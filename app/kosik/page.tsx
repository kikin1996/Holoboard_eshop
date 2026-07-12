import Cart from '@/components/Cart';

// Ukázková data - v reálném provozu by se položky natáhly z Medusa Cart API
// podle cart ID uloženého v cookie (viz ARCHITECTURE.md, kap. 1.3).
const sampleItems = [
  {
    variantId: 'holoboard-standard',
    name: 'HoloBoard — 2v1 Paddleboard a Kajak',
    unitPriceCents: 899000, // 8 990 Kč
    quantity: 1,
  },
];

export default function CartPage() {
  return <Cart initialItems={sampleItems} />;
}
