'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import type { ProductVariant } from '@/lib/catalog';

const CONTACT_EMAIL = 'info@holoboard.cz';

// Nákupní blok produktové stránky: stepper množství + "Do košíku".
// Po přidání se na pár vteřin ukáže potvrzení a odkaz do košíku.
export default function AddToCart({ variant }: { variant: ProductVariant }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(1);
  const [emailCopied, setEmailCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    };
  }, []);

  // "mailto:" nic neudělá viditelně, pokud návštěvník nemá v systému
  // nastavený výchozí e-mailový klient - proto adresu navíc zkopírujeme
  // do schránky a zobrazíme potvrzení, ať tlačítko vždy k něčemu vede.
  // Default navigaci schválně zastavíme a mailto spustíme až PO dokončení
  // kopírování - jinak prohlížeč při pokusu otevřít mail klienta odebere
  // stránce focus a zápis do schránky tiše selže.
  const handleAskClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    navigator.clipboard
      .writeText(CONTACT_EMAIL)
      .then(() => {
        setEmailCopied(true);
        if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
        copyResetTimer.current = setTimeout(() => setEmailCopied(false), 4000);
      })
      .catch(() => {
        // Clipboard API nemusí být dostupné (starší prohlížeč, zakázaná
        // oprávnění) - mailto odkaz i tak proběhne dál.
      })
      .finally(() => {
        window.location.href = `mailto:${CONTACT_EMAIL}`;
      });
  };

  const handleAdd = () => {
    addItem(
      {
        variantId: variant.variantId,
        name: variant.name,
        unitPriceCents: variant.priceCents,
      },
      quantity
    );
    setAddedQuantity(quantity);
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
          href={`mailto:${CONTACT_EMAIL}`}
          onClick={handleAskClick}
          className="rounded-full border border-line px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Zeptat se
        </a>
      </div>

      {emailCopied && (
        <p
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-green-600"
          role="status"
        >
          <Check size={16} strokeWidth={2.5} />
          E-mail {CONTACT_EMAIL} zkopírován do schránky.
        </p>
      )}

      {/* Velké, nepřehlédnutelné potvrzení přidání do košíku - fixní pozice,
          ať ho zákazník uvidí i po scrollu pryč od tlačítka. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              role="status"
              className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-ink px-6 py-4 text-white shadow-2xl"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <Check size={20} strokeWidth={3} />
              </span>
              <div>
                <p className="text-base font-semibold">Přidáno do košíku</p>
                <p className="text-sm text-white/70">
                  {addedQuantity}× {variant.name}
                </p>
              </div>
              <Link
                href="/kosik"
                className="ml-2 shrink-0 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
              >
                Košík →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
