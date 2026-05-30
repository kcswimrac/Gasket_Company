import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mockSQL is available when vi.mock factories run
const { mockSQL } = vi.hoisted(() => {
  const defaultResults: unknown[] = [];
  let handler: ((strings: TemplateStringsArray, ...values: unknown[]) => unknown[] | Promise<unknown[]>) | null = null;

  const sql = Object.assign(
    (...args: unknown[]) => {
      if (Array.isArray(args[0]) && "raw" in (args[0] as object)) {
        const strings = args[0] as unknown as TemplateStringsArray;
        const values = args.slice(1);
        if (handler) return Promise.resolve(handler(strings, ...values));
        return Promise.resolve(defaultResults);
      }
      if (handler) return Promise.resolve(handler(args[0] as TemplateStringsArray, ...args.slice(1)));
      return Promise.resolve(defaultResults);
    },
    {
      setResults: (results: unknown[]) => { (sql as any)._defaultResults = results; },
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

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({ url: "https://blob.vercel-storage.com/test-file" }),
}));

vi.mock("@/lib/virus-scan", () => ({
  scanFile: vi.fn().mockResolvedValue({ safe: true, skipped: true, reason: "mock" }),
}));

vi.stubEnv("DATABASE_URL", "postgres://mock:mock@localhost/mock");

import { POST } from "@/app/api/contribute/route";

function makeJsonRequest(body: Record<string, string>, headers?: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/contribute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `test-${Math.random()}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function makeMultipartRequest(data: Record<string, string>, files: { field: string; file: File }[] = []): Request {
  const fd = new FormData();
  fd.set("data", JSON.stringify(data));
  for (const { field, file } of files) {
    fd.append(field, file);
  }
  return new Request("http://localhost:3000/api/contribute", {
    method: "POST",
    headers: {
      "x-forwarded-for": `test-${Math.random()}`,
    },
    body: fd,
  });
}

function validForm() {
  return {
    partDescription: "Water pump gasket for Ford 8N tractor",
    application: "Ford 8N tractor, 1947-1952",
    name: "Test User",
    email: "test@example.com",
    phone: "555-1234",
    company: "",
    segment: "tractor",
    make: "Ford",
    model: "8N",
    year: "1947-1952",
    condition: "worn",
    partNumber: "8N-12345",
  };
}

describe("POST /api/contribute", () => {
  beforeEach(() => {
    mockSQL.resetMock();
    mockSQL.setHandler((strings: TemplateStringsArray) => {
      const query = strings.join("?");
      if (query.includes("SELECT id FROM contributors")) return [];
      if (query.includes("INSERT INTO contributors")) return [{ id: "contrib-1" }];
      if (query.includes("SELECT id FROM customers")) return [];
      if (query.includes("INSERT INTO customers")) return [{ id: "cust-1" }];
      if (query.includes("INSERT INTO scan_queue")) return [{ id: "sq-1" }];
      if (query.includes("INSERT INTO scan_artifacts")) return [];
      return [];
    });
  });

  it("rejects missing partDescription", async () => {
    const form = { ...validForm(), partDescription: "" };
    const req = makeJsonRequest(form);
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("required");
  });

  it("rejects invalid email", async () => {
    const form = { ...validForm(), email: "not-an-email" };
    const req = makeJsonRequest(form);
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("email");
  });

  it("rejects oversized files", async () => {
    const form = validForm();
    // In jsdom, FormData round-trips reconstruct File objects, losing size overrides.
    // Instead, we intercept request.formData() to inject a file with a mocked size.
    const req = new Request("http://localhost:3000/api/contribute", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=----test",
        "x-forwarded-for": `test-${Math.random()}`,
      },
      body: "------test--", // dummy body, we override formData()
    });

    const bigFile = new File(["x"], "huge.jpg", { type: "image/jpeg" });
    Object.defineProperty(bigFile, "size", { value: 51 * 1024 * 1024 });

    const fd = new FormData();
    fd.set("data", JSON.stringify(form));
    fd.append("photos", bigFile);

    // Override formData() to return our custom FormData with the oversized file
    vi.spyOn(req, "formData").mockResolvedValue(fd);

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("50MB");
  });

  it("accepts valid submission", async () => {
    const form = validForm();
    const req = makeJsonRequest(form);
    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.scanQueueId).toBe("sq-1");
  });
});
