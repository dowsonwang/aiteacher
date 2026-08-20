import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeFooter from "../components/HomeFooter.jsx";
import ImmersiveCharacterCard from "../components/ImmersiveCharacterCard.jsx";
import LiveStreamCard from "../components/LiveStreamCard.jsx";
import OnboardingTour from "../components/OnboardingTour.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { ChevronDown, Compass, Film, Wand2 } from "lucide-react";
import { getCharacterCategoryFromPath } from "../lib/characterCategories.js";
import { cn } from "../lib/utils.js";
import { liveHosts, shortDramas } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";

const categoryContent = {
  all: {
    title: "Some characters are stories. Some are mirrors.",
    description:
      "Create AI characters, discover new personas, watch Micro-Dramas, and let them unfold into digital selves of their own. Chat, roleplay, follow their worlds, and see what parts of you answer back.",
    faqSubtitle: "Common questions about learning with AI Language Coach.",
    faqItems: [
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
    seoTitle: "Where roleplay stays imaginative, expressive, and safe.",
    seoBody:
      "Heartbits is a SFW AI chat platform for character-led stories with emotional depth. It is built for roleplay that can feel playful, intimate, strange, comforting, or quietly revealing, while staying safe by design.",
  },
  female: {
    title: "Meet female AI characters with personality and presence.",
    description:
      "Browse realistic female characters created for conversation, roleplay, and character-led stories. Each card opens directly into a chat with a distinct persona.",
    faqSubtitle: "Common questions about female AI characters.",
    faqItems: [
      {
        q: "What can I do with a female AI character?",
        a: "Start a chat, explore her personality, and build a roleplay thread around everyday moments, stories, or emotional support.",
      },
      {
        q: "Are the characters realistic?",
        a: "Yes. This category focuses on realistic female character portraits and grounded persona descriptions.",
      },
      {
        q: "How do I start chatting?",
        a: "Click any character card to open her chat page. Some actions may require you to sign in first.",
      },
      {
        q: "Can I switch to another category?",
        a: "Use the category tabs at the top of the page to move between All, Female, Male, and Anime characters.",
      },
    ],
    seoTitle: "A dedicated destination for female AI characters.",
    seoBody:
      "Explore female AI characters with distinct looks, personalities, and conversation styles. This category page brings realistic female personas together in one focused browsing experience.",
  },
  male: {
    title: "Meet male AI characters built for conversation and story.",
    description:
      "Discover realistic male characters with different moods, backgrounds, and chat styles. Open a card to begin a conversation or follow a character-driven story.",
    faqSubtitle: "Common questions about male AI characters.",
    faqItems: [
      {
        q: "What can I do with a male AI character?",
        a: "Open a chat, explore his persona, and shape a conversation around companionship, storytelling, advice, or roleplay.",
      },
      {
        q: "Are the characters realistic?",
        a: "Yes. This category focuses on realistic male character portraits and persona-led interactions.",
      },
      {
        q: "How do I start chatting?",
        a: "Click any character card to enter the chat page. Sign in may be required for actions that save data to your account.",
      },
      {
        q: "Can I browse every character type?",
        a: "Yes. Select All in the top tabs to return to the mixed character homepage.",
      },
    ],
    seoTitle: "A focused destination for male AI characters.",
    seoBody:
      "Browse male AI characters with realistic portraits and distinct personalities. This category page is designed for users who want to discover male personas and start character-led chats quickly.",
  },
  anime: {
    title: "Meet anime AI characters with expressive worlds and style.",
    description:
      "Browse anime-inspired AI characters with illustrated portraits, vivid personalities, and the same chat interactions as realistic characters. Anime cards do not display age.",
    faqSubtitle: "Common questions about anime AI characters.",
    faqItems: [
      {
        q: "What is the Anime category?",
        a: "Anime is a dedicated category for illustrated, anime-inspired AI characters with stylized portraits and character-driven conversations.",
      },
      {
        q: "Do anime characters work like realistic characters?",
        a: "Yes. Anime character cards use the same layout and chat behavior as realistic character cards.",
      },
      {
        q: "When do anime cards show age?",
        a: "Age is shown only when the character has age data. Characters without age data keep a clean, stylized card.",
      },
      {
        q: "How do I start chatting with an anime character?",
        a: "Click any anime character card to open the chat page and begin the conversation.",
      },
    ],
    seoTitle: "A dedicated destination for anime AI characters.",
    seoBody:
      "Discover anime AI characters with expressive illustrated portraits and distinct personalities. This category page collects anime-inspired personas in one place for browsing, roleplay, and chat.",
  },
};

const normalizeCharacterKind = (character) =>
  character?.kind === "male" || character?.kind === "anime" ? character.kind : "female";

const mixCharactersByKind = (items) => {
  const groups = { female: [], male: [], anime: [] };
  items.forEach((item) => groups[normalizeCharacterKind(item)].push(item));
  const mixed = [];
  let index = 0;
  while (mixed.length < items.length) {
    ["female", "male", "anime"].forEach((kind) => {
      if (groups[kind][index]) mixed.push(groups[kind][index]);
    });
    index += 1;
  }
  return mixed;
};

export default function BrowseHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const activeCategory = getCharacterCategoryFromPath(location.pathname) || "all";
  const isAllCategory = activeCategory === "all";
  const content = categoryContent[activeCategory] || categoryContent.all;
  const assetVersion = useMemo(() => Date.now().toString(), []);
  const liveCoverSrc = `/images/home/live-cover.png?v=${assetVersion}`;
  const t2i = (prompt, imageSize) =>
    `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
  const getShortsCoverSrc = (i) => {
    const sources = [
      "/images/create/fixed-portrait.png",
      "/images/create/results/standard/hero-1.png",
      "/images/create/results/vip/candidate-1-hero.png",
      "/images/create/fixed-portrait-2.png",
    ];
    const src = sources[i % sources.length];
    return `${src}?v=${assetVersion}`;
  };
  const onStartChat = (characterId) => {
    const conversationId = openConversationForCharacter(characterId);
    navigate(`/chat/${conversationId}`);
  };

  const characters = getAllCharacters();
  const displayCharacters = useMemo(() => {
    const created = characters.filter((c) => `${c.id}`.startsWith("u_"));
    const seeds = characters.filter((c) => !`${c.id}`.startsWith("u_"));
    const ordered = [...created, ...seeds];
    if (isAllCategory) return mixCharactersByKind(ordered);
    return ordered.filter((character) => normalizeCharacterKind(character) === activeCategory);
  }, [activeCategory, characters, isAllCategory]);
  const [faqOpen, setFaqOpen] = useState(() => new Set([0]));
  const cardCount = 10;
  const showLive = false;
  const shortsVideoSrcForIndex = (i) => `/videos/feed/feed-0${(i % 4) + 1}.mp4?v=${assetVersion}`;
  const heroLinks = useMemo(
    () => [
      {
        label: "Micro-Dramas",
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
  const firstCharacterRef = useRef(null);
  const [categoryTabsTarget, setCategoryTabsTarget] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    setCategoryTabsTarget(document.getElementById("home-category-tabs"));
  }, [location.pathname]);

  useEffect(() => {
    setFaqOpen(new Set([0]));
  }, [activeCategory]);

  useEffect(() => {
    if (!isAllCategory) {
      setTourOpen(false);
      return;
    }
    setTourStep(0);
    setTourOpen(true);
  }, [isAllCategory]);

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
      title: "Micro-Dramas",
      body: "进入 Micro-Dramas，浏览平台精选短剧内容，快速开始观看。",
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
      title: "Crowdsourced Micro-Dramas",
      body: "这里展示当前推荐的短剧内容。你可以横向浏览卡片，并点击进入播放页。",
    },
    {
      key: "home-character-filter",
      target: categoryTabsTarget,
      title: "Character categories",
      body: "使用顶部分类 Tab 切换 All / Female / Male / Anime 人物。",
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

      {isAllCategory ? (
        <section className="grid grid-cols-1 gap-6 lg:h-[420px] lg:min-h-[380px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
          <div className="flex h-full flex-col gap-5">
            <div className="px-1 pt-1">
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-[34px]">{content.title}</div>
              <div className="mt-3 max-w-[560px] text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
                {content.description}
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
              <div className="text-base font-semibold text-zinc-900">Crowdsourced Micro-Dramas</div>
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
      ) : (
        <section className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-rose-50/60" />
          <div className="relative max-w-3xl">
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-[36px]">{content.title}</div>
            <div className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">{content.description}</div>
          </div>
        </section>
      )}

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
          <div className="text-base font-semibold text-zinc-900">Characters</div>
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
              <div className="mt-1 text-sm text-zinc-600">{content.faqSubtitle}</div>
            </div>
            <div className="divide-y divide-zinc-200">
              {content.faqItems.map((item, idx) => {
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
            <div className="text-sm font-semibold text-zinc-900">{content.seoTitle}</div>
            <div className="mt-2 text-zinc-600">{content.seoBody}</div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
