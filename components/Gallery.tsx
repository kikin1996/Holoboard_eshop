'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const EASE = [0.16, 1, 0.3, 1] as const;

const photos = [
  { src: '/gallery/P1574883-min.jpg', alt: 'HoloBoard na vodě' },
  { src: '/gallery/P1574905-min.jpg', alt: 'HoloBoard detail' },
  { src: '/gallery/P1574907-min.jpg', alt: 'HoloBoard v akci' },
  { src: '/gallery/P1574944OB-min.jpg', alt: 'HoloBoard s jezdcem' },
  { src: '/gallery/P1574966-min.jpg', alt: 'HoloBoard na klidné vodě' },
  { src: '/gallery/P1574989-min.jpg', alt: 'HoloBoard testovací jízda' },
];

// Sekce "Galerie" - reálné produktové fotky HoloBoardu (staženo z
// shop.holoboard.cz/user/documents/upload/, viz public/gallery).
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
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.05 }}
              className="relative aspect-square overflow-hidden rounded-3xl bg-paper shadow-sm"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
