import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart, type CartItem } from "@/lib/cart";
import type { ReactNode } from "react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
  },
});

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function makeItem(overrides: Partial<Omit<CartItem, "id" | "addedAt">> = {}): Omit<CartItem, "id" | "addedAt"> {
  return {
    partId: "part-1",
    partName: "Valve Cover Gasket",
    variantId: "var-1",
    tier: "oem",
    material: "Cork",
    process: "Laser Cut",
    quantity: 1,
    unitPrice: "12.50",
    totalPrice: "12.50",
    leadTimeDays: 5,
    isEstimate: false,
    quoteId: null,
    quoteSource: "catalog",
    ...overrides,
  };
}

describe("Cart — addItem", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("creates a new item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(makeItem());
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].partName).toBe("Valve Cover Gasket");
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].totalPrice).toBe("12.50");
  });

  it("merges duplicate (same partId + variantId + material)", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ quantity: 2, totalPrice: "25.00" }));
    });
    act(() => {
      result.current.addItem(makeItem({ quantity: 3, totalPrice: "37.50" }));
    });
    // Should merge into one item with quantity 5
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it("merged item uses latest unitPrice (not stale price)", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ unitPrice: "10.00", quantity: 1, totalPrice: "10.00" }));
    });
    act(() => {
      result.current.addItem(makeItem({ unitPrice: "15.00", quantity: 1, totalPrice: "15.00" }));
    });
    expect(result.current.items).toHaveLength(1);
    // unitPrice should be updated to the latest (15.00)
    expect(result.current.items[0].unitPrice).toBe("15.00");
    // totalPrice should be recalculated: 15.00 * 2 = 30.00
    expect(result.current.items[0].totalPrice).toBe("30.00");
  });
});

describe("Cart — removeItem", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("removes the correct item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ partId: "part-1", partName: "Gasket A" }));
    });
    act(() => {
      result.current.addItem(makeItem({ partId: "part-2", partName: "Gasket B" }));
    });
    expect(result.current.items).toHaveLength(2);

    const idToRemove = result.current.items[0].id;
    act(() => {
      result.current.removeItem(idToRemove);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].partName).toBe("Gasket B");
  });
});

describe("Cart — updateQuantity", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("recalculates totalPrice when quantity changes", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ unitPrice: "10.00", quantity: 1, totalPrice: "10.00" }));
    });

    const id = result.current.items[0].id;
    act(() => {
      result.current.updateQuantity(id, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.items[0].totalPrice).toBe("50.00");
  });
});
