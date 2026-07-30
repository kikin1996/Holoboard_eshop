'use client';

// =============================================================================
// components/WaveTransition.tsx
// -----------------------------------------------------------------------------
// Sdílená vrstvená vlnka pro přechod mezi světlým pozadím stránky a plnou/
// tónovanou barvou sekce - vytažena ze StorySection, aby ji šlo použít i
// jinde s jinou paletou barev (viz FeatureSection `waveBottom`).
// =============================================================================

import { motion } from 'framer-motion';

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

interface WaveTransitionProps {
  flip?: boolean;
  // Tři barvy odshora dolů (nejsvětlejší -> střední -> nejsytější/shodná se
  // sousedící plnou sekcí). Při `flip` se celý blok otočí o 180°, takže
  // nejsytější vrstva "naváže" nahoře a nejsvětlejší dole (výstup zpátky do
  // světlého pozadí).
  colors?: [string, string, string];
}

export default function WaveTransition({
  flip,
  colors = ['#EDF5FA', '#8ED0EF', '#2D9CDA'],
}: WaveTransitionProps) {
  return (
    <div className={`relative h-24 overflow-hidden md:h-32 ${flip ? 'rotate-180' : ''}`}>
      <WaveLayer fill={colors[0]} baseline={40} amplitude={22} duration={32} />
      <WaveLayer fill={colors[1]} baseline={62} amplitude={26} duration={24} reverse />
      <WaveLayer fill={colors[2]} baseline={86} amplitude={18} duration={20} />
    </div>
  );
}
