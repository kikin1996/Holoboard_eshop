import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// POST /api/checkout
// -----------------------------------------------------------------------------
// Volá se z components/Cart.tsx. Běží v Node runtime (výchozí pro Route
// Handlers), takže smí bezpečně sahat na tajné proměnné prostředí.
//
// Co dělá:
//   1) Ověří vstup od klienta (jen variantId + quantity, žádná cena).
//   2) [TODO v reálném projektu] Dopočítá cenu podle aktuální ceny varianty
//      v Meduse/Strapi (server-to-server, admin token) a zapíše objednávku.
//   3) Založí platbu u ComGate (POST /v2.0/create) a vrátí redirectUrl.
// =============================================================================

interface CheckoutRequestBody {
  items: { variantId: string; quantity: number }[];
  shipping: {
    method: 'PACKETA_ZBOX' | 'PACKETA_HOME' | 'COURIER';
    packetaBranchId: string;
    packetaBranchName: string;
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequestBody;

  if (!body.items?.length || !body.shipping?.packetaBranchId) {
    return NextResponse.json(
      { error: 'Chybí položky košíku nebo výdejní místo.' },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------
  // 1) Zde by v reálném projektu proběhlo:
  //    - dotaz na Medusa/Strapi admin API pro aktuální ceny variant podle
  //      body.items[].variantId (NIKDY nedůvěřovat ceně z klienta),
  //    - vytvoření Order záznamu se statusem PENDING a uložením
  //      shipping.packetaBranchId / packetaBranchName (viz schema.prisma).
  //
  // Pro přehlednost ukázky simulujeme výsledek pevnou částkou a číslem
  // objednávky - v produkci nahraďte skutečným voláním Medusa/Strapi.
  // ---------------------------------------------------------------------
  const orderNumber = `HB-${Date.now()}`;
  const totalPriceCents = 2499000 + 7900; // demo: cena + doprava

  const merchant = process.env.COMGATE_MERCHANT_ID;
  const secret = process.env.COMGATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Bez nastavených ComGate proměnných (např. v demo/preview nasazení bez
  // reálného merchant účtu) vrátíme mock redirect na lokální "díky" stránku,
  // aby šel celý tok vyzkoušet i bez ostrých plateb.
  if (!merchant || !secret) {
    return NextResponse.json({
      redirectUrl: `${siteUrl}/objednavka/dekujeme?demo=1&orderNumber=${orderNumber}`,
    });
  }

  // ---------------------------------------------------------------------
  // 2) Reálné založení platby u ComGate - server-to-server, secret
  //    se nikdy neposílá klientovi.
  // ---------------------------------------------------------------------
  const comgateResponse = await fetch('https://payments.comgate.cz/v2.0/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      merchant,
      secret,
      test: process.env.COMGATE_TEST_MODE === 'true' ? 'true' : 'false',
      price: String(totalPriceCents), // haléře
      curr: 'CZK',
      label: 'HoloBoard objednávka',
      refId: orderNumber, // interní číslo objednávky - použije se pro párování webhooku
      method: 'ALL',
      email: 'zakaznik@example.com', // v reálu z formuláře/session
      redirectUrl: `${siteUrl}/objednavka/dekujeme?orderNumber=${orderNumber}`,
      cancelUrl: `${siteUrl}/kosik?zruseno=1`,
    }),
  });

  const comgateText = await comgateResponse.text();
  // ComGate vrací klasický "application/x-www-form-urlencoded" formát odpovědi
  const params = new URLSearchParams(comgateText);
  const redirectUrl = params.get('redirect');
  const transId = params.get('transId');
  const code = params.get('code'); // "0" = OK

  if (code !== '0' || !redirectUrl) {
    return NextResponse.json(
      { error: 'Založení platby u ComGate selhalo.', details: comgateText },
      { status: 502 }
    );
  }

  // [TODO] Uložit transId + orderNumber k objednávce (Order.paymentTransactionId),
  // aby ho šlo spárovat ve webhooku - viz app/api/webhooks/comgate/route.ts.

  return NextResponse.json({ redirectUrl, transId, orderNumber });
}
