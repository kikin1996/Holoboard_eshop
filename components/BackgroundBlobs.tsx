// =============================================================================
// components/BackgroundBlobs.tsx
// -----------------------------------------------------------------------------
// Čistě dekorativní vrstva - dvě rozostřené barevné skvrny (modrá + oranžová,
// stejné barvy jako Story/Community sekce a ikony), potichu za obsahem, ať
// bílé sekce nepůsobí ploše. Vždy `aria-hidden` + `pointer-events-none` a
// rodič musí mít `relative overflow-hidden`, jinak skvrny protečou layoutem.
// =============================================================================

export default function BackgroundBlobs({
  variant = 'default',
}: {
  variant?: 'default' | 'reverse';
}) {
  const blue = 'bg-accent/20';
  const orange = 'bg-accent-orange/15';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute h-[26rem] w-[26rem] rounded-full blur-3xl ${
          variant === 'reverse' ? `-right-32 -top-32 ${orange}` : `-left-32 -top-24 ${blue}`
        }`}
      />
      <div
        className={`absolute h-[22rem] w-[22rem] rounded-full blur-3xl ${
          variant === 'reverse' ? `-bottom-24 -left-24 ${blue}` : `-bottom-32 -right-16 ${orange}`
        }`}
      />
    </div>
  );
}
