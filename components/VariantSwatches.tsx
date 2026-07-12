// Vizuál pro sekci "Produkt" - preview barevných variant, odpovídá
// ProductOptionValue "Barva" ze schema.prisma (Ocean Blue / Sand White).
const variants = [
  { name: 'Ocean Blue', hex: '#0E7C86' },
  { name: 'Sand White', hex: '#E7E2D8' },
];

export default function VariantSwatches() {
  return (
    <div className="space-y-6">
      {variants.map((variant) => (
        <div
          key={variant.name}
          className="flex items-center gap-4 rounded-2xl bg-mist p-4"
        >
          <span
            className="h-10 w-10 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
            style={{ backgroundColor: variant.hex }}
          />
          <div>
            <p className="font-medium text-ink">{variant.name}</p>
            <p className="text-sm text-muted">HoloBoard Original</p>
          </div>
        </div>
      ))}
      <p className="pt-2 text-sm text-muted">
        Volitelně s příslušenstvím Weekend Kit nebo bez příslušenství.
      </p>
    </div>
  );
}
