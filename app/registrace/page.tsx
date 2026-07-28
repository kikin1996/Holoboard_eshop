'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Registraci se nepodařilo dokončit.');
      setIsSubmitting(false);
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });

    setIsSubmitting(false);

    if (result?.error) {
      // Účet vznikl, ale automatické přihlášení selhalo - pošleme na login.
      router.push('/prihlaseni');
      return;
    }

    router.push('/ucet');
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Registrace</h1>
      <p className="mt-2 text-sm text-muted">
        Už máte účet?{' '}
        <Link href="/prihlaseni" className="text-accent hover:underline">
          Přihlaste se
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Jméno (nepovinné)
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Heslo
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">Alespoň 8 znaků.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Vytvářím účet…' : 'Vytvořit účet'}
        </button>
      </form>
    </main>
  );
}
