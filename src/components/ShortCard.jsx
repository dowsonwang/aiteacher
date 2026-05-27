import { useNavigate } from "react-router-dom";

export default function ShortCard({ drama, coverSrc, showProtagonistTag = true, size = "md", protagonistAvatarUrl }) {
  const navigate = useNavigate();
  const widthClass = size === "lg" ? "w-44" : "w-36";
  const titleClass = size === "lg" ? "text-base" : "text-sm";
  const avatarClass = size === "lg" ? "h-7 w-7" : "h-6 w-6";

  return (
    <button
      type="button"
      onClick={() => navigate(`/shorts/${drama.id}`)}
      className={`group relative ${widthClass} flex-shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:scale-[1.03] hover:shadow-md`}
    >
      <div className="aspect-[9/16] w-full overflow-hidden bg-zinc-100">
        <img src={coverSrc || drama.coverUrl} alt={drama.title} className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
          {drama.episodes} eps
        </span>
        {showProtagonistTag ? (
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
            {drama.protagonist}
          </span>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {protagonistAvatarUrl ? (
            <img
              src={protagonistAvatarUrl}
              alt=""
              className={`${avatarClass} shrink-0 rounded-full object-cover ring-1 ring-white/25`}
            />
          ) : null}
          <div className={`min-w-0 truncate font-semibold text-white ${titleClass}`}>{drama.title}</div>
        </div>
      </div>
    </button>
  );
}
