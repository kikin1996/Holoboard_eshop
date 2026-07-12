'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

// Fotky produktu - hlavní snímek + přepínatelné náhledy.
const photos = [
  { src: '/gallery/P1574944OB-min.jpg', alt: 'HoloBoard s jezdcem na vodě' },
  { src: '/gallery/0906-min.jpg', alt: 'HoloBoard na výletě u jezera' },
  { src: '/gallery/P1574883-min.jpg', alt: 'HoloBoard na vodě' },
  { src: '/gallery/P1574905-min.jpg', alt: 'HoloBoard detail konstrukce' },
  { src: '/gallery/P1574966-min.jpg', alt: 'HoloBoard na klidné vodě' },
];

// Galerie produktové stránky - velký snímek s jemným prolnutím při změně
// a řada náhledů pod ním. Drží vizuální jazyk webu (rounded-3xl, bg-mist).
export default function ProductGallery() {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
        {/* key vynutí remount při změně fotky → přehraje se jemný fade-in */}
        <motion.div
          key={photos[selected].src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={photos[selected].src}
            alt={photos[selected].alt}
            fill
            priority={selected === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setSelected(index)}
            aria-label={`Zobrazit fotku: ${photo.alt}`}
            className={`relative aspect-square overflow-hidden rounded-2xl bg-mist transition-all ${
              selected === index
                ? 'ring-2 ring-accent ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="10vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
