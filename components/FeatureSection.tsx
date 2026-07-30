'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import WaveTransition from '@/components/WaveTransition';

const EASE = [0.16, 1, 0.3, 1] as const;

type Tint = 'mist' | 'orange';

const TINT_BG: Record<Tint, string> = {
  mist: 'rounded-b-[2.5rem] bg-mist md:rounded-b-[4rem]',
  orange: 'bg-peach',
};

// Barvy vlnky pro výstup z oranžového tónu zpátky do bílého pozadí stránky
// (viz WaveTransition) - nejsytější vrstva odpovídá vlastnímu pozadí sekce
// (`peach`), ať navazují bez viditelného švu.
const ORANGE_WAVE_COLORS: [string, string, string] = ['#FFF6EC', '#FFD9A8', '#FFA95E'];

interface FeatureSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse?: boolean;
  // Tónované pozadí sekce - `mist` má zaoblené spodní rohy, `orange` se
  // místo toho odděluje animovanou vlnkou (`waveBottom`).
  tint?: Tint;
  waveBottom?: boolean;
}

// Opakovatelný stavební blok pro marketingové sekce - text + vizuál vedle
// sebe, pořadí se dá otočit (`reverse`), volitelně tónované pozadí (`tint`).
export default function FeatureSection({
  id,
  eyebrow,
  title,
  description,
  visual,
  reverse = false,
  tint,
  waveBottom = false,
}: FeatureSectionProps) {
  return (
    <section id={id} className={tint ? TINT_BG[tint] : undefined}>
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div
          className={`grid items-center gap-12 md:grid-cols-2 md:gap-16 ${
            reverse ? 'md:[&>*:first-child]:order-2' : ''
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              {eyebrow}
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted">{description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="rounded-3xl bg-paper p-10 shadow-sm"
          >
            {visual}
          </motion.div>
        </div>
      </div>

      {tint === 'orange' && waveBottom && <WaveTransition flip colors={ORANGE_WAVE_COLORS} />}
    </section>
  );
}
