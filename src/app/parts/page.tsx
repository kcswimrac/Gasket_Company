import type { Metadata } from "next";
import PartsPage from "./PartsPage";

export const metadata: Metadata = {
  title: "PartVault — Hard-to-Find Restoration Parts, Fabricated On Demand",
  description:
    "Browse our digital library of 3D-scanned restoration parts. Order what you need — we fabricate it. Classic cars, motorcycles, tractors, marine, and industrial equipment.",
};

export default function Page() {
  return <PartsPage />;
}
