'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface FeatureSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse?: boolean;
  tinted?: boolean;
}

// Opakovatelný stavební blok pro marketingové sekce - text + vizuál vedle
// sebe, pořadí se dá otočit (`reverse`), volitelně tónované pozadí (`tinted`).
export default function FeatureSection({
  id,
  eyebrow,
  title,
  description,
  visual,
  reverse = false,
  tinted = false,
}: FeatureSectionProps) {
  return (
    <section id={id} className={tinted ? 'bg-mist' : undefined}>
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div
          className={`grid items-center gap-12 md:grid-cols-2 md:gap-16 ${
            reverse ? 'md:[&>*:first-child]:order-2' : ''
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
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
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="rounded-3xl bg-paper p-10 shadow-sm"
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
