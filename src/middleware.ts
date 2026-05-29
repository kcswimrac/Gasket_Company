import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Protect admin API routes with a secret token
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("admin_token")?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
    }

    const token = authHeader?.replace("Bearer ", "") || cookieToken;
    if (token !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
