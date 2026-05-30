import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partIdFromSlug, partSlug } from "@/lib/slug";
import AddToCartButton from "./AddToCartButton";
import {
  FITMENT_COLORS,
  FITMENT_LABELS,
  TIER_LABELS_FULL,
  fileChip,
  tierChip,
  getPhotosForTier,
} from "../catalog-types";

async function fetchPart(partIdPrefix: string) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/catalog?partId=${partIdPrefix}`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success && data.parts?.length > 0) {
      return data.parts[0];
    }
    return null;
  } catch {
    return null;
  }
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const partIdPrefix = partIdFromSlug(slug);
  const part = await fetchPart(partIdPrefix);
  if (!part) return { title: "Part Not Found" };

  const yearDisplay =
    part.year_start && part.year_end
      ? `${part.year_start}-${part.year_end}`
      : part.year_start
        ? `${part.year_start}+`
        : "";

  const desc = [
    part.application,
    part.make && part.model ? `${part.make} ${part.model}` : part.make || part.model,
    yearDisplay,
    part.description,
  ]
    .filter(Boolean)
    .join(". ");

  const photos = part.files?.filter(
    (f: { file_type: string; show_in_catalog: boolean }) =>
      f.file_type.startsWith("photo") && f.show_in_catalog
  );
  const ogImage = photos?.[0]?.file_url || photos?.[0]?.thumbnail_url || undefined;

  return {
    title: `${part.name} — ${part.make || ""} ${part.model || ""} ${yearDisplay}`.trim(),
    description: desc.slice(0, 160),
    openGraph: {
      title: part.name,
      description: desc.slice(0, 200),
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: part.name,
      description: desc.slice(0, 200),
    },
  };
}

export default async function PartPage({ params }: PageProps) {
  const { slug } = await params;
  const partIdPrefix = partIdFromSlug(slug);
  const part = await fetchPart(partIdPrefix);
  if (!part) notFound();

  // Verify the slug matches expected slug to canonicalize
  const expectedSlug = partSlug(part);
  const canonical = `/catalog/${expectedSlug}`;

  const yearDisplay =
    part.year_start && part.year_end
      ? `${part.year_start}-${part.year_end}`
      : part.year_start
        ? `${part.year_start}+`
        : "";

  const allPhotos =
    part.files?.filter(
      (f: { file_type: string; show_in_catalog: boolean; file_url: string }) =>
        f.file_type.startsWith("photo") && f.show_in_catalog
    ) || [];
  const photos = getPhotosForTier(allPhotos, null);
  const heroPhoto = photos[0] || null;

  return (
    <>
      <SiteHeader />
      <main className="pt-20 pb-16 md:pt-24 md:pb-24">
        {/* Canonical link for SEO */}
        {slug !== expectedSlug && (
          <link rel="canonical" href={`https://backyardrestorations.com${canonical}`} />
        )}

        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Back link */}
          <a
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-emerald-400 transition-colors mb-6 uppercase tracking-wider font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Catalog
          </a>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Photos */}
            <div>
              {heroPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-charcoal-800/40">
                  <img
                    src={heroPhoto.thumbnail_url || heroPhoto.file_url}
                    alt={part.name}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  {(() => {
                    const cl = fileChip(heroPhoto.file_type, heroPhoto.file_name);
                    const tc = tierChip(heroPhoto.tier);
                    return (
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`${cl.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm`}>
                          {cl.label}
                        </span>
                        {tc && (
                          <span className={`${tc.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm`}>
                            {tc.label}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-charcoal-950 border border-charcoal-800/40 rounded-xl flex items-center justify-center">
                  <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="text-charcoal-800">
                    <rect x="10" y="20" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                    <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto mt-3">
                  {photos.map((f: { id: string; file_type: string; file_name: string; file_url: string; thumbnail_url: string | null; tier: string | null }) => {
                    const cl = fileChip(f.file_type, f.file_name);
                    return (
                      <div
                        key={f.id}
                        className="relative flex-shrink-0 rounded-lg overflow-hidden border border-charcoal-800/40 w-20 h-20"
                      >
                        <img
                          src={f.thumbnail_url || f.file_url}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className={`absolute bottom-0 left-0 right-0 ${cl.color} text-white text-[7px] font-semibold text-center py-px`}>
                          {cl.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{part.name}</h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      FITMENT_COLORS[part.fitment_status] || ""
                    }`}
                  >
                    {FITMENT_LABELS[part.fitment_status] || part.fitment_status}
                  </span>
                </div>
                <p className="text-sm text-emerald-400/70 font-medium">
                  {part.make && <span>{part.make} </span>}
                  {part.model && <span>{part.model} </span>}
                  {yearDisplay && <span>({yearDisplay})</span>}
                </p>
                <p className="text-sm text-charcoal-300 mt-1">{part.application}</p>
              </div>

              {/* Description */}
              {part.description &&
                !part.description.startsWith("Published") &&
                !part.description.startsWith("New scan") &&
                !part.description.startsWith("Revision scan") && (
                  <p className="text-sm text-charcoal-300 leading-relaxed mb-6">{part.description}</p>
                )}

              {/* Contributor credit */}
              {part.contributor_name && (
                <p className="text-xs text-charcoal-300 flex items-center gap-1.5 mb-6">
                  <svg className="w-3.5 h-3.5 text-emerald-500/50" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Scanned from donor by {part.contributor_name}
                </p>
              )}

              {/* Variant tiers with pricing (client component) */}
              <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-xl p-5">
                <AddToCartButton
                  partId={part.id}
                  partName={part.name}
                  variants={part.variants.map(
                    (v: {
                      id: string;
                      tier: string;
                      material: string;
                      process: string;
                      resolvedPrice: string | null;
                      pricingStatus: string;
                      lead_time_days: number | null;
                    }) => ({
                      id: v.id,
                      tier: v.tier,
                      material: v.material,
                      process: v.process,
                      resolvedPrice: v.resolvedPrice,
                      pricingStatus: v.pricingStatus,
                      lead_time_days: v.lead_time_days,
                    })
                  )}
                  estimate={
                    part.estimate
                      ? { price: part.estimate.price, material: part.estimate.material }
                      : null
                  }
                />
              </div>

              {/* All variant details */}
              {part.variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-3">
                    Available Tiers
                  </p>
                  <div className="space-y-2">
                    {part.variants.map(
                      (v: {
                        id: string;
                        tier: string;
                        material: string;
                        process: string;
                        resolvedPrice: string | null;
                        pricingStatus: string;
                        lead_time_days: number | null;
                      }) => (
                        <div
                          key={v.id}
                          className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white">
                              {TIER_LABELS_FULL[v.tier] || v.tier}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                v.resolvedPrice ? "text-white" : "text-charcoal-500"
                              }`}
                            >
                              {v.resolvedPrice
                                ? v.pricingStatus !== "firm"
                                  ? `est. $${v.resolvedPrice}`
                                  : `$${v.resolvedPrice}`
                                : "Contact us"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-charcoal-300">
                            <span>{v.material}</span>
                            <span>{v.process}</span>
                          </div>
                          {v.lead_time_days && (
                            <p className="text-[11px] text-charcoal-300 mt-1">
                              {v.lead_time_days} day lead time
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
