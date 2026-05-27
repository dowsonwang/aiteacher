import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  FileUp,
  Flag,
  Gem,
  Globe,
  Heart,
  Image as ImageIcon,
  Play,
  Send,
  Sparkles,
  Video as VideoIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import Modal from "../components/Modal.jsx";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";
import { shortDramas } from "../data/mock.js";

const buildAssistantReply = ({ characterName, userText }) => {
  const text = userText.trim();
  if (!text) return "Tell me your English goal for today (speaking, grammar, vocabulary, writing).";
  if (text.length <= 6) return `Nice. Use it in a full English sentence: “${text} …”`;
  return `${characterName}: Great. I’ll correct your English, then give a better natural version + one quick practice question.`;
};

const pickProfileBlocks = (characterId) => {
  const idx = Math.max(1, Number(`${characterId}`.replace(/\D/g, "")) || 1);
  const languages = ["English", "English (Business)", "English (Travel)", "English (Pronunciation)", "English (Writing)"];
  const hobbies = ["Shadowing", "Role-play", "Vocabulary", "Pronunciation", "Grammar drills"];
  const countries = ["USA", "Japan", "Korea", "France", "Canada", "Germany", "UK"];
  const jobs = ["English Coach", "Language Tutor", "Pronunciation Coach", "Exam Trainer", "Conversation Partner"];
  const personalities = ["Patient", "Clear", "Encouraging", "Direct", "Structured", "Playful"];

  return [
    { key: "language", label: "Language", value: languages[idx % languages.length], Icon: Globe },
    { key: "hobby", label: "Focus", value: hobbies[idx % hobbies.length], Icon: Heart },
    { key: "country", label: "Country", value: countries[idx % countries.length], Icon: Flag },
    { key: "occupation", label: "Occupation", value: jobs[idx % jobs.length], Icon: Briefcase },
    { key: "personality", label: "Personality", value: personalities[idx % personalities.length], Icon: Sparkles },
  ];
};

