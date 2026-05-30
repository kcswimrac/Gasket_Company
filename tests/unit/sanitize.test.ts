import { describe, it, expect } from "vitest";
import { sanitize, isValidEmail, maxLength } from "@/lib/sanitize";

describe("sanitize", () => {
  it("strips angle brackets from input", () => {
    expect(sanitize("<script>alert('xss')</script>")).toBe("scriptalert('xss')/script");
  });

  it("returns input unchanged when no angle brackets present", () => {
    expect(sanitize("hello world")).toBe("hello world");
  });

  it("strips multiple angle brackets", () => {
    expect(sanitize("a<b>c<d>e")).toBe("abcde");
  });

  it("handles empty string", () => {
    expect(sanitize("")).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts email with subdomain", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects email without TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects email longer than 254 characters", () => {
    const longLocal = "a".repeat(245);
    expect(isValidEmail(`${longLocal}@example.com`)).toBe(false);
  });

  it("accepts email at exactly 254 characters", () => {
    // local@domain.com => need to construct exactly 254 chars
    const domain = "example.com"; // 11 chars
    const at = 1; // @ sign
    const localLen = 254 - at - domain.length; // 242
    const email = "a".repeat(localLen) + "@" + domain;
    expect(email.length).toBe(254);
    expect(isValidEmail(email)).toBe(true);
  });
});

describe("maxLength", () => {
  it("truncates string longer than max", () => {
    expect(maxLength("hello world", 5)).toBe("hello");
  });

  it("returns full string when shorter than max", () => {
    expect(maxLength("hi", 10)).toBe("hi");
  });

  it("returns full string when exactly max length", () => {
    expect(maxLength("hello", 5)).toBe("hello");
  });

  it("returns empty string for max of 0", () => {
    expect(maxLength("hello", 0)).toBe("");
  });
});
