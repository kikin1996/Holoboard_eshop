import Link from 'next/link';

// Stránka 404 - drží vizuální jazyk webu a nabízí cestu zpět.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-32 text-center md:py-40">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        Chyba 404
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink md:text-6xl">
        Stránka nenalezena
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-lg text-muted">
        Vypadá to, že jste odbočili z proudu. Stránka, kterou hledáte,
        neexistuje nebo byla přesunuta.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
        >
          Zpět na hlavní stránku
        </Link>
        <Link
          href="/holoboard"
          className="rounded-full border border-line px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Prohlédnout HoloBoard
        </Link>
      </div>
    </main>
  );
}
