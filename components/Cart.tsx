'use client';

// =============================================================================
// components/Cart.tsx
// -----------------------------------------------------------------------------
// Nákupní košík HoloBoard e-shopu.
//
// Datový tok (viz ARCHITECTURE.md, kap. 1.4 a 1.5):
//   1) Položky košíku žijí ve sdíleném CartContextu (localStorage persistence);
//      v reálu by se synchronizovaly s Medusa Cart API.
//   2) Tlačítko "Vybrat výdejní místo" otevře oficiální Packeta (Zásilkovna)
//      JS Widget. Widget běží čistě na klientovi, klíč je veřejný
//      (NEXT_PUBLIC_PACKETA_API_KEY), po výběru se do state uloží jen
//      ID a název pobočky - žádná platba ani sklad se tu neřeší.
//   3) Tlačítko "Přejít k platbě" odešle obsah košíku + ID pobočky na
//      VLASTNÍ Next.js API route (/api/checkout). Ta teprve server-to-server
//      založí objednávku a platbu u ComGate. Tajný ComGate "secret" se
//      v této komponentě vůbec neobjevuje - je jen na serveru.
// =============================================================================

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Minus, Plus, Trash2, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { SHIPPING_CENTS, formatPrice } from '@/lib/catalog';

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
  /** true, když se zákazník vrátil z ComGate bez dokončení platby (?zruseno=1). */
  paymentCancelled?: boolean;
}

export default function Cart({ paymentCancelled = false }: CartProps) {
  const { items, isHydrated, updateQuantity, removeItem } = useCart();
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
  const shippingCents = selectedPoint ? SHIPPING_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

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
      // sám podle katalogu - klient cenu neposílá).
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

      {paymentCancelled && (
        <p className="mt-6 rounded-2xl bg-mist p-4 text-sm text-ink">
          Platba nebyla dokončena. Položky zůstaly v košíku - můžete to zkusit
          znovu, nebo nás kontaktovat na{' '}
          <a href="mailto:info@holoboard.cz" className="font-medium text-accent underline underline-offset-4">
            info@holoboard.cz
          </a>
          .
        </p>
      )}

      {/* --- Prázdný košík --- */}
      {isHydrated && items.length === 0 ? (
        <div className="mt-12 rounded-3xl bg-mist p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper text-accent">
            <ShoppingBag size={24} strokeWidth={1.75} />
          </span>
          <p className="mt-6 text-lg font-medium text-ink">Košík je prázdný</p>
          <p className="mt-2 text-sm text-muted">
            Vyberte si HoloBoard a vraťte se k pokladně.
          </p>
          <Link
            href="/holoboard"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
          >
            Prohlédnout HoloBoard
          </Link>
        </div>
      ) : (
        <>
          {/* --- Přehled produktů --- */}
          <ul className="mt-10 divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="flex flex-wrap items-center justify-between gap-4 py-6"
              >
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatPrice(item.unitPriceCents)} / ks
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Stepper množství */}
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      aria-label="Snížit množství"
                      className="flex h-9 w-9 items-center justify-center rounded-l-full text-ink transition-colors hover:bg-mist"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      aria-label="Zvýšit množství"
                      className="flex h-9 w-9 items-center justify-center rounded-r-full text-ink transition-colors hover:bg-mist"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="w-24 text-right font-medium text-ink">
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Odebrat ${item.name} z košíku`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
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
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
            >
              <MapPin size={15} strokeWidth={2} />
              {selectedPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
            </button>

            {selectedPoint ? (
              <p className="mt-4 text-sm text-muted">
                Vybraná pobočka:{' '}
                <strong className="text-ink">{selectedPoint.name}</strong>{' '}
                <span className="text-muted">(ID: {selectedPoint.id})</span>
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Doručujeme na více než 10 000 výdejních míst a Z-BOXů Zásilkovny
                po celé ČR.
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}

          {/* --- Přechod k platbě --- */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting || items.length === 0}
            className="mt-6 w-full rounded-full bg-accent-orange px-6 py-4 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Zakládám platbu…' : 'Přejít k platbě'}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Bezpečná platba přes ComGate · kartou i bankovním převodem
          </p>
        </>
      )}
    </div>
  );
}
