/**
 * Mock utilities for the neon SQL tagged template from @neondatabase/serverless.
 *
 * For API route tests, prefer using vi.hoisted() directly in the test file
 * to avoid hoisting issues with vi.mock(). See tests/api/checkout.test.ts
 * for the recommended pattern.
 *
 * This module provides helper types and documentation for the mock pattern.
 */

export type SQLHandler = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => unknown[] | Promise<unknown[]>;

export interface MockSQL {
  (...args: unknown[]): Promise<unknown[]>;
  setHandler: (h: SQLHandler | null) => void;
  resetMock: () => void;
}
