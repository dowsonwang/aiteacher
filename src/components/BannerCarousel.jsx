import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import { banners as seedBanners } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";

export default function BannerCarousel() {
  const navigate = useNavigate();
  const language = useAppStore((s) => s.language);
  const [index, setIndex] = useState(0);

  const banners = useMemo(() => seedBanners, []);
  const active = banners[index] || banners[0];

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((v) => (v + 1) % banners.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const title = active.titleKey ? t(language, active.titleKey) : active.title;
  const subtitle = active.subtitleKey ? t(language, active.subtitleKey) : active.subtitle;
  const ctaText = active.ctaKey ? t(language, active.ctaKey) : active.ctaText;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      <div className="absolute inset-0">
        <img src={active.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
      </div>

      <div className="relative flex min-h-48 flex-col justify-between gap-6 px-6 py-6 text-white">
        <div className="max-w-xl space-y-2">
          <div className="text-2xl font-semibold leading-tight">{title}</div>
          <div className="text-sm text-white/85">{subtitle}</div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(active.href)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            {ctaText}
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/70",
                )}
                aria-label={`banner-${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
