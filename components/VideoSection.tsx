'use client';

import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const videos = [
  {
    id: 'gvh5dEGVrBU',
    title: '1. Prototyp — Holoboardu',
    description:
      'Podívejte se na naše video, kde představujeme Holo Board v rámci crowdfundingové kampaně na Hithit.cz. Dozvíte se více o našem projektu a jak můžete přispět k jeho uvedení na trh.',
  },
  {
    id: 'LjyhNDnc_HA',
    title: '2. Prototyp — Holoboardu',
    description:
      'Představujeme druhý prototyp Holoboardu — inovaci, která spojuje stabilitu paddleboardingu s precizností kajaku. Moderní design a technologie přináší novou úroveň vodního dobrodružství.',
  },
  {
    id: 'PLGFVswK86k',
    title: '3. Prototyp — Holoboard',
    description:
      'Představujeme třetí prototyp HoloBoardu — oranžovo-modrý design a vylepšená konstrukce přinášejí novou úroveň pohodlí a zábavy pro každého milovníka vodních dobrodružství.',
  },
];

// Sekce "Video" - cesta HoloBoardu napříč třemi prototypy (crowdfunding
// kampaň na Hithit.cz), embedované YouTube video pro každý prototyp.
export default function VideoSection() {
  return (
    <section id="video">
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Video
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Krok vpřed — cesta HoloBoardu
          </h2>
        </motion.div>

        <div className="mt-16 space-y-16">
          {videos.map(({ id, title, description }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <div
                className={`relative aspect-video overflow-hidden rounded-3xl bg-ink shadow-sm ${
                  index % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-ink">{title}</h3>
                <p className="mt-3 max-w-md text-muted">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
