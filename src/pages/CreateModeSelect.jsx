import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";

const imageUrl = (prompt, imageSize) =>
  `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;

export default function CreateModeSelect() {
  const navigate = useNavigate();
  const subscription = useAppStore((s) => s.subscription);
  const isVipEnabled = subscription.status === "active";
  const [assetVersion] = useState(() => Date.now().toString());

  const standardCover = useMemo(
    () =>
      imageUrl(
        "Soft neutral gradient background, minimal, clean, high quality, no text",
        "square_hd",
      ),
    [],
  );
  const vipCover = useMemo(
    () =>
      imageUrl(
        "Luxury black and gold abstract gradient background, premium, cinematic light, high quality, no text",
        "square_hd",
      ),
    [],
  );

  return (
    <div className="h-full min-h-0 overflow-hidden bg-zinc-50 p-6">
      <div className="mx-auto flex h-full min-h-0 max-w-5xl flex-col items-center justify-center">
        <div className="w-full text-center">
          <div className="text-2xl font-semibold text-zinc-900">Start Character Creation</div>
          <div className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600">
            Pick a creation mode, then shape the character step by step — from outer looks to inner core.
          </div>
        </div>

        <div className="mt-7 w-full">
          <div className="grid w-full grid-cols-1 justify-items-center gap-5 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/create/normal")}
              className="group relative aspect-square w-full max-w-[440px] overflow-hidden rounded-[36px] border border-zinc-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={`${standardCover}&v=${assetVersion}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-white/70" />
              <div className="relative flex h-full flex-col p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-zinc-900">Standard</div>
                      <div className="mt-1 text-xs font-semibold text-zinc-600">Guided · Fast · Beginner friendly</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-zinc-900/5 px-3 py-1 text-[11px] font-semibold text-zinc-700">Free</div>
                </div>

                <div className="mt-6 space-y-2 text-sm font-medium text-zinc-700">
                  <div>1) Outer looks: race / age / body / eyes / hair</div>
                  <div>2) Inner core: name / personality</div>
                  <div>3) Generate once and start chatting</div>
                </div>

                <div className="mt-auto">
                  <div className="inline-flex items-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-zinc-800">
                    Start Standard
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(isVipEnabled ? "/create/vip" : "/subscribe")}
              className={cn(
                "group relative aspect-square w-full max-w-[440px] overflow-hidden rounded-[36px] border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                isVipEnabled ? "border-amber-300/40 bg-black" : "border-zinc-200 bg-black",
              )}
            >
              <img
                src={`${vipCover}&v=${assetVersion}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/60 to-black/80" />
              <div className="relative flex h-full flex-col p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/20 shadow-sm">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">VIP</div>
                      <div className="mt-1 text-xs font-semibold text-white/70">Prompt-based · Premium · 3 candidates</div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      isVipEnabled ? "bg-amber-200/15 text-amber-100 ring-1 ring-amber-200/20" : "bg-white/10 text-white/80 ring-1 ring-white/15",
                    )}
                  >
                    {isVipEnabled ? "Unlocked" : "Locked"}
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm font-medium text-white/80">
                  <div>1) Same guided steps (outer → inner)</div>
                  <div>2) Add a prompt to shape details & style</div>
                  <div>3) Generate 3 candidates and pick your favorite</div>
                </div>

                <div className="mt-auto">
                  <div
                    className={cn(
                      "inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold transition",
                      isVipEnabled
                        ? "bg-gradient-to-r from-amber-200 to-amber-400 text-zinc-900 hover:from-amber-300 hover:to-amber-500"
                        : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
                    )}
                  >
                    {isVipEnabled ? "Start VIP" : "Subscribe to unlock"}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
