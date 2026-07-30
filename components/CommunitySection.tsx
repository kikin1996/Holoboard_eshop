'use client';

// =============================================================================
// components/CommunitySection.tsx
// -----------------------------------------------------------------------------
// Oranžový pás propojující fotky z Instagramu s odkazem na profil. Na rozdíl
// od StorySection tu záměrně není animovaná vlnka - jen zaoblené rohy (viz
// FeatureSection `tinted`), ať barva působí jako klidný, oddělený blok a ne
// jako rušivý pohyb navíc.
// =============================================================================

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const photos = [
  '/gallery/090610-min.jpg',
  '/gallery/090612-min.jpg',
  '/gallery/090614-min.jpg',
  '/gallery/090616-min.jpg',
  '/gallery/09062-min.jpg',
  '/gallery/P1574944OB2-min.jpg',
  '/gallery/P1574993-min.jpg',
  '/gallery/P1575002-min.jpg',
];

export default function CommunitySection() {
  return (
    <section className="rounded-[2.5rem] bg-accent-orange md:rounded-[4rem]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16"
        >
          <div className="text-white">
            <a
              href="https://www.instagram.com/holoboard_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              <Instagram size={16} strokeWidth={2} />
              @holoboard_
            </a>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Staň se součástí naší komunity
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {photos.map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: index * 0.04 }}
                className="relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={src}
                  alt="HoloBoard na Instagramu"
                  fill
                  sizes="(min-width: 768px) 12vw, 25vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
