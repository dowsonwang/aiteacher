import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../lib/utils.js";
import { getArticleBySlug } from "../data/articles.js";

export default function Article() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const data = useMemo(() => getArticleBySlug(slug), [slug]);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="text-base font-semibold text-zinc-900">Article not found</div>
        <button
          type="button"
          onClick={() => navigate("/browse")}
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="px-7 py-7">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">AI Language Coach</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{data.title}</div>
          <div className="mt-2 text-sm text-zinc-600">{data.subtitle}</div>
        </div>

        <div className="border-t border-zinc-200 px-7 py-6">
          <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
            {data.body.map((p) => (
              <div key={p} className={cn("whitespace-pre-wrap")}>
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-200 px-7 py-5">
          <button
            type="button"
            onClick={() => navigate("/browse")}
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
