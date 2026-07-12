'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Křivka a časování odpovídají DESIGN.md - jemný "ease-out-expo" pocit,
// žádné rychlé/agresivní animace.
const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-32 md:pt-28">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            Patentováno v České republice
          </p>
          <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl">
            2 v 1 — paddleboard
            <br />i kajak.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Holo Board je unikátní hybridní produkt, který kombinuje výhody
            paddleboardu a kajaku v jednom designu. Vhodné pro děti, dospělé i
            úplné začátečníky.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/holoboard"
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Koupit HoloBoard
            </Link>
            <Link
              href="#specifikace"
              className="rounded-full border border-line px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
            >
              Specifikace
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted">
            Momentálně v předprodeji · dodací lhůta 6–14 týdnů
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist"
        >
          <Image
            src="/gallery/0906-min.jpg"
            alt="HoloBoard na výletě u jezera"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
