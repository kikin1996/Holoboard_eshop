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
//      založí objednávku a platbu u Stripe. Tajný Stripe klíč se v této
//      komponentě vůbec neobjevuje - je jen na serveru.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Mail, Home, Phone } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { SHIPPING_CENTS, formatPrice } from '@/lib/catalog';
import type { PacketaPoint } from '@/lib/packeta';

interface CartProps {
  /** true, když se zákazník vrátil z Stripe bez dokončení platby (?zruseno=1). */
  paymentCancelled?: boolean;
}

export default function Cart({ paymentCancelled = false }: CartProps) {
  const { items, isHydrated, updateQuantity, removeItem } = useCart();
  const { data: session } = useSession();
  const [shippingMethod, setShippingMethod] = useState<'PACKETA_ZBOX' | 'PACKETA_HOME'>('PACKETA_ZBOX');
  const [selectedPoint, setSelectedPoint] = useState<PacketaPoint | null>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasPrefilledShipping = useRef(false);

  // Přihlášený zákazník e-mail ani jméno nevyplňuje - objednávka se stejně
  // napojí na jeho účet. Host musí obojí zadat sám (prohlížeč mu to ale
  // umí nabídnout z uloženého autofillu díky autoComplete níže).
  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.email, session?.user?.name]);

  // Předvyplnění doručovacích údajů z profilu (viz ProfileForm.tsx /
  // /api/profile) - zákazník si je pořád může kdykoliv změnit.
  useEffect(() => {
    if (!session?.user || hasPrefilledShipping.current) return;
    hasPrefilledShipping.current = true;
    (async () => {
      try {
        const response = await fetch('/api/profile');
        const data = (await response.json()) as {
          phone?: string;
          street?: string;
          city?: string;
          zipCode?: string;
          savedPacketaBranchId?: string | null;
          savedPacketaBranchName?: string | null;
        };
        if (data.savedPacketaBranchId) {
          setSelectedPoint({
            id: data.savedPacketaBranchId,
            name: data.savedPacketaBranchName ?? data.savedPacketaBranchId,
          });
        }
        if (data.phone) setPhone(data.phone);
        if (data.street) setStreet(data.street);
        if (data.city) setCity(data.city);
        if (data.zipCode) setZipCode(data.zipCode);
      } catch {
        // Předvyplnění je jen "best effort" - zákazník si údaje klidně vyplní ručně.
      }
    })();
  }, [session?.user]);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isNameValid = name.trim() !== '';
  const isPhoneValid = phone.trim() !== '';
  const isAddressValid = street.trim() !== '' && city.trim() !== '' && zipCode.trim() !== '';
  const hasShipping = shippingMethod === 'PACKETA_ZBOX' ? Boolean(selectedPoint) : isAddressValid;

  // --- Kalkulace ceny (čistě klientský výpočet pro zobrazení; finální
  //     autoritativní cena se vždy přepočítá znovu na serveru v /api/checkout) ---
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );
  const shippingCents = hasShipping ? SHIPPING_CENTS : 0;
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
  // Krok 2: odeslání na backend - vytvoření objednávky + platby u Stripe
  // ---------------------------------------------------------------------
  const handleCheckout = useCallback(async () => {
    setErrorMessage(null);

    if (!isNameValid) {
      setErrorMessage('Zadejte prosím jméno a příjmení.');
      return;
    }
    if (!isEmailValid) {
      setErrorMessage('Zadejte prosím platný e-mail pro potvrzení objednávky.');
      return;
    }
    if (!isPhoneValid) {
      setErrorMessage('Zadejte prosím telefonní číslo - je potřeba pro doručení kurýrem/Zásilkovnou.');
      return;
    }
    if (shippingMethod === 'PACKETA_ZBOX' && !selectedPoint) {
      setErrorMessage('Nejdřív prosím vyberte výdejní místo Zásilkovny.');
      return;
    }
    if (shippingMethod === 'PACKETA_HOME' && !isAddressValid) {
      setErrorMessage('Vyplňte prosím celou doručovací adresu.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Košík je prázdný.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Pro dokončení objednávky musíte souhlasit s obchodními podmínkami.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Voláme VLASTNÍ Next.js API route, ne Stripe přímo. Tělo požadavku
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
          name,
          email,
          phone,
          shipping:
            shippingMethod === 'PACKETA_ZBOX'
              ? {
                  method: 'PACKETA_ZBOX',
                  packetaBranchId: selectedPoint!.id,
                  packetaBranchName: selectedPoint!.name,
                }
              : {
                  method: 'PACKETA_HOME',
                  street,
                  city,
                  zipCode,
                },
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout selhal (HTTP ${response.status})`);
      }

      // Server vrací redirectUrl, kterou vygeneroval Stripe
      // (POST https://payments.comgate.cz/v2.0/create) - viz architektura, kap. 1.5.
      const data: { redirectUrl: string } = await response.json();

      // Přesměrování na platební bránu Stripe. Po zaplacení Stripe
      // zavolá webhook /api/webhooks/comgate server-to-server a teprve
      // ten (po ověření přes /v2.0/status) označí objednávku jako zaplacenou.
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error(error);
      setErrorMessage('Nepodařilo se zahájit platbu, zkuste to prosím znovu.');
      setIsSubmitting(false);
    }
  }, [
    items,
    shippingMethod,
    selectedPoint,
    street,
    city,
    zipCode,
    isAddressValid,
    name,
    isNameValid,
    email,
    isEmailValid,
    phone,
    isPhoneValid,
    agreedToTerms,
  ]);

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
                {hasShipping ? formatPrice(shippingCents) : '—'}
              </span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <span>Celkem</span>
              <span className="text-accent-orange">{formatPrice(totalCents)}</span>
            </div>
          </div>

          {/* --- Jméno a e-mail pro potvrzení a notifikace o stavu objednávky --- */}
          <div className="mt-6 rounded-3xl border border-line p-6">
            <label htmlFor="checkout-name" className="text-sm font-medium text-ink">
              Jméno a příjmení
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              disabled={Boolean(session?.user?.name)}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Novák"
              className="mt-1.5 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent disabled:bg-mist disabled:text-muted"
            />

            <label htmlFor="checkout-email" className="mt-4 flex items-center gap-2 text-sm font-medium text-ink">
              <Mail size={15} strokeWidth={2} />
              E-mail
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              disabled={Boolean(session?.user?.email)}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              className="mt-1.5 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent disabled:bg-mist disabled:text-muted"
            />
            <p className="mt-2 text-xs text-muted">
              Pošleme na něj potvrzení objednávky a informaci o odeslání.
            </p>

            <label htmlFor="checkout-phone" className="mt-4 flex items-center gap-2 text-sm font-medium text-ink">
              <Phone size={15} strokeWidth={2} />
              Telefon
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+420 777 123 456"
              className="mt-1.5 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
            />
            <p className="mt-2 text-xs text-muted">Potřebuje ho kurýr/Zásilkovna kvůli doručení.</p>
          </div>

          {/* --- Výběr dopravy --- */}
          <div className="mt-6 rounded-3xl border border-line p-6">
            <div className="flex gap-2 rounded-full bg-mist p-1">
              <button
                type="button"
                onClick={() => setShippingMethod('PACKETA_ZBOX')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  shippingMethod === 'PACKETA_ZBOX'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <MapPin size={15} strokeWidth={2} />
                Výdejní místo
              </button>
              <button
                type="button"
                onClick={() => setShippingMethod('PACKETA_HOME')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  shippingMethod === 'PACKETA_HOME'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Home size={15} strokeWidth={2} />
                Doručení domů
              </button>
            </div>

            {shippingMethod === 'PACKETA_ZBOX' ? (
              <div className="mt-5">
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
                    Doručujeme na více než 10 000 výdejních míst a Z-BOXů
                    Zásilkovny po celé ČR.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ulice a č.p."
                  aria-label="Ulice a číslo popisné"
                  autoComplete="street-address"
                  className="rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent sm:col-span-2"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Město"
                  aria-label="Město"
                  autoComplete="address-level2"
                  className="rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="PSČ"
                  aria-label="PSČ"
                  autoComplete="postal-code"
                  className="rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          {/* --- Souhrn objednávky --- */}
          <div className="mt-6 rounded-3xl border border-line p-6">
            <h2 className="text-sm font-semibold text-ink">Souhrn objednávky</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Příjemce</dt>
                <dd className="text-right text-ink">{name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">E-mail</dt>
                <dd className="text-right text-ink">{email || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Telefon</dt>
                <dd className="text-right text-ink">{phone || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Doručení</dt>
                <dd className="text-right text-ink">
                  {shippingMethod === 'PACKETA_ZBOX'
                    ? selectedPoint?.name ?? 'nevybráno'
                    : isAddressValid
                      ? `${street}, ${city}, ${zipCode}`
                      : 'nevyplněno'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-1.5 font-medium">
                <dt className="text-ink">Celkem k úhradě</dt>
                <dd className="text-right text-accent-orange">{formatPrice(totalCents)}</dd>
              </div>
            </dl>
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-accent focus:ring-accent"
            />
            <span>
              Souhlasím s{' '}
              <Link
                href="/obchodni-podminky"
                target="_blank"
                className="font-medium text-accent underline underline-offset-4"
              >
                obchodními podmínkami
              </Link>{' '}
              a{' '}
              <Link
                href="/ochrana-osobnich-udaju"
                target="_blank"
                className="font-medium text-accent underline underline-offset-4"
              >
                zpracováním osobních údajů
              </Link>
              .
            </span>
          </label>

          {errorMessage && (
            <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}

          {/* --- Přechod k platbě --- */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting || items.length === 0 || !agreedToTerms}
            className="mt-6 w-full rounded-full bg-accent-orange px-6 py-4 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Zakládám platbu…' : 'Přejít k platbě'}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Bezpečná platba přes Stripe · kartou i bankovním převodem
          </p>
        </>
      )}
    </div>
  );
}
