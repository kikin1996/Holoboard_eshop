import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CartItemPayload {
  variantId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

// GET  - vrátí uložený košík přihlášeného zákazníka (prázdné pole pro hosta).
// PUT  - nahradí celý uložený košík aktuálním stavem z klienta.
// Volá se z CartContext.tsx při přihlášení (načtení) a při každé změně
// košíku, pokud je zákazník přihlášený - viz komentář v CartItem modelu.

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ items: [] });
  }

  const cartItems = await prisma.cartItem.findMany({ where: { userId: session.user.id } });

  return NextResponse.json({
    items: cartItems.map((item) => ({
      variantId: item.variantId,
      name: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Nepřihlášen.' }, { status: 401 });
  }

  const body = (await request.json()) as { items?: unknown };
  const items = Array.isArray(body.items) ? (body.items as CartItemPayload[]) : [];

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { userId } }),
    ...(items.length
      ? [
          prisma.cartItem.createMany({
            data: items.map((item) => ({
              userId,
              variantId: String(item.variantId),
              productName: String(item.name),
              unitPriceCents: Math.round(Number(item.unitPriceCents)) || 0,
              quantity: Math.max(1, Math.min(99, Math.round(Number(item.quantity)) || 1)),
            })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
