import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Gem, Send } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { cn } from "../lib/utils.js";
import { liveHosts } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const assetVersion = Date.now().toString();

const makeLiveVideoCandidates = () => [
  `/videos/live/live.mp4?v=${assetVersion}`,
  `/videos/live/live-01.mp4?v=${assetVersion}`,
  `/images/live/live.mp4?v=${assetVersion}`,
  `/images/live/preview-01.mp4?v=${assetVersion}`,
];

const gifts = [
  { id: "g1", icon: "🌷", name: "Tulip", action: "Waves to the camera", free: true },
  { id: "g2", icon: "🌼", name: "Daisy", action: "Sends a heart gesture", free: true },
  { id: "g3", icon: "🌹", name: "Rose", action: "Does a quick dance move", free: true },
  { id: "g4", icon: "🌸", name: "Cherry Blossom", action: "Blows a kiss", free: false },
  { id: "g5", icon: "💐", name: "Bouquet", action: "Says your name and thanks you", free: false },
  { id: "g6", icon: "🌻", name: "Sunflower", action: "Gives a thumbs up", free: false },
  { id: "g7", icon: "🪻", name: "Lavender", action: "Makes a cute pose", free: false },
  { id: "g8", icon: "🌺", name: "Hibiscus", action: "Sings a short line", free: false },
  { id: "g9", icon: "🏵️", name: "Rosette", action: "Leans in and smiles", free: false },
  { id: "g10", icon: "🪷", name: "Lotus", action: "Does a calm breathing moment", free: false },
  { id: "g11", icon: "🌱", name: "Sprout", action: "Nods and listens closely", free: false },
  { id: "g12", icon: "🍀", name: "Clover", action: "Says “Lucky you!”", free: false },
  { id: "g13", icon: "🎀", name: "Ribbon", action: "Does a shy smile", free: false },
  { id: "g14", icon: "✨", name: "Sparkle", action: "Does a quick sparkle pose", free: false },
  { id: "g15", icon: "🫶", name: "Hands Heart", action: "Makes a heart with hands", free: false },
  { id: "g16", icon: "👏", name: "Clap", action: "Claps for you", free: false },
  { id: "g17", icon: "🎉", name: "Confetti", action: "Celebration shout-out", free: false },
  { id: "g18", icon: "⭐", name: "Star", action: "Star moment: dramatic look", free: false },
  { id: "g19", icon: "🦋", name: "Butterfly", action: "Does a gentle wave", free: false },
  { id: "g20", icon: "🍓", name: "Strawberry", action: "Says something sweet", free: false },
  { id: "g21", icon: "🍒", name: "Cherry", action: "Winks", free: false },
  { id: "g22", icon: "🍬", name: "Candy", action: "Makes a playful face", free: false },
  { id: "g23", icon: "🧸", name: "Teddy", action: "Hugs the air", free: false },
  { id: "g24", icon: "🎧", name: "Headphones", action: "Turns up the vibe", free: false },
  { id: "g25", icon: "🎤", name: "Mic", action: "Says “Let’s go!”", free: false },
  { id: "g26", icon: "🕯️", name: "Candle", action: "Whispers a secret", free: false },
  { id: "g27", icon: "🧡", name: "Orange Heart", action: "Sends warm thanks", free: false },
  { id: "g28", icon: "💎", name: "💎", action: "Highlights the next topic", free: false },
  { id: "g29", icon: "🧿", name: "Charm", action: "Does a lucky charm pose", free: false },
  { id: "g30", icon: "🌈", name: "Rainbow", action: "Big smile + wave goodbye", free: false },
];

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const pickHostReply = ({ kind, hostName, payload }) => {
  if (kind === "gift") {
    return `Thank you! ${payload?.name ? `(${payload.name}) ` : ""}${payload?.action ? `— ${payload.action}.` : ""}`;
  }
  const text = `${payload || ""}`.trim();
  if (!text) return `I’m here, ${hostName}. What’s on your mind?`;
  if (text.length <= 12) return `Got it. Tell me more.`;
  return `I hear you. Let’s keep going.`;
};

