import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: {
    default: "Backyard Restoration — Custom Gaskets & Reproduction Parts",
    template: "%s | Backyard Restoration",
  },
  description:
    "On-demand custom gaskets and 3D-scanned reproduction parts for classic cars, tractors, outboards, motorcycles, and industrial equipment. Upload a DXF or photo, or browse the parts catalog.",
  metadataBase: new URL("https://backyardrestorations.com"),
  openGraph: {
    title: "Backyard Restoration — Custom Gaskets & Reproduction Parts",
    description: "On-demand custom gaskets and 3D-scanned reproduction parts for vintage equipment. OEM, Improved, and Custom material tiers.",
    siteName: "Backyard Restoration",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backyard Restoration",
    description: "Custom gaskets and reproduction parts for classic cars, tractors, marine, motorcycles, and industrial equipment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
