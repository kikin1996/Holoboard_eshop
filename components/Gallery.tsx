'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const captions = [
  'Testovací jízda na jezeře',
  'Detail sedačky a popruhů',
  'Konvertibilní pádlo 2v1',
  'Transportní batoh',
  'V kajakovém režimu',
  'Rodinný výlet na vodě',
];

// Sekce "Galerie" - dokud nejsou k dispozici reálné produktové fotky,
// drží stejnou mřížku jako budoucí fotogalerie (nahradit <img> po dodání fotek).
export default function Gallery() {
  return (
    <section id="galerie" className="bg-mist">
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Galerie
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Holo Board v akci
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
          {captions.map((caption, index) => (
            <motion.div
              key={caption}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.05 }}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl bg-paper p-6 text-center shadow-sm"
            >
              <ImageIcon size={28} strokeWidth={1.5} className="text-accent" />
              <p className="text-sm text-muted">{caption}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
