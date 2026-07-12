import { Timer, ShieldCheck, Weight } from 'lucide-react';

const specs = [
  {
    icon: Timer,
    label: 'Přeměna sedu ↔ stand',
    value: 'pod 10 sekund',
  },
  {
    icon: ShieldCheck,
    label: 'Odolnost materiálu',
    value: 'mořská i sladká voda',
  },
  {
    icon: Weight,
    label: 'Nosnost systému',
    value: 'do 120 kg',
  },
];

// Vizuál pro sekci "Technologie" - jednoduchá specifikační mřížka
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
