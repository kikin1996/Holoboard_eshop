'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/CartContext';

// Po úspěšném dokončení objednávky (návrat z platební brány na "děkujeme")
// se košík vyprázdní, aby zákazník omylem neobjednal podruhé.
export default function ClearCartOnMount() {
  const { clear, isHydrated } = useCart();

  useEffect(() => {
    if (isHydrated) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  return null;
}
