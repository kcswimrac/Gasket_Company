export function sanitize(input: string): string {
  return input.replace(/[<>]/g, '');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function maxLength(input: string, max: number): string {
  return input.slice(0, max);
}
