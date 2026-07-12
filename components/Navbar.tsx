import Link from 'next/link';

// Jednoduchá, "prosklená" navigace - fixní nahoře, minimum prvků (logo, 2 odkazy, košík).
// Drží se zásady designu: hodně bílého prostoru, žádná barva navíc kromě akcentu na hover.
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          HoloBoard
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/#produkt" className="transition-colors hover:text-ink">
            Produkt
          </Link>
          <Link href="/#technologie" className="transition-colors hover:text-ink">
            Technologie
          </Link>
        </nav>

        <Link
          href="/kosik"
          className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Košík
        </Link>
      </div>
    </header>
  );
}
