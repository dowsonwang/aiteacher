import { MessageCircle } from "lucide-react";

export default function CharacterPortraitCard({ character, onStartChat }) {
  return (
    <button
      type="button"
      onClick={() => onStartChat?.(character.id)}
      className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full bg-zinc-100">
        <img src={character.photoUrl || character.avatarUrl} alt={character.name} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-1 px-4 pb-4 pt-3">
        <div className="flex items-baseline gap-2">
          <div className="text-base font-semibold text-zinc-900">{character.name}</div>
          <div className="text-xs text-zinc-500">{character.age ? `${character.age} yrs` : ""}</div>
        </div>
        <div className="line-clamp-2 text-sm text-zinc-600">{character.bio}</div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-4 pb-4 transition group-hover:translate-y-0">
        <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Start Chat 💬
          </span>
        </div>
      </div>
    </button>
  );
}
