import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-4">404</p>
          <h1 className="text-3xl font-extrabold text-white mb-4">Page Not Found</h1>
          <p className="text-sm text-charcoal-400 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors">
              Home
            </a>
            <a href="/catalog" className="px-6 py-3 border border-charcoal-700 hover:border-charcoal-600 text-charcoal-300 font-bold text-sm rounded-lg uppercase tracking-wider transition-colors">
              Browse Catalog
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
