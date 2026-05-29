import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("admin_token")?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 503 });
    }

    const token = authHeader?.replace("Bearer ", "") || cookieToken;
    if (token !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
