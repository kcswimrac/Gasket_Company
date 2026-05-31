import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { sendEmail, welcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, company } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const sql = getSQL();

    // Check if customer already exists with a password
    const existing = await sql`
      SELECT id, password_hash FROM customers
      WHERE email = ${normalizedEmail} AND deleted_at IS NULL
      LIMIT 1
    `;

    if (existing.length > 0 && existing[0].password_hash) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await sha256(password + "_backyard_customer_salt");

    if (existing.length > 0) {
      // Existing customer without password — upgrade to account
      await sql`
        UPDATE customers
        SET password_hash = ${passwordHash},
            name = ${name},
            phone = COALESCE(${phone || null}, phone),
            company = COALESCE(${company || null}, company),
            email_verified = false,
            last_activity_at = NOW()
        WHERE id = ${existing[0].id}
      `;

      // Send welcome email (non-blocking)
      const welcome = welcomeEmail({ customerName: name });
      sendEmail({ to: normalizedEmail, subject: welcome.subject, html: welcome.html }).catch(() => {});

      return NextResponse.json({
        success: true,
        customerId: existing[0].id,
      });
    }

    // Create new customer
    const result = await sql`
      INSERT INTO customers (name, email, phone, company, password_hash, email_verified)
      VALUES (${name}, ${normalizedEmail}, ${phone || null}, ${company || null}, ${passwordHash}, false)
      RETURNING id
    `;

    // Send welcome email (non-blocking)
    const welcome = welcomeEmail({ customerName: name });
    sendEmail({ to: normalizedEmail, subject: welcome.subject, html: welcome.html }).catch(() => {});

    return NextResponse.json({
      success: true,
      customerId: result[0].id,
    });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
