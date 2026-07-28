import { NextRequest, NextResponse } from 'next/server';
import { getVariant, SHIPPING_CENTS } from '@/lib/catalog';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  // 1) Autoritativní přepočet ceny na serveru - ceny se dohledávají
  //    v katalogu podle variantId, ceně z klienta se NIKDY nevěří.
  //    (V reálném projektu by getVariant volal Medusa/Strapi admin API.)
  // ---------------------------------------------------------------------
  let itemsTotalCents = 0;
  const orderItemsData: { variantId: string; productName: string; quantity: number; unitPriceCents: number }[] = [];
  for (const item of body.items) {
    const variant = getVariant(item.variantId);
    const quantity = Math.round(item.quantity);
    if (!variant || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: `Neplatná položka košíku: ${item.variantId}` },
        { status: 400 }
      );
    }
    itemsTotalCents += variant.priceCents * quantity;
    orderItemsData.push({
      variantId: variant.variantId,
      productName: variant.name,
      quantity,
      unitPriceCents: variant.priceCents,
    });
  }

  const orderNumber = `HB-${Date.now()}`;
  const totalPriceCents = itemsTotalCents + SHIPPING_CENTS;

  // Přihlášený zákazník se k objednávce připojí rovnou (pro přehled
  // objednávek na /ucet) - checkout ale funguje i bez přihlášení (guest).
  const session = await auth();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerEmail: session?.user?.email ?? 'zakaznik@example.com', // v reálu z checkout formuláře pro guesty
      customerName: session?.user?.name ?? null,
      userId: session?.user?.id ?? null,
      totalPriceCents,
      shippingMethod: body.shipping.method,
      packetaBranchId: body.shipping.packetaBranchId,
      packetaBranchName: body.shipping.packetaBranchName,
      items: { create: orderItemsData },
    },
  });

  const merchant = process.env.COMGATE_MERCHANT_ID;
  const secret = process.env.COMGATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Bez nastavených ComGate proměnných (např. v demo/preview nasazení bez
  // reálného merchant účtu) vrátíme mock redirect na lokální "díky" stránku,
  // aby šel celý tok vyzkoušet i bez ostrých plateb. Demo objednávka nemá
  // žádnou reálnou platbu, kterou by šlo ověřit webhookem, takže ji rovnou
  // označíme jako zaplacenou.
  if (!merchant || !secret) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paymentStatus: 'PAID' },
    });
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
      email: order.customerEmail,
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
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', paymentStatus: 'CANCELLED' },
    });
    return NextResponse.json(
      { error: 'Založení platby u ComGate selhalo.', details: comgateText },
      { status: 502 }
    );
  }

  // transId se uloží k objednávce, aby ho šlo spárovat ve webhooku
  // (app/api/webhooks/comgate/route.ts) - status zůstává PENDING, dokud
  // ho webhook po ověření u ComGate nepřepne na PAID.
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentTransactionId: transId },
  });

  return NextResponse.json({ redirectUrl, transId, orderNumber });
}
