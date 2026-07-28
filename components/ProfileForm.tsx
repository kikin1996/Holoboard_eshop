'use client';

// =============================================================================
// components/ProfileForm.tsx
// -----------------------------------------------------------------------------
// Editovatelný profil na stránce účtu - telefon a uložené výdejní místo
// Zásilkovny (stejný Packeta Widget jako v Cart.tsx). Obojí se uloží přes
// PATCH /api/profile a příště se automaticky předvyplní v checkoutu.
// =============================================================================

import { useState } from 'react';
import Script from 'next/script';
import { MapPin } from 'lucide-react';
import type { PacketaPoint } from '@/lib/packeta';

interface ProfileFormProps {
  initialPhone: string;
  initialPacketaBranchId: string | null;
  initialPacketaBranchName: string | null;
}

export default function ProfileForm({
  initialPhone,
  initialPacketaBranchId,
  initialPacketaBranchName,
}: ProfileFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [selectedPoint, setSelectedPoint] = useState<PacketaPoint | null>(
    initialPacketaBranchId
      ? { id: initialPacketaBranchId, name: initialPacketaBranchName ?? initialPacketaBranchId }
      : null
  );
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleOpenPacketaWidget = () => {
    if (!isWidgetReady || !window.Packeta) return;
    const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY as string;
    window.Packeta.Widget.pick(
      apiKey,
      (point) => {
        if (point) setSelectedPoint({ id: point.id, name: point.name });
      },
      { country: 'cz', language: 'cs' }
    );
  };

  const handleSave = async () => {
    setStatus('saving');
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          packetaBranchId: selectedPoint?.id ?? null,
          packetaBranchName: selectedPoint?.name ?? null,
        }),
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="rounded-2xl border border-line p-5">
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="lazyOnload"
        onReady={() => setIsWidgetReady(true)}
      />

      <h3 className="font-medium text-ink">Doručovací údaje</h3>
      <p className="mt-1 text-sm text-muted">
        Předvyplní se automaticky při příští objednávce.
      </p>

      <div className="mt-4">
        <label htmlFor="profile-phone" className="block text-sm font-medium text-ink">
          Telefon
        </label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+420 777 123 456"
          className="mt-1.5 w-full rounded-2xl border border-line px-4 py-2.5 text-ink outline-none focus:border-accent"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleOpenPacketaWidget}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          <MapPin size={15} strokeWidth={2} />
          {selectedPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
        </button>
        {selectedPoint && (
          <p className="mt-3 text-sm text-muted">
            Vybraná pobočka: <strong className="text-ink">{selectedPoint.name}</strong>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={status === 'saving'}
        className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist disabled:opacity-60"
      >
        {status === 'saving' ? 'Ukládám…' : status === 'saved' ? 'Uloženo' : 'Uložit'}
      </button>
    </div>
  );
}
