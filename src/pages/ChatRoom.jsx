import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileUp,
  Flag,
  Gem,
  Image as ImageIcon,
  Heart,
  Play,
  Send,
  Share2,
  Sparkles,
  Video as VideoIcon,
} from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import Modal from "../components/Modal.jsx";
import OnboardingTour from "../components/OnboardingTour.jsx";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";
import { shortDramas } from "../data/mock.js";

const requestImageCost = 40;
const requestVideoCost = 750;

const buildAssistantReply = ({ characterName, userText }) => {
  const text = userText.trim();
  if (!text) {
    return `*${characterName} smiles, waiting for your cue.*\nTell me your English goal for today (speaking, grammar, vocabulary, writing).`;
  }
  if (text.length <= 6) {
    return `*${characterName} nods slowly.*\nNice. Use it in a full English sentence: “${text} …”\n\n*Then send it here and I’ll refine it.*`;
  }
  return `*${characterName} leans in, listening carefully.*\nGot it. I’ll correct your English first, then give a more natural version.\n\n*Reply with your next sentence and I’ll keep it flowing.*`;
};

const splitMixedReply = (raw) => {
  const text = `${raw || ""}`;
  if (!text) return [];
  const out = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m = null;
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index);
    if (before) out.push({ kind: "body", text: before });
    const aside = m[1] || "";
    if (aside) out.push({ kind: "aside", text: aside });
    last = re.lastIndex;
  }
  const rest = text.slice(last);
  if (rest) out.push({ kind: "body", text: rest });
  return out;
};

const pickProfileBlocks = (characterId) => {
  const idx = Math.max(1, Number(`${characterId}`.replace(/\D/g, "")) || 1);
  const countries = ["USA", "Japan", "Korea", "France", "Canada", "Germany", "UK"];
  const personalities = ["Patient", "Clear", "Encouraging", "Direct", "Structured", "Playful"];
  const personalityTagsByIdx = [
    ["Warm", "Supportive", "Playful"],
    ["Calm", "Precise", "Encouraging"],
    ["Direct", "Fast", "Honest"],
    ["Cheeky", "Soft", "Teasing"],
    ["Structured", "Practical", "Clear"],
  ];
  const personality = personalities[idx % personalities.length];
  const personalityTags = personalityTagsByIdx[idx % personalityTagsByIdx.length];

  return [
    { key: "country", label: "Country", value: countries[idx % countries.length], Icon: Flag },
    { key: "personality", label: "Personality", value: personality, tags: personalityTags, Icon: Sparkles },
  ];
};

