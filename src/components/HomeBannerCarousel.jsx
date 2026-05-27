import { useMemo } from "react";

export default function HomeBannerCarousel() {
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const bannerSrc = useMemo(() => `/images/home/banner3.png?v=${assetVersion}`, [assetVersion]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
      <div className="absolute inset-0">
        <img src={bannerSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      </div>

      <div className="relative flex min-h-56 flex-col justify-between gap-6 px-7 py-7 text-white">
        <div className="max-w-xl space-y-2">
          <div className="text-3xl font-semibold leading-tight">Learn English with an AI Coach</div>
          <div className="text-sm leading-relaxed text-white/85">
            Practice speaking, expand vocabulary, and get instant corrections—right when you need them.
            Train with realistic scenarios, track progress, and build confidence one session at a time.
          </div>
        </div>
      </div>
    </div>
  );
}
