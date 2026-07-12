import { Layers, Weight, Ruler, Gauge } from 'lucide-react';

const specs = [
  {
    icon: Layers,
    label: 'Konstrukce',
    value: 'nafukovací SUP, dvouvrstvý PVC drop-stitch',
  },
  {
    icon: Weight,
    label: 'Nosnost',
    value: '110 kg (doporučeno do ~90 kg jezdce)',
  },
  {
    icon: Ruler,
    label: 'Rozměry',
    value: '320 × 88 × 15 cm',
  },
  {
    icon: Gauge,
    label: 'Doporučený tlak',
    value: '12–15 PSI',
  },
];

// Vizuál pro sekci "Specifikace" - jednoduchá specifikační mřížka
// místo produktové fotografie.
export default function SpecGrid() {
  return (
    <div className="space-y-8">
      {specs.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mist text-accent">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-lg font-medium text-ink">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
