import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: "Backyard Restoration — Custom Gaskets & Reproduction Parts",
  description:
    "On-demand custom gaskets and 3D-scanned reproduction parts for classic cars, tractors, outboards, motorcycles, and industrial equipment.",
  openGraph: {
    title: "Backyard Restoration — The Parts Nobody Makes Anymore",
    description: "Custom gaskets and reproduction parts manufactured on demand. 3D-scanned from originals, fabricated in OEM, Improved, or Custom material tiers.",
  },
};

export default function Page() {
  return <HomePage />;
}
