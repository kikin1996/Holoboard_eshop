// =============================================================================
// lib/catalog.ts
// -----------------------------------------------------------------------------
// Jediný zdroj pravdy o produktech a cenách. Používá ho produktová stránka,
// košík i /api/checkout - server tak nikdy nedůvěřuje ceně poslané klientem,
// vždy si ji dohledá tady podle variantId. V reálném provozu by tato data
// přicházela z Medusa/Strapi, tvar zůstává stejný.
// =============================================================================

export interface ProductVariant {
  variantId: string;
  name: string;
  priceCents: number; // haléře - žádné Float zaokrouhlování
}

export const SHIPPING_CENTS = 7900; // Zásilkovna, 79 Kč

export const HOLOBOARD: ProductVariant = {
  variantId: 'holoboard-standard',
  name: 'HoloBoard — 2v1 Paddleboard a Kajak',
  priceCents: 899000, // 8 990 Kč
};

const variants: Record<string, ProductVariant> = {
  [HOLOBOARD.variantId]: HOLOBOARD,
};

export function getVariant(variantId: string): ProductVariant | null {
  return variants[variantId] ?? null;
}

export function formatPrice(cents: number, currency = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
