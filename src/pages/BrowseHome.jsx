import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeFooter from "../components/HomeFooter.jsx";
import ImmersiveCharacterCard from "../components/ImmersiveCharacterCard.jsx";
import LiveStreamCard from "../components/LiveStreamCard.jsx";
import OnboardingTour from "../components/OnboardingTour.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { ChevronDown, Compass, Film, Wand2 } from "lucide-react";
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
  const shortsVideoSrcForIndex = (i) => `/videos/feed/feed-0${(i % 4) + 1}.mp4?v=${assetVersion}`;
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
  const shortsVideoRefs = useRef(new Map());
  const [hoveredShortId, setHoveredShortId] = useState("");
  const heroShortsRef = useRef(null);
  const heroDiscoverRef = useRef(null);
  const heroCreateRef = useRef(null);
  const homeShortsModuleRef = useRef(null);
  const characterFilterRef = useRef(null);
  const firstCharacterRef = useRef(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    setTourOpen(true);
  }, []);

  useEffect(() => {
    shortsVideoRefs.current.forEach((el, id) => {
      if (!el) return;
      if (id === hoveredShortId) {
        const p = el.play();
        if (p?.catch) p.catch(() => {});
      } else {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [hoveredShortId]);

  const tourSteps = [
    {
      key: "home-hero-shorts",
      target: heroShortsRef.current,
      title: "Shorts",
      body: "进入 Shorts，浏览平台精选短剧内容，快速开始观看。",
    },
    {
      key: "home-hero-discover",
      target: heroDiscoverRef.current,
      title: "Discover",
      body: "进入 Discover，观看精彩短视频内容，并探索更多角色。",
    },
    {
      key: "home-hero-create",
      target: heroCreateRef.current,
      title: "Create",
      body: "进入 Create，可免费或付费创建人物，完成更个性化的角色定制。",
    },
    {
      key: "home-shorts-module",
      target: homeShortsModuleRef.current,
      title: "Recommended shorts",
      body: "这里展示当前推荐的短剧内容。你可以横向浏览卡片，并点击进入播放页。",
    },
    {
      key: "home-character-filter",
      target: characterFilterRef.current,
      title: "Character filters",
      body: "使用筛选按钮切换人物类型，快速定位你想看的角色。",
    },
    {
      key: "home-first-character",
      target: firstCharacterRef.current,
      title: "Start a chat",
      body: "点击任意人物卡片即可进入对话，与该角色开始聊天。",
    },
  ];

  return (
    <div className="space-y-8">
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

      <section className="grid grid-cols-1 gap-6 lg:h-[420px] lg:min-h-[380px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
        <div className="flex h-full flex-col gap-5">
          <div className="px-1 pt-1">
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-[34px]">
              Some characters are stories. Some are mirrors.
            </div>
            <div className="mt-3 max-w-[560px] text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              Create AI characters, discover new personas, watch Shorts, and let them unfold into digital selves of their own. Chat, roleplay, follow their worlds, and see what parts of you answer back.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {heroLinks.map((x) => {
              const Icon = x.Icon;
              const ref = x.href === "/shorts" ? heroShortsRef : x.href === "/feed" ? heroDiscoverRef : heroCreateRef;
              return (
                <button
                  key={x.href}
                  ref={ref}
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
          <div ref={homeShortsModuleRef} className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-zinc-900">Shorts</div>
            <button type="button" onClick={() => navigate("/shorts")} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              View all →
            </button>
          </div>

          <div className="no-scrollbar mt-5 flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
            {shortDramas.slice(0, cardCount).map((d, i) => {
              const isHover = hoveredShortId === d.id;
              const coverSrc = getShortsCoverSrc(i);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => navigate(`/shorts/${d.id}`)}
                  onMouseEnter={() => setHoveredShortId(d.id)}
                  onMouseLeave={() => setHoveredShortId((v) => (v === d.id ? "" : v))}
                  className="group relative w-44 flex-shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40"
                  aria-label={d.title}
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                    <img
                      src={coverSrc}
                      alt=""
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
                        isHover ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <video
                      ref={(el) => {
                        if (!el) {
                          shortsVideoRefs.current.delete(d.id);
                          return;
                        }
                        shortsVideoRefs.current.set(d.id, el);
                      }}
                      src={shortsVideoSrcForIndex(i)}
                      loop
                      muted
                      playsInline
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
                        isHover ? "opacity-100" : "opacity-0",
                      )}
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
                      {d.episodes} eps
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent px-3 py-2">
                      <div className="truncate text-sm font-semibold text-white">{d.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
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
            <div ref={characterFilterRef} className="flex items-center gap-2">
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
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayCharacters.slice(0, 24).map((c, idx) =>
            idx === 0 ? (
              <div key={c.id} ref={firstCharacterRef}>
                <ImmersiveCharacterCard character={c} onStartChat={onStartChat} />
              </div>
            ) : (
              <ImmersiveCharacterCard key={c.id} character={c} onStartChat={onStartChat} />
            ),
          )}
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
            <div className="text-sm font-semibold text-zinc-900">Where roleplay stays imaginative, expressive, and safe.</div>
            <div className="mt-2 text-zinc-600">
              Heartbits is a SFW AI chat platform for character-led stories with emotional depth. It is built for roleplay that can feel playful, intimate, strange, comforting, or quietly revealing, while staying safe by design.
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
