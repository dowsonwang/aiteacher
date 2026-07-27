import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Heart,
  Play,
  RotateCcw,
  WandSparkles,
} from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import Modal from "../components/Modal.jsx";
import { shortDramas, shortStoryBranches } from "../data/mock.js";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const generationCost = 2700;
const generationDurationSeconds = 10;
const promptMaxLength = 1200;
const playbackRateOptions = [0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds) => {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const deriveGeneratedTitle = (prompt, fallback = "New episode") => {
  const clean = `${prompt || ""}`.replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  const firstSentence = clean
    .split(/[。！？.!?]/)
    .map((part) => part.trim())
    .find(Boolean);
  const title = firstSentence || clean;
  return title.length > 44 ? `${title.slice(0, 44).trim()}...` : title;
};

const fallbackNodes = (drama) => [
  {
    id: `${drama.id}-official-1`,
    parentId: null,
    episode: 1,
    title: "Where the story begins",
    prompt: "Official story opening",
    author: "Heartbits Studio",
    authorAvatar: "/images/home/people.png",
    duration: "1:12",
    views: "8.2K",
    videoUrl: "/videos/feed/feed-01.mp4",
    official: true,
  },
];

export default function ShortStoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const videoRef = useRef(null);
  const initializedDramaRef = useRef(null);
  const allowAutoplayRef = useRef(true);
  const drama = useMemo(() => shortDramas.find((item) => item.id === id) || shortDramas[0], [id]);
  const baseNodes = useMemo(() => shortStoryBranches[drama.id] || fallbackNodes(drama), [drama]);
  const accountKey = useAppStore((state) => state.session?.accountKey);
  const continuationJobs = useAppStore((state) => state.shortContinuationJobs);
  const createShortContinuation = useAppStore((state) => state.createShortContinuation);
  const openDiamondUpsell = useUIStore((state) => state.openDiamondUpsell);
  const favoriteShorts = useAppStore((state) => state.favoriteShorts);
  const likedShorts = useAppStore((state) => state.likedShorts);
  const toggleFavoriteShort = useAppStore((state) => state.toggleFavoriteShort);
  const toggleLikeShort = useAppStore((state) => state.toggleLikeShort);
  const [currentNodeId, setCurrentNodeId] = useState(baseNodes[0].id);
  const [path, setPath] = useState([baseNodes[0].id]);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [toast, setToast] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState("continue");
  const [createEpisode, setCreateEpisode] = useState(2);
  const [createParentNodeId, setCreateParentNodeId] = useState("");
  const [now, setNow] = useState(Date.now());
  const [playerHovered, setPlayerHovered] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waitingForBranchChoice, setWaitingForBranchChoice] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const ownJobs = useMemo(
    () =>
      (continuationJobs || [])
        .filter((job) => job.dramaId === drama.id && job.ownerKey === accountKey)
        .map((job) => ({
          ...job,
          readyAt: Math.min(job.readyAt, job.createdAt + generationDurationSeconds * 1000),
        })),
    [accountKey, continuationJobs, drama.id],
  );
  const generatedNodes = useMemo(
    () =>
      ownJobs
        .map((job) => ({
          ...job,
          parentId: job.parentNodeId,
          title: deriveGeneratedTitle(job.prompt, job.kind === "rewrite" ? "Rewrite" : "Continuation"),
          author: "You",
          authorAvatar: "/images/home/login.png",
          duration: "1:09",
          views: "New",
          videoUrl: now >= job.readyAt ? "/videos/feed/feed-02.mp4" : "",
          pending: now < job.readyAt,
          owned: true,
        })),
    [now, ownJobs],
  );
  const allNodes = useMemo(() => [...baseNodes, ...generatedNodes], [baseNodes, generatedNodes]);
  const nodeById = useMemo(() => Object.fromEntries(allNodes.map((node) => [node.id, node])), [allNodes]);
  const indexById = useMemo(() => Object.fromEntries(allNodes.map((node, idx) => [node.id, idx])), [allNodes]);
  const childrenByParentId = useMemo(() => {
    const map = {};
    allNodes.forEach((node) => {
      const key = node.parentId || "";
      const list = map[key] || [];
      list.push(node);
      map[key] = list;
    });
    return map;
  }, [allNodes]);
  const depthById = useMemo(() => {
    const memo = {};
    const visit = (nodeId) => {
      if (memo[nodeId]) return memo[nodeId];
      const children = childrenByParentId[nodeId] || [];
      const bestChildDepth = children.reduce((best, node) => Math.max(best, visit(node.id)), 0);
      memo[nodeId] = 1 + bestChildDepth;
      return memo[nodeId];
    };
    Object.keys(nodeById).forEach((nodeId) => visit(nodeId));
    return memo;
  }, [childrenByParentId, nodeById]);
  const rootNode = useMemo(
    () =>
      allNodes.find((node) => node.official && node.episode === 1 && !node.parentId) ||
      allNodes.find((node) => node.episode === 1 && !node.parentId) ||
      allNodes[0],
    [allNodes],
  );
  const globalLongestPath = useMemo(() => {
    if (!rootNode) return [];
    const sortByDepth = (left, right) => {
      const delta = (depthById[right.id] || 1) - (depthById[left.id] || 1);
      if (delta) return delta;
      return (indexById[left.id] || 0) - (indexById[right.id] || 0);
    };
    const next = [];
    let cursor = rootNode.id;
    while (cursor) {
      next.push(cursor);
      const children = (childrenByParentId[cursor] || []).slice().sort(sortByDepth);
      if (!children.length) break;
      cursor = children[0].id;
    }
    return next;
  }, [childrenByParentId, depthById, indexById, rootNode]);
  const requestedEpisode = useMemo(() => {
    const raw = Number(searchParams.get("episode"));
    return Number.isFinite(raw) ? Math.max(1, Math.floor(raw)) : 1;
  }, [searchParams]);
  const currentNode = nodeById[currentNodeId] || rootNode || allNodes[0];
  const currentUnlocked = true;
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const showPlayerControls = currentUnlocked && !waitingForBranchChoice && (playerHovered || speedMenuOpen);
  const currentPathIndex = path.findIndex((nodeId) => nodeId === currentNodeId);
  const currentPendingProgress = useMemo(() => {
    if (!currentNode?.pending) return 0;
    const job = ownJobs.find((item) => item.id === currentNodeId);
    if (!job) return 12;
    const seconds = Math.max(1, Math.ceil((job.readyAt - now) / 1000));
    return Math.min(96, Math.max(6, 100 - (seconds / generationDurationSeconds) * 100));
  }, [currentNode?.pending, currentNodeId, now, ownJobs]);

  const togglePlay = () => {
    if (!currentUnlocked) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const handleVideoLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    video.playbackRate = playbackRate;
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime || 0);
    setDuration(video.duration || 0);
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(event.target.value) || 0;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    setPlaybackRate(rate);
    if (video) video.playbackRate = rate;
    setSpeedMenuOpen(false);
  };

  const openCreateComposer = ({ mode, episode, parentNodeId }) => {
    if (!parentNodeId) return;
    setCreateMode(mode === "rewrite" ? "rewrite" : "continue");
    setCreateEpisode(Math.max(2, Number(episode) || 2));
    setCreateParentNodeId(parentNodeId);
    setPrompt("");
    setCreateOpen(true);
  };

  const advanceToNextEpisode = () => {
    const nextNodeId = currentPathIndex >= 0 ? path[currentPathIndex + 1] : "";
    const nextNode = nextNodeId ? nodeById[nextNodeId] : null;
    if (!nextNode) {
      setWaitingForBranchChoice(false);
      setIsPlaying(false);
      setCurrentTime(duration || 0);
      openCreateComposer({
        mode: "continue",
        episode: currentNode?.episode + 1,
        parentNodeId: currentNode?.id,
      });
      return;
    }
    allowAutoplayRef.current = false;
    setWaitingForBranchChoice(true);
    setIsPlaying(false);
    setCurrentNodeId(nextNode.id);
    setActiveEpisode(nextNode.episode);
  };

  useEffect(() => {
    if (!globalLongestPath.length) return;
    if (initializedDramaRef.current === drama.id) return;
    initializedDramaRef.current = drama.id;
    const initialEpisode = Math.min(Math.max(1, requestedEpisode), globalLongestPath.length);
    const initialNodeId = globalLongestPath[initialEpisode - 1] || globalLongestPath[0];
    const initialParentNodeId = initialEpisode <= 1 ? "" : globalLongestPath[initialEpisode - 2] || "";
    const initialChoices =
      initialEpisode <= 1
        ? [nodeById[globalLongestPath[0]]].filter(Boolean)
        : (childrenByParentId[initialParentNodeId] || []).filter((node) => node.episode === initialEpisode && !node.pending);
    const shouldWaitForChoice = initialEpisode > 1 && initialChoices.length > 1;
    allowAutoplayRef.current = !shouldWaitForChoice;
    setPath(globalLongestPath);
    setCurrentNodeId(initialNodeId);
    setActiveEpisode(initialEpisode);
    setWaitingForBranchChoice(shouldWaitForChoice);
    setIsPlaying(false);
    setCreateOpen(false);
  }, [childrenByParentId, drama.id, globalLongestPath, nodeById, requestedEpisode]);

  useEffect(() => {
    if (!path.length) return;
    if (activeEpisode > path.length) setActiveEpisode(path.length);
  }, [activeEpisode, path.length]);

  useEffect(() => {
    if (!currentUnlocked) return;
    if (currentNode?.pending) return;
    if (!currentNode?.videoUrl) return;
    if (waitingForBranchChoice) return;
    if (!allowAutoplayRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
    const tryPlay = () => {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    };
    const frame = window.requestAnimationFrame(tryPlay);
    return () => window.cancelAnimationFrame(frame);
  }, [currentNode?.pending, currentNode?.videoUrl, currentNodeId, currentUnlocked, playbackRate, waitingForBranchChoice]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setSpeedMenuOpen(false);
  }, [currentNode.id]);

  const buildLongestPathFrom = (startNodeId) => {
    const sortByDepth = (left, right) => {
      const delta = (depthById[right.id] || 1) - (depthById[left.id] || 1);
      if (delta) return delta;
      return (indexById[left.id] || 0) - (indexById[right.id] || 0);
    };
    const next = [];
    let cursor = startNodeId;
    while (cursor) {
      next.push(cursor);
      const children = (childrenByParentId[cursor] || []).slice().sort(sortByDepth);
      if (!children.length) break;
      cursor = children[0].id;
    }
    return next;
  };

  const onSelectTheme = (node) => {
    allowAutoplayRef.current = true;
    setWaitingForBranchChoice(false);
    if (node.id === currentNodeId && node.videoUrl && !node.pending) {
      const video = videoRef.current;
      if (video) {
        video.playbackRate = playbackRate;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      setActiveEpisode(node.episode);
      setCreateOpen(false);
      return;
    }
    const prefix = path.slice(0, Math.max(0, node.episode - 1));
    const tail = buildLongestPathFrom(node.id);
    setPath([...prefix, ...tail]);
    setCurrentNodeId(node.id);
    setActiveEpisode(node.episode);
    setCreateOpen(false);
  };

  const onSelectEpisode = (episode) => {
    const nodeId = path[episode - 1];
    const node = nodeById[nodeId];
    if (!node) return;
    allowAutoplayRef.current = false;
    setWaitingForBranchChoice(true);
    setIsPlaying(false);
    setActiveEpisode(episode);
    setCurrentNodeId(node.id);
    setCreateOpen(false);
  };

  const activeParentNodeId = activeEpisode <= 1 ? "" : path[activeEpisode - 2] || "";
  const activeSelectedThemeId = path[activeEpisode - 1] || rootNode?.id;
  const activeThemes = useMemo(() => {
    if (!rootNode) return [];
    if (activeEpisode === 1) return [rootNode];
    const candidates = (childrenByParentId[activeParentNodeId] || []).filter(
      (node) => node.episode === activeEpisode && !node.pending,
    );
    const sortByDepth = (left, right) => {
      const delta = (depthById[right.id] || 1) - (depthById[left.id] || 1);
      if (delta) return delta;
      return (indexById[left.id] || 0) - (indexById[right.id] || 0);
    };
    return candidates.slice().sort(sortByDepth);
  }, [activeEpisode, activeParentNodeId, childrenByParentId, depthById, indexById, rootNode]);
  const activePendingJobs = useMemo(() => {
    if (activeEpisode <= 1) return [];
    return ownJobs.filter((job) => job.episode === activeEpisode && job.parentNodeId === activeParentNodeId && now < job.readyAt);
  }, [activeEpisode, activeParentNodeId, now, ownJobs]);
  const formatEpisodeLabel = (episode) => `Ep. ${episode}`;
  const createTitle = createMode === "rewrite" ? `Rewrite ${formatEpisodeLabel(createEpisode)}` : `Continue into ${formatEpisodeLabel(createEpisode)}`;
  const createDescription =
    createMode === "rewrite"
      ? "You are rewriting this episode. The recap shows everything that happened before it."
      : "You are continuing the story. The recap shows everything that has happened up to this point.";
  const createRecapNodes = useMemo(
    () =>
      path
        .slice(0, Math.max(0, createEpisode - 1))
        .map((nodeId, index) => ({ episode: index + 1, node: nodeById[nodeId] }))
        .filter((item) => item.node),
    [createEpisode, nodeById, path],
  );
  const createRecapText = useMemo(() => {
    if (!createRecapNodes.length) return "This is the beginning of the story.";
    return createRecapNodes
      .map(({ episode, node }) => `${formatEpisodeLabel(episode)}: ${node.prompt}`)
      .join(" ");
  }, [createRecapNodes]);
  const saved = useMemo(() => (Array.isArray(favoriteShorts) ? favoriteShorts.includes(drama.id) : false), [drama.id, favoriteShorts]);
  const liked = useMemo(() => (Array.isArray(likedShorts) ? likedShorts.includes(drama.id) : false), [drama.id, likedShorts]);
  const displayFavoriteCount = Math.max(0, Number(drama.favoriteCount) || 0) + (saved ? 1 : 0);
  const displayLikeCount = Math.max(0, Number(drama.likeCount) || 0) + (liked ? 1 : 0);
  const promptPlaceholder =
    createMode === "rewrite"
      ? "Example: Rewrite this episode so the conflict arrives earlier. The stranger appears before Lin can leave the platform, forcing him to choose between following the warning voice or confronting the person from his memory. End the episode with a stronger emotional cliffhanger."
      : "Example: Continue the story by turning the next episode into a direct confrontation. Lin follows the clue into a quieter part of the station, discovers who has been watching him, and learns one truth that changes how he understands everything from the earlier episodes.";

  const openRewrite = () => {
    if (activeEpisode <= 1) return;
    const parentNodeId = path[activeEpisode - 2];
    openCreateComposer({
      mode: "rewrite",
      episode: activeEpisode,
      parentNodeId,
    });
  };

  const openContinue = () => {
    const parentNodeId = path[activeEpisode - 1];
    openCreateComposer({
      mode: "continue",
      episode: activeEpisode + 1,
      parentNodeId,
    });
  };

  const submitCreate = () => {
    const result = createShortContinuation({
      dramaId: drama.id,
      parentNodeId: createParentNodeId,
      episode: createEpisode,
      prompt,
      isPublic: true,
      cost: generationCost,
      kind: createMode,
    });
    if (!result.ok) {
      if (result.reason === "diamonds") {
        openDiamondUpsell({
          title: "Not enough diamonds",
          description:
            createMode === "rewrite"
              ? "Rewrite this short drama branch by subscribing or buying a diamond pack in this modal."
              : "Continue this short drama by subscribing or buying a diamond pack in this modal.",
          cost: generationCost,
          source: `shorts-${createMode}`,
        });
      } else {
        setToast("Add a prompt first.");
      }
      return;
    }
    const job = result.job;
    if (job?.id) {
      if (createMode === "rewrite") {
        const prefix = path.slice(0, Math.max(0, job.episode - 1));
        setPath([...prefix, job.id]);
        setActiveEpisode(job.episode);
        setCurrentNodeId(job.id);
      } else {
        const prefix = path.slice(0, Math.max(0, job.episode - 1));
        setPath([...prefix, job.id]);
        setActiveEpisode(job.episode);
        setCurrentNodeId(job.id);
      }
    }
    setPrompt("");
    setCreateOpen(false);
    setToast("Generation started. You can leave this page safely.");
  };

  const onStartOver = () => {
    if (!globalLongestPath.length) return;
    allowAutoplayRef.current = true;
    setPath(globalLongestPath);
    setCurrentNodeId(globalLongestPath[0]);
    setActiveEpisode(1);
    setWaitingForBranchChoice(false);
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] pb-12">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <Link to="/shorts" className="transition hover:text-zinc-900">
          All shorts
        </Link>
        <ChevronRight className="h-4 w-4 text-zinc-300" />
        <Link to={`/shorts/${drama.id}/about`} className="transition hover:text-zinc-900">
          {drama.title}
        </Link>
        <ChevronRight className="h-4 w-4 text-zinc-300" />
        <span className="font-medium text-zinc-900">Watch</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(380px,0.88fr)_minmax(520px,1.12fr)]">
        <section className="min-w-0">
          <div
            className="relative mx-auto aspect-[9/16] w-full max-w-[430px] overflow-hidden rounded-[32px] bg-zinc-950 shadow-[0_28px_70px_-28px_rgba(0,0,0,0.55)]"
            onMouseEnter={() => setPlayerHovered(true)}
            onMouseLeave={() => {
              setPlayerHovered(false);
              setSpeedMenuOpen(false);
            }}
          >
            {currentUnlocked && currentNode?.pending ? (
              <div className="relative flex h-full w-full items-center justify-center bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),rgba(0,0,0,0.82))]" />
                <div className="relative w-full max-w-xs px-7 text-center text-white">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                    <WandSparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="mt-4 text-base font-semibold">Generating {formatEpisodeLabel(currentNode.episode)}</div>
                </div>
              </div>
            ) : waitingForBranchChoice ? (
              <div className="relative flex h-full w-full items-center justify-center bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),rgba(0,0,0,0.84))]" />
                <div className="relative w-full max-w-md px-5 text-white">
                  <div className="text-center">
                    <div className="text-base font-semibold">Choose a branch for {formatEpisodeLabel(currentNode.episode)}</div>
                    <div className="mt-2 text-sm leading-6 text-white/70">Pick one card to start the next episode.</div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {activeThemes.map((node) => {
                      const selected = node.id === activeSelectedThemeId;
                      const showCardMeta = !(node.official && node.episode === 1);
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => onSelectTheme(node)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition",
                            selected ? "border-white/40 bg-white/16" : "border-white/10 bg-white/8 hover:bg-white/12",
                          )}
                        >
                          <div className="h-16 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                            <video src={node.videoUrl} muted preload="metadata" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white">{node.title}</div>
                            <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">{node.prompt}</div>
                            {showCardMeta ? (
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-white/60">
                                <span>By {node.author || "Heartbits Studio"}</span>
                                <span>{node.views || "New"} views</span>
                              </div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <video
                key={`${currentNode.id}-${currentNode.videoUrl}`}
                ref={videoRef}
                src={currentNode.videoUrl}
                autoPlay={currentUnlocked}
                muted
                playsInline
                className={cn("h-full w-full object-cover", currentUnlocked && "cursor-pointer", !currentUnlocked && "scale-105 blur-xl")}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={advanceToNextEpisode}
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleVideoTimeUpdate}
                onClick={togglePlay}
              />
            )}
            {currentUnlocked && !isPlaying && !waitingForBranchChoice ? (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play"
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-black/55"
              >
                <Play className="ml-1 h-7 w-7 fill-current" />
              </button>
            ) : null}
            {currentUnlocked ? (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(duration, 0)}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={handleSeek}
                    className={cn(
                      "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white transition",
                      showPlayerControls ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                    )}
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) ${progressPercent}%, rgba(255,255,255,0.22) ${progressPercent}%, rgba(255,255,255,0.22) 100%)`,
                    }}
                  />
                  <div
                    className={cn(
                      "mt-3 flex items-center justify-between gap-3 text-xs text-white transition",
                      showPlayerControls ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                    )}
                  >
                    <div className="rounded-full bg-black/35 px-3 py-1.5 font-medium backdrop-blur-md">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSpeedMenuOpen((open) => !open)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 font-medium text-white backdrop-blur-md hover:bg-black/45"
                      >
                        {playbackRate}x <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {speedMenuOpen ? (
                        <div className="absolute bottom-full right-0 mb-2 flex min-w-[168px] flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/65 p-2 shadow-xl backdrop-blur-md">
                          {playbackRateOptions.map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => handlePlaybackRateChange(rate)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                                playbackRate === rate ? "bg-white text-zinc-950" : "bg-white/10 text-white hover:bg-white/20",
                              )}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

        </section>

        <section className="min-w-0">
          <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{drama.title}</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">{drama.description}</p>
              </div>
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
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-950">Story line</h2>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[26px] border border-zinc-200 bg-white">
                <div className="flex items-center gap-2 overflow-x-auto px-4 py-3">
                  {path.map((nodeId, index) => {
                    const node = nodeById[nodeId];
                    if (!node) return null;
                    const episode = index + 1;
                    const active = episode === activeEpisode;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => onSelectEpisode(episode)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition",
                          active ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
                        )}
                      >
                        {formatEpisodeLabel(episode)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-950">{formatEpisodeLabel(activeEpisode)}</div>
                  <div className="mt-1 text-sm text-zinc-500">{activeThemes.length} themes</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeEpisode === 1 ? (
                    <button
                      type="button"
                      onClick={openContinue}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                      Continue {formatEpisodeLabel(2)}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={openRewrite}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                      >
                        Rewrite {formatEpisodeLabel(activeEpisode)}
                      </button>
                      <button
                        type="button"
                        onClick={openContinue}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                      >
                        Continue {formatEpisodeLabel(activeEpisode + 1)}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {activePendingJobs.map((job) => {
                  const seconds = Math.max(1, Math.ceil((job.readyAt - now) / 1000));
                  const progress = Math.min(96, Math.max(6, 100 - (seconds / generationDurationSeconds) * 100));
                  return (
                    <div key={job.id} className="overflow-hidden rounded-[24px] border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <WandSparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-zinc-950">Generating {formatEpisodeLabel(job.episode)}</div>
                          </div>
                          <p className="mt-1 truncate text-xs text-zinc-600">{job.prompt}</p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
                        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}

                {activeThemes.map((node) => {
                  const selected = node.id === activeSelectedThemeId;
                  const showCardMeta = !(node.official && node.episode === 1);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => onSelectTheme(node)}
                      className={cn(
                        "group flex w-full items-center gap-4 rounded-[24px] border p-3 text-left transition hover:bg-zinc-50",
                        selected ? "border-zinc-950 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300",
                      )}
                    >
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
                        <video src={node.videoUrl} muted preload="metadata" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {node.official ? (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">Official</span>
                          ) : null}
                        </div>
                        <h3 className="mt-1 truncate text-sm font-semibold text-zinc-950">{node.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{node.prompt}</p>
                        {showCardMeta ? (
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-500">
                            <span>By {node.author || "Heartbits Studio"}</span>
                            <span>{node.views || "New"} views</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0">
                        {node.owned ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Created by you</span>
                        ) : (
                          selected ? null : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600">
                            Watch <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                          )
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div> : null}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={createTitle}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-600">{createDescription}</p>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-sm font-semibold text-zinc-950">Story so far</div>
              <div className="mt-3 text-sm leading-7 text-zinc-600">{createRecapText}</div>
            </div>

            <div className="min-w-0 rounded-[28px] border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-zinc-950">Your idea</div>
                <div className="text-xs text-zinc-500">{prompt.length}/{promptMaxLength}</div>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value.slice(0, promptMaxLength))}
                placeholder={promptPlaceholder}
                className="mt-3 min-h-[260px] w-full resize-none rounded-[24px] border border-zinc-200 bg-zinc-50 p-5 text-sm leading-7 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!prompt.trim() || !createParentNodeId}
              onClick={submitCreate}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate <DiamondIcon className="h-4 w-4" /> {generationCost}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
