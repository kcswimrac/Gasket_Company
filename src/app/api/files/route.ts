import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const runtime = "nodejs";

/**
 * GET /api/files?url=<blob-url>
 * Proxies private Vercel Blob files with proper auth.
 * Used by the public catalog to display images from private blob storage.
 */
export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get("url");

  if (!blobUrl) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  try {
    // Verify the blob exists
    const metadata = await head(blobUrl);

    // Fetch the actual file
    const res = await fetch(metadata.url);
    if (!res.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File access failed" }, { status: 403 });
  }
}
