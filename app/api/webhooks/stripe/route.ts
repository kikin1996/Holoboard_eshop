import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderPaidEmail } from '@/lib/email';

// =============================================================================
// POST /api/webhooks/stripe
// -----------------------------------------------------------------------------
// Stripe na tuto adresu zavolá server-to-server po dokončení platby.
// Podpis (header "stripe-signature") se ověřuje proti STRIPE_WEBHOOK_SECRET
// - tělu požadavku se NIKDY nevěří naslepo, protože na tuto URL by
// teoreticky mohl zavolat kdokoliv.
// =============================================================================

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe není nakonfigurováno.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Chybí podpis nebo webhook secret.' }, { status: 400 });
  }

  // Podpis se ověřuje proti SYROVÉMU tělu požadavku - proto request.text(),
  // ne request.json() (JSON.stringify by mohl výsledek jinak formátovat).
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Neplatný podpis webhooku.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderNumber = checkoutSession.metadata?.orderNumber;

    if (orderNumber && checkoutSession.payment_status === 'paid') {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentTransactionId: checkoutSession.id,
        },
      });
      await sendOrderPaidEmail({
        to: order.customerEmail,
        orderNumber: order.orderNumber,
        totalPriceCents: order.totalPriceCents,
      });
    }
    // [TODO] Po PAID odečíst sklad (Inventory).
  }

  if (event.type === 'checkout.session.expired') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderNumber = checkoutSession.metadata?.orderNumber;
    if (orderNumber) {
      await prisma.order.updateMany({
        where: { orderNumber, status: 'PENDING' },
        data: { status: 'CANCELLED', paymentStatus: 'CANCELLED' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
