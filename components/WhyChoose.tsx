'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const EASE = [0.16, 1, 0.3, 1] as const;

const reasons = [
  {
    icon: '/icons/footing.png',
    title: 'Nepřekonatelná stabilita',
    description:
      'Díky unikátnímu designu s nízkým sedadlem poskytuje Holo Board stabilitu, která převyšuje běžné paddleboardy.',
  },
  {
    icon: '/icons/paddleboarding.png',
    title: 'Všestrannost',
    description:
      'Snadno se přemění z paddleboardu na kajak, což umožňuje dynamický zážitek na vodě.',
  },
  {
    icon: '/icons/ergonomic.png',
    title: 'Pohodlí',
    description:
      'Užijte si dlouhé jízdy bez námahy a nepohodlí díky ergonomickému designu, který zajišťuje přirozenou polohu při pádlování.',
  },
];

// Sekce "Proč Si Vybrat Holo Board?" - tři rovnocenné karty místo
// klasického textu vedle vizuálu (viz FeatureSection).
export default function WhyChoose() {
  return (
    <section id="produkt" className="mx-auto max-w-6xl px-6 py-28 md:py-36">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
          Produkt
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Proč si vybrat Holo Board?
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {reasons.map(({ icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
            className="rounded-3xl bg-mist p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper p-2.5">
              <Image src={icon} alt="" width={28} height={28} />
            </div>
            <h3 className="mt-6 text-lg font-medium text-ink">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
