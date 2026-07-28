import { Resend } from 'resend';
import { formatPrice } from '@/lib/catalog';

// Bez RESEND_API_KEY (např. lokální vývoj bez nastaveného .env) e-maily
// jen tiše přeskočíme - stejný vzor jako ComGate v /api/checkout.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Dokud není ověřená vlastní doména (RESEND_FROM_EMAIL v .env.example),
// Resend dovolí odesílat jen z jejich testovací adresy.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'HoloBoard <onboarding@resend.dev>';

interface OrderEmailInput {
  to: string;
  orderNumber: string;
  totalPriceCents: number;
}

export async function sendOrderPaidEmail({ to, orderNumber, totalPriceCents }: OrderEmailInput) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Objednávka ${orderNumber} je zaplacená`,
    html: `
      <p>Dobrý den,</p>
      <p>Vaše objednávka <strong>${orderNumber}</strong> v hodnotě ${formatPrice(totalPriceCents)} byla úspěšně zaplacena.</p>
      <p>HoloBoard je v předprodeji, počítejte prosím s dodací lhůtou 6–14 týdnů. Jakmile objednávku odešleme, dáme vám vědět.</p>
      <p>Máte dotaz? Napište na <a href="mailto:info@holoboard.cz">info@holoboard.cz</a>.</p>
    `,
  });
}

export async function sendOrderFulfilledEmail({ to, orderNumber }: Omit<OrderEmailInput, 'totalPriceCents'>) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Objednávka ${orderNumber} byla odeslána`,
    html: `
      <p>Dobrý den,</p>
      <p>Vaše objednávka <strong>${orderNumber}</strong> byla předána dopravci a míří k vám.</p>
      <p>Máte dotaz? Napište na <a href="mailto:info@holoboard.cz">info@holoboard.cz</a>.</p>
    `,
  });
}
