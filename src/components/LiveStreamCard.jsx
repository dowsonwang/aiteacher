import { cn } from "../lib/utils.js";

export default function LiveStreamCard({ host, onClick, coverSrc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-36 flex-shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white text-left shadow-sm transition hover:scale-[1.02] hover:shadow-md"
    >
      <div className="aspect-[9/16] w-full bg-zinc-100">
        <img src={coverSrc || host.coverUrl} alt={host.name} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <div className="relative">
          {host.isLive ? <div className="live-ring absolute -inset-1 rounded-full" /> : null}
          <img
            src={host.avatarUrl}
            alt={host.name}
            className="relative h-9 w-9 rounded-full object-cover ring-2 ring-white"
          />
        </div>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
          LIVE
        </span>
        <span className={cn("h-2 w-2 rounded-full", host.isLive ? "bg-emerald-400" : "bg-zinc-300")} />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10">
        <div className="truncate text-sm font-semibold text-white">{host.name}</div>
        <div className="mt-1 line-clamp-2 text-xs text-white/85">{host.headline}</div>
      </div>
    </button>
  );
}