export default function LiveRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const spendDiamonds = useAppStore((s) => s.spendDiamonds);
  const openAuth = useUIStore((s) => s.openAuth);

  const host = useMemo(() => liveHosts.find((x) => x.id === id) || liveHosts[0], [id]);
  const isSubscribed = subscription.status === "active";
  const hostAge = useMemo(() => 20 + ((Number((id || "l1").replace(/\D/g, "")) || 1) % 8), [id]);
  const hostAvatar = host?.avatarUrl || session.avatarUrl;

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

  const [videoTry, setVideoTry] = useState(0);
  const videoCandidates = useMemo(() => makeLiveVideoCandidates(), []);
  const liveVideoSrc = videoCandidates[videoTry];

  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState(null);
  const openGate = (kind) => {
    setGateKind(kind);
    setGateOpen(true);
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: generateId(), role: "host", text: `Welcome in. I’m live now.`, createdAt: Date.now() - 8000 },
    { id: generateId(), role: "host", text: `Say hi in the chat.`, createdAt: Date.now() - 5000 },
  ]);
  const userMessageCount = useMemo(() => messages.filter((m) => m.role === "user").length, [messages]);

  const overlayLines = useMemo(() => messages.slice(-6), [messages]);
  const [lastAction, setLastAction] = useState(null);

  const sendUserMessage = (text) => {
    const clean = `${text || ""}`.trim();
    if (!clean) return;

    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/live/${id || "l1"}` });
      return;
    }

    if (!isSubscribed && userMessageCount >= 3) {
      openGate("chat");
      return;
    }

    const now = Date.now();
    setMessages((prev) => [...prev, { id: generateId(), role: "user", text: clean, createdAt: now }]);
    setInput("");

    window.setTimeout(() => {
      const reply = pickHostReply({ kind: "chat", hostName: host?.name || "Host", payload: clean });
      setMessages((prev) => [...prev, { id: generateId(), role: "host", text: reply, createdAt: Date.now() }]);
    }, 650);
  };

  const sendGift = (gift) => {
    if (!gift) return;
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/live/${id || "l1"}` });
      return;
    }

    if (!gift.free && !isSubscribed) {
      openGate("gifts");
      return;
    }

    const cost = gift.free ? 0 : 5;
    const ok = cost ? spendDiamonds(cost) : true;
    if (!ok) {
      showToast("error", "Not enough 💎.");
      return;
    }

    setLastAction({ title: `${gift.icon} ${gift.name}`, desc: gift.action, ts: Date.now() });
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "system", text: `You sent ${gift.name}.`, createdAt: Date.now() },
    ]);
    window.setTimeout(() => {
      const reply = pickHostReply({ kind: "gift", hostName: host?.name || "Host", payload: gift });
      setMessages((prev) => [...prev, { id: generateId(), role: "host", text: reply, createdAt: Date.now() }]);
    }, 720);

    if (!gift.free) showToast("success", `Gift sent (-${cost} 💎).`);
  };

  return (
    <div className="-mx-6 -my-6 relative h-[calc(100dvh-56px)] w-full overflow-hidden p-3">
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

      <button
        type="button"
        onClick={() => navigate("/live")}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 lg:hidden"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[128px_minmax(0,1fr)_minmax(0,520px)]">
        <button
          type="button"
          onClick={() => navigate("/live")}
          className="hidden items-center gap-2 self-start justify-self-start rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 lg:inline-flex"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="min-h-0 pl-20 lg:col-start-2 lg:pl-0">
          <div className="flex h-full items-start justify-start">
            <div className="relative aspect-[9/16] w-full max-w-[640px] overflow-hidden rounded-3xl border border-zinc-200 bg-black shadow-2xl lg:h-full lg:w-auto lg:max-w-none">
              <video
                className="h-full w-full object-cover"
                src={liveVideoSrc}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoTry((v) => Math.min(v + 1, Math.max(0, videoCandidates.length - 1)))}
              />

              <div className="absolute right-4 top-4 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </div>
              </div>

              {lastAction ? (
                <div className="absolute right-4 top-14 max-w-xs rounded-2xl bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <div className="truncate">{lastAction.title}</div>
                  <div className="mt-0.5 text-white/80">{lastAction.desc}</div>
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4 w-[min(420px,85%)] space-y-1.5">
                {overlayLines.map((m) => (
                  <div key={m.id} className="text-xs text-white/90">
                    {m.role === "host" ? (
                      <span className="font-semibold text-emerald-300">{host?.name || "Host"}:</span>
                    ) : m.role === "user" ? (
                      <span className="font-semibold text-white/95">{session.displayName || "You"}:</span>
                    ) : (
                      <span className="font-semibold text-white/60">System:</span>
                    )}{" "}
                    <span className="text-white/85">{m.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 lg:col-start-3">
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img alt={host?.name || "Host"} src={hostAvatar} className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900">{host?.name || "Host"}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{hostAge} years</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  Start Chat
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-zinc-900">Gifts</div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700">
                  <Gem className="h-4 w-4 text-sky-500" />
                  <span>{diamonds.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y">
                <div className="grid grid-cols-4 gap-3">
                  {gifts.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => sendGift(g)}
                      className="group rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-left hover:bg-zinc-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-lg leading-none">{g.icon}</div>
                        {g.free ? (
                          <div className="text-[10px] font-semibold text-zinc-500">Free</div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-700">
                            <Gem className="h-3.5 w-3.5" />
                            5
                          </div>
                        )}
                      </div>
                      <div className="mt-2 truncate text-xs font-semibold text-zinc-900">{g.name}</div>
                      <div className="mt-1 line-clamp-2 text-[11px] text-zinc-600">{g.action}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-zinc-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendUserMessage(input);
                  }}
                  className="h-11 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder="Say something…"
                />
                <button
                  type="button"
                  onClick={() => sendUserMessage(input)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        title={gateKind === "chat" ? "Subscription required" : "Subscription required"}
        className="max-w-md"
      >
        <div className="space-y-4">
          {gateKind === "chat" ? (
            <div className="text-sm text-zinc-700">
              Free users can send up to 3 messages. Subscribe to continue chatting with the host.
            </div>
          ) : (
            <div className="text-sm text-zinc-700">
              Paid gifts require an active subscription. Subscribe to unlock gifts and buy 💎.
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setGateOpen(false)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={() => navigate("/subscribe")}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Go to Subscribe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
