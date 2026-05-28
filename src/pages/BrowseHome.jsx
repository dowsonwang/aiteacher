import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeFooter from "../components/HomeFooter.jsx";
import ImmersiveCharacterCard from "../components/ImmersiveCharacterCard.jsx";
import LiveStreamCard from "../components/LiveStreamCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ShortCard from "../components/ShortCard.jsx";
import { ChevronDown, Compass, Film, Pause, Play, Volume2, VolumeX, Wand2 } from "lucide-react";
import { cn } from "../lib/utils.js";
import { liveHosts, shortDramas } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function BrowseHome() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const openAuth = useUIStore((s) => s.openAuth);
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const liveCoverSrc = `/images/home/live-cover.png?v=${assetVersion}`;
  const t2i = (prompt, imageSize) =>
    `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
  const getShortsCoverSrc = (i) => {
    const sources = [
      "/images/home/shorts-cover.png",
      "/images/home/shorts-cover1.png",
      "/images/home/shorts-cover2.png",
      "/images/home/shorts-cover3.png",
      "/images/home/shorts-cover4.png",
    ];
    const src = sources[i] || sources[0];
    return `${src}?v=${assetVersion}`;
  };
  const onStartChat = (characterId) => {
    const conversationId = openConversationForCharacter(characterId);
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/chat/${conversationId}` });
      return;
    }
    navigate(`/chat/${conversationId}`);
  };

  const characters = getAllCharacters();
  const [characterType, setCharacterType] = useState("female");
  const displayCharacters = useMemo(() => {
    if (characterType === "male") return characters.filter((c) => c.kind === "male");
    if (characterType === "anime") return characters.filter((c) => c.kind === "anime");
    return characters.filter((c) => c.kind === "female" || !c.kind);
  }, [characterType, characters]);
  const [faqOpen, setFaqOpen] = useState(() => new Set([0]));
  const faqItems = useMemo(
    () => [
      {
        q: "How do I practice English with AI Language Coach?",
        a: "Send a short sentence in chat. You’ll get a corrected version, a more natural alternative, and one quick follow-up question to practice.",
      },
      {
        q: "Can it help with pronunciation?",
        a: "Yes. Ask for stress and intonation tips, then shadow a sentence twice. You can also request drills for specific sounds.",
      },
      {
        q: "What if I don’t know what to say?",
        a: "Start with a scenario: travel, workplace, small talk, or interview. The tutor can guide the conversation with prompts and role-play.",
      },
      {
        q: "Does it explain grammar?",
        a: "Yes. It focuses on practical rules with examples. Ask for “simple rule + common mistake + two practice questions”.",
      },
      {
        q: "How can I learn faster?",
        a: "Practice daily for 10 minutes. Save your corrected sentences and review them for 2 minutes a day to build real fluency.",
      },
    ],
    [],
  );
  const cardCount = 10;
  const showLive = false;
  const featuredDrama = shortDramas[0];
  const featuredVideoSrc = `/videos/feed/feed-02.mp4?v=${assetVersion}`;
  const heroLinks = useMemo(
    () => [
      {
        label: "Shorts",
        href: "/shorts",
        Icon: Film,
        accent: "from-amber-200/60 via-orange-100/40 to-rose-200/50",
        coverUrl: t2i(
          "a cinematic still of a modern language learning short video, vertical reel style, warm studio lighting, abstract typography shapes, vibrant gradient, high contrast, premium app aesthetic, no text, ultra realistic, 35mm",
          "landscape_4_3",
        ),
      },
      {
        label: "Discover",
        href: "/feed",
        Icon: Compass,
        accent: "from-sky-200/60 via-cyan-100/40 to-emerald-200/50",
        coverUrl: t2i(
          "a premium discovery feed for language learners, floating video cards and chat bubbles, clean white UI, soft shadows, neon accent gradient, modern minimal design, no text, ultra realistic, high detail",
          "landscape_4_3",
        ),
      },
      {
        label: "Create",
        href: "/create",
        Icon: Wand2,
        accent: "from-violet-200/60 via-fuchsia-100/40 to-rose-200/50",
        coverUrl: t2i(
          "a stylish character creation screen for an AI language tutor, avatar silhouette, sliders and panels, bold color accents, glossy glassmorphism, modern premium UI, no text, ultra realistic, high detail",
          "landscape_4_3",
        ),
      },
    ],
    [],
  );
  const featuredVideoRef = useRef(null);
  const [featuredMuted, setFeaturedMuted] = useState(true);
  const [featuredPaused, setFeaturedPaused] = useState(false);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 lg:h-[420px] lg:min-h-[380px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
        <div className="flex h-full flex-col gap-5">
          <div className="px-1 pt-1">
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-[34px]">AI Language Coach</div>
            <div className="mt-3 max-w-[560px] text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              Practice English with AI tutors—fast, natural, and actually useful.
              <br />
              Send one sentence and get a correction + a more native rewrite + one short drill to repeat.
              <br />
              Use Shorts for role-play, Discover for quick inspiration, or Create your own tutor. Ten minutes a day is enough to feel progress.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Instant corrections", "Daily drills", "Real scenarios"].map((x) => (
                <div
                  key={x}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {heroLinks.map((x) => {
              const Icon = x.Icon;
              return (
                <button
                  key={x.href}
                  type="button"
                  onClick={() => navigate(x.href)}
                  className="group relative min-h-[124px] overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-zinc-900/40"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70", x.accent)} />
                  <img
                    src={x.coverUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-25 saturate-150 transition duration-500 group-hover:scale-[1.06] group-hover:opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/55 via-white/15 to-white/0" />
                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-zinc-900 shadow-sm backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold tracking-wide text-zinc-900">{x.label}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-zinc-900">Shorts</div>
            <button type="button" onClick={() => navigate("/shorts")} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              View all →
            </button>
          </div>

          <div className="no-scrollbar mt-5 flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
            {featuredDrama ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/shorts/${featuredDrama.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/shorts/${featuredDrama.id}`);
                }}
                className="group relative w-44 flex-shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:scale-[1.03] hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40"
              >
                <div className="aspect-[9/16] w-full overflow-hidden bg-black">
                  <video
                    ref={featuredVideoRef}
                    src={featuredVideoSrc}
                    autoPlay
                    loop
                    muted={featuredMuted}
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    onPlay={() => setFeaturedPaused(false)}
                    onPause={() => setFeaturedPaused(true)}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const el = featuredVideoRef.current;
                      if (!el) return;
                      if (el.paused) el.play();
                      else el.pause();
                    }}
                    className="absolute left-1/2 top-1/2 inline-flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur hover:bg-white/20"
                  >
                    {featuredPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFeaturedMuted((v) => !v);
                    }}
                    className="absolute right-3 top-14 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur hover:bg-white/20"
                  >
                    {featuredMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ) : null}

            {shortDramas.slice(1, cardCount).map((d, i) => (
              <ShortCard
                key={d.id}
                drama={d}
                coverSrc={getShortsCoverSrc(i + 1)}
                showProtagonistTag={false}
                size="lg"
                protagonistAvatarUrl={characters.find((c) => c.id === d.characterId)?.avatarUrl}
              />
            ))}
          </div>
        </section>
      </section>

      {showLive ? (
        <section id="live" className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Live" href="/live" />
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {liveHosts.slice(0, cardCount).map((h) => (
              <LiveStreamCard key={h.id} host={h} coverSrc={liveCoverSrc} onClick={() => navigate("/live")} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-base font-semibold text-zinc-900">Characters</div>
            <div className="flex items-center gap-2">
              {[
                { key: "female", label: "Female" },
                { key: "anime", label: "Anime" },
                { key: "male", label: "Male" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setCharacterType(t.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    characterType === t.key
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => navigate("/browse")} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayCharacters.slice(0, 24).map((c) => (
            <ImmersiveCharacterCard key={c.id} character={c} onStartChat={onStartChat} />
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <div className="text-sm font-semibold text-zinc-900">FAQ</div>
              <div className="mt-1 text-sm text-zinc-600">Common questions about learning with AI Language Coach.</div>
            </div>
            <div className="divide-y divide-zinc-200">
              {faqItems.map((item, idx) => {
                const isOpen = faqOpen.has(idx);
                return (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() => {
                      setFaqOpen((prev) => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx);
                        else next.add(idx);
                        return next;
                      });
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-4 px-6 py-5">
                      <div className="text-sm font-semibold text-zinc-900">{item.q}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-semibold text-zinc-500">{isOpen ? "Hide" : "View"}</div>
                        <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition", isOpen ? "rotate-180" : "")} />
                      </div>
                    </div>
                    {isOpen ? <div className="px-6 pb-5 text-sm leading-relaxed text-zinc-700">{item.a}</div> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm">
            <div className="text-sm font-semibold text-zinc-900">Learn English faster with AI Language Coach</div>
            <div className="mt-2 text-zinc-600">
              AI Language Coach is an AI-powered English learning app built for real practice: speaking, writing, grammar, and vocabulary—without long lessons.
            </div>
            <div className="mt-3 space-y-3">
              <div>
                Practice with AI tutors anytime. Get instant corrections, natural rewrites, and bite-sized drills that fit your daily routine.
              </div>
              <div>
                Train with realistic scenarios like travel, workplace English, interviews, and small talk. Build confidence through repetition and feedback.
              </div>
              <div>
                Turn mistakes into progress. Save corrected sentences, review them daily, and watch your fluency improve session by session.
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
