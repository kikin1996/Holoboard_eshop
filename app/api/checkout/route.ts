import { NextRequest, NextResponse } from 'next/server';
import { getVariant, SHIPPING_CENTS } from '@/lib/catalog';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendOrderPaidEmail } from '@/lib/email';

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
//   3) Založí platbu u Stripe (Checkout Session) a vrátí redirectUrl.
// =============================================================================

interface CheckoutRequestBody {
  items: { variantId: string; quantity: number }[];
  name?: string;
  email?: string;
  phone?: string;
  shipping:
    | { method: 'PACKETA_ZBOX'; packetaBranchId: string; packetaBranchName: string }
    | { method: 'PPL_ZBOX'; pickupPointName: string }
    | { method: 'PACKETA_HOME' | 'COURIER'; street: string; city: string; zipCode: string };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequestBody;

  const shipping = body.shipping;
  const hasValidShipping =
    shipping?.method === 'PACKETA_ZBOX'
      ? Boolean(shipping.packetaBranchId)
      : shipping?.method === 'PPL_ZBOX'
        ? Boolean(shipping.pickupPointName?.trim())
        : shipping?.method === 'PACKETA_HOME' || shipping?.method === 'COURIER'
          ? Boolean(shipping.street?.trim() && shipping.city?.trim() && shipping.zipCode?.trim())
          : false;

  if (!body.items?.length || !hasValidShipping) {
    return NextResponse.json(
      { error: 'Chybí položky košíku nebo doručovací údaje.' },
      { status: 400 }
    );
  }

  // Přihlášený zákazník má jméno, e-mail a telefon na účtu (bezpečnější než
  // věřit tělu požadavku) - host musí vše zadat v checkout formuláři, aby ho
  // šlo identifikovat, zkontaktovat kvůli doručení a poslat mu notifikace.
  const session = await auth();
  const guestEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const guestName = typeof body.name === 'string' ? body.name.trim() : '';
  const guestPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const customerEmail = session?.user?.email ?? guestEmail;
  const customerName = session?.user?.name ?? guestName;
  const customerPhone = guestPhone; // profil telefon zatím do session nedáváme, viz /api/profile

  if (!customerEmail || !customerEmail.includes('@')) {
    return NextResponse.json(
      { error: 'Zadejte prosím platný e-mail pro potvrzení objednávky.' },
      { status: 400 }
    );
  }
  if (!customerName) {
    return NextResponse.json(
      { error: 'Zadejte prosím jméno a příjmení.' },
      { status: 400 }
    );
  }
  if (!customerPhone) {
    return NextResponse.json(
      { error: 'Zadejte prosím telefonní číslo pro doručení.' },
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

  // Podle zvoleného způsobu dopravy se do objednávky (a případně profilu)
  // ukládají jiná pole - Packeta výdejní místo má ID + název z widgetu, PPL
  // výdejní místo zatím jen ručně zadaný název (žádné veřejné PPL API/widget),
  // doručení domů (oběma dopravci) sdílí stejnou adresu.
  const orderShippingData =
    shipping.method === 'PACKETA_ZBOX'
      ? { packetaBranchId: shipping.packetaBranchId, packetaBranchName: shipping.packetaBranchName }
      : shipping.method === 'PPL_ZBOX'
        ? { packetaBranchName: shipping.pickupPointName }
        : { shippingStreet: shipping.street, shippingCity: shipping.city, shippingZip: shipping.zipCode };

  // Přihlášenému zákazníkovi rovnou uložíme použité doručovací údaje (a
  // telefon) na profil, ať se mu příště v checkoutu samy předvyplní (viz
  // Cart.tsx a ProfileForm.tsx) - jen tu jednu věc, kterou zrovna použil, se
  // druhou (např. dřív uložené výdejní místo) nepřepisuje. PPL výdejní místo
  // (volný text) se na profil zatím neukládá.
  if (session?.user) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: customerPhone,
        ...(shipping.method === 'PACKETA_ZBOX'
          ? { savedPacketaBranchId: shipping.packetaBranchId, savedPacketaBranchName: shipping.packetaBranchName }
          : shipping.method === 'PACKETA_HOME' || shipping.method === 'COURIER'
            ? { street: shipping.street, city: shipping.city, zipCode: shipping.zipCode }
            : {}),
      },
    });
  }

  // Přihlášený zákazník se k objednávce připojí rovnou (pro přehled
  // objednávek na /ucet) - checkout ale funguje i bez přihlášení (guest).
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      userId: session?.user?.id ?? null,
      totalPriceCents,
      shippingMethod: shipping.method,
      ...orderShippingData,
      items: { create: orderItemsData },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Bez nastaveného STRIPE_SECRET_KEY (např. lokální vývoj / demo nasazení
  // bez účtu) vrátíme mock redirect na "díky" stránku, aby šel celý tok
  // vyzkoušet i bez ostrých plateb. Demo objednávka nemá žádnou reálnou
  // platbu, kterou by šlo ověřit webhookem, takže ji rovnou označíme jako
  // zaplacenou.
  if (!stripe) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paymentStatus: 'PAID' },
    });
    await sendOrderPaidEmail({ to: customerEmail, orderNumber, totalPriceCents });
    return NextResponse.json({
      redirectUrl: `${siteUrl}/objednavka/dekujeme?demo=1&orderNumber=${orderNumber}`,
    });
  }

  // ---------------------------------------------------------------------
  // 2) Reálné založení platby u Stripe (Checkout Session) - tajný klíč se
  //    nikdy neposílá klientovi, jen se z něj server-to-server vytvoří
  //    session a klientovi se vrátí jen hostovaná platební URL.
  // ---------------------------------------------------------------------
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        ...orderItemsData.map((item) => ({
          price_data: {
            currency: 'czk',
            product_data: { name: item.productName },
            unit_amount: item.unitPriceCents,
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name:
                shipping.method === 'PACKETA_ZBOX'
                  ? 'Doprava (výdejní místo Zásilkovna)'
                  : shipping.method === 'PPL_ZBOX'
                    ? 'Doprava (výdejní místo PPL)'
                    : shipping.method === 'PACKETA_HOME'
                      ? 'Doprava (Zásilkovna domů)'
                      : 'Doprava (PPL domů)',
            },
            unit_amount: SHIPPING_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { orderNumber },
      success_url: `${siteUrl}/objednavka/dekujeme?orderNumber=${orderNumber}`,
      cancel_url: `${siteUrl}/kosik?zruseno=1`,
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe nevrátil platební URL.');
    }

    // session.id se uloží k objednávce, aby ho šlo spárovat ve webhooku
    // (app/api/webhooks/stripe/route.ts) - status zůstává PENDING, dokud
    // ho webhook po ověření podpisu nepřepne na PAID.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProvider: 'stripe', paymentTransactionId: checkoutSession.id },
    });

    return NextResponse.json({ redirectUrl: checkoutSession.url, orderNumber });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', paymentStatus: 'CANCELLED' },
    });
    return NextResponse.json(
      { error: 'Založení platby u Stripe selhalo.', details: String(error) },
      { status: 502 }
    );
  }
}
