import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CatalogClient from "./CatalogClient";

async function fetchInitialData() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const [catalogRes, facetsRes] = await Promise.all([
      fetch(`${base}/api/catalog`, { next: { revalidate: 60 } }),
      fetch(`${base}/api/catalog/facets`, { next: { revalidate: 120 } }),
    ]);
    const [catalog, facets] = await Promise.all([catalogRes.json(), facetsRes.json()]);
    return {
      parts: catalog.success ? catalog.parts : [],
      facets: facets.success ? facets : { makes: [], models: [], years: [] },
    };
  } catch {
    return { parts: [], facets: { makes: [], models: [], years: [] } };
  }
}

export default async function CatalogPage() {
  const { parts, facets } = await fetchInitialData();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 metal-texture overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Parts Library</span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white leading-[1.1]">
                The Parts Nobody Makes Anymore.
                <br /><span className="text-emerald-400">We Do.</span>
              </h1>
              <p className="mt-6 text-base text-charcoal-300 max-w-xl leading-relaxed">
                {parts.length > 0
                  ? `${parts.length} parts in the library. 3D-scanned from originals. OEM, Improved, or Custom tiers.`
                  : "Our parts library is being built. Check back soon or submit a part request below."
                }
              </p>
            </div>
          </div>
        </section>

        <CatalogClient initialParts={parts} initialFacets={facets} />
      </main>
      <SiteFooter />
    </>
  );
}
