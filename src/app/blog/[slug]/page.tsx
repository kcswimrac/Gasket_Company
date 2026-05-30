import { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    const sql = neon(url);
    const posts = await sql`
      SELECT id, slug, title, excerpt, content, author, published_at, created_at
      FROM blog_posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    return posts.length > 0 ? (posts[0] as unknown as BlogPost) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      authors: post.author ? [post.author] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Render content as paragraphs split on double newlines
  const paragraphs = post.content.split(/\n\n+/).filter((p) => p.trim());

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-obsidian pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mb-8">
            <a
              href="/blog"
              className="text-xs text-charcoal-500 hover:text-emerald-400 transition-colors uppercase tracking-wider"
            >
              &larr; Back to Blog
            </a>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              {date && (
                <span className="text-sm text-charcoal-400">{date}</span>
              )}
              {post.author && (
                <span className="text-sm text-charcoal-400">
                  by {post.author}
                </span>
              )}
            </div>
          </header>

          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-charcoal-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-charcoal-800/40">
            <a
              href="/blog"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium uppercase tracking-wider"
            >
              &larr; More Posts
            </a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
