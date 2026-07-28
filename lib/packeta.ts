// Sdílený typ pro Packeta (Zásilkovna) Widget - použitý v Cart.tsx i
// ProfileForm.tsx. Global augmentace smí být deklarovaná jen jednou,
// jinak TypeScript hlásí konflikt mezi dvěma strukturálně stejnými,
// ale nominálně odlišnými deklaracemi.
export interface PacketaPoint {
  id: string;
  name: string;
  city?: string;
  street?: string;
  zip?: string;
}

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: Record<string, unknown>
        ) => void;
      };
    };
  }
}
