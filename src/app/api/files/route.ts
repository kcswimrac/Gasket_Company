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
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File access failed" }, { status: 500 });
  }
}
