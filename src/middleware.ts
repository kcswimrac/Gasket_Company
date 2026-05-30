import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Routes that only 'owner' role can access */
const OWNER_ONLY_PREFIXES = [
  "/api/admin/users",
  "/api/admin/settings",
  "/api/admin/migrations",
];

/** Routes that operators can access (plus anything not in owner-only) */
const OPERATOR_ALLOWED_PREFIXES = [
  "/api/admin/parts",
  "/api/admin/orders",
  "/api/admin/scans",
  "/api/admin/bounties",
  "/api/admin/customers",
  "/api/admin/stats",
  "/api/admin/autoquote",
  "/api/admin/variants",
  "/api/admin/upload",
  "/api/admin/render",
];

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // --- Try Auth.js session first ---
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Viewer: GET only
    if (role === "viewer" && method !== "GET") {
      return NextResponse.json(
        { error: "Viewers have read-only access" },
        { status: 403 }
      );
    }

    // Owner: full access
    if (role === "owner") {
      return NextResponse.next();
    }

    // Operator: blocked from owner-only routes
    if (role === "operator") {
      const isOwnerOnly = OWNER_ONLY_PREFIXES.some((prefix) =>
        path.startsWith(prefix)
      );
      if (isOwnerOnly) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      return NextResponse.next();
    }

    // Viewer: check route access (same as operator but GET-only, already checked above)
    if (role === "viewer") {
      const isOwnerOnly = OWNER_ONLY_PREFIXES.some((prefix) =>
        path.startsWith(prefix)
      );
      if (isOwnerOnly) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      return NextResponse.next();
    }

    // Unknown role — deny
    return NextResponse.json({ error: "Unknown role" }, { status: 403 });
  }

  // --- Fallback: legacy shared-password auth (bootstrap mode) ---
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("admin_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  const expectedHash = await sha256(adminPassword + "_backyard_salt");
  if (token !== expectedHash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Legacy auth grants owner-equivalent access
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
