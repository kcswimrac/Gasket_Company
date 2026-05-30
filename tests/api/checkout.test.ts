import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mockSQL is available when vi.mock factories run
const { mockSQL } = vi.hoisted(() => {
  let handler: ((strings: TemplateStringsArray, ...values: unknown[]) => unknown[] | Promise<unknown[]>) | null = null;

  const sql = Object.assign(
    (...args: unknown[]) => {
      if (Array.isArray(args[0]) && "raw" in (args[0] as object)) {
        const strings = args[0] as unknown as TemplateStringsArray;
        const values = args.slice(1);
        if (handler) return Promise.resolve(handler(strings, ...values));
        return Promise.resolve([]);
      }
      if (handler) return Promise.resolve(handler(args[0] as TemplateStringsArray, ...args.slice(1)));
      return Promise.resolve([]);
    },
    {
      setHandler: (h: typeof handler) => { handler = h; },
      resetMock: () => { handler = null; },
    }
  );

  return { mockSQL: sql };
});

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockSQL,
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: class Stripe {
      checkout = {
        sessions: {
          create: vi.fn().mockResolvedValue({ id: "sess_123", url: "https://checkout.stripe.com/sess_123" }),
        },
      };
    },
  };
});

// Set env vars before importing the route
vi.stubEnv("DATABASE_URL", "postgres://mock:mock@localhost/mock");
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");

import { POST } from "@/app/api/checkout/route";

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `test-${Math.random()}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function validCustomer() {
  return {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-1234",
    company: "Test Co",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    notes: "",
  };
}

function validItem(overrides: Record<string, unknown> = {}) {
  return {
    partId: "part-1",
    partName: "Valve Cover Gasket",
    variantId: "var-1",
    tier: "oem",
    material: "Cork",
    process: "Laser Cut",
    quantity: 1,
    unitPrice: null,
    totalPrice: null,
    leadTimeDays: 5,
    isEstimate: true,
    quoteId: null,
    quoteSource: "catalog",
    ...overrides,
  };
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    mockSQL.resetMock();
  });

  it("rejects empty items", async () => {
    const req = makeRequest({ items: [], customer: validCustomer() });
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("required");
  });

  it("rejects missing customer name", async () => {
    const customer = { ...validCustomer(), name: "" };
    const req = makeRequest({ items: [validItem()], customer });
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejects missing customer email", async () => {
    const customer = { ...validCustomer(), email: "" };
    const req = makeRequest({ items: [validItem()], customer });
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejects price below DB price (price trust validation)", async () => {
    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM part_variants")) {
        return [{ last_quoted_price: "20.00", base_price: "18.00" }];
      }
      if (query.includes("FROM customers")) return [];
      if (query.includes("INSERT INTO customers")) return [{ id: "cust-1" }];
      if (query.includes("INSERT INTO orders")) return [{ id: "order-1" }];
      return [];
    });

    const item = validItem({
      unitPrice: "10.00",
      totalPrice: "10.00",
      isEstimate: false,
    });
    const req = makeRequest({ items: [item], customer: validCustomer() });
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Price mismatch");
    expect(data.error).toContain("below");
  });

  it("accepts valid order with estimates (returns url: null)", async () => {
    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM customers") || query.includes("FROM part_variants") || query.includes("FROM parts")) return [];
      if (query.includes("INSERT INTO customers")) return [{ id: "cust-1" }];
      if (query.includes("INSERT INTO orders")) return [{ id: "order-1" }];
      if (query.includes("INSERT INTO order_line_items")) return [];
      return [];
    });

    const item = validItem({ isEstimate: true, unitPrice: null, totalPrice: null });
    const req = makeRequest({ items: [item], customer: validCustomer() });
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBeNull();
    expect(data.orderId).toBe("order-1");
  });
});
