import { NextRequest, NextResponse } from "next/server";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("admin_token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    const expectedHash = await sha256(adminPassword + "_backyard_salt");
    if (token !== expectedHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
