import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import ClearCartOnMount from '@/components/ClearCartOnMount';

export const metadata: Metadata = {
  title: 'Děkujeme za objednávku',
  robots: { index: false },
};

interface PageProps {
  searchParams: { orderNumber?: string; demo?: string };
}

// Zákazník sem přijde po návratu z ComGate (redirectUrl). Stránka NESMÍ
// sama o sobě označit objednávku za zaplacenou - o tom rozhoduje jen
// ověřený webhook (app/api/webhooks/comgate/route.ts). Tady se v reálném
// projektu jen zeptáme vlastního backendu na aktuální (ověřený) stav.
export default function ThankYouPage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
      <ClearCartOnMount />

      {searchParams.demo && (
        <div className="mb-10 flex items-start gap-3 rounded-2xl border-2 border-accent-orange bg-accent-orange/10 p-5 text-left">
          <TriangleAlert size={22} className="mt-0.5 shrink-0 text-accent-orange" strokeWidth={2} />
          <div>
            <p className="font-semibold text-ink">Toto je testovací (demo) objednávka</p>
            <p className="mt-1 text-sm text-ink/80">
              E-shop zatím nemá napojený skutečný platební systém (ComGate),
              proto se nikdo nezeptal na způsob platby a <strong>žádné peníze
              se nikde nestrhly</strong>. Jakmile bude ComGate účet zapojený,
              tahle stránka se zobrazí až po opravdovém zaplacení.
            </p>
          </div>
        </div>
      )}

      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist text-accent">
        <CheckCircle2 size={32} strokeWidth={1.75} />
      </span>

      <h1 className="mt-8 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Děkujeme za objednávku
      </h1>

      {searchParams.orderNumber && (
        <p className="mt-5 text-lg text-muted">
          Číslo objednávky:{' '}
          <strong className="font-semibold text-ink">
            {searchParams.orderNumber}
          </strong>
        </p>
      )}

      <div className="mt-8 space-y-3 rounded-3xl bg-mist p-6 text-sm text-muted">
        {!searchParams.demo && (
          <p>
            Stav platby ověřujeme u ComGate na pozadí - potvrzení objednávky
            vám dorazí e-mailem.
          </p>
        )}
        <p>
          HoloBoard je v předprodeji, počítejte prosím s dodací lhůtou
          6–14 týdnů. Objednávky vyřizujeme v pořadí jejich přijetí.
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-accent-dark"
      >
        Zpět na hlavní stránku
      </Link>

      <p className="mt-8 text-sm text-muted">
        Máte dotaz k objednávce? Napište na{' '}
        <a
          href="mailto:info@holoboard.cz"
          className="font-medium text-accent underline underline-offset-4"
        >
          info@holoboard.cz
        </a>
        .
      </p>
    </main>
  );
}
