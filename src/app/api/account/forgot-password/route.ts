import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per minute per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = rateLimit(`forgot-password:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const sql = getSQL();

    // Look up customer by email
    const rows = await sql`
      SELECT id, name, email FROM customers
      WHERE email = ${normalizedEmail}
        AND password_hash IS NOT NULL
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (rows.length > 0) {
      const customer = rows[0];
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await sql`
        UPDATE customers
        SET reset_token = ${resetToken},
            reset_token_expires_at = ${expiresAt.toISOString()}
        WHERE id = ${customer.id}
      `;

      const emailContent = passwordResetEmail({ token: resetToken });
      await sendEmail({
        to: customer.email as string,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    // Always return success to avoid revealing whether an email exists
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
