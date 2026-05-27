import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function ImmersiveCharacterCard({ character, onStartChat }) {
  const primarySrc = useMemo(
    () => character.heroUrl || character.photoUrl || character.avatarUrl,
    [character.avatarUrl, character.heroUrl, character.photoUrl],
  );
  const fallbackSrc = useMemo(() => character.fallbackUrl || character.avatarUrl, [character.avatarUrl, character.fallbackUrl]);
  const [src, setSrc] = useState(primarySrc);
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const videoSrc = useMemo(() => `/videos/characters/hover.mp4?v=${assetVersion}`, [assetVersion]);
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    setSrc(primarySrc);
  }, [primarySrc]);

  return (
    <button
      type="button"
      onClick={() => onStartChat?.(character.id)}
      onMouseEnter={() => {
        const el = videoRef.current;
        if (!el || !hasVideo) return;
        try {
          el.currentTime = 0;
          const p = el.play();
          if (p?.catch) p.catch(() => {});
        } catch {
        }
      }}
      onMouseLeave={() => {
        const el = videoRef.current;
        if (!el) return;
        try {
          el.pause();
          el.currentTime = 0;
        } catch {
        }
      }}
      className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full bg-zinc-100">
        <img
          src={src}
          alt={character.name}
          className={cn("h-full w-full object-cover transition-opacity duration-200", hasVideo ? "group-hover:opacity-0" : "")}
          onError={() => {
            if (fallbackSrc && src !== fallbackSrc) setSrc(fallbackSrc);
          }}
        />
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            loop
            preload="metadata"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            onError={() => setHasVideo(false)}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10">
        <div className="flex items-baseline justify-between gap-3">
          <div className="truncate text-sm font-semibold text-white">{character.name}</div>
          <div className="text-[11px] text-white/75">{character.age ? `${character.age}` : ""}</div>
        </div>
        <div className="mt-1 line-clamp-1 text-[11px] text-white/80">{character.bio}</div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-3 pb-3 transition group-hover:translate-y-0">
        <div
          className={cn(
            "rounded-2xl border border-white/25 bg-white/12 p-3 text-white backdrop-blur-xl",
            "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
          )}
        >
          <div className="text-sm font-semibold">{character.name}</div>
          <div className="mt-2 line-clamp-3 text-xs text-white/85">{character.bio}</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900">
            <MessageCircle className="h-4 w-4" />
            Chat
          </div>
        </div>
      </div>
    </button>
  );
}
