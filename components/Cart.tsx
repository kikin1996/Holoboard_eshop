'use client';

// =============================================================================
// components/Cart.tsx
// -----------------------------------------------------------------------------
// Ukázková komponenta nákupního košíku pro HoloBoard e-shop.
//
// Datový tok (viz ARCHITECTURE.md, kap. 1.4 a 1.5):
//   1) Položky košíku přichází jako props/state (v reálu z Medusa Cart API).
//   2) Tlačítko "Vybrat výdejní místo" otevře oficiální Packeta (Zásilkovna)
//      JS Widget. Widget běží čistě na klientovi, klíč je veřejný
//      (NEXT_PUBLIC_PACKETA_API_KEY), po výběru se do state uloží jen
//      ID a název pobočky - žádná platba ani sklad se tu neřeší.
//   3) Tlačítko "Přejít k platbě" odešle obsah košíku + ID pobočky na
//      VLASTNÍ Next.js API route (/api/checkout). Ta teprve server-to-server
//      založí objednávku v Meduse/Strapi a platbu u ComGate. Tajný ComGate
//      "secret" se v této komponentě vůbec neobjevuje - je jen na serveru.
// =============================================================================

import { useState, useCallback } from 'react';
import Script from 'next/script';

// -----------------------------------------------------------------------
// Typy
// -----------------------------------------------------------------------

interface CartItem {
  variantId: string;      // odpovídá ProductVariant.id ve schématu
  name: string;           // "HoloBoard Original - Ocean Blue / Weekend Kit"
  unitPriceCents: number; // cena v halířích - žádné Float zaokrouhlování
  quantity: number;
  imageUrl?: string;
}

// Tvar objektu, který vrací Packeta Widget po výběru pobočky/Z-BOXu.
// (id a name jsou jediná pole, která si ukládáme do objednávky - viz schéma.)
interface PacketaPoint {
  id: string;
  name: string;
  city?: string;
  street?: string;
  zip?: string;
}

// Deklarace globálního objektu, který do window vloží knihovna
// https://widget.packeta.com/v6/www/js/library.js (načtená přes next/script níže).
declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: Record<string, unknown>
        ) => void;
      };
    };
  }
}

interface CartProps {
  initialItems: CartItem[];
}

// -----------------------------------------------------------------------
// Pomocné funkce
// -----------------------------------------------------------------------

function formatPrice(cents: number, currency = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency }).format(
    cents / 100
  );
}

// -----------------------------------------------------------------------
// Komponenta
// -----------------------------------------------------------------------

export default function Cart({ initialItems }: CartProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [selectedPoint, setSelectedPoint] = useState<PacketaPoint | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Kalkulace ceny (čistě klientský výpočet pro zobrazení; finální
  //     autoritativní cena se vždy přepočítá znovu na serveru v /api/checkout) ---
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );
  const shippingCents = selectedPoint ? 7900 : 0; // 79 Kč, jen ilustrační sazba
  const totalCents = subtotalCents + shippingCents;

  const updateQuantity = (variantId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  // ---------------------------------------------------------------------
  // Krok 1: výběr výdejního místa přes Packeta Widget
  // ---------------------------------------------------------------------
  const handleOpenPacketaWidget = useCallback(() => {
    setErrorMessage(null);

    // Pokud se knihovna widgetu ještě nenačetla (next/script, strategy
    // "lazyOnload"), widget nemůžeme otevřít - uživatele o tom informujeme.
    if (!isWidgetReady || !window.Packeta) {
      setErrorMessage('Výběr pobočky se právě načítá, zkuste to prosím za chvíli.');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY as string;

    window.Packeta.Widget.pick(
      apiKey,
      (point) => {
        // Callback z widgetu - "point" je null, pokud uživatel okno zavřel bez výběru.
        if (!point) return;

        // Do stavu aplikace ukládáme JEN id a name (viz Order.packetaBranchId /
        // Order.packetaBranchName ve schématu) - zbytek adresy se v případě
        // potřeby znovu dotáhne z Packeta API podle ID při generování štítku.
        setSelectedPoint({
          id: point.id,
          name: point.name,
          city: point.city,
          street: point.street,
          zip: point.zip,
        });
      },
      {
        country: 'cz',
        language: 'cs',
      }
    );
  }, [isWidgetReady]);

  // ---------------------------------------------------------------------
  // Krok 2: odeslání na backend - vytvoření objednávky + platby u ComGate
  // ---------------------------------------------------------------------
  const handleCheckout = useCallback(async () => {
    setErrorMessage(null);

    if (!selectedPoint) {
      setErrorMessage('Nejdřív prosím vyberte výdejní místo Zásilkovny.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Košík je prázdný.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Voláme VLASTNÍ Next.js API route, ne ComGate přímo. Tělo požadavku
      // obsahuje jen ID varianty a množství (cenu si server vždy přepočítá
      // sám podle aktuálních cen v Meduse/Strapi - klient cenu neposílá).
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shipping: {
            method: 'PACKETA_ZBOX',
            packetaBranchId: selectedPoint.id,
            packetaBranchName: selectedPoint.name,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout selhal (HTTP ${response.status})`);
      }

      // Server vrací redirectUrl, kterou vygeneroval ComGate
      // (POST https://payments.comgate.cz/v2.0/create) - viz architektura, kap. 1.5.
      const data: { redirectUrl: string } = await response.json();

      // Přesměrování na platební bránu ComGate. Po zaplacení ComGate
      // zavolá webhook /api/webhooks/comgate server-to-server a teprve
      // ten (po ověření přes /v2.0/status) označí objednávku jako zaplacenou.
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error(error);
      setErrorMessage('Nepodařilo se zahájit platbu, zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  }, [items, selectedPoint]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Načtení oficiální knihovny Packeta Widgetu - jen na klientovi,
          po dokončení nastavíme isWidgetReady, aby šlo tlačítko použít. */}
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="lazyOnload"
        onReady={() => setIsWidgetReady(true)}
      />

      <h1 className="text-2xl font-semibold">Váš košík</h1>

      {/* --- Přehled produktů --- */}
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {formatPrice(item.unitPriceCents)} / ks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.variantId, Number(e.target.value))
                }
                className="w-16 rounded border border-gray-300 px-2 py-1 text-center"
              />
              <span className="w-24 text-right font-medium">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-4 text-gray-500">Košík je prázdný.</li>
        )}
      </ul>

      {/* --- Kalkulace ceny --- */}
      <div className="space-y-1 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span>Mezisoučet</span>
          <span>{formatPrice(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Doprava (Zásilkovna)</span>
          <span>{selectedPoint ? formatPrice(shippingCents) : '—'}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Celkem</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
      </div>

      {/* --- Výběr dopravy --- */}
      <div className="rounded border border-gray-200 p-4">
        <button
          type="button"
          onClick={handleOpenPacketaWidget}
          className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
        >
          {selectedPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
        </button>

        {selectedPoint && (
          <p className="mt-2 text-sm text-gray-700">
            Vybraná pobočka: <strong>{selectedPoint.name}</strong>{' '}
            <span className="text-gray-400">(ID: {selectedPoint.id})</span>
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
      )}

      {/* --- Přechod k platbě --- */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isSubmitting || items.length === 0}
        className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Zakládám platbu…' : 'Přejít k platbě'}
      </button>
    </div>
  );
}
