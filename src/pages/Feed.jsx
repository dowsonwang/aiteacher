import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Lock, Play } from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import OnboardingTour from "../components/OnboardingTour.jsx";
import { shortDramas } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const formatTimeAgo = (ts) => {
  const diff = Math.max(0, Date.now() - ts);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const makeDefaultAvatar = (seed) =>
  `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `Minimal profile avatar, neutral background, realistic, no text, seed ${seed}`,
  )}&image_size=square`;

export default function Feed() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const diamonds = useAppStore((s) => s.diamonds);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const openAuth = useUIStore((s) => s.openAuth);
  const openDiamondUpsell = useUIStore((s) => s.openDiamondUpsell);
  const openShare = useUIStore((s) => s.openShare);
  const closeShare = useUIStore((s) => s.closeShare);
  const unlockedFeedVideos = useAppStore((s) => s.unlockedFeedVideos);
  const unlockFeedVideo = useAppStore((s) => s.unlockFeedVideo);

  const characters = getAllCharacters();
  const baseCharacters = useMemo(() => characters.slice(0, 4), [characters]);

  const assetVersion = useMemo(() => Date.now().toString(), []);
  const items = useMemo(() => {
    const safeCharId = (i) => baseCharacters[i]?.id;
    return [
      {
        id: "feed-01",
        videoSrc: `/videos/feed/feed-01.mp4?v=${assetVersion}`,
        username: "@aurora",
        caption: "Pronunciation warm-up: shadow this sentence and copy the rhythm.",
        tags: ["#english", "#speaking"],
        characterId: safeCharId(0),
        hasShorts: false,
        shortId: null,
        likeCount: 12400,
        shareCount: 210,
      },
      {
        id: "feed-02",
        videoSrc: `/videos/feed/feed-02.mp4?v=${assetVersion}`,
        requiresUnlock: true,
        unlockCost: 5,
        username: "@nox",
        caption: "Learn 5 travel phrases you can use today—then practice with me.",
        tags: ["#english", "#travel"],
        characterId: safeCharId(1),
        hasShorts: true,
        shortId: "s2",
        likeCount: 8300,
        shareCount: 128,
      },
      {
        id: "feed-03",
        videoSrc: `/videos/feed/feed-03.mp4?v=${assetVersion}`,
        username: "@mika",
        caption: "Mini grammar fix: present perfect vs past simple in one minute.",
        tags: ["#english", "#grammar"],
        characterId: safeCharId(2),
        hasShorts: true,
        shortId: "s3",
        likeCount: 15600,
        shareCount: 342,
      },
      {
        id: "feed-04",
        videoSrc: `/videos/feed/feed-04.mp4?v=${assetVersion}`,
        username: "@echo",
        caption: "Listening drill: can you catch the key word in this short line?",
        tags: ["#english", "#listening"],
        characterId: safeCharId(3),
        hasShorts: false,
        shortId: null,
        likeCount: 4200,
        shareCount: 66,
      },
    ].filter((x) => x.characterId);
  }, [assetVersion, baseCharacters]);

  const [index, setIndex] = useState(0);
  const wheelLock = useRef(false);
  const wheelDelta = useRef(0);
  const [videoVisible, setVideoVisible] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const mainVideoWrapRef = useRef(null);
  const clipListWrapRef = useRef(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
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

  useEffect(() => {
    const canShow = typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)")?.matches;
    if (!canShow) return;
    const raf = requestAnimationFrame(() => setTourOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const [activeTab, setActiveTab] = useState("character");
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);

  const active = items[index] || items[0];
  const character = characters.find((c) => c.id === active?.characterId);
  const characterShorts = useMemo(() => {
    if (!character?.id) return [];
    return shortDramas.filter((d) => d.characterId === character.id);
  }, [character?.id]);
  const isVideoLocked = Boolean(active?.requiresUnlock) && !Boolean(unlockedFeedVideos?.[active?.id]);
  const clips = useMemo(() => {
    const activeId = active?.id || "feed";
    return Array.from({ length: 8 }).map((_, i) => {
      const n = (i % 4) + 1;
      return {
        id: `${activeId}-clip-${String(i + 1).padStart(2, "0")}`,
        videoSrc: `/videos/feed/feed-0${n}.mp4?v=${assetVersion}`,
        coverUrl: `/images/home/shorts-cover${n}.png?v=${assetVersion}`,
        index: i + 1,
        free: i === 0,
      };
    });
  }, [active?.id, assetVersion]);
  const selectedClip = useMemo(() => clips.find((c) => c.id === selectedClipId) || null, [clips, selectedClipId]);
  const isMainLocked = selectedClip ? !(selectedClip.free || Boolean(unlockedFeedVideos?.[selectedClip.id])) : isVideoLocked;
  const mainVideoSrc = selectedClip ? selectedClip.videoSrc : active?.videoSrc;
  const mainVideoKey = selectedClip ? selectedClip.id : active?.id;
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = window.location?.origin || "";
    return `${base}/feed?item=${active?.id || ""}&clip=01`;
  }, [active?.id]);

  const next = () =>
    setIndex((v) => {
      if (!items.length) return v;
      return (v + 1) % items.length;
    });
  const prev = () =>
    setIndex((v) => {
      if (!items.length) return v;
      return (v - 1 + items.length) % items.length;
    });

  useEffect(() => {
    if (!items.length) return;
    setIndex((v) => Math.min(v, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    closeShare();
    const activeId = active?.id || "feed";
    setSelectedClipId(`${activeId}-clip-01`);
  }, [active?.id, closeShare]);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const commentsWrapRef = useRef(null);
  const pendingCommentRef = useRef(null);

  const [commentInput, setCommentInput] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [commentsByCharacter, setCommentsByCharacter] = useState(() => ({
    c1: [
      {
        id: "c-01",
        user: { name: "Sienna", avatar: makeDefaultAvatar("sienna") },
        createdAt: Date.now() - 3600 * 1000 * 6,
        text: "Great pacing. Could you correct my stress on 'comfortable'?",
        likes: 14,
      },
    ],
    c2: [
      {
        id: "c-02",
        user: { name: "Aria", avatar: makeDefaultAvatar("aria") },
        createdAt: Date.now() - 3600 * 1000 * 20,
        text: "These travel phrases are so useful. Can we role-play a hotel check-in?",
        likes: 29,
      },
    ],
    c3: [
      {
        id: "c-03",
        user: { name: "Ethan", avatar: makeDefaultAvatar("ethan") },
        createdAt: Date.now() - 60000 * 55,
        text: "Finally understood present perfect. More examples please!",
        likes: 8,
      },
    ],
    c4: [
      {
        id: "c-04",
        user: { name: "Mason", avatar: makeDefaultAvatar("mason") },
        createdAt: Date.now() - 60000 * 8,
        text: "Listening tip: should I focus on keywords or every word?",
        likes: 4,
      },
    ],
  }));

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowDown") next();
      if (e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length]);

  const onVideoWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wheelLock.current) return;

    wheelDelta.current += e.deltaY;
    const threshold = 80;
    if (Math.abs(wheelDelta.current) < threshold) return;

    wheelLock.current = true;
    window.setTimeout(() => {
      wheelLock.current = false;
      wheelDelta.current = 0;
    }, 650);

    if (wheelDelta.current > 0) next();
    else prev();
  };

  useEffect(() => {
    setActiveTab("character");
    setLiked(false);
    setFollowed(false);
    setIsPlaying(true);
    setVideoVisible(false);
    window.setTimeout(() => setVideoVisible(true), 20);
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
  }, [active?.id]);

  useEffect(() => {
    if (!selectedClipId) return;
    setIsPlaying(!isMainLocked);
    setVideoVisible(false);
    window.setTimeout(() => setVideoVisible(true), 20);
    const el = videoRef.current;
    if (!el || isMainLocked) return;
    el.currentTime = 0;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
  }, [selectedClipId, isMainLocked]);

  useEffect(() => {
    if (isMainLocked) {
      setIsPlaying(false);
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
    setIsPlaying(true);
  }, [isMainLocked]);

  useEffect(() => {
    if (!session.isLoggedIn) return;
    if (!pendingCommentRef.current) return;
    const { characterId, text } = pendingCommentRef.current;
    pendingCommentRef.current = null;
    setCommentsByCharacter((prevMap) => {
      const nextMap = { ...prevMap };
      const nextList = [...(nextMap[characterId] || [])];
      nextList.unshift({
        id: `c-u-${Date.now().toString(36)}`,
        user: { name: session.displayName || "You", avatar: session.avatarUrl || makeDefaultAvatar("you") },
        createdAt: Date.now(),
        text,
        likes: 0,
      });
      nextMap[characterId] = nextList;
      return nextMap;
    });
  }, [session.displayName, session.avatarUrl, session.isLoggedIn]);

  const togglePlay = async () => {
    if (isMainLocked) return;
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      const p = el.play();
      if (p?.catch) p.catch(() => {});
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const startChat = () => {
    if (!character) return;
    const conversationId = openConversationForCharacter(character.id);
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/chat/${conversationId}` });
      return;
    }
    navigate(`/chat/${conversationId}`);
  };

  const sendComment = () => {
    const text = commentInput.trim();
    if (!text || !character?.id) return;
    setCommentInput("");
    if (!session.isLoggedIn) {
      pendingCommentRef.current = { characterId: character.id, text };
      openAuth({ mode: "login" });
      return;
    }
    setCommentsByCharacter((prevMap) => {
      const nextMap = { ...prevMap };
      const nextList = [...(nextMap[character.id] || [])];
      nextList.unshift({
        id: `c-u-${Date.now().toString(36)}`,
        user: { name: session.displayName || "You", avatar: session.avatarUrl || makeDefaultAvatar("you") },
        createdAt: Date.now(),
        text,
        likes: 0,
      });
      nextMap[character.id] = nextList;
      return nextMap;
    });
  };

  const toggleCommentLike = (commentId) => {
    setCommentLikes((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (!active || !character) return null;

  const comments = commentsByCharacter[character.id] || [];
  const tourSteps = [
    {
      key: "feed-main-video",
      target: mainVideoWrapRef.current,
      title: "浏览更多视频",
      body: "在主视频区域上下滑动，可切换查看更多精彩内容。",
    },
    {
      key: "feed-clip-list",
      target: clipListWrapRef.current,
      title: "解锁更多内容",
      body: "右侧为该人物的视频列表。点击锁定视频可消耗 5 💎 解锁，观看更多精彩视频。",
    },
  ];

  return (
    <div className="-mx-6 -my-6 h-[calc(100dvh-56px-48px)] bg-zinc-950 text-white">
      <OnboardingTour
        open={tourOpen}
        step={tourStep}
        steps={tourSteps}
        onClose={() => setTourOpen(false)}
        onNext={() => {
          const isLast = tourStep >= tourSteps.length - 1;
          if (isLast) {
            setTourOpen(false);
            return;
          }
          setTourStep((v) => v + 1);
        }}
      />

      <div className="h-full min-h-0 grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="relative h-full min-h-0">
          <div className="flex h-full min-h-0 items-stretch justify-center gap-4 px-6 py-6">
            <div
              ref={mainVideoWrapRef}
              onWheel={onVideoWheel}
              onClick={() => togglePlay()}
              className={
                videoVisible
                  ? "group relative h-full w-auto max-w-[520px] aspect-[9/16] overflow-hidden rounded-3xl bg-black opacity-100 transition-opacity duration-300"
                  : "group relative h-full w-auto max-w-[520px] aspect-[9/16] overflow-hidden rounded-3xl bg-black opacity-0 transition-opacity duration-300"
              }
            >
              {!isMainLocked ? (
                <video
                  key={mainVideoKey}
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={mainVideoSrc}
                  playsInline
                  muted
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

              {!isMainLocked && !isPlaying ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur">
                    <Play className="h-8 w-8 translate-x-[1px]" fill="currentColor" />
                  </div>
                </div>
              ) : null}

              <div className="absolute bottom-5 right-4 space-y-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiked((v) => !v);
                  }}
                  className="flex flex-col items-center gap-1 text-white/90"
                >
                  <span
                    className={
                      liked
                        ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/55 text-red-500 backdrop-blur"
                        : "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/55 backdrop-blur"
                    }
                  >
                    <Heart className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold">{(active.likeCount + (liked ? 1 : 0)).toLocaleString()}</span>
                </button>
              </div>

              {isMainLocked ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-xl">
                  <div className="mx-6 w-full max-w-[340px] rounded-3xl border border-white/20 bg-black/35 px-5 py-5 text-center text-white shadow-2xl">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                      <Lock className="h-4 w-4" />
                      <span>Unlock required</span>
                    </div>
                    <div className="mt-2 text-xs text-white/80">
                      This clip is locked. Unlock to watch for{" "}
                      <span className="inline-flex items-center gap-1 font-semibold text-white">
                        <DiamondIcon className="h-4 w-4" />
                        <span>{active.unlockCost || 5}</span>
                      </span>
                      .
                    </div>
                    <div className="mt-1 text-xs text-white/70">Unlocked clips are saved on this device.</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const r = unlockFeedVideo({ feedId: active.id, cost: active.unlockCost || 5 });
                        if (!r.ok) {
                          if (r.reason === "diamonds") {
                            openDiamondUpsell({
                              title: "Not enough diamonds",
                              description: "Unlock this Discover video by subscribing or buying a diamond pack in this modal.",
                              cost: active.unlockCost || 5,
                              source: "discover-main-video",
                            });
                          } else {
                            showToast("error", "Unable to unlock this video.");
                          }
                          return;
                        }
                        showToast("success", "Unlocked.");
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                    >
                      <span>Unlock</span>
                      <span className="inline-flex items-center gap-1">
                        <DiamondIcon className="h-4 w-4" />
                        <span>{active.unlockCost || 5}</span>
                      </span>
                    </button>
                    <div className="mt-3 text-xs text-white/70">
                      Balance:{" "}
                      <span className="inline-flex items-center gap-1 font-semibold text-white">
                        <DiamondIcon className="h-4 w-4" />
                        <span>{diamonds.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div ref={clipListWrapRef} className="hidden h-full w-[156px] overflow-hidden lg:block">
              <div className="h-full min-h-0 overflow-auto pr-1">
                <div className="space-y-3">
                  {clips.map((clip) => {
                    const unlocked = Boolean(clip.free) || Boolean(unlockedFeedVideos?.[clip.id]);
                    const selected = selectedClipId === clip.id;
                    return (
                      <button
                        key={clip.id}
                        type="button"
                        onClick={() => {
                          if (!unlocked && !clip.free) {
                            const r = unlockFeedVideo({ feedId: clip.id, cost: 5 });
                            if (!r.ok) {
                              if (r.reason === "diamonds") {
                                openDiamondUpsell({
                                  title: "Not enough diamonds",
                                  description: "Unlock this Discover clip by subscribing or buying a diamond pack in this modal.",
                                  cost: 5,
                                  source: "discover-clip",
                                });
                              } else {
                                showToast("error", "Unable to unlock this clip.");
                              }
                              return;
                            }
                            showToast("success", r.alreadyUnlocked ? "Unlocked." : "Unlocked (-5 💎).");
                          }
                          setSelectedClipId(clip.id);
                        }}
                        className="group block w-full text-left"
                        aria-label={`Preview ${clip.index}`}
                      >
                        <div
                          className={
                            selected
                              ? "relative w-full overflow-hidden rounded-2xl border border-white/35 bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.15)]"
                              : "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black hover:border-white/20"
                          }
                          style={{ aspectRatio: "9 / 16" }}
                        >
                          <img
                            src={clip.coverUrl}
                            alt=""
                            className={unlocked ? "h-full w-full object-cover opacity-100 transition" : "h-full w-full object-cover opacity-70 transition"}
                            onError={(e) => {
                              e.currentTarget.src = `/images/home/shorts-cover.png?v=${assetVersion}`;
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          {!unlocked ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
                              <div className="rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white">
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>Unlock</span>
                                </div>
                                <div className="mt-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-white/90">
                                  <DiamondIcon className="h-3.5 w-3.5" />
                                  <span>5</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
                              {selected ? "Playing" : clip.free ? "Free" : "Unlocked"}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-full min-h-0 bg-zinc-950">
          <div className="flex h-full min-h-0 flex-col px-4 py-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className="relative h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <div className="truncate text-lg font-semibold text-white">{character.name}</div>
                        <div className="text-xs text-white/60">{character.age ? `${character.age}` : ""}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFollowed((v) => !v)}
                      className={
                        followed
                          ? "h-9 flex-shrink-0 rounded-2xl bg-white/15 px-4 text-xs font-semibold text-white hover:bg-white/20"
                          : "h-9 flex-shrink-0 rounded-2xl bg-white px-4 text-xs font-semibold text-zinc-900 hover:bg-white/90"
                      }
                    >
                      {followed ? "Following" : "Follow"}
                    </button>
                  </div>
                  <div className="mt-2 line-clamp-3 text-sm text-white/75">{character.bio}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("character")}
                  className={
                    activeTab === "character"
                      ? "relative px-1 pb-2 text-sm font-semibold text-white"
                      : "px-1 pb-2 text-sm font-semibold text-white/60 hover:text-white/85"
                  }
                >
                  Character
                  {activeTab === "character" ? <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white" /> : null}
                </button>
                {characterShorts.length ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("shorts")}
                    className={
                      activeTab === "shorts"
                        ? "relative px-1 pb-2 text-sm font-semibold text-white"
                        : "px-1 pb-2 text-sm font-semibold text-white/60 hover:text-white/85"
                    }
                  >
                    Shorts
                    {activeTab === "shorts" ? <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white" /> : null}
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                {activeTab === "character" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={startChat}
                        className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-white/90"
                      >
                        Start chat
                      </button>
                      <button
                        type="button"
                        onClick={() => openShare({ url: shareUrl, title: "分享" })}
                        className="flex-1 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                    {characterShorts.map((d, i) => {
                      const cover = `/images/home/shorts-cover${(i % 4) + 1}.png?v=${assetVersion}`;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => navigate(`/shorts/${d.id}`)}
                          className="group relative w-40 flex-shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                        >
                          <div className="aspect-[9/16] w-full bg-black">
                            <img
                              src={cover}
                              alt={d.title}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                              onError={(e) => {
                                e.currentTarget.src = `/images/home/shorts-cover.png?v=${assetVersion}`;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
                              {d.episodes} eps
                            </div>
                            <div className="absolute inset-x-0 bottom-0 px-3 py-2">
                              <div className="truncate text-sm font-semibold text-white">{d.title}</div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <div className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900">Play</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div ref={commentsWrapRef} className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold">Comments</div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
                <div className="space-y-5">
                  {comments.map((c) => {
                    const likedByMe = !!commentLikes[c.id];
                    return (
                      <div key={c.id} className="space-y-3">
                        <div className="flex gap-3">
                          <img src={c.user.avatar} alt={c.user.name} className="h-9 w-9 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs text-white/70">
                              <span className="font-semibold text-white">{c.user.name}</span>
                            </div>
                            <div className="mt-1 text-sm text-white/85">{c.text}</div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-white/60">
                              <button
                                type="button"
                                onClick={() => toggleCommentLike(c.id)}
                                className={likedByMe ? "inline-flex items-center gap-1 font-semibold text-red-500" : "inline-flex items-center gap-1 hover:text-white/85"}
                              >
                                <Heart className="h-4 w-4" fill={likedByMe ? "currentColor" : "none"} />
                                <span>{c.likes + (likedByMe ? 1 : 0)}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={session.isLoggedIn ? session.avatarUrl : makeDefaultAvatar("guest")}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment…"
                    className="h-10 flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={sendComment}
                    className="h-10 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-white/90"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
