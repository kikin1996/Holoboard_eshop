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
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      {/* Načtení oficiální knihovny Packeta Widgetu - jen na klientovi,
          po dokončení nastavíme isWidgetReady, aby šlo tlačítko použít. */}
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="lazyOnload"
        onReady={() => setIsWidgetReady(true)}
      />

      <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Váš košík
      </h1>

      {/* --- Přehled produktů --- */}
      <ul className="mt-10 divide-y divide-line">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center justify-between py-6">
            <div>
              <p className="font-medium text-ink">{item.name}</p>
              <p className="mt-1 text-sm text-muted">
                {formatPrice(item.unitPriceCents)} / ks
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.variantId, Number(e.target.value))
                }
                className="w-16 rounded-full border border-line px-3 py-2 text-center text-sm focus:border-accent focus:outline-none"
              />
              <span className="w-28 text-right font-medium text-ink">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-6 text-muted">Košík je prázdný.</li>
        )}
      </ul>

      {/* --- Kalkulace ceny --- */}
      <div className="mt-8 space-y-2 rounded-3xl bg-mist p-6 text-sm">
        <div className="flex justify-between text-muted">
          <span>Mezisoučet</span>
          <span className="text-ink">{formatPrice(subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Doprava (Zásilkovna)</span>
          <span className="text-ink">
            {selectedPoint ? formatPrice(shippingCents) : '—'}
          </span>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
          <span>Celkem</span>
          <span className="text-accent-orange">{formatPrice(totalCents)}</span>
        </div>
      </div>

      {/* --- Výběr dopravy --- */}
      <div className="mt-6 rounded-3xl border border-line p-6">
        <button
          type="button"
          onClick={handleOpenPacketaWidget}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          {selectedPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
        </button>

        {selectedPoint && (
          <p className="mt-4 text-sm text-muted">
            Vybraná pobočka: <strong className="text-ink">{selectedPoint.name}</strong>{' '}
            <span className="text-muted">(ID: {selectedPoint.id})</span>
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {/* --- Přechod k platbě --- */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isSubmitting || items.length === 0}
        className="mt-6 w-full rounded-full bg-accent px-6 py-4 text-sm font-medium text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Zakládám platbu…' : 'Přejít k platbě'}
      </button>
    </div>
  );
}
