import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils.js";

export default function HomeFooter() {
  const navigate = useNavigate();

  const logoUrl = useMemo(
    () =>
      `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
        "Minimal app logo icon for a chat product, flat vector style, simple geometric mark, white on dark, no text",
      )}&image_size=square`,
    [],
  );

  const visa = "https://cdn.simpleicons.org/visa/ffffff";
  const master = "https://cdn.simpleicons.org/mastercard/ffffff";

  return (
    <footer className="overflow-hidden rounded-[32px] bg-zinc-950 text-white">
      <div className="px-8 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="AI Language Coach" className="h-10 w-10 rounded-2xl object-cover" />
              <div className="text-lg font-semibold">AI Language Coach</div>
            </div>
            <div className="max-w-md text-sm leading-relaxed text-white/75">
              Practice English with AI tutors, get instant corrections, and build real fluency through bite-sized scenarios.
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Features</div>
            <div className="space-y-2 text-sm text-white/75">
              {[
                { label: "Image Generation", slug: "feature-image-generation" },
                { label: "Video Generation", slug: "feature-video-generation" },
                { label: "Chat", slug: "feature-chat" },
                { label: "Create Characters", slug: "feature-create-characters" },
              ].map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  onClick={() => navigate(`/articles/${x.slug}`)}
                  className="block w-full text-left hover:text-white"
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => navigate("/blog")} className="text-left text-sm font-semibold text-white hover:text-white/90">
              Blog
            </button>
            <div className="space-y-2 text-sm text-white/75">
              {[
                { label: "pronunciation tips", slug: "blog-pronunciation-tips" },
                { label: "speaking practice", slug: "blog-speaking-practice" },
                { label: "grammar shortcuts", slug: "blog-grammar-shortcuts" },
                { label: "travel English", slug: "blog-travel-english" },
                { label: "study routine", slug: "blog-study-routine" },
              ].map((k) => (
                <button
                  key={k.slug}
                  type="button"
                  onClick={() => navigate(`/articles/${k.slug}`)}
                  className="block w-full text-left hover:text-white"
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Legal & Support</div>
            <div className="space-y-2 text-sm text-white/75">
              <button type="button" onClick={() => navigate("/terms")} className="block w-full text-left hover:text-white">
                User Agreement
              </button>
              <button type="button" onClick={() => navigate("/privacy")} className="block w-full text-left hover:text-white">
                Privacy Policy
              </button>
              <button type="button" onClick={() => navigate("/faq")} className="block w-full text-left hover:text-white">
                FAQ
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">Payments</div>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-16 items-center justify-center rounded-2xl bg-white/10")}>
                <img
                  src={visa}
                  alt="Visa"
                  className="h-5"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className={cn("flex h-10 w-16 items-center justify-center rounded-2xl bg-white/10")}>
                <img
                  src={master}
                  alt="Mastercard"
                  className="h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div>© 2026 AI Language Coach. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
