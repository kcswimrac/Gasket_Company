import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import SessionWrapper from "@/app/admin/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}')` }} />
          </>
        )}
      </head>
      <body className="font-sans antialiased">
        <SessionWrapper>
          <CartProvider>{children}</CartProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
