import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";
import { characters, shortDramas } from "../data/mock.js";
import { cn } from "../lib/utils.js";

export default function Shorts() {
  const navigate = useNavigate();
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const list = useMemo(() => {
    const map = new Map(characters.map((c) => [c.id, c]));
    return shortDramas
      .map((d) => ({ drama: d, character: map.get(d.characterId) }))
      .filter((x) => x.character);
  }, []);
  const coverSources = useMemo(
    () => [
      `/images/home/shorts-cover.png?v=${assetVersion}`,
      `/images/home/shorts-cover1.png?v=${assetVersion}`,
      `/images/home/shorts-cover2.png?v=${assetVersion}`,
      `/images/home/shorts-cover3.png?v=${assetVersion}`,
      `/images/home/shorts-cover4.png?v=${assetVersion}`,
    ],
    [assetVersion],
  );
  const pad2 = (n) => `${n}`.padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-2xl font-semibold text-zinc-900">Shorts</div>
        </div>
      </div>

      <div className="space-y-4">
        {list.map(({ drama, character }) => {
          const total = Math.min(10, Math.max(1, Number(drama.episodes) || 10));
          const previewCount = Math.min(6, total);
          const previewEpisodes = Array.from({ length: previewCount }, (_, i) => i + 1);
          const dramaSeed = Math.max(1, Number(`${drama.id}`.replace(/\D/g, "")) || 1);
          return (
            <div key={drama.id} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex shrink-0 flex-col items-start gap-3 lg:w-80">
                  <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-100">
                    <img
                      src={character.avatarUrl || character.heroUrl || character.fallbackUrl}
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-zinc-900">{character.name}</div>
                    <div className="mt-2 line-clamp-2 text-sm text-zinc-600">{character.bio}</div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {previewEpisodes.map((ep) => {
                      const preferred = `/images/shorts/episodes/${drama.id}/ep-${pad2(ep)}.png?v=${assetVersion}`;
                      const fallback = coverSources[(dramaSeed + ep - 2) % coverSources.length];
                      return (
                        <button
                          key={ep}
                          type="button"
                          onClick={() => navigate(`/shorts/${drama.id}?ep=${ep}`)}
                          className="group relative w-[104px] flex-shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm transition hover:scale-[1.02] hover:shadow-md"
                          aria-label={`${character.name} episode ${ep}`}
                        >
                          <div className="aspect-[9/16] w-full overflow-hidden">
                            <img
                              src={preferred}
                              data-fallback={fallback}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                              onError={(e) => {
                                const next = e.currentTarget.dataset.fallback;
                                if (next) {
                                  e.currentTarget.src = next;
                                  e.currentTarget.dataset.fallback = "";
                                }
                              }}
                            />
                          </div>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                          <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                            Ep {ep}
                          </div>
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                              <Play className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      key="more"
                      type="button"
                      onClick={() => navigate(`/shorts/${drama.id}`)}
                      className={cn(
                        "group relative w-[104px] flex-shrink-0 overflow-hidden rounded-3xl border shadow-sm transition hover:scale-[1.02] hover:shadow-md",
                        "border-zinc-200 bg-white text-zinc-900",
                      )}
                      aria-label={`${character.name} more`}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-semibold">More</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
