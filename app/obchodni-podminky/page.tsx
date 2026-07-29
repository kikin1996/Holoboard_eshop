import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obchodní podmínky',
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Obchodní podmínky</h1>

      <div className="mt-8 rounded-2xl border-2 border-accent-orange bg-accent-orange/10 p-5 text-sm text-ink">
        <p className="font-semibold">Tahle stránka zatím neobsahuje finální obchodní podmínky.</p>
        <p className="mt-2 text-ink/80">
          Než e-shop opravdu spustíte, doplňte sem reálný text (doporučujeme
          nechat zkontrolovat nebo sepsat právníkem) - musí pokrývat mimo
          jiné uzavření kupní smlouvy, cenu a platební podmínky, dodací
          lhůty, právo na odstoupení od smlouvy do 14 dnů a reklamační řád.
        </p>
      </div>

      <p className="mt-8 text-sm text-muted">
        Máte otázku k objednávce mezitím? Napište na{' '}
        <a href="mailto:info@holoboard.cz" className="font-medium text-accent underline underline-offset-4">
          info@holoboard.cz
        </a>
        .
      </p>
    </main>
  );
}
