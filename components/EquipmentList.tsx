import { Check } from 'lucide-react';

const equipment = [
  'Sedačka s nylonovými popruhy a kovovými karabinkami',
  'Ruční nafukovací pumpa s hadicí',
  'Konvertibilní pádlo 2v1 — kajakové i SUP',
  'Pojistný leash na nohu',
  'Odnímatelná středová ploutev',
  'Transportní batoh na přenášení a skladování',
];

// Vizuál pro sekci "Vybavení" - co je součástí balení.
export default function EquipmentList() {
  return (
    <ul className="space-y-4">
      {equipment.map((item) => (
        <li key={item} className="flex items-start gap-4">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mist text-accent">
            <Check size={14} strokeWidth={2.5} />
          </span>
          <span className="text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
