import Hero from '@/components/Hero';
import WhyChoose from '@/components/WhyChoose';
import StorySection from '@/components/StorySection';
import VideoSection from '@/components/VideoSection';
import FeatureSection from '@/components/FeatureSection';
import SpecGrid from '@/components/SpecGrid';
import EquipmentList from '@/components/EquipmentList';
import Gallery from '@/components/Gallery';
import CommunitySection from '@/components/CommunitySection';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import Link from 'next/link';
import { Waves } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <WhyChoose />

      <StorySection />

      <VideoSection />

      <FeatureSection
        id="specifikace"
        eyebrow="Specifikace"
        title="Nafukovací plavidlo pro celou rodinu"
        description="HoloBoard představuje inovativní hybrid mezi paddleboardem a kajakem, navržený tak, aby spojil pohodlí, stabilitu a zábavu na vodě do jednoho univerzálního plavidla."
        visual={<SpecGrid />}
        tint="orange"
        waveBottom
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

      <section id="kontakt" className="relative overflow-hidden">
        <BackgroundBlobs variant="reverse" />
        <Waves
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 text-accent/[0.04]"
          strokeWidth={1}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center md:py-36">
          <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Předobjednejte si HoloBoard.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted">
            Momentálně v předprodeji, dodací lhůta 6–14 týdnů. Doprava přes síť
            výdejních míst Zásilkovny, platba bezpečně přes Stripe.
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
        </div>
      </section>

      <CommunitySection />
    </main>
  );
}
