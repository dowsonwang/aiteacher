import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listBlogArticles } from "../data/articles.js";
import { cn } from "../lib/utils.js";

export default function Blog() {
  const navigate = useNavigate();
  const posts = useMemo(() => {
    const raw = listBlogArticles();
    const sorted = [...raw].sort((a, b) => `${b.date || ""}`.localeCompare(`${a.date || ""}`));
    return sorted;
  }, []);
  const featured = posts[0] || null;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="space-y-1">
        <div className="text-base font-semibold text-zinc-900">Blog</div>
        <div className="text-sm text-zinc-600">Practical tips for speaking, grammar, vocabulary, and study habits.</div>
      </div>

      {featured ? (
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
            <div className="relative bg-zinc-100">
              {featured.coverUrl ? (
                <img src={featured.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full min-h-[220px]" />
              )}
            </div>
            <div className="p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Featured</div>
                <div className="text-xs font-semibold text-zinc-500">{featured.date || ""}</div>
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-900">{featured.title}</div>
              <div className="mt-3 text-sm leading-relaxed text-zinc-600">{featured.subtitle}</div>
              <button
                type="button"
                onClick={() => navigate(`/articles/${featured.slug}`)}
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Read
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rest.map((p) => (
          <div key={p.slug} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {p.coverUrl ? <img src={p.coverUrl} alt="" className="h-44 w-full object-cover" /> : null}
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">AI Language Coach</div>
                <div className="text-xs font-semibold text-zinc-500">{p.date || ""}</div>
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-900">{p.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-600">{p.subtitle}</div>
              <button
                type="button"
                onClick={() => navigate(`/articles/${p.slug}`)}
                className={cn(
                  "mt-4 inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50",
                )}
              >
                Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
