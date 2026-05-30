import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://backyardrestorations.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/gaskets`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cart`, changeFrequency: "always", priority: 0.3 },
    { url: `${base}/checkout`, changeFrequency: "always", priority: 0.3 },
  ];
}
