import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Backyard Restoration",
  description: "How Backyard Restoration collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-charcoal-950 text-charcoal-200">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-charcoal-400 mb-12">
          Last updated: May 30, 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">What We Collect</h2>
            <p className="text-charcoal-300 mb-3">
              When you place an order or create an account, we may collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-charcoal-300">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name</li>
              <li>Shipping and billing address</li>
              <li>Order history</li>
              <li>Uploaded files (e.g., CAD models, reference photos)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">How We Use It</h2>
            <ul className="list-disc list-inside space-y-1.5 text-charcoal-300">
              <li>Order fulfillment and shipping</li>
              <li>Communication about your orders, quotes, and account</li>
              <li>Improving our parts catalog and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Third Parties</h2>
            <p className="text-charcoal-300 mb-3">
              We share data only with the service providers necessary to operate our business:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-charcoal-300">
              <li><strong className="text-charcoal-100">Stripe</strong> — payment processing</li>
              <li><strong className="text-charcoal-100">Vercel</strong> — website hosting and infrastructure</li>
              <li><strong className="text-charcoal-100">Resend</strong> — transactional email delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Data Retention</h2>
            <p className="text-charcoal-300 mb-3">
              Customer data is retained for 24 months after the last recorded activity on your
              account (e.g., placing an order, updating your profile). After this period, your
              data may be automatically anonymized unless required by law for longer retention.
            </p>
            <p className="text-charcoal-300 mb-3">
              You may request deletion of your personal data at any time by contacting{" "}
              <a
                href="mailto:privacy@backyardrestorations.com"
                className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
              >
                privacy@backyardrestorations.com
              </a>.
            </p>
            <p className="text-charcoal-300">
              When data is deleted, your personal details (name, email, phone, company, and notes)
              are anonymized. Order history is preserved in anonymized form to comply with tax and
              legal record-keeping requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Your Rights</h2>
            <p className="text-charcoal-300 mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-charcoal-300">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
            </ul>
            <p className="text-charcoal-300 mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:privacy@backyardrestorations.com"
                className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
              >
                privacy@backyardrestorations.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cookies</h2>
            <p className="text-charcoal-300 mb-3">
              We use minimal cookies and local storage to operate this site:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-charcoal-300">
              <li>
                <strong className="text-charcoal-100">admin_token</strong> (cookie) — authenticates
                admin sessions; expires after 24 hours or 30 minutes of inactivity
              </li>
              <li>
                <strong className="text-charcoal-100">br_cart</strong> (localStorage) — stores your
                shopping cart contents locally in your browser
              </li>
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
