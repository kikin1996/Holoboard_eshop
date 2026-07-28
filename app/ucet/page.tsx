import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Můj účet',
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/prihlaseni?callbackUrl=/ucet');
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Můj účet</h1>

      <div className="mt-6 rounded-2xl border border-line bg-mist/40 p-5">
        {session.user.name && <p className="font-medium text-ink">{session.user.name}</p>}
        <p className="text-sm text-muted">{session.user.email}</p>
      </div>

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Odhlásit se
        </button>
      </form>
    </main>
  );
}
