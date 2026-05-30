import type { MetadataRoute } from "next";
import { partSlug } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://backyardrestorations.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/gaskets`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/track`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/cart`, changeFrequency: "always", priority: 0.3 },
    { url: `${base}/checkout`, changeFrequency: "always", priority: 0.3 },
  ];

  // Dynamically include all active parts
  let partRoutes: MetadataRoute.Sitemap = [];
  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.DATABASE_URL;
    if (url) {
      const sql = neon(url);
      const parts = await sql`
        SELECT id, name, make, model, updated_at
        FROM parts
        WHERE active IS NOT false
        ORDER BY name
      `;
      partRoutes = parts.map((p) => ({
        url: `${base}/catalog/${partSlug({ id: p.id as string, name: p.name as string, make: p.make as string | undefined, model: p.model as string | undefined })}`,
        lastModified: p.updated_at ? new Date(p.updated_at as string) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // If DB is unavailable, just return static routes
  }

  // Dynamically include published blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.DATABASE_URL;
    if (url) {
      const sql = neon(url);
      const posts = await sql`
        SELECT slug, updated_at
        FROM blog_posts
        WHERE published = true
        ORDER BY published_at DESC
      `;
      blogRoutes = posts.map((p) => ({
        url: `${base}/blog/${p.slug as string}`,
        lastModified: p.updated_at ? new Date(p.updated_at as string) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // If DB is unavailable, skip blog routes
  }

  return [...staticRoutes, ...partRoutes, ...blogRoutes];
}
