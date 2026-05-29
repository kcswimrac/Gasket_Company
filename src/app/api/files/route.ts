import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/files?url=<blob-url>
 * Proxies private Vercel Blob files. Uses the BLOB_READ_WRITE_TOKEN
 * to authenticate the fetch to Vercel's blob storage.
 */
export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get("url");

  if (!blobUrl) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  // Validate hostname to prevent SSRF — only allow Vercel Blob Storage
  try {
    const parsed = new URL(blobUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (
      !hostname.endsWith(".blob.vercel-storage.com") &&
      !hostname.endsWith(".public.blob.vercel-storage.com")
    ) {
      return NextResponse.json(
        { error: "Invalid URL: only Vercel Blob Storage URLs are allowed" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // For Vercel Blob private stores, we need to append the token
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    const fetchUrl = token
      ? `${blobUrl}?token=${token}`
      : blobUrl;

    const res = await fetch(fetchUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      // Try direct fetch without token as fallback
      const fallback = await fetch(blobUrl);
      if (!fallback.ok) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      const body = await fallback.arrayBuffer();
      return new NextResponse(body, {
        headers: {
          "Content-Type": fallback.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        },
      });
    }

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File access failed" }, { status: 500 });
  }
}
