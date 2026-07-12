import type { Metadata } from 'next';
import Cart from '@/components/Cart';

export const metadata: Metadata = {
  title: 'Košík',
  description: 'Váš nákupní košík - doprava Zásilkovnou, platba přes ComGate.',
  robots: { index: false }, // košík do vyhledávačů nepatří
};

interface PageProps {
  searchParams: { zruseno?: string };
}

// Obsah košíku žije v CartContextu (localStorage) - stránka jen předá
// příznak zrušené platby, když se zákazník vrátí z ComGate přes cancelUrl.
export default function CartPage({ searchParams }: PageProps) {
  return <Cart paymentCancelled={searchParams.zruseno === '1'} />;
}
