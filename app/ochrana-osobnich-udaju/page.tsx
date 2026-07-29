import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů',
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Ochrana osobních údajů
      </h1>

      <div className="mt-8 rounded-2xl border-2 border-accent-orange bg-accent-orange/10 p-5 text-sm text-ink">
        <p className="font-semibold">Tahle stránka zatím neobsahuje finální zásady zpracování osobních údajů.</p>
        <p className="mt-2 text-ink/80">
          Než e-shop opravdu spustíte, doplňte sem reálný text podle GDPR -
          musí popisovat, jaké údaje o zákaznících sbíráte (jméno, e-mail,
          telefon, adresa, historie objednávek), za jakým účelem, jak dlouho
          je uchováváte, komu je předáváte (ComGate, Zásilkovna, Resend) a
          jaká práva mají zákazníci k žádosti o výmaz či opravu.
        </p>
      </div>

      <p className="mt-8 text-sm text-muted">
        Máte otázku mezitím? Napište na{' '}
        <a href="mailto:info@holoboard.cz" className="font-medium text-accent underline underline-offset-4">
          info@holoboard.cz
        </a>
        .
      </p>
    </main>
  );
}
