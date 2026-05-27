import { MessageCircle, Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";

const heatIcon = (heat) => {
  if (heat >= 85) return SignalHigh;
  if (heat >= 70) return SignalMedium;
  if (heat >= 50) return SignalLow;
  return Signal;
};

export default function CharacterCard({ character, onStartChat }) {
  const language = useAppStore((s) => s.language);
  const HeatIcon = heatIcon(character.stats?.heat ?? 0);

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="h-12 w-12 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold text-zinc-900">{character.name}</div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <HeatIcon className="h-4 w-4" />
              <span>{character.stats?.heat ?? "-"}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {character.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 line-clamp-2 text-sm text-zinc-600">{character.bio}</div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              character.stats?.online ? "bg-emerald-500" : "bg-zinc-300",
            )}
          />
          <div className="text-xs text-zinc-500">
            {character.stats?.online ? t(language, "common_online") : t(language, "common_offline")}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onStartChat?.(character.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <MessageCircle className="h-4 w-4" />
          {t(language, "character_start_chat")}
        </button>
      </div>
    </div>
  );
}
