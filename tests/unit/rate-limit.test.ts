import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Use a unique key per test to avoid cross-test pollution
    vi.restoreAllMocks();
  });

  it("allows requests within limit", () => {
    const key = `test-allow-${Date.now()}`;
    const r1 = rateLimit(key, 3, 60_000);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, 3, 60_000);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(key, 3, 60_000);
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over limit", () => {
    const key = `test-block-${Date.now()}`;
    // Use up all 2 allowed requests
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);

    // Third request should be blocked
    const r3 = rateLimit(key, 2, 60_000);
    expect(r3.ok).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${Date.now()}`;
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    // Use up all requests
    rateLimit(key, 1, 1000);
    const blocked = rateLimit(key, 1, 1000);
    expect(blocked.ok).toBe(false);

    // Advance time past the window
    vi.spyOn(Date, "now").mockReturnValue(now + 1001);

    // Should be allowed again
    const after = rateLimit(key, 1, 1000);
    expect(after.ok).toBe(true);
    expect(after.remaining).toBe(0);
  });
});
