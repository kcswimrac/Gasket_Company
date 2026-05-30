import { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, tips, and stories from Backyard Restoration — custom gaskets and reproduction parts for vintage equipment.",
  openGraph: {
    title: "Blog | Backyard Restoration",
    description: "News, tips, and stories from Backyard Restoration.",
  },
};

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.DATABASE_URL;
    if (!url) return [];
    const sql = neon(url);
    const posts = await sql`
      SELECT id, slug, title, excerpt, author, published_at, created_at
      FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC NULLS LAST
    `;
    return posts as unknown as BlogPost[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-obsidian pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Blog
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              News & Updates
            </h1>
            <p className="mt-4 text-charcoal-300 leading-relaxed max-w-2xl">
              Tips, build stories, and updates from the shop.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-charcoal-400">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const date = post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;
                return (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl p-6 hover:border-emerald-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-charcoal-300 mt-2 leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          {date && (
                            <span className="text-[11px] text-charcoal-500">{date}</span>
                          )}
                          {post.author && (
                            <span className="text-[11px] text-charcoal-500">
                              by {post.author}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider shrink-0 mt-1">
                        Read
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
