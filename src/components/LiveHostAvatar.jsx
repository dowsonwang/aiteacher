import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils.js";

export default function LiveHostAvatar({ host }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/live/${host.id}`)}
      className="group relative flex w-20 flex-col items-center text-left"
    >
      <div className="relative">
        {host.isLive ? (
          <div className="live-ring absolute -inset-1 rounded-full" />
        ) : (
          <div className="absolute -inset-1 rounded-full bg-zinc-200" />
        )}
        <img
          src={host.avatarUrl}
          alt={host.name}
          className={cn(
            "relative h-16 w-16 rounded-full object-cover",
            host.isLive ? "ring-2 ring-white" : "ring-2 ring-white/0",
          )}
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-1">
        {host.isLive ? (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Live
          </span>
        ) : null}
        <span className="max-w-full truncate text-xs font-medium text-zinc-800">{host.name}</span>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-0 z-20 hidden w-52 -translate-x-1/2 -translate-y-[110%] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl group-hover:block">
        <div className="relative aspect-video">
          <img src={host.coverUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            🔴 {host.watching} watching
          </div>
        </div>
        <div className="px-3 py-2 text-sm font-semibold text-zinc-900">{host.name}</div>
      </div>
    </button>
  );
}
