"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  id: string;
  partId: string;
  partName: string;
  variantId: string | null;
  tier: string | null;
  material: string;
  process: string;
  quantity: number;
  unitPrice: string | null;
  totalPrice: string | null;
  leadTimeDays: number | null;
  isEstimate: boolean; // true for any non-firm price
  quoteId: string | null;
  quoteSource: string;
  addedAt: string;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: string;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("br_cart");
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("br_cart", JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((item: Omit<CartItem, "id" | "addedAt">) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        i.partId === item.partId &&
        i.variantId === item.variantId &&
        i.material === item.material
      );
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        const latestUnitPrice = item.unitPrice || existing.unitPrice;
        const unitPriceNum = parseFloat(latestUnitPrice || "0");
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: newQty,
                unitPrice: latestUnitPrice,
                totalPrice: (unitPriceNum * newQty).toFixed(2),
                isEstimate: item.isEstimate,
                quoteId: item.quoteId || i.quoteId,
                quoteSource: item.quoteSource,
              }
            : i
        );
      }
      return [...prev, { ...item, id: crypto.randomUUID(), addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const unitPrice = parseFloat(i.unitPrice || "0");
      return { ...i, quantity: qty, totalPrice: (unitPrice * qty).toFixed(2) };
    }));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.totalPrice || "0"), 0).toFixed(2);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
