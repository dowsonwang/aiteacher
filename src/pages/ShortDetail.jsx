import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Bookmark, ChevronLeft, Heart, Lock, Share2, X } from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import { shortDramas } from "../data/mock.js";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";

export default function ShortDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const diamonds = useAppStore((s) => s.diamonds);
  const unlockedShortEpisodes = useAppStore((s) => s.unlockedShortEpisodes);
  const unlockShortEpisode = useAppStore((s) => s.unlockShortEpisode);
  const favoriteShorts = useAppStore((s) => s.favoriteShorts);
  const toggleFavoriteShort = useAppStore((s) => s.toggleFavoriteShort);

  const drama = useMemo(() => shortDramas.find((d) => d.id === id) || shortDramas[0], [id]);
  const [episode, setEpisode] = useState(1);
  const initKeyRef = useRef("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const unlockCost = 5;
  const totalEpisodes = Math.min(10, Math.max(1, Number(drama.episodes) || 10));
  const episodeList = useMemo(() => Array.from({ length: totalEpisodes }, (_, i) => i + 1), [totalEpisodes]);
  const requestedEpisode = useMemo(() => {
    const raw = Number(searchParams.get("ep"));
    if (!Number.isFinite(raw) || raw <= 0) return 1;
    return Math.max(1, Math.min(totalEpisodes, raw));
  }, [searchParams, totalEpisodes]);
  useEffect(() => {
    const key = `${drama.id}:${requestedEpisode}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;
    setEpisode(requestedEpisode);
  }, [drama.id, requestedEpisode]);

  const isUnlocked = (ep) => ep <= 5 || Boolean(unlockedShortEpisodes?.[drama.id]?.[ep]);
  const locked = !isUnlocked(episode);

  const feedVideos = useMemo(
    () => ["/videos/feed/feed-01.mp4", "/videos/feed/feed-02.mp4", "/videos/feed/feed-03.mp4", "/videos/feed/feed-04.mp4"],
    [],
  );
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const preferredVideoSrc = useMemo(() => {
    const pad2 = (n) => `${n}`.padStart(2, "0");
    return `/videos/shorts/${drama.id}/ep-${pad2(episode)}.mp4?v=${assetVersion}`;
  }, [assetVersion, drama.id, episode]);
  const fallbackVideoSrc = useMemo(
    () => `${feedVideos[(episode - 1) % feedVideos.length]}?v=${assetVersion}`,
    [assetVersion, episode, feedVideos],
  );
  const [videoSrc, setVideoSrc] = useState(preferredVideoSrc);
  useEffect(() => {
    setVideoSrc(preferredVideoSrc);
  }, [preferredVideoSrc]);

  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const saved = useMemo(() => (Array.isArray(favoriteShorts) ? favoriteShorts.includes(drama.id) : false), [drama.id, favoriteShorts]);
  const workTags = useMemo(() => {
    const tags = Array.isArray(drama.tags) ? drama.tags : [];
    const picked = tags.filter(Boolean).slice(0, 2);
    while (picked.length < 2) picked.push("Drama");
    return picked;
  }, [drama.tags]);
  useEffect(() => {
    if (!shareOpen) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setShareUrl(origin ? `${origin}/shorts/${drama.id}` : `/shorts/${drama.id}`);
  }, [drama.id, shareOpen]);
  useEffect(() => {
    if (!shareOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shareOpen]);

  const swipeStartYRef = useRef(null);
  const swipeGateRef = useRef(0);
  const goEpisode = (next) => {
    const n = Math.max(1, Math.min(totalEpisodes, Number(next) || 1));
    if (n === episode) return;
    setEpisode(n);
  };
  const swipeTo = (direction) => {
    const now = Date.now();
    if (now - swipeGateRef.current < 320) return;
    swipeGateRef.current = now;
    goEpisode(episode + direction);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <button
        type="button"
        onClick={() => navigate("/shorts")}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-black shadow-sm">
            <div
              className="relative aspect-[9/16] w-full overscroll-contain"
              onWheel={(e) => {
                if (Math.abs(e.deltaY) < 28) return;
                e.preventDefault();
                swipeTo(e.deltaY > 0 ? 1 : -1);
              }}
              onTouchStart={(e) => {
                swipeStartYRef.current = e.touches?.[0]?.clientY ?? null;
              }}
              onTouchEnd={(e) => {
                const startY = swipeStartYRef.current;
                const endY = e.changedTouches?.[0]?.clientY ?? null;
                swipeStartYRef.current = null;
                if (startY == null || endY == null) return;
                const delta = startY - endY;
                if (Math.abs(delta) < 40) return;
                swipeTo(delta > 0 ? 1 : -1);
              }}
            >
              <video
                key={videoSrc}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                src={videoSrc}
                onError={() => {
                  if (videoSrc !== fallbackVideoSrc) setVideoSrc(fallbackVideoSrc);
                }}
              />
              {locked ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-xl">
                  <div className="mx-6 w-full max-w-[320px] rounded-3xl border border-white/20 bg-black/35 px-5 py-5 text-center text-white shadow-2xl">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                      <Lock className="h-4 w-4" />
                      <span>Unlock required</span>
                    </div>
                    <div className="mt-2 text-xs text-white/80">
                      Episodes 1–5 are free. Unlock this episode for{" "}
                      <span className="inline-flex items-center gap-1 font-semibold text-white">
                        <DiamondIcon className="h-4 w-4" />
                        <span>{unlockCost}</span>
                      </span>
                      .
                    </div>
                    <div className="mt-1 text-xs text-white/70">
                      Unlocked episodes are saved on this device.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const r = unlockShortEpisode({ dramaId: drama.id, episode, cost: unlockCost });
                        if (!r.ok) {
                          showToast("error", "Not enough 💎.");
                          return;
                        }
                        showToast("success", "Unlocked.");
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                    >
                      <span>Unlock</span>
                      <span className="inline-flex items-center gap-1">
                        <DiamondIcon className="h-4 w-4" />
                        <span>{unlockCost}</span>
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-500">Short drama</div>
                <div className="mt-1 text-2xl font-semibold text-zinc-900">{drama.title}</div>
                <div className="mt-2 text-sm text-zinc-600">{drama.description}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{drama.protagonist}</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{workTags[0]}</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{workTags[1]}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-zinc-700">
                  <DiamondIcon className="h-4 w-4" />
                  <span>{diamonds.toLocaleString()}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  Episode {episode} / {totalEpisodes}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLiked((v) => !v)}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
                    liked ? "border-rose-200 bg-rose-50 text-rose-600" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                  )}
                  aria-label="Like"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavoriteShort(drama.id)}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
                    saved ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                  )}
                  aria-label="Save"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs font-semibold text-zinc-500">
                Free: 1–5 · Locked: 6–{totalEpisodes}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-900">Episodes</div>
              <div className="text-xs font-semibold text-zinc-500">Unlock costs <span className="inline-flex items-center gap-1 align-middle"><DiamondIcon className="h-4 w-4" /><span>{unlockCost}</span></span></div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {episodeList.map((ep) => {
                const canPlay = isUnlocked(ep);
                return (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => {
                      if (canPlay) {
                        setEpisode(ep);
                        return;
                      }
                      const r = unlockShortEpisode({ dramaId: drama.id, episode: ep, cost: unlockCost });
                      if (!r.ok) {
                        showToast("error", "Not enough 💎.");
                        return;
                      }
                      showToast("success", "Unlocked.");
                      setEpisode(ep);
                    }}
                    className={cn(
                      "relative flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition",
                      ep === episode ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                      !canPlay ? "opacity-80" : "",
                    )}
                    aria-label={`Episode ${ep}`}
                  >
                    <span>{ep}</span>
                    {!canPlay ? <Lock className="absolute right-2 top-2 h-3.5 w-3.5 text-zinc-500" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-xl">
          {toast.message}
        </div>
      ) : null}

      {shareOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShareOpen(false);
          }}
        >
          <div className="w-full max-w-[420px] rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-zinc-900">Share</div>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { key: "x", label: "X / Twitter" },
                { key: "ins", label: "Instagram" },
                { key: "tt", label: "TikTok" },
                { key: "fb", label: "Facebook" },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    showToast("info", `Shared to ${p.label}.`);
                    setShareOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  <span>{p.label}</span>
                  <span className="text-xs font-semibold text-zinc-500">Share</span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="text-xs font-semibold text-zinc-500">Link</div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={shareUrl}
                  readOnly
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl || "");
                      showToast("success", "Link copied.");
                    } catch {
                      showToast("error", "Copy failed.");
                    }
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