export default function ChatRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const language = useAppStore((s) => s.language);
  const session = useAppStore((s) => s.session);
  const openAuth = useUIStore((s) => s.openAuth);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const conversations = useAppStore((s) => s.conversations);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const replyAsAssistant = useAppStore((s) => s.replyAsAssistant);
  const diamonds = useAppStore((s) => s.diamonds);
  const mediaRequests = useAppStore((s) => s.mediaRequests);
  const consumeMediaRequest = useAppStore((s) => s.consumeMediaRequest);
  const getMediaRequestSummary = useAppStore((s) => s.getMediaRequestSummary);

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

  const [speakingId, setSpeakingId] = useState(null);
  const [panelTab, setPanelTab] = useState("profile");
  useEffect(
    () => () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    },
    [],
  );

  const characters = getAllCharacters();
  const conversation = useMemo(() => conversations.find((c) => c.id === id), [conversations, id]);
  const character = useMemo(
    () => characters.find((c) => c.id === conversation?.characterId),
    [characters, conversation?.characterId],
  );

  const assetVersion = useMemo(() => Date.now().toString(), []);
  const aiImageSrc = useMemo(() => `/images/chat/ai-reply-01.png?v=${assetVersion}`, [assetVersion]);
  const aiImageFallback = useMemo(() => `/images/chat/ai-reply-01.jpg?v=${assetVersion}`, [assetVersion]);
  const aiVideoSrc = useMemo(() => `/images/chat/ai-reply-01.mp4?v=${assetVersion}`, [assetVersion]);
  const aiVideoFallback = useMemo(() => `/videos/chat/ai-reply-01.mp4?v=${assetVersion}`, [assetVersion]);

  const quota = useMemo(() => getMediaRequestSummary({ freeLimit: 3 }), [getMediaRequestSummary, mediaRequests]);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState(null);

  const openMedia = (item) => {
    if (!item) return;
    setMediaItem(item);
    setMediaOpen(true);
  };
  const closeMedia = () => {
    setMediaOpen(false);
    setMediaItem(null);
  };

  const speak = (messageId, text) => {
    const clean = `${text || ""}`.trim();
    if (!clean) return;
    if (typeof window === "undefined" || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      showToast("error", "Speech is not supported in this browser.");
      return;
    }
    if (speakingId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    setSpeakingId(messageId);
    window.speechSynthesis.speak(utter);
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
    const result = consumeMediaRequest({ freeLimit: 3, cost: 5 });
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
      text: kind === "image" ? "Sure — here you go." : "Sure — here is the video.",
      attachments:
        kind === "image"
          ? [{ kind: "image", url: aiImageSrc, fallbackUrl: aiImageFallback, name: "ai-reply-01" }]
          : [{ kind: "video", url: aiVideoSrc, fallbackUrl: aiVideoFallback, name: "ai-reply-01" }],
    });
    setTyping(false);

    if (result.charged) showToast("success", `Request sent (-${result.cost} 💎).`);
    else showToast("success", `Request sent (free).`);
  };

  const panelBlocks = useMemo(() => (character ? pickProfileBlocks(character.id) : []), [character?.id]);

  const shorts = useMemo(() => {
    if (!character) return [];
    const matchedShorts = shortDramas.filter((x) => x.protagonist === character.name);
    return matchedShorts.length ? matchedShorts.slice(0, 6) : shortDramas.slice(0, 6);
  }, [character?.name]);

  const worldbooks = useMemo(() => {
    if (!character) return [];
    const custom = character?.profile?.worldbooks;
    if (Array.isArray(custom) && custom.length) {
      return custom
        .map((w, idx) => {
          const paragraphs = Array.isArray(w?.paragraphs) ? w.paragraphs.filter(Boolean) : [];
          return {
            id: `${w?.id || `wb-${idx + 1}`}`,
            title: `${w?.title || "Worldbook"}`,
            summary: `${w?.summary || ""}`,
            paragraphs,
          };
        })
        .filter((w) => w.title && w.paragraphs.length);
    }
    const tagLine = Array.isArray(character.tags) && character.tags.length ? character.tags.slice(0, 3).join(" · ") : "";
    const origin = character.bio ? `${character.bio} ` : "";
    const core = {
      id: "wb-core",
      title: "Core Coaching",
      summary: "Your daily practice loop: correct, explain, repeat.",
      paragraphs: [
        `${character.name}'s worldbook is a teaching notebook: goals, rules, and mini-lessons designed to make your English feel natural.`,
        `${origin}${character.name} focuses on practical speaking first, then accuracy. You’ll get corrections, explanations, and short drills you can repeat daily.`,
        "Core method: you speak or write one sentence → I correct it → I explain the rule in plain English → you try again with a new example.",
        "Pronunciation routine: pick one tricky word, break it into sounds, stress it correctly, then shadow the full sentence twice.",
        "Vocabulary routine: learn 5 high-frequency words, then use each word in a personal sentence. If your sentence is unnatural, I’ll rewrite it with a native-style option.",
        "Grammar routine: one pattern per session. Example + common mistake + two quick practice questions. No long lectures—just what you need.",
        `Scenario practice: ${tagLine || "travel, workplace, and daily small talk"} role-plays. You choose the situation, I keep it realistic, and we repeat until it feels smooth.`,
        "Progress tracking: we keep a small list of “fixed mistakes” and “new phrases”. Review them for 2 minutes a day to build real fluency.",
      ],
    };

    const extra = [
      {
        id: "wb-travel",
        title: "Travel English Playbook",
        summary: "Airport, hotel, directions, and dining role-plays.",
        paragraphs: [
          "Focus: practical travel phrases you can use immediately.",
          "Routine: learn 5 key phrases → role-play the situation → get corrections → repeat faster.",
          "Target: sound polite, clear, and confident in short interactions.",
          "Drill: answer the same question in 3 ways (polite / casual / very concise).",
        ],
      },
      {
        id: "wb-work",
        title: "Workplace English Playbook",
        summary: "Meetings, emails, small talk, and polite tone.",
        paragraphs: [
          "Focus: professional tone and clear structure.",
          "Routine: write one email sentence → refine → rewrite shorter → add a polite option.",
          "Target: be direct without sounding rude.",
          "Drill: transform informal sentences into professional English in 60 seconds.",
        ],
      },
      {
        id: "wb-exam",
        title: "Exam Prep Notebook",
        summary: "Short drills for accuracy and speed under pressure.",
        paragraphs: [
          "Focus: accuracy-first practice with short timed prompts.",
          "Routine: do one question → review mistake → repeat with a new example.",
          "Target: reduce repeated mistakes and improve clarity.",
          "Drill: create a personal list of “fixed mistakes” and review daily.",
        ],
      },
    ];

    const needsMultiple = ["c1", "c2", "c3", "c4"].includes(character.id);
    return needsMultiple ? [core, ...extra] : [core];
  }, [character?.bio, character?.id, character?.name, character?.tags]);

  const [activeWorldbookId, setActiveWorldbookId] = useState("");
  const [viewedWorldbookId, setViewedWorldbookId] = useState("");
  const [worldbookView, setWorldbookView] = useState("detail");

  useEffect(() => {
    if (!worldbooks.length) return;
    const nextActive = worldbooks.some((w) => w.id === activeWorldbookId) ? activeWorldbookId : worldbooks[0].id;
    setActiveWorldbookId(nextActive);
    setViewedWorldbookId((prev) => (worldbooks.some((w) => w.id === prev) ? prev : nextActive));
    setWorldbookView(worldbooks.length > 1 ? "list" : "detail");
  }, [activeWorldbookId, character?.id, worldbooks]);

  const activeWorldbook = useMemo(
    () => worldbooks.find((w) => w.id === activeWorldbookId) || worldbooks[0] || null,
    [activeWorldbookId, worldbooks],
  );
  const viewedWorldbook = useMemo(
    () => worldbooks.find((w) => w.id === viewedWorldbookId) || activeWorldbook || null,
    [activeWorldbook, viewedWorldbookId, worldbooks],
  );

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

      <div className="flex h-full min-h-0 flex-col lg:border-r lg:border-zinc-200">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={character.avatarUrl} alt={character.name} className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900">{character.name}</div>
              <div className="truncate text-xs text-zinc-500">{character.tags?.join(" · ")}</div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center justify-end gap-1 text-[11px] font-semibold text-zinc-700">
              <Gem className="h-3.5 w-3.5 text-sky-500" />
              <span>{diamonds.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              Free requests left: <span className="font-semibold text-zinc-700">{quota.freeLeft}</span>/3
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto px-5 py-4">
          {conversation.messages.map((m) => {
            const isUser = m.role === "user";
            const attachments = Array.isArray(m.attachments) ? m.attachments : [];
            const hasMedia = attachments.some((a) => a?.kind === "image" || a?.kind === "video");
            const canSpeak = !isUser && Boolean(m.text) && !hasMedia;
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
                      {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}
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
                  {canSpeak ? (
                      <button
                        type="button"
                        onClick={() => speak(m.id, m.text)}
                        className={cn(
                          "mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border text-zinc-700 hover:bg-zinc-50",
                          speakingId === m.id ? "border-zinc-400 bg-zinc-100" : "border-zinc-200 bg-white",
                        )}
                        aria-label="Read aloud"
                      >
                        {speakingId === m.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    ) : null}
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => requestMedia("image")}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <ImageIcon className="h-4 w-4" />
              {t(language, "chat_request_image")}
              {quota.freeLeft <= 0 ? (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <Gem className="h-3.5 w-3.5" />5
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
                  <Gem className="h-3.5 w-3.5" />5
                </span>
              ) : null}
            </button>
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
            onClick={() => setPanelTab("story")}
            className={cn(
              "border-b-2 pb-2 text-xs font-semibold",
              panelTab === "story"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-700",
            )}
          >
            {t(language, "chat_tab_story")}
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
                      src={character.heroUrl || character.fallbackUrl || character.avatarUrl}
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
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
                  <div className="grid grid-cols-2 gap-3">
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
                              <div className="mt-1 truncate text-sm font-semibold text-zinc-900">{b.value}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : panelTab === "story" ? (
              <div className="p-4">
                <div className="text-sm font-semibold text-zinc-900">{t(language, "chat_story_title")}</div>
                {worldbooks.length <= 1 ? (
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-700">
                    {(activeWorldbook?.paragraphs || []).map((p) => (
                      <div key={p} className="whitespace-pre-wrap">
                        {p}
                      </div>
                    ))}
                  </div>
                ) : worldbookView === "list" ? (
                  <div className="mt-3 space-y-3">
                    {worldbooks.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setViewedWorldbookId(w.id);
                          setWorldbookView("detail");
                        }}
                        className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left hover:bg-zinc-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-zinc-900">{w.title}</div>
                            <div className="mt-1 text-xs text-zinc-600">{w.summary}</div>
                          </div>
                          {w.id === activeWorldbookId ? (
                            <div className="shrink-0 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                              In use
                            </div>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-900">{viewedWorldbook?.title}</div>
                      {viewedWorldbook?.id === activeWorldbookId ? (
                        <div className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                          In use
                        </div>
                      ) : (
                        <div className="rounded-full bg-zinc-900/5 px-3 py-1 text-xs font-semibold text-zinc-700">
                          Preview
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-700">
                      {(viewedWorldbook?.paragraphs || []).map((p) => (
                        <div key={p} className="whitespace-pre-wrap">
                          {p}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWorldbookView("list")}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!viewedWorldbook?.id || viewedWorldbook?.id === activeWorldbookId}
                        onClick={() => {
                          if (!viewedWorldbook?.id || viewedWorldbook?.id === activeWorldbookId) return;
                          setActiveWorldbookId(viewedWorldbook.id);
                          showToast("success", "Worldbook switched.");
                        }}
                        className={cn(
                          "inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold",
                          viewedWorldbook?.id && viewedWorldbook?.id !== activeWorldbookId
                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                            : "bg-zinc-100 text-zinc-400",
                        )}
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-900">{t(language, "chat_short_list_title")}</div>
                  <div className="text-xs text-zinc-500">{t(language, "chat_short_list_hint")}</div>
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
