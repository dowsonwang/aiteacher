import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Users } from "lucide-react";
import { cn } from "../lib/utils.js";
import HomeBannerCarousel from "../components/HomeBannerCarousel.jsx";

const assetVersion = Date.now().toString();

const formatK = (value) => {
  if (!Number.isFinite(value)) return "-";
  if (value < 1000) return `${value}`;
  const k = value / 1000;
  if (k >= 100) return `${Math.round(k)}K`;
  return `${Number(k.toFixed(1))}K`;
};

const makeLiveItems = () => {
  const names = [
    "Lynn",
    "Ryo",
    "Mika",
    "Noah",
    "Ava",
    "Kai",
    "Yuna",
    "Mason",
    "Lia",
    "Ethan",
    "Sora",
    "Nova",
    "Iris",
    "Leo",
    "Hazel",
    "Jade",
    "River",
    "Skye",
    "Finn",
    "Aria",
  ];
  const headlines = [
    "Late-night talk & cozy music",
    "Real-time advice, no fluff",
    "Fashion chat + daily stories",
    "Chill Q&A + story time",
    "Morning vibes & journaling",
    "Gaming + hangout",
    "Storytelling live",
    "Productivity session",
    "Coffee chat",
    "Open mic questions",
    "Acoustic sessions & requests",
    "Quick reactions & hot takes",
    "Makeup tips + GRWM",
    "Tech talk, fast answers",
    "Movie nights & commentary",
    "Daily life, small joys",
    "Study with me",
    "Travel stories, live",
    "Sports chat + highlights",
    "Late-night confession booth",
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const index = i + 1;
    const id = `l${index}`;
    const viewers = Math.floor(120_000 + index * 38_500 + (index % 3) * 7_900);
    const coverPick = ((index - 1) % 6) + 1;
    return {
      id,
      name: names[i] || `Host ${index}`,
      headline: headlines[i] || "Live now — come hang out",
      totalViews: viewers,
      coverCandidates: [
        `/images/live/live-cover${coverPick}.png?v=${assetVersion}`,
        `/images/live/cover-${String(coverPick).padStart(2, "0")}.png?v=${assetVersion}`,
      ],
      previewCandidates: [
        `/videos/live/preview-01.mp4?v=${assetVersion}`,
        `/images/live/preview-01.mp4?v=${assetVersion}`,
      ],
      avatarCandidates: [
        `/images/live/avatar-01.png?v=${assetVersion}`,
        `/images/live/avatar-${String(index).padStart(2, "0")}.png?v=${assetVersion}`,
      ],
      fallbackCoverUrl: `/images/home/live-cover.png?v=${assetVersion}`,
    };
  });
};

function LiveCard({ item }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [coverTry, setCoverTry] = useState(0);
  const [avatarTry, setAvatarTry] = useState(0);
  const [previewTry, setPreviewTry] = useState(0);
  const coverSrc = item.coverCandidates[coverTry] || item.fallbackCoverUrl;
  const avatarSrc = item.avatarCandidates[avatarTry] || item.fallbackCoverUrl;
  const videoRef = useRef(null);

  const previewSrc = item.previewCandidates[previewTry];

  useEffect(() => {
    if (!hovered) return;
    const el = videoRef.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      try {
        el.currentTime = 0;
        const r = el.play();
        if (r && typeof r.catch === "function") r.catch(() => {});
      } catch {
      }
    }, 40);
    return () => window.clearTimeout(t);
  }, [hovered]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/live/${item.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/live/${item.id}`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        const el = videoRef.current;
        if (el) {
          try {
            el.pause();
            el.currentTime = 0;
          } catch {
          }
        }
      }}
      className="group relative cursor-pointer select-none overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
    >
      <div className="relative aspect-[9/16]">
        <img
          src={coverSrc}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            hovered ? "opacity-0" : "opacity-100",
          )}
          onError={() => {
            setCoverTry((v) => Math.min(v + 1, item.coverCandidates.length));
          }}
        />
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0",
          )}
          muted
          loop
          playsInline
          preload="none"
          src={hovered ? previewSrc : undefined}
          onError={() => {
            setPreviewTry((v) => Math.min(v + 1, item.previewCandidates.length));
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            LIVE
          </div>
        </div>

        <div className="absolute right-3 top-3">
          <img
            src={avatarSrc}
            alt={item.name}
            className="h-10 w-10 rounded-full border border-white/20 object-cover"
            onError={() => {
              setAvatarTry((v) => Math.min(v + 1, item.avatarCandidates.length));
            }}
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            hovered ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/live/${item.id}`);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-black/70 px-4 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-black/80"
          >
            <Play className="h-4 w-4" />
            Enter Live
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{item.name}</div>
              <div className="mt-1 line-clamp-2 text-xs text-white/85">{item.headline}</div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
              <Users className="h-3.5 w-3.5" />
              {formatK(item.totalViews)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveList() {
  const items = useMemo(() => makeLiveItems(), []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="text-base font-semibold text-zinc-900">Live</div>

      <HomeBannerCarousel />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <LiveCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
