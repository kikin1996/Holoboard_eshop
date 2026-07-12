import Hero from '@/components/Hero';
import WhyChoose from '@/components/WhyChoose';
import VideoSection from '@/components/VideoSection';
import FeatureSection from '@/components/FeatureSection';
import SpecGrid from '@/components/SpecGrid';
import EquipmentList from '@/components/EquipmentList';
import Gallery from '@/components/Gallery';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <WhyChoose />

      <VideoSection />

      <FeatureSection
        id="specifikace"
        eyebrow="Specifikace"
        title="Nafukovací plavidlo pro celou rodinu"
        description="HoloBoard představuje inovativní hybrid mezi paddleboardem a kajakem, navržený tak, aby spojil pohodlí, stabilitu a zábavu na vodě do jednoho univerzálního plavidla."
        visual={<SpecGrid />}
        tinted
      />

      <FeatureSection
        id="vybaveni"
        eyebrow="Vybavení"
        title="Vše potřebné je součástí balení"
        description="HoloBoard je lehký a snadno přenosný - nafukovací konstrukce se pohodlně složí a vejde do batohu, ideální pro cestování i jednodenní výpravy."
        visual={<EquipmentList />}
        reverse
      />

      <Gallery />

      <section
        id="kontakt"
        className="mx-auto max-w-6xl px-6 py-28 text-center md:py-36"
      >
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Předobjednejte si HoloBoard.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Momentálně v předprodeji, dodací lhůta 6–14 týdnů. Doprava přes síť
          výdejních míst Zásilkovny, platba bezpečně přes ComGate.
        </p>
        <Link
          href="/kosik"
          className="mt-10 inline-block rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
        >
          Přejít do košíku
        </Link>
        <p className="mt-8 text-sm text-muted">
          Potřebujete pomoc? Napište na{' '}
          <a href="mailto:info@holoboard.cz" className="text-ink underline underline-offset-4">
            info@holoboard.cz
          </a>{' '}
          nebo volejte{' '}
          <a href="tel:+420777726001" className="text-ink underline underline-offset-4">
            777 726 001
          </a>
          .
        </p>
      </section>
    </main>
  );
}
