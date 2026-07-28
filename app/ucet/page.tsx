import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/catalog';
import LogoutButton from '@/components/LogoutButton';

export const metadata: Metadata = {
  title: 'Můj účet',
  robots: { index: false },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Čeká na platbu',
  PAID: 'Zaplaceno',
  FULFILLED: 'Odesláno',
  CANCELLED: 'Zrušeno',
};

const dateFormatter = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' });

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/prihlaseni?callbackUrl=/ucet');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Můj účet</h1>

      <div className="mt-6 rounded-2xl border border-line bg-mist/40 p-5">
        {session.user.name && <p className="font-medium text-ink">{session.user.name}</p>}
        <p className="text-sm text-muted">{session.user.email}</p>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-ink">Moje objednávky</h2>

        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Zatím žádné objednávky.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">{order.orderNumber}</span>
                  <span className="text-sm text-muted">{dateFormatter.format(order.createdAt)}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="font-medium text-ink">
                    {formatPrice(order.totalPriceCents, order.currency)}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-muted">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.productName}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
