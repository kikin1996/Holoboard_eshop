'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';

// Navigace: "prosklená" lišta fixní nahoře. Na desktopu odkazy + košík
// s počtem kusů, na mobilu hamburger s rozbalovacím menu.
const links = [
  { href: '/holoboard', label: 'Produkt' },
  { href: '/#video', label: 'Video' },
  { href: '/#specifikace', label: 'Specifikace' },
  { href: '/#galerie', label: 'Galerie' },
  { href: '/#kontakt', label: 'Kontakt' },
];

export default function Navbar() {
  const { count, isHydrated } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo-holoboard.png"
            alt="HoloBoard"
            width={36}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/kosik"
            className="relative flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            onClick={() => setIsMenuOpen(false)}
          >
            <ShoppingBag size={16} strokeWidth={2} />
            Košík
            {isHydrated && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-orange px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={isMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-mist md:hidden"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobilní menu - rozbalí se pod lištou, kliknutí na odkaz ho zavře. */}
      {isMenuOpen && (
        <nav className="border-t border-line/60 bg-paper px-6 py-4 md:hidden">
          <ul className="space-y-1">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-ink transition-colors hover:bg-mist"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
