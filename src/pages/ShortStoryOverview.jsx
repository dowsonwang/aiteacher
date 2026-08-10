import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, ChevronRight, Heart, Play } from "lucide-react";
import { characters, shortDramas, shortStoryBranches } from "../data/mock.js";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";

const fallbackNodes = (drama) => [
  {
    id: `${drama.id}-official-1`,
    parentId: null,
    episode: 1,
    title: "Where the story begins",
    prompt: "Official story opening",
    official: true,
  },
];

const buildLongestPath = (nodes) => {
  const childrenByParentId = {};
  nodes.forEach((node, index) => {
    const key = node.parentId || "";
    const list = childrenByParentId[key] || [];
    list.push({ ...node, _index: index });
    childrenByParentId[key] = list;
  });

  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const memo = {};
  const visit = (nodeId) => {
    if (memo[nodeId]) return memo[nodeId];
    const children = childrenByParentId[nodeId] || [];
    const bestChildDepth = children.reduce((best, child) => Math.max(best, visit(child.id)), 0);
    memo[nodeId] = 1 + bestChildDepth;
    return memo[nodeId];
  };
  Object.keys(nodeById).forEach((nodeId) => visit(nodeId));

  const rootNode =
    nodes.find((node) => node.official && node.episode === 1 && !node.parentId) ||
    nodes.find((node) => node.episode === 1 && !node.parentId) ||
    nodes[0];
  if (!rootNode) return [];

  const sortByDepth = (left, right) => {
    const delta = (memo[right.id] || 1) - (memo[left.id] || 1);
    if (delta) return delta;
    return (left._index || 0) - (right._index || 0);
  };

  const path = [];
  let cursor = rootNode.id;
  while (cursor) {
    path.push(nodeById[cursor]);
    const children = (childrenByParentId[cursor] || []).slice().sort(sortByDepth);
    if (!children.length) break;
    cursor = children[0].id;
  }
  return path.filter(Boolean);
};

export default function ShortStoryOverview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const favoriteShorts = useAppStore((state) => state.favoriteShorts);
  const likedShorts = useAppStore((state) => state.likedShorts);
  const toggleFavoriteShort = useAppStore((state) => state.toggleFavoriteShort);
  const toggleLikeShort = useAppStore((state) => state.toggleLikeShort);

  const drama = useMemo(() => shortDramas.find((item) => item.id === id) || shortDramas[0], [id]);
  const character = useMemo(() => characters.find((item) => item.id === drama.characterId) || null, [drama.characterId]);
  const storyNodes = useMemo(() => shortStoryBranches[drama.id] || fallbackNodes(drama), [drama]);
  const longestPath = useMemo(() => buildLongestPath(storyNodes), [storyNodes]);
  const longestEpisodeCount = longestPath.length || drama.episodes || 1;
  const openingNode = longestPath[0] || storyNodes[0] || null;
  const episodeLabels = useMemo(
    () => Array.from({ length: longestEpisodeCount }, (_, index) => `Ep. ${index + 1}`),
    [longestEpisodeCount],
  );
  const synopsis = openingNode?.prompt
    ? `${drama.title} follows ${drama.protagonist} through a story shaped by ${drama.description.toLowerCase()} The opening chapter begins with ${openingNode.prompt.toLowerCase()} In the current demo, the longest public line reaches ${longestEpisodeCount} episodes.`
    : `${drama.title} follows ${drama.protagonist} through a story shaped by ${drama.description.toLowerCase()} In the current demo, the longest public line reaches ${longestEpisodeCount} episodes.`;
  const description = openingNode?.prompt
    ? `${drama.description} ${openingNode.prompt}`
    : drama.description;
  const saved = useMemo(() => (Array.isArray(favoriteShorts) ? favoriteShorts.includes(drama.id) : false), [drama.id, favoriteShorts]);
  const liked = useMemo(() => (Array.isArray(likedShorts) ? likedShorts.includes(drama.id) : false), [drama.id, likedShorts]);
  const displayFavoriteCount = Math.max(0, Number(drama.favoriteCount) || 0) + (saved ? 1 : 0);
  const displayLikeCount = Math.max(0, Number(drama.likeCount) || 0) + (liked ? 1 : 0);

  useEffect(() => {
    const previousTitle = document.title;
    const meta =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const element = document.createElement("meta");
        element.setAttribute("name", "description");
        document.head.appendChild(element);
        return element;
      })();
    const previousDescription = meta.getAttribute("content") || "";
    document.title = `${drama.title} | Heartbits ai`;
    meta.setAttribute("content", description);
    return () => {
      document.title = previousTitle;
      meta.setAttribute("content", previousDescription);
    };
  }, [description, drama.title]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-12">
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <Link to="/shorts" className="transition hover:text-zinc-900">
          All Micro-Dramas
        </Link>
        <ChevronRight className="h-4 w-4 text-zinc-300" />
        <span className="font-medium text-zinc-900">{drama.title}</span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[24px] bg-zinc-100">
            <img src={drama.coverUrl} alt={drama.title} className="aspect-[3/4] h-full w-full object-cover" />
          </div>

          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{drama.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFavoriteShort(drama.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-1 py-1 text-sm font-semibold transition",
                      saved ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800",
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                    <span>{displayFavoriteCount.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLikeShort(drama.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-1 py-1 text-sm font-semibold transition",
                      liked ? "text-rose-600" : "text-zinc-500 hover:text-zinc-800",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                    <span>{displayLikeCount.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/shorts/${drama.id}`)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Go watching
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(drama.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid gap-3 rounded-[24px] border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0 rounded-[20px] border border-zinc-200 bg-white p-4 sm:min-h-[210px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-zinc-950">Synopsis</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{synopsis}</p>
                </div>

                <div className="rounded-[20px] border border-zinc-200 bg-white p-4 sm:min-h-[210px]">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Lead character</div>
                  {character ? (
                    <div className="mt-3 flex items-start gap-3">
                      <img
                        src={character.heroUrl || character.avatarUrl || character.fallbackUrl}
                        alt={character.name}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-950">{character.name}</div>
                        <p className="mt-1 line-clamp-4 text-xs leading-5 text-zinc-600">{character.bio}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-zinc-500">Character information is not available in the current demo.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950">Episode list</h2>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {episodeLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(`/shorts/${drama.id}?episode=${index + 1}`)}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-950">How to play</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
          <p>Each Micro-Drama starts from an official first episode. Watch it, then shape what happens next.</p>
          <p>
            At the end of every episode you have two choices:{" "}
            <span className="font-semibold text-zinc-900">Continue</span> to write the next episode, or{" "}
            <span className="font-semibold text-zinc-900">Rewrite</span> to reimagine the current one with your own idea.
          </p>
          <p>Describe the direction you want, spend Diamonds, and a new video branch is generated from this node. Public branches can also be discovered and watched by other users.</p>
          <p>Switch between episodes on the play page to explore different story lines created by you or the community.</p>
        </div>
      </section>
    </div>
  );
}
