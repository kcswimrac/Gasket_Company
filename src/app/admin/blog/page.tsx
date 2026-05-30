"use client";

import { useState, useEffect, useCallback } from "react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (data.success) setPosts(data.posts);
      else setError(data.error);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleAdd = async () => {
    if (!newTitle || !newContent) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || slugify(newTitle),
          excerpt: newExcerpt || null,
          content: newContent,
          author: newAuthor || null,
          published: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle("");
        setNewSlug("");
        setNewExcerpt("");
        setNewContent("");
        setNewAuthor("");
        setShowAdd(false);
        fetchPosts();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: editTitle,
          slug: editSlug,
          excerpt: editExcerpt,
          content: editContent,
          author: editAuthor,
        }),
      });
      const data = await res.json();
      if (data.success) fetchPosts();
      else setError(data.error);
    } catch {
      setError("Failed to update post");
    } finally {
      setEditSaving(false);
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
      fetchPosts();
    } catch {
      setError("Failed to toggle published state");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (expandedId === id) setExpandedId(null);
      fetchPosts();
    } catch {
      setError("Failed to delete post");
    }
  };

  const expandPost = (post: BlogPost) => {
    if (expandedId === post.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(post.id);
    setEditTitle(post.title);
    setEditSlug(post.slug);
    setEditExcerpt(post.excerpt || "");
    setEditContent(post.content);
    setEditAuthor(post.author || "");
  };

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls =
    "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors"
        >
          + New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Add post form */}
      {showAdd && (
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-white mb-4">New Blog Post</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug || newSlug === slugify(newTitle)) {
                      setNewSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="Post title"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Excerpt</label>
              <input
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                placeholder="Short summary for listing page"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Content *</label>
              <textarea
                rows={8}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Post content. Use blank lines to separate paragraphs."
                className={`${inputCls} resize-y`}
              />
            </div>
            <div>
              <label className={labelCls}>Author</label>
              <input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Author name"
                className={inputCls}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={saving || !newTitle || !newContent}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Post"}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-2.5 border border-charcoal-700 text-charcoal-400 hover:text-charcoal-300 text-xs rounded uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg
              className="animate-spin w-4 h-4 text-charcoal-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-charcoal-400">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-charcoal-300 mb-2">No posts yet</p>
            <p className="text-sm text-charcoal-500">
              Click &quot;+ New Post&quot; to write your first blog post.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-800/30">
            {posts.map((post) => (
              <div key={post.id}>
                <div
                  className="flex items-center gap-4 py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors"
                  onClick={() => expandPost(post)}
                >
                  <svg
                    className={`w-3 h-3 text-charcoal-600 transition-transform shrink-0 ${
                      expandedId === post.id ? "rotate-90" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-[11px] text-charcoal-500">/{post.slug}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-charcoal-500">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublished(post);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        post.published
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-charcoal-800 text-charcoal-500"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </button>
                  </div>
                </div>

                {expandedId === post.id && (
                  <div className="px-4 pb-5 pl-11 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Slug</label>
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Excerpt</label>
                      <input
                        value={editExcerpt}
                        onChange={(e) => setEditExcerpt(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Content</label>
                      <textarea
                        rows={10}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`${inputCls} resize-y`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Author</label>
                      <input
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => handleUpdate(post.id)}
                        disabled={editSaving}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider disabled:opacity-50"
                      >
                        {editSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePublished(post);
                        }}
                        className={`px-4 py-2 text-[11px] font-bold rounded uppercase tracking-wider transition-colors ${
                          post.published
                            ? "border border-charcoal-700 text-charcoal-400 hover:text-charcoal-300"
                            : "bg-blue-500 hover:bg-blue-400 text-white"
                        }`}
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-[11px] text-red-400/60 hover:text-red-400 font-medium ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
