'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import type { ProductVariant } from '@/lib/catalog';

// Nákupní blok produktové stránky: stepper množství + "Do košíku".
// Po přidání se na pár vteřin ukáže potvrzení a odkaz do košíku.
export default function AddToCart({ variant }: { variant: ProductVariant }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleAdd = () => {
    addItem(
      {
        variantId: variant.variantId,
        name: variant.name,
        unitPriceCents: variant.priceCents,
      },
      quantity
    );
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 4000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Stepper množství */}
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Snížit množství"
            className="flex h-12 w-12 items-center justify-center rounded-l-full text-ink transition-colors hover:bg-mist disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span
            aria-live="polite"
            className="w-10 text-center text-sm font-medium text-ink"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            aria-label="Zvýšit množství"
            className="flex h-12 w-12 items-center justify-center rounded-r-full text-ink transition-colors hover:bg-mist"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
        >
          {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          {justAdded ? 'Přidáno do košíku' : 'Do košíku'}
        </button>

        <a
          href="mailto:info@holoboard.cz"
          className="rounded-full border border-line px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Zeptat se
        </a>
      </div>

      {justAdded && (
        <p className="mt-4 text-sm text-muted" role="status">
          Produkt je v košíku.{' '}
          <Link
            href="/kosik"
            className="font-medium text-accent underline underline-offset-4"
          >
            Přejít k pokladně →
          </Link>
        </p>
      )}
    </div>
  );
}
