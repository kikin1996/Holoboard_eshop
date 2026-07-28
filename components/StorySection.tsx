'use client';

// =============================================================================
// components/StorySection.tsx
// -----------------------------------------------------------------------------
// Sekce "Holoboard story" pro hlavní stránku - fotomontáž zakladatele +
// text příběhu, oddělené od zbytku stránky vrstvenou vlnkou, která se
// pomalu a nenápadně hýbe (nekonečná horizontální smyčka přes zdvojený
// SVG dlaždicový vzor - klasický trik pro plynulé "wave" pozadí).
// =============================================================================

import { motion } from 'framer-motion';
import Image from 'next/image';

const EASE = [0.16, 1, 0.3, 1] as const;

// Jedna "dlaždice" vlny (0-1440) zopakovaná dvakrát vedle sebe (0-2880) -
// T příkazy (hladké kvadratické křivky) se zrcadlí od předchozího řídicího
// bodu, takže vlna navazuje sama na sebe a smyčka je bezešvá.
function wavePath(baseline: number, amplitude: number) {
  const crest = baseline - amplitude;
  const trough = baseline + amplitude;
  return `M0,${baseline} Q180,${crest} 360,${baseline} T720,${baseline} T1080,${baseline} T1440,${baseline} T1800,${baseline} T2160,${baseline} T2520,${baseline} L2880,120 L0,120 Z`;
}

interface WaveLayerProps {
  fill: string;
  baseline: number;
  amplitude: number;
  duration: number;
  reverse?: boolean;
  opacity?: number;
}

function WaveLayer({ fill, baseline, amplitude, duration, reverse, opacity = 1 }: WaveLayerProps) {
  return (
    <motion.svg
      viewBox="0 0 2880 120"
      preserveAspectRatio="none"
      className="absolute inset-y-0 left-0 h-full w-[200%]"
      style={{ opacity }}
      animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      <path d={wavePath(baseline, amplitude)} fill={fill} />
    </motion.svg>
  );
}

export default function StorySection() {
  return (
    <section className="relative">
      {/* Vrstvené vlnky - přechod ze světlého pozadí stránky do modré sekce. */}
      <div className="relative h-24 overflow-hidden md:h-32">
        <WaveLayer fill="#EDF5FA" baseline={40} amplitude={22} duration={32} />
        <WaveLayer fill="#8ED0EF" baseline={62} amplitude={26} duration={24} reverse />
        <WaveLayer fill="#2D9CDA" baseline={86} amplitude={18} duration={20} />
      </div>

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
