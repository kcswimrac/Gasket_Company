import type { Metadata } from "next";
import CatalogPage from "./CatalogPage";

export const metadata: Metadata = {
  title: "Parts Catalog — Backyard Restoration",
  description:
    "Browse our library of 3D-scanned reproduction parts. Classic cars, tractors, outboards, motorcycles, industrial machinery. Fabricated on demand with OEM, Improved, or Custom tiers.",
};

export default function Page() {
  return <CatalogPage />;
}
