'use client';

// =============================================================================
// components/CartContext.tsx
// -----------------------------------------------------------------------------
// Sdílený stav košíku pro celý web. Položky se drží v React contextu a
// zrcadlí do localStorage, takže košík přežije reload i zavření záložky.
// V reálném provozu by se sem místo localStorage synchronizoval Medusa cart
// podle ID v cookie - API komponent (useCart) by zůstalo stejné.
// =============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartItem {
  variantId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  /** Součet kusů všech položek - pro badge v navigaci. */
  count: number;
  /** true až po načtení z localStorage - do té doby nevykreslovat badge. */
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'holoboard-cart-v1';

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(99, Math.round(quantity)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Načtení uloženého košíku - jen na klientovi, po mountu.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Poškozená data ignorujeme - začne se s prázdným košíkem.
    }
    setIsHydrated(true);
  }, []);

  // Každá změna košíku se propíše do localStorage.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage může být plné/zakázané - košík pak žije jen v paměti.
    }
  }, [items, isHydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      isHydrated,
      addItem: (item, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (existing) {
            return prev.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: clampQuantity(i.quantity + quantity) }
                : i
            );
          }
          return [...prev, { ...item, quantity: clampQuantity(quantity) }];
        });
      },
      updateQuantity: (variantId, quantity) => {
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.variantId !== variantId)
            : prev.map((i) =>
                i.variantId === variantId
                  ? { ...i, quantity: clampQuantity(quantity) }
                  : i
              )
        );
      },
      removeItem: (variantId) => {
        setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      },
      clear: () => setItems([]),
    }),
    [items, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart musí být použit uvnitř <CartProvider>.');
  }
  return context;
}
