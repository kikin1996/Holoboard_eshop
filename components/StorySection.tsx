'use client';

// =============================================================================
// components/StorySection.tsx
// -----------------------------------------------------------------------------
// Sekce "Holoboard story" pro hlavní stránku - fotomontáž zakladatele +
// text příběhu, oddělené od zbytku stránky vrstvenou vlnkou (viz
// WaveTransition), která se pomalu a nenápadně hýbe.
// =============================================================================

import { motion } from 'framer-motion';
import Image from 'next/image';
import WaveTransition from '@/components/WaveTransition';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function StorySection() {
  return (
    <section className="relative">
      {/* Vrstvené vlnky - přechod ze světlého pozadí stránky do modré sekce. */}
      <WaveTransition />

      <div className="bg-accent">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-4 md:grid-cols-2 md:gap-16 md:pb-32 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative mx-auto w-full max-w-sm md:mx-0 md:-ml-6"
          >
            <Image
              src="/story/rodina.png"
              alt="Zakladatel HoloBoardu s rodinou a prvním prototypem"
              width={520}
              height={545}
              className="h-auto w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="text-white"
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-white/70">
              Holoboard story
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Naše cesta – příběh HoloBoardu
            </h2>

            <div className="mt-6 space-y-4 text-white/90">
              <p>
                Na VUT v Brně jsem jezdil na kajaku na Svratce a tahle vášeň mi
                zůstala. Po škole jsem ale neměl kde kajak skladovat, a tak
                jsem si pořídil paddleboard. Ten mi ale nikdy neposkytl
                pohodlí, na které jsem byl zvyklý.
              </p>
              <p>
                Jedno léto u moře mě napadlo – proč bych nemohl při pádlování
                sedět ve vodě a pohodlně se opírat přímo o tělo paddleboardu?
                Z myšlenky vznikl první prototyp, pak Hithit kampaň a další
                vylepšování.
              </p>
              <p>
                Dnes je z toho HoloBoard – spojení svobody paddleboardu
                s pohodlím kajaku.
              </p>
            </div>

            <Image
              src="/story/podpis.svg"
              alt="Podpis zakladatele"
              width={140}
              height={65}
              className="mt-8 brightness-0 invert"
            />
            <p className="mt-2 text-sm text-white/70">
              <span className="font-semibold text-white">Ing. Kristián Karas</span> – zakladatel HoloBoardu
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
