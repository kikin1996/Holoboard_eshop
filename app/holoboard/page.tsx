import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Waves,
  Shuffle,
  Feather,
  Users,
  Check,
  Clock,
} from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import SpecGrid from '@/components/SpecGrid';
import EquipmentList from '@/components/EquipmentList';

export const metadata: Metadata = {
  title: 'HoloBoard – 2v1 Paddleboard a Kajak | 8 990 Kč',
  description:
    'HoloBoard je stabilní a pohodlné plavidlo, které kombinuje výhody paddleboardu a kajaku. Vhodné pro děti, dospělé i úplné začátečníky.',
};

// Klíčové vlastnosti z oficiálního popisu produktu (shop.holoboard.cz/holoboard).
const features = [
  {
    icon: ShieldCheck,
    title: 'Vysoká stabilita a bezpečnost',
    text: 'Širší základna a nízké těžiště zajišťují vynikající stabilitu i v nestabilních podmínkách. Užijte si vodu bez stresu a obav z převrácení.',
  },
  {
    icon: Waves,
    title: 'Pohodlné sezení přímo ve vodě',
    text: 'Díky sedačce připnuté ze spodní strany sedíte přímo ve vodě - příjemné osvěžení během horkých dní a relaxační zážitek.',
  },
  {
    icon: Shuffle,
    title: 'Multifunkční využití',
    text: 'Stůjte a pádlujte jako na paddleboardu, seďte na připevněné sedačce, nebo klečte. Volba je na vás podle preferencí a situace.',
  },
  {
    icon: Feather,
    title: 'Lehký a snadno přenosný',
    text: 'Nafukovací konstrukce je kompaktní, snadno se skládá a vejde se do batohu - ideální pro cestování i jednodenní výpravy.',
  },
  {
    icon: Users,
    title: 'Rodinný produkt',
    text: 'Navržen s ohledem na bezpečnost a pohodlí celé rodiny. Děti si bezpečně užijí jízdu s dospělým i samostatně v mělké vodě.',
  },
];

// "Pro koho je HoloBoard ideální?" - z oficiálního popisu.
const audience = [
  'Pro uživatele, kteří se na běžném paddleboardu necítí stabilně a hledají jistotu na vodě.',
  'Pro rodiče s dětmi, kteří chtějí bezpečnější a komfortnější alternativu k paddleboardu.',
  'Pro ty, kdo hledají relaxaci a pohodlí během vodních aktivit, a nechtějí se nadřít.',
  'Pro teenagery a zkušené jezdce, kteří si chtějí vychutnat jízdu ve stoje i v sedě.',
];

// Rozměry z oficiální specifikace.
const dimensions = [
  { label: 'Délka', value: '320 cm' },
  { label: 'Šířka', value: '88 cm' },
  { label: 'Tloušťka', value: '15 cm' },
  { label: 'Plocha pro sezení (vnitřní část)', value: '500 × 750 mm' },
];

export default function ProductPage() {
  return (
    <main>
      {/* --- Produktový hero: galerie + nákupní informace --- */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <ProductGallery />

          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              Patentováno v České republice
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink md:text-5xl">
              HoloBoard
            </h1>
            <p className="mt-5 text-lg text-muted">
              Stabilní a pohodlné plavidlo, které kombinuje výhody paddleboardu
              a kajaku. Vhodné pro děti, dospělé i úplné začátečníky. Perfektní
              pro rodinnou zábavu na vodě.
            </p>

            <p className="mt-8 text-4xl font-semibold tracking-tight text-accent-orange">
              8 990 Kč
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-muted">
              <Clock size={15} strokeWidth={2} className="text-accent" />
              Předprodej · dodací lhůta 6–14 týdnů
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/kosik"
                className="rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                Do košíku
              </Link>
              <a
                href="mailto:info@holoboard.cz"
                className="rounded-full border border-line px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
              >
                Zeptat se
              </a>
            </div>

            <dl className="mt-10 divide-y divide-line border-t border-line text-sm">
              {[
                ['Kód produktu', '23'],
                ['Kategorie', 'Holoboard'],
                ['Záruka', '2 roky'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* --- Klíčové vlastnosti --- */}
      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              Klíčové vlastnosti
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Všestranné plavidlo pro celou rodinu
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl bg-paper p-8 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-accent">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}

            {/* Karta "Pro koho" doplňuje mřížku na 6 polí */}
            <div className="rounded-3xl bg-ink p-8 text-white shadow-sm">
              <h3 className="text-lg font-semibold">
                Pro koho je HoloBoard ideální?
              </h3>
              <ul className="mt-4 space-y-3">
                {audience.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Specifikace + rozměry --- */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              Specifikace
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Technické parametry
            </h2>
            <div className="mt-10">
              <SpecGrid />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              Rozměry
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Přesné míry
            </h2>
            <dl className="mt-10 divide-y divide-line border-t border-line">
              {dimensions.map(({ label, value }) => (
                <div key={label} className="flex justify-between py-4">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-muted">
              Povrch: protiskluzová EVA podložka, přední cargo zóna s gumolany.
              Doporučený tlak obvykle 12–15 PSI (řiďte se údaji v manuálu).
            </p>
          </div>
        </div>
      </section>

      {/* --- Vybavení v balení --- */}
      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                Vybavení
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                Vše potřebné je součástí balení
              </h2>
              <p className="mt-5 text-muted">
                HoloBoard dorazí kompletní - stačí nafouknout a vyrazit na vodu.
              </p>
            </div>
            <EquipmentList />
          </div>
        </div>
      </section>

      {/* --- Závěrečné CTA --- */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Připraveni na nový rozměr vodních sportů?
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          HoloBoard je vyvinutý a patentovaný přímo v České republice s důrazem
          na kvalitu, bezpečnost a inovativní design.
        </p>
        <Link
          href="/kosik"
          className="mt-10 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Objednat za 8 990 Kč
        </Link>
        <p className="mt-6 text-sm text-muted">
          Objednávky vyřizujeme v pořadí jejich přijetí.
        </p>
      </section>
    </main>
  );
}
