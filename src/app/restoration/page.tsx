import type { Metadata } from "next";
import RestorationPage from "./RestorationPage";

export const metadata: Metadata = {
  title: "Backyard Restoration — On-Demand Reproduction Parts, Scan-Verified",
  description:
    "Browse our library of 3D-scanned reproduction parts for classic tractors, outboards, automobiles, motorcycles, and industrial machinery. Fabricated on demand. Contributor royalty program.",
};

export default function Page() {
  return <RestorationPage />;
}
