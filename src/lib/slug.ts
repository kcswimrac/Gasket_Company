/**
 * Generate a URL-friendly slug from part data.
 * The last 8 chars of the ID are appended to ensure uniqueness.
 */
export function partSlug(part: {
  id: string;
  name: string;
  make?: string | null;
  model?: string | null;
}): string {
  const parts = [part.name, part.make, part.model].filter(Boolean) as string[];
  return (
    parts
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    part.id.slice(0, 8)
  );
}

/**
 * Extract the 8-char part ID prefix from a slug.
 */
export function partIdFromSlug(slug: string): string {
  return slug.slice(-8);
}
