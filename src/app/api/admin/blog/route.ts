import { NextRequest, NextResponse } from "next/server";
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
      SELECT id, slug, title, excerpt, content, author, published, published_at, created_at, updated_at
      FROM blog_posts
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, posts });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { title, slug, excerpt, content, author, published } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: "title, slug, and content are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, author, published, published_at)
      VALUES (
        ${title},
        ${slug},
        ${excerpt || null},
        ${content},
        ${author || null},
        ${published ?? false},
        ${published ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, post: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id, title, slug, excerpt, content, author, published } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    // If toggling to published and no published_at yet, set it
    const result = await sql`
      UPDATE blog_posts SET
        title = COALESCE(${title || null}, title),
        slug = COALESCE(${slug || null}, slug),
        excerpt = ${excerpt ?? null},
        content = COALESCE(${content || null}, content),
        author = ${author ?? null},
        published = COALESCE(${published ?? null}, published),
        published_at = CASE
          WHEN ${published ?? false} = true AND published_at IS NULL THEN NOW()
          WHEN ${published ?? false} = false THEN NULL
          ELSE published_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, post: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    await sql`DELETE FROM blog_posts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