export default function ChatRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const language = useAppStore((s) => s.language);
  const session = useAppStore((s) => s.session);
  const openAuth = useUIStore((s) => s.openAuth);
  const openShare = useUIStore((s) => s.openShare);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const conversations = useAppStore((s) => s.conversations);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const replyAsAssistant = useAppStore((s) => s.replyAsAssistant);
  const mediaRequests = useAppStore((s) => s.mediaRequests);
  const consumeMediaRequest = useAppStore((s) => s.consumeMediaRequest);
  const getMediaRequestSummary = useAppStore((s) => s.getMediaRequestSummary);
  const favoriteCharacters = useAppStore((s) => s.favoriteCharacters);
  const toggleFavoriteCharacter = useAppStore((s) => s.toggleFavoriteCharacter);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState(null);
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

  const [panelTab, setPanelTab] = useState("profile");

  const characters = getAllCharacters();
  const conversation = useMemo(() => conversations.find((c) => c.id === id), [conversations, id]);
  const character = useMemo(
    () => characters.find((c) => c.id === conversation?.characterId),
    [characters, conversation?.characterId],
  );
  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location?.origin || "" : "";
    return origin ? `${origin}/chat/${conversation?.id || ""}` : `/chat/${conversation?.id || ""}`;
  }, [conversation?.id]);

  const assetVersion = useMemo(() => Date.now().toString(), []);
  const aiImageSrc = useMemo(() => `/images/chat/ai-reply-01.png?v=${assetVersion}`, [assetVersion]);
  const aiImageFallback = useMemo(() => `/images/chat/ai-reply-01.jpg?v=${assetVersion}`, [assetVersion]);
  const aiVideoSrc = useMemo(() => `/images/chat/ai-reply-01.mp4?v=${assetVersion}`, [assetVersion]);
  const aiVideoFallback = useMemo(() => `/videos/chat/ai-reply-01.mp4?v=${assetVersion}`, [assetVersion]);

  const quota = useMemo(() => getMediaRequestSummary({ freeLimit: 3 }), [getMediaRequestSummary, mediaRequests]);
  const [freeExhaustedOpen, setFreeExhaustedOpen] = useState(false);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState(null);
  const messagesRef = useRef(null);
  const requestButtonsRef = useRef(null);
  const hasOpenedTourRef = useRef(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const openMedia = (item) => {
    if (!item) return;
    setMediaItem(item);
    setMediaOpen(true);
  };
  const closeMedia = () => {
    setMediaOpen(false);
    setMediaItem(null);
  };

  const onSend = async ({ text, attachments = [] } = {}) => {
    if (!conversation) return;
    const clean = `${text ?? input}`.trim();
    if (!clean && !attachments.length) return;
    setInput("");
    sendMessage({ conversationId: conversation.id, text: clean, attachments });
    setTyping(true);
    await new Promise((r) => setTimeout(r, 550));
    replyAsAssistant({
      conversationId: conversation.id,
      text: buildAssistantReply({ characterName: character?.name || "Them", userText: clean }),
    });
    setTyping(false);
  };

  const requestMedia = async (kind) => {
    if (!conversation) return;
    const beforeFreeLeft = quota.freeLeft;
    const cost = kind === "video" ? requestVideoCost : requestImageCost;
    const result = consumeMediaRequest({ freeLimit: 3, cost });
    if (!result.ok) {
      showToast("error", "Not enough 💎.");
      return;
    }

    sendMessage({
      conversationId: conversation.id,
      text: kind === "image" ? "Request image." : "Request video.",
      attachments: [],
    });

    setTyping(true);
    await new Promise((r) => setTimeout(r, 520));
    replyAsAssistant({
      conversationId: conversation.id,
      text: "",
      attachments:
        kind === "image"
          ? [{ kind: "image", url: aiImageSrc, fallbackUrl: aiImageFallback, name: "ai-reply-01" }]
          : [{ kind: "video", url: aiVideoSrc, fallbackUrl: aiVideoFallback, name: "ai-reply-01" }],
    });
    setTyping(false);
    showToast("success", "Request sent.");

    if (beforeFreeLeft > 0 && result.freeLeft <= 0) setFreeExhaustedOpen(true);
  };

  const panelBlocks = useMemo(() => (character ? pickProfileBlocks(character.id) : []), [character?.id]);
  const isFavorited = useMemo(
    () => (Array.isArray(favoriteCharacters) ? favoriteCharacters.includes(character?.id) : false),
    [character?.id, favoriteCharacters],
  );

  const shorts = useMemo(() => {
    if (!character) return [];
    const matchedShorts = shortDramas.filter((x) => x.protagonist === character.name);
    return matchedShorts.length ? matchedShorts.slice(0, 6) : shortDramas.slice(0, 6);
  }, [character?.name]);

  const profileFallbackSrc = useMemo(() => `/images/create/results/standard/hero-1.png?v=${assetVersion}`, [assetVersion]);
  const [profileImgSrc, setProfileImgSrc] = useState(
    character?.heroUrl || character?.fallbackUrl || character?.avatarUrl || profileFallbackSrc,
  );

  useEffect(() => {
    if (!character) return;
    setProfileImgSrc(character.heroUrl || character.fallbackUrl || character.avatarUrl || profileFallbackSrc);
  }, [character, profileFallbackSrc]);

  useEffect(() => {
    if (!conversation || !session.isLoggedIn) return;
    const el = messagesRef.current;
    if (!el) return;
    const raf = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => window.cancelAnimationFrame(raf);
  }, [conversation, session.isLoggedIn, typing]);

  useEffect(() => {
    if (!conversation || !character || !session.isLoggedIn) return;
    if (hasOpenedTourRef.current) return;
    const canShow = typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)")?.matches;
    if (!canShow) return;
    hasOpenedTourRef.current = true;
    const raf = window.requestAnimationFrame(() => setTourOpen(true));
    return () => window.cancelAnimationFrame(raf);
  }, [character, conversation, session.isLoggedIn]);

  if (!conversation || !character) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">{t(language, "chat_not_found")}</div>;
  }

  if (!session.isLoggedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
        <div className="text-sm text-zinc-600">{t(language, "chat_need_login")}</div>
        <button
          type="button"
          onClick={() => openAuth({ mode: "login", postAuthPath: `/chat/${conversation.id}` })}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          {t(language, "top_login")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <OnboardingTour
        open={tourOpen}
        step={tourStep}
        steps={[
          {
            key: "chat-requests",
            target: requestButtonsRef.current,
            title: "请求图片与视频",
            body: "你可以向对方发起图片或视频请求，让对话内容更生动、更有趣。",
          },
        ]}
        onClose={() => setTourOpen(false)}
        onNext={() => {
          setTourOpen(false);
          setTourStep(0);
        }}
      />

      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[60] -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl",
              toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-zinc-900",
            )}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <Modal
        open={mediaOpen}
        onClose={closeMedia}
        title={mediaItem?.kind === "video" ? "Video" : "Preview"}
        className={mediaItem?.kind === "video" ? "max-w-2xl" : "max-w-xl"}
      >
        {mediaItem?.kind === "image" ? (
          <img
            src={mediaItem?.src}
            alt="Preview"
            className="mx-auto max-h-[70dvh] w-auto max-w-full rounded-2xl object-contain"
            onError={(e) => {
              if (mediaItem?.fallbackUrl && mediaItem?.src !== mediaItem?.fallbackUrl) {
                e.currentTarget.src = mediaItem.fallbackUrl;
                setMediaItem((prev) => (prev ? { ...prev, src: prev.fallbackUrl, fallbackUrl: null } : prev));
              }
            }}
          />
        ) : mediaItem?.kind === "video" ? (
          <video
            key={mediaItem?.src || "video"}
            src={mediaItem?.src}
            autoPlay
            loop
            playsInline
            className="pointer-events-none mx-auto max-h-[70dvh] w-auto max-w-full rounded-2xl bg-black object-contain"
            onError={() => {
              if (mediaItem?.fallbackUrl && mediaItem?.src !== mediaItem?.fallbackUrl) {
                setMediaItem((prev) => (prev ? { ...prev, src: prev.fallbackUrl, fallbackUrl: null } : prev));
              }
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={freeExhaustedOpen}
        onClose={() => setFreeExhaustedOpen(false)}
        title="Free requests used up"
        className="max-w-md"
      >
        <div className="text-sm text-zinc-600">
          Your 3 free requests are used up. To get more, please subscribe.
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setFreeExhaustedOpen(false)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setFreeExhaustedOpen(false);
              navigate("/subscription");
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Subscribe
          </button>
        </div>
      </Modal>

      <div className="flex h-full min-h-0 flex-col lg:border-r lg:border-zinc-200">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={character.avatarUrl} alt={character.name} className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900">{character.name}</div>
              <div className="truncate text-xs text-zinc-500">{character.tags?.join(" · ")}</div>
            </div>
          </div>
        </div>

        <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-auto px-5 py-4">
          {conversation.messages.map((m) => {
            const isUser = m.role === "user";
            const attachments = Array.isArray(m.attachments) ? m.attachments : [];
            const mixed = !isUser && m.text ? splitMixedReply(m.text) : [];
            return (
              <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                {isUser ? (
                  <div className="max-w-[78%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-white">
                    {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}
                    {attachments.length ? (
                      <div className={cn(m.text ? "mt-2" : "", "space-y-2")}>
                        {attachments.map((a, idx) => (
                          <div key={`${m.id}-${idx}`} className="space-y-2">
                            {a.kind === "image" && a.url ? (
                              <button
                                type="button"
                                onClick={() => openMedia({ kind: "image", src: a.url, fallbackUrl: a.fallbackUrl || null })}
                                className="w-44 max-w-full overflow-hidden rounded-xl bg-black/10"
                              >
                                <img
                                  src={a.url}
                                  alt={a.name || "image"}
                                  className="h-auto w-full object-cover"
                                  data-fallback={a.fallbackUrl || ""}
                                  onError={(e) => {
                                    const fallback = e.currentTarget.dataset.fallback;
                                    if (fallback) {
                                      e.currentTarget.src = fallback;
                                      e.currentTarget.dataset.fallback = "";
                                    }
                                  }}
                                />
                              </button>
                            ) : a.kind === "video" && a.url ? (
                              <div className="overflow-hidden rounded-xl bg-black/90">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80">
                                  <VideoIcon className="h-4 w-4" />
                                  <span className="truncate">{a.name || "Video"}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                                <FileUp className="h-4 w-4 text-white/80" />
                                <div className="min-w-0 flex-1 truncate text-xs text-white/90">{a.name || "File"}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex max-w-[78%] items-start gap-2">
                    <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-900">
                      {m.text ? (
                        <div className="whitespace-pre-wrap">
                          {mixed.length
                            ? mixed.map((seg, idx) => (
                                <span key={`${m.id}-seg-${idx}`} className={seg.kind === "aside" ? "text-zinc-500 italic" : ""}>
                                  {seg.text}
                                </span>
                              ))
                            : m.text}
                        </div>
                      ) : null}
                      {attachments.length ? (
                        <div className={cn(m.text ? "mt-2" : "", "space-y-2")}>
                          {attachments.map((a, idx) => (
                            <div key={`${m.id}-${idx}`} className="space-y-2">
                              {a.kind === "image" && a.url ? (
                                <button
                                  type="button"
                                  onClick={() => openMedia({ kind: "image", src: a.url, fallbackUrl: a.fallbackUrl || null })}
                                  className="w-44 max-w-full overflow-hidden rounded-xl bg-white"
                                >
                                  <img
                                    src={a.url}
                                    alt={a.name || "image"}
                                    className="h-auto w-full object-cover"
                                    data-fallback={a.fallbackUrl || ""}
                                    onError={(e) => {
                                      const fallback = e.currentTarget.dataset.fallback;
                                      if (fallback) {
                                        e.currentTarget.src = fallback;
                                        e.currentTarget.dataset.fallback = "";
                                      }
                                    }}
                                  />
                                </button>
                              ) : a.kind === "video" && a.url ? (
                                <button
                                  type="button"
                                  onClick={() => openMedia({ kind: "video", src: a.url, fallbackUrl: a.fallbackUrl || null })}
                                  className="group relative w-44 max-w-full overflow-hidden rounded-xl bg-black"
                                  style={{ aspectRatio: "9 / 16" }}
                                >
                                  <video
                                    src={a.url}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="pointer-events-none h-full w-full object-cover"
                                    onError={(e) => {
                                      const fallback = e.currentTarget.dataset.fallback;
                                      if (fallback) {
                                        e.currentTarget.src = fallback;
                                        e.currentTarget.dataset.fallback = "";
                                      }
                                    }}
                                    data-fallback={a.fallbackUrl || ""}
                                  />
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white/20">
                                      <Play className="h-4 w-4" />
                                    </div>
                                  </div>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                                  <FileUp className="h-4 w-4 text-zinc-600" />
                                  <div className="min-w-0 flex-1 truncate text-xs text-zinc-700">{a.name || "File"}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {typing ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600">…</div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-zinc-200 px-5 py-4">
          <div ref={requestButtonsRef} className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => requestMedia("image")}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <ImageIcon className="h-4 w-4" />
              {t(language, "chat_request_image")}
              {quota.freeLeft <= 0 ? (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <Gem className="h-3.5 w-3.5" />
                  {requestImageCost}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => requestMedia("video")}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <VideoIcon className="h-4 w-4" />
              {t(language, "chat_request_video")}
              {quota.freeLeft <= 0 ? (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <Gem className="h-3.5 w-3.5" />
                  {requestVideoCost}
                </span>
              ) : null}
            </button>
            {quota.freeLeft > 0 ? (
              <div className="ml-auto text-[11px] text-zinc-500">
                Free requests left: <span className="font-semibold text-zinc-700">{quota.freeLeft}</span>/3
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              className="h-11 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
              placeholder={t(language, "chat_input_placeholder")}
            />

            <button
              type="button"
              onClick={() => onSend()}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <Send className="h-4 w-4" />
              {t(language, "chat_send")}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden h-full min-h-0 flex-col overflow-hidden lg:flex">
        <div className="flex items-center gap-5 border-b border-zinc-200 px-5 py-3">
          <button
            type="button"
            onClick={() => setPanelTab("profile")}
            className={cn(
              "border-b-2 pb-2 text-xs font-semibold",
              panelTab === "profile"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-700",
            )}
          >
            {t(language, "chat_tab_profile")}
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("shorts")}
            className={cn(
              "border-b-2 pb-2 text-xs font-semibold",
              panelTab === "shorts"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-700",
            )}
          >
            {t(language, "chat_tab_shorts")}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {panelTab === "profile" ? (
              <>
                <div className="p-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100">
                    <img
                      src={profileImgSrc}
                      alt={character.name}
                      className="h-full w-full object-cover"
                      onError={() => setProfileImgSrc(profileFallbackSrc)}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavoriteCharacter(character.id)}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
                        isFavorited ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                      )}
                    >
                      <Heart className="h-4 w-4" />
                      收藏
                    </button>
                    <button
                      type="button"
                      onClick={() => openShare({ url: shareUrl, title: "分享" })}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      <Share2 className="h-4 w-4" />
                      分享
                    </button>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">{character.name}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">{character.age} years</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-zinc-700">{character.bio}</div>
                </div>

                <div className="border-t border-zinc-200 p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {panelBlocks.map((b) => {
                      const Icon = b.Icon;
                      return (
                        <div key={b.key} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{b.label}</div>
                              {b.key === "personality" ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-900">
                                    {b.value}
                                  </span>
                                  {(b.tags || []).slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-1 break-words text-sm font-semibold leading-snug text-zinc-900">{b.value}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-900">{t(language, "chat_short_list_title")}</div>
                </div>

                <div className="mt-3 space-y-2">
                  {shorts.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                      <img src={s.coverUrl} alt={s.title} className="h-14 w-12 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-zinc-900">{s.title}</div>
                        <div className="mt-1 truncate text-[11px] text-zinc-500">
                          {s.episodes} {t(language, "shorts_episodes")}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/shorts")}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        {t(language, "shorts_play")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
