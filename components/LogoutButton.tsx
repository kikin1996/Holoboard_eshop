'use client';

import { signOut } from 'next-auth/react';
import { useCart } from '@/components/CartContext';

// Košík žije v localStorage sdíleném celým prohlížečem, ne per-účet -
// při odhlášení ho proto schválně vyprázdníme, ať v něm další přihlášený
// (nebo odhlášený) návštěvník na stejném zařízení nevidí cizí položky.
export default function LogoutButton() {
  const { clear } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        clear();
        void signOut({ callbackUrl: '/' });
      }}
      className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
    >
      Odhlásit se
    </button>
  );
}
