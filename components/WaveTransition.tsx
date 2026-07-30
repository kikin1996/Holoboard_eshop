'use client';

// =============================================================================
// components/WaveTransition.tsx
// -----------------------------------------------------------------------------
// Sdílená vrstvená vlnka pro přechod mezi světlým pozadím stránky a plnou/
// tónovanou barvou sekce - vytažena ze StorySection, aby ji šlo použít i
// jinde s jinou paletou barev (viz FeatureSection `waveBottom`).
// =============================================================================

// Jedna "dlaždice" vlny (0-1440) zopakovaná dvakrát vedle sebe (0-2880) -
// T příkazy (hladké kvadratické křivky) se zrcadlí od předchozího řídicího
// bodu, takže vlna navazuje sama na sebe a smyčka je bezešvá.
//
// Pozor: řídicí bod kvadratické křivky NENÍ bod, kterým křivka prochází -
// skutečný vrchol vykreslené vlny leží v půlce mezi baseline a řídicím
// bodem (B(0.5) = (baseline + control) / 2). Aby `amplitude` odpovídala
// skutečné viditelné výchylce, musí se řídicí bod posunout o dvojnásobek.
function wavePath(baseline: number, amplitude: number) {
  const control = baseline - amplitude * 2;
  return `M0,${baseline} Q180,${control} 360,${baseline} T720,${baseline} T1080,${baseline} T1440,${baseline} T1800,${baseline} T2160,${baseline} T2520,${baseline} L2880,120 L0,120 Z`;
}

interface WaveLayerProps {
  fill: string;
  baseline: number;
  amplitude: number;
  duration: number;
  reverse?: boolean;
}

// Čistá CSS animace (@keyframes wave-scroll, viz globals.css) místo
// framer-motion smyčky - běží na compositor threadu, takže se neseká při
// hydrataci/JS vytížení stránky, na rozdíl z předchozí `animate={{ x: [...] }}`
// verze.
function WaveLayer({ fill, baseline, amplitude, duration, reverse }: WaveLayerProps) {
  return (
    <svg
      viewBox="0 0 2880 120"
      preserveAspectRatio="none"
      className="absolute inset-y-0 left-0 h-full w-[200%]"
      style={{ animation: `wave-scroll ${duration}s linear infinite ${reverse ? 'reverse' : 'normal'}` }}
    >
      <path d={wavePath(baseline, amplitude)} fill={fill} />
    </svg>
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
    // backgroundColor = nejsvětlejší vrstva - vyplní i tu tenkou "mezeru" nad
    // vrcholem vlny, kterou by jinak prosvítalo pozadí rodiče (bílá stránka,
    // nebo u FeatureSection dokonce oranžová sekce, do níž je vlna vnořená).
    <div
      className={`relative h-24 overflow-hidden md:h-32 ${flip ? 'rotate-180' : ''}`}
      style={{ backgroundColor: colors[0] }}
    >
      <WaveLayer fill={colors[0]} baseline={30} amplitude={30} duration={32} />
      <WaveLayer fill={colors[1]} baseline={55} amplitude={27} duration={24} reverse />
      <WaveLayer fill={colors[2]} baseline={84} amplitude={20} duration={20} />
    </div>
  );
}
