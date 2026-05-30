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
      // The catalog route uses sql`...` as a tagged template but also
      // chains it in Promise.all, and uses sql`...` to build ORDER BY fragments.
      // Those fragment calls return something that gets interpolated into the query.
      // We need to make sure the mock handles this.
      catch: (fn: (e: unknown) => unknown[]) => Promise.resolve([]).catch(fn),
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

vi.mock("@/lib/autoquote/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/autoquote/client")>("@/lib/autoquote/client");
  return {
    ...actual,
    isCachedPriceStale: (date: Date | null) => {
      if (!date) return true;
      return Date.now() - date.getTime() > 30 * 24 * 60 * 60 * 1000;
    },
  };
});

vi.stubEnv("DATABASE_URL", "postgres://mock:mock@localhost/mock");

import { GET } from "@/app/api/catalog/route";

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/catalog");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const req = new Request(url.toString());
  // NextRequest has a nextUrl property with searchParams
  (req as any).nextUrl = url;
  return req;
}

const freshDate = new Date().toISOString();

function basePart(overrides: Record<string, unknown> = {}) {
  return {
    id: "part-1",
    name: "Water Pump Gasket",
    segment: "classic_auto",
    make: "Ford",
    model: "Mustang",
    year_start: 1965,
    year_end: 1970,
    application: "302 V8",
    description: "Water pump housing gasket",
    fitment_status: "verified",
    dimensions: null,
    cad_file_url: null,
    last_estimate_price: "15.00",
    last_estimate_at: freshDate,
    last_estimate_material: "Cork",
    times_sold: 5,
    custom_quotes: "[]",
    contributor_name: null,
    ...overrides,
  };
}

describe("GET /api/catalog", () => {
  beforeEach(() => {
    mockSQL.resetMock();
  });

  it("returns parts array", async () => {
    const part = basePart();

    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM settings")) return [{ value: "0" }];
      if (query.includes("FROM parts")) return [part];
      if (query.includes("FROM part_variants")) return [];
      if (query.includes("FROM part_files")) return [];
      return [];
    });

    const req = makeRequest();
    const res = await GET(req as any);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.parts)).toBe(true);
    expect(data.parts.length).toBeGreaterThanOrEqual(1);
    expect(data.parts[0].name).toBe("Water Pump Gasket");
  });

  it("applies markup to estimate prices", async () => {
    const part = basePart({ last_estimate_price: "10.00" });

    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM settings")) return [{ value: "20" }]; // 20% markup
      if (query.includes("FROM parts")) return [part];
      if (query.includes("FROM part_variants")) return [];
      if (query.includes("FROM part_files")) return [];
      return [];
    });

    const req = makeRequest();
    const res = await GET(req as any);
    const data = await res.json();

    expect(data.success).toBe(true);
    // $10.00 * 1.20 = $12.00
    expect(data.parts[0].estimate.price).toBe("12.00");
  });

  it("does NOT apply markup to firm AutoQuote prices", async () => {
    const part = basePart({ last_estimate_price: null, last_estimate_at: null });
    const variant = {
      id: "var-1",
      part_id: "part-1",
      tier: "oem",
      material: "Cork",
      process: "Laser Cut",
      base_price: "8.00",
      lead_time_days: 5,
      available: true,
      last_quoted_price: "25.00",
      last_quoted_at: freshDate,
      last_quote_expires_at: new Date(Date.now() + 86400000).toISOString(),
      last_quote_firm: true,
      autoquote_material_code: "CORK-3MM",
    };

    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM settings")) return [{ value: "20" }]; // 20% markup
      if (query.includes("FROM parts")) return [part];
      if (query.includes("FROM part_variants")) return [variant];
      if (query.includes("FROM part_files")) return [];
      return [];
    });

    const req = makeRequest();
    const res = await GET(req as any);
    const data = await res.json();

    expect(data.success).toBe(true);
    const v = data.parts[0].variants[0];
    // Firm AutoQuote price should NOT have markup applied
    expect(v.resolvedPrice).toBe("25.00");
    expect(v.pricingStatus).toBe("firm");
  });

  it("filters by segment, make, model", async () => {
    const part = basePart({ segment: "tractor", make: "Ford", model: "8N" });

    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("FROM settings")) return [{ value: "0" }];
      if (query.includes("FROM parts")) return [part];
      if (query.includes("FROM part_variants")) return [];
      if (query.includes("FROM part_files")) return [];
      return [];
    });

    const req = makeRequest({ segment: "tractor", make: "Ford", model: "8N" });
    const res = await GET(req as any);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.parts[0].segment).toBe("tractor");
  });
});
