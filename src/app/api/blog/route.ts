import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const sql = getSQL();
    const posts = await sql`
      SELECT id, slug, title, excerpt, author, published_at, created_at
      FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC NULLS LAST
    `;
    return NextResponse.json({ success: true, posts });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
