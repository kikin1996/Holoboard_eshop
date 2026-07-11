import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// POST /api/webhooks/comgate
// -----------------------------------------------------------------------------
// ComGate na tuto adresu zavolá server-to-server po každé změně stavu platby.
// Payloadu webhooku se NIKDY nevěří naslepo - vždy se stav ověří zpětným
// dotazem na ComGate (/v2.0/status) pomocí merchant+secret, protože na tuto
// URL by teoreticky mohl zavolat kdokoliv.
// =============================================================================

export async function POST(request: NextRequest) {
  // ComGate posílá notifikaci jako application/x-www-form-urlencoded
  const raw = new URLSearchParams(await request.text());

  const transId = raw.get('transId');
  const refId = raw.get('refId'); // = orderNumber z /api/checkout

  if (!transId) {
    return NextResponse.json({ error: 'Chybí transId.' }, { status: 400 });
  }

  const merchant = process.env.COMGATE_MERCHANT_ID;
  const secret = process.env.COMGATE_SECRET;

  if (!merchant || !secret) {
    return NextResponse.json({ error: 'ComGate není nakonfigurováno.' }, { status: 500 });
  }

  // --- Ověření skutečného stavu platby přímo u ComGate ---
  const statusResponse = await fetch('https://payments.comgate.cz/v2.0/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ merchant, secret, transId }),
  });

  const statusText = await statusResponse.text();
  const statusParams = new URLSearchParams(statusText);
  const verifiedStatus = statusParams.get('status'); // "PAID" | "CANCELLED" | "PENDING"

  if (verifiedStatus === 'PAID') {
    // [TODO] Najít objednávku podle refId/transId (Order.paymentTransactionId)
    // a nastavit Order.status = PAID, Order.paymentStatus = PAID,
    // odečíst sklad (Inventory.quantityReserved -> odečet z quantityAvailable)
    // a odeslat potvrzovací e-mail zákazníkovi.
    console.log(`Objednávka ${refId} (transId ${transId}) byla ověřeně zaplacena.`);
  }

  // ComGate očekává HTTP 200 jako potvrzení přijetí notifikace
  return NextResponse.json({ received: true });
}
