import Cart from '@/components/Cart';

// Ukázková data - v reálném provozu by se položky natáhly z Medusa Cart API
// podle cart ID uloženého v cookie (viz ARCHITECTURE.md, kap. 1.3).
const sampleItems = [
  {
    variantId: 'variant-ocean-blue-weekend',
    name: 'HoloBoard Original — Ocean Blue / Weekend Kit',
    unitPriceCents: 2499000, // 24 990 Kč
    quantity: 1,
  },
  {
    variantId: 'variant-sand-white-none',
    name: 'HoloBoard Original — Sand White / Bez příslušenství',
    unitPriceCents: 2199000, // 21 990 Kč
    quantity: 1,
  },
];

export default function HomePage() {
  return <Cart initialItems={sampleItems} />;
}
