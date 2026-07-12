import Hero from '@/components/Hero';
import FeatureSection from '@/components/FeatureSection';
import SpecGrid from '@/components/SpecGrid';
import VariantSwatches from '@/components/VariantSwatches';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <FeatureSection
        id="technologie"
        eyebrow="Technologie"
        title="Mechanismus, který myslí za vás"
        description="Patentovaný sklápěcí rám mění HoloBoard z plochého standu na pohodlné křeslo jedním pohybem - beze šroubování, bez nářadí."
        visual={<SpecGrid />}
      />

      <FeatureSection
        id="produkt"
        eyebrow="Produkt"
        title="Jedna deska, dvě podoby"
        description="HoloBoard Original je k dispozici ve dvou barevných provedeních, volitelně s příslušenstvím Weekend Kit pro celodenní výlety na vodě."
        visual={<VariantSwatches />}
        reverse
        tinted
      />

      <section className="mx-auto max-w-6xl px-6 py-28 text-center md:py-36">
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Připraveno k vyplutí.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Doprava přes síť výdejních míst Zásilkovny, platba bezpečně přes ComGate.
        </p>
        <Link
          href="/kosik"
          className="mt-10 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Přejít do košíku
        </Link>
      </section>
    </main>
  );
}
