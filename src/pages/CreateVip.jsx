import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Crown, FileText, FileUp, RefreshCcw, Sparkles } from "lucide-react";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const parseWorldbookDraft = ({ title = "", text = "" } = {}) => {
  const raw = `${text || ""}`.trim();
  if (!raw) return null;
  const inferredTitle =
    title.trim() ||
    raw
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() ||
    "Worldbook";
  const withoutTitle = raw.replace(/^#\s+.+(\r?\n)?/, "").trim();
  const paragraphs = withoutTitle
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const summary = paragraphs[0] ? `${paragraphs[0]}`.slice(0, 120) : "";
  return { title: inferredTitle, summary, paragraphs };
};

const PreviewImage = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-zinc-900 text-[11px] font-semibold text-zinc-500", className)}>
        No preview
      </div>
    );
  }
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc.includes("/images/create/") && currentSrc.includes(".jpg")) {
          const nextSrc = currentSrc.replace(/\.jpg(\?[^#]*)?$/, ".png$1");
          if (nextSrc !== currentSrc) {
            setCurrentSrc(nextSrc);
            return;
          }
        }
        setFailed(true);
      }}
      loading="lazy"
    />
  );
};

const OptionCard = ({ selected, title, previewSrc, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-[168px] shrink-0 overflow-hidden rounded-2xl border text-left transition duration-200 will-change-transform",
        selected
          ? "scale-[1.03] border-amber-300/70 bg-zinc-950 shadow-[0_10px_28px_-16px_rgba(253,230,138,0.35)]"
          : "border-white/10 bg-black/30 hover:scale-[1.01] hover:border-white/20 hover:bg-black/40",
      )}
    >
      <div className="aspect-square w-full overflow-hidden bg-black/40">
        <PreviewImage src={previewSrc} alt={title} className="h-full w-full object-contain opacity-95" />
      </div>
      <div className="px-3 py-2">
        <div className="truncate text-xs font-semibold text-white/90">{title}</div>
      </div>
    </button>
  );
};

const Carousel = ({ title, options, selectedKey, onSelect, previewCategory, previewPath }) => {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanPrev(el.scrollLeft > 2);
      setCanNext(el.scrollLeft < max - 2);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const randomPick = () => {
    if (!options.length) return;
    const pool = options.filter((o) => o.key !== selectedKey);
    const picked = (pool.length ? pool : options)[Math.floor(Math.random() * (pool.length ? pool.length : options.length))];
    if (picked?.key) onSelect(picked.key);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={randomPick}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white hover:bg-black/60"
          >
            <RefreshCcw className="h-4 w-4" />
            Random
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white hover:bg-black/60 disabled:opacity-40"
            aria-label="Prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white hover:bg-black/60 disabled:opacity-40"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-3">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {options.map((o) => (
            <div key={o.key} className="snap-start">
              <OptionCard
                title={o.label}
                selected={selectedKey === o.key}
                previewSrc={previewPath(previewCategory, o.key)}
                onClick={() => onSelect(o.key)}
              />
            </div>
          ))}
        </div>
        {canPrev ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/70 to-transparent" />
        ) : null}
        {canNext ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/70 to-transparent" />
        ) : null}
      </div>
    </div>
  );
};

const AgeSlider = ({ value, onChange, min = 19, max = 45 }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">Age</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-amber-200"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-white/55">
          <div>{min}</div>
          <div>{max}</div>
        </div>
      </div>
    </div>
  );
};

const defaultOptions = {
  race: [
    { key: "asian", label: "Asian" },
    { key: "white", label: "White" },
    { key: "black", label: "Black" },
    { key: "latina", label: "Latina" },
    { key: "middle-eastern", label: "Middle Eastern" },
  ],
  hairStyle: [
    { key: "short", label: "Short" },
    { key: "long", label: "Long" },
    { key: "long-wavy", label: "Long wavy" },
    { key: "short-wavy", label: "Short wavy" },
    { key: "bun", label: "Bun" },
    { key: "ponytail", label: "Ponytail" },
  ],
  hairColor: [
    { key: "black", label: "Black" },
    { key: "brown", label: "Brown" },
    { key: "blonde", label: "Blonde" },
    { key: "red", label: "Red" },
    { key: "silver", label: "Silver" },
  ],
  eyeColor: [
    { key: "brown", label: "Brown" },
    { key: "blue", label: "Blue" },
    { key: "green", label: "Green" },
    { key: "hazel", label: "Hazel" },
    { key: "gray", label: "Gray" },
  ],
  body: [
    { key: "slim", label: "Slim" },
    { key: "fit", label: "Fit" },
    { key: "balanced", label: "Balanced" },
    { key: "curvy", label: "Curvy" },
    { key: "plus-size", label: "Plus-size" },
  ],
  personality: [
    { key: "warm", label: "Warm" },
    { key: "calm", label: "Calm" },
    { key: "funny", label: "Funny" },
    { key: "confident", label: "Confident" },
    { key: "bold", label: "Bold" },
  ],
};

const steps = [
  { key: "outer-1", title: "Looks I" },
  { key: "outer-2", title: "Looks II" },
  { key: "outer-3", title: "Looks III" },
  { key: "inner", title: "Core" },
  { key: "prompt", title: "Prompt" },
  { key: "worldbook", title: "Worldbook" },
  { key: "result", title: "Result" },
];

export default function CreateVip() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const upsertCharacter = useAppStore((s) => s.upsertCharacter);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const openAuth = useUIStore((s) => s.openAuth);

  const isVipEnabled = subscription.status === "active";

  const [stepIndex, setStepIndex] = useState(0);
  const [assetVersion, setAssetVersion] = useState(() => Date.now().toString());

  const [race, setRace] = useState(defaultOptions.race[0].key);
  const [age, setAge] = useState(26);
  const [hairStyle, setHairStyle] = useState(defaultOptions.hairStyle[1].key);
  const [hairColor, setHairColor] = useState(defaultOptions.hairColor[0].key);
  const [eyeColor, setEyeColor] = useState(defaultOptions.eyeColor[0].key);
  const [body, setBody] = useState(defaultOptions.body[2].key);
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState(defaultOptions.personality[0].key);
  const [prompt, setPrompt] = useState("");
  const [pickedCandidate, setPickedCandidate] = useState(0);
  const [nameSeed, setNameSeed] = useState(() => Date.now().toString());
  const [promptExampleSeed, setPromptExampleSeed] = useState(() => Date.now().toString());
  const [worldbookMode, setWorldbookMode] = useState("write");
  const [worldbookTitle, setWorldbookTitle] = useState("");
  const [worldbookText, setWorldbookText] = useState("");
  const [worldbookFileName, setWorldbookFileName] = useState("");
  const [worldbookParsing, setWorldbookParsing] = useState(false);
  const worldbookFileRef = useRef(null);

  const step = steps[stepIndex];
  const progress = useMemo(() => Math.round(((stepIndex + 1) / steps.length) * 100), [stepIndex]);

  const previewPath = (category, key) => {
    if (category === "personality") {
      const cap = key ? `${key.slice(0, 1).toUpperCase()}${key.slice(1)}` : key;
      return `/images/create/options/personality/image_w1024_h1024_${cap}.png?v=${assetVersion}`;
    }
    return `/images/create/options/${category}/${key}.jpg?v=${assetVersion}`;
  };
  const nameSuggestions = useMemo(() => {
    const pool = [
      "Lina",
      "Mia",
      "Yuki",
      "Ava",
      "Nora",
      "Iris",
      "Kira",
      "Evelyn",
      "Sofia",
      "Aria",
      "Luna",
      "Jade",
      "Elena",
      "Nova",
      "Chloe",
      "Hazel",
      "Tessa",
      "Serena",
      "Ariel",
      "Aya",
    ];
    const picked = [];
    const used = new Set();
    while (picked.length < 6 && used.size < pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      if (used.has(idx)) continue;
      used.add(idx);
      picked.push(pool[idx]);
    }
    return picked;
  }, [nameSeed]);

  const promptExample = useMemo(() => {
    const examples = [
      "A calm, elegant vibe. Minimal jewelry. Soft light. Subtle smile. High-end fashion editorial style.",
      "A confident, slightly mischievous personality. Modern streetwear. Neon city night background. Cinematic contrast lighting.",
      "Warm and gentle. Cozy sweater. Daytime soft sunlight. Natural look, realistic skin texture, friendly eyes.",
      "Bold and charismatic. Luxury black & gold aesthetic. Dramatic cinematic light. Premium mood, high detail.",
      "Funny and playful. Bright colors. Clean studio background. Light-hearted expression, approachable and lively.",
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  }, [promptExampleSeed]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(steps.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const summary = useMemo(() => {
    const labelOf = (group, key) => defaultOptions[group].find((x) => x.key === key)?.label || key;
    return {
      Race: labelOf("race", race),
      Age: `${age}`,
      "Hair style": labelOf("hairStyle", hairStyle),
      "Hair color": labelOf("hairColor", hairColor),
      "Eye color": labelOf("eyeColor", eyeColor),
      "Body type": labelOf("body", body),
      Name: name.trim() || "-",
      Personality: labelOf("personality", personality),
    };
  }, [age, body, eyeColor, hairColor, hairStyle, name, personality, race]);

  const generated = useMemo(() => {
    const heroUrl = `/images/create/results/vip/candidate-1-hero.png?v=${assetVersion}`;
    const avatarUrl = `/images/create/results/vip/candidate-1-avatar.png?v=${assetVersion}`;
    return {
      heroUrl,
      avatarUrl,
      starter: "Hello. I was crafted for you—what should we create together next?",
      bio: `VIP-crafted. ${summary.Personality}. ${summary.Race}, ${age}.`,
      tags: ["VIP", summary.Personality, summary["Body type"]].filter(Boolean).slice(0, 6),
      age,
    };
  }, [age, assetVersion, summary]);

  const candidates = useMemo(() => {
    return Array.from({ length: 3 }, (_, idx) => {
      const n = idx + 1;
      return {
        heroUrl: `/images/create/results/vip/candidate-${n}-hero.png?v=${assetVersion}`,
        avatarUrl: `/images/create/results/vip/candidate-${n}-avatar.png?v=${assetVersion}`,
      };
    });
  }, [assetVersion]);

  const nextDisabled = useMemo(() => {
    if (step.key === "inner") return !name.trim();
    if (step.key === "prompt") return !prompt.trim();
    if (step.key === "worldbook") return worldbookParsing;
    return step.key === "result";
  }, [name, prompt, step.key, worldbookParsing]);

  const parsedWorldbook = useMemo(
    () => parseWorldbookDraft({ title: worldbookTitle, text: worldbookText }),
    [worldbookText, worldbookTitle],
  );

  const goToStep = (idx) => {
    if (idx === steps.length - 1) setAssetVersion(Date.now().toString());
    setStepIndex(idx);
  };

  const next = () => goToStep(Math.min(steps.length - 1, stepIndex + 1));
  const prev = () => goToStep(Math.max(0, stepIndex - 1));

  const regenerate = () => {
    setAssetVersion(Date.now().toString());
    setPickedCandidate(Math.floor(Math.random() * 3));
  };

  const createAgain = () => {
    setRace(defaultOptions.race[0].key);
    setAge(26);
    setHairStyle(defaultOptions.hairStyle[1].key);
    setHairColor(defaultOptions.hairColor[0].key);
    setEyeColor(defaultOptions.eyeColor[0].key);
    setBody(defaultOptions.body[2].key);
    setName("");
    setPersonality(defaultOptions.personality[0].key);
    setPrompt("");
    setPickedCandidate(0);
    setNameSeed(Date.now().toString());
    setPromptExampleSeed(Date.now().toString());
    setWorldbookMode("write");
    setWorldbookTitle("");
    setWorldbookText("");
    setWorldbookFileName("");
    setWorldbookParsing(false);
    setAssetVersion(Date.now().toString());
    setStepIndex(0);
  };

  const startChat = () => {
    const id = `vip-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const selected = candidates[pickedCandidate] || candidates[0] || generated;
    const wb = parsedWorldbook?.paragraphs?.length
      ? [{ id: "wb-user", title: parsedWorldbook.title, summary: parsedWorldbook.summary, paragraphs: parsedWorldbook.paragraphs }]
      : [];
    const character = {
      id,
      name: name.trim(),
      age: generated.age,
      bio: generated.bio,
      starter: generated.starter,
      avatarUrl: selected.avatarUrl,
      heroUrl: selected.heroUrl,
      tags: generated.tags,
      stats: { heat: 0, online: true },
      profile: { race, age, hairStyle, hairColor, eyeColor, body, personality, prompt, worldbooks: wb },
    };
    upsertCharacter(character);
    const conversationId = openConversationForCharacter(id);
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/chat/${conversationId}` });
      return;
    }
    navigate(`/chat/${conversationId}`);
  };

  if (!isVipEnabled) {
    return (
      <div className="h-full overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black p-6">
        <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center">
          <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-white">VIP creation</div>
                <div className="mt-1 text-sm text-white/60">Subscribe to unlock premium prompt-based generation.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/subscribe")}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 to-amber-400 px-4 py-3 text-sm font-semibold text-zinc-900 hover:from-amber-300 hover:to-amber-500"
            >
              Go to Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">
      {step.key !== "result" ? (
        <div className="shrink-0 border-b border-white/10 px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/20">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold text-white">VIP creation</div>
                    <div className="text-xs font-semibold text-white/50">· {step.title}</div>
                  </div>
                  <div className="mt-1 text-xs text-white/55">Generate 3 premium candidates at the end.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {steps.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => goToStep(i)}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition",
                        i === stepIndex
                          ? "bg-amber-200"
                          : i < stepIndex
                            ? "bg-amber-200/55"
                            : "bg-white/10 hover:bg-white/20",
                      )}
                      aria-label={`Go to ${s.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl items-center justify-center">
          {step.key !== "result" ? (
            <div className="w-full max-w-[980px]">
              <div className="space-y-4">
              {step.key === "outer-1" ? (
                <>
                  <Carousel
                    title="Race"
                    options={defaultOptions.race}
                    selectedKey={race}
                    onSelect={setRace}
                    previewCategory="race"
                    previewPath={previewPath}
                  />
                  <AgeSlider value={age} onChange={setAge} />
                </>
              ) : null}

              {step.key === "outer-2" ? (
                <>
                  <Carousel
                    title="Body type"
                    options={defaultOptions.body}
                    selectedKey={body}
                    onSelect={setBody}
                    previewCategory="body"
                    previewPath={previewPath}
                  />
                  <Carousel
                    title="Eye color"
                    options={defaultOptions.eyeColor}
                    selectedKey={eyeColor}
                    onSelect={setEyeColor}
                    previewCategory="eye-color"
                    previewPath={previewPath}
                  />
                </>
              ) : null}

              {step.key === "outer-3" ? (
                <>
                  <Carousel
                    title="Hair style"
                    options={defaultOptions.hairStyle}
                    selectedKey={hairStyle}
                    onSelect={setHairStyle}
                    previewCategory="hair-style"
                    previewPath={previewPath}
                  />
                  <Carousel
                    title="Hair color"
                    options={defaultOptions.hairColor}
                    selectedKey={hairColor}
                    onSelect={setHairColor}
                    previewCategory="hair-color"
                    previewPath={previewPath}
                  />
                </>
              ) : null}

              {step.key === "inner" ? (
                <>
                  <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">Name</div>
                      <button
                        type="button"
                        onClick={() => setNameSeed(Date.now().toString())}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white hover:bg-black/60"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Shuffle
                      </button>
                    </div>
                    <div className="mt-3 max-w-md space-y-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-amber-300/50"
                        placeholder="e.g. Lina"
                      />
                      <div className="flex flex-wrap gap-2">
                        {nameSuggestions.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setName(n)}
                            className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-black/60"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-white/55">This will be shown in chat and profile.</div>
                    </div>
                  </div>
                  <Carousel
                    title="Personality"
                    options={defaultOptions.personality}
                    selectedKey={personality}
                    onSelect={setPersonality}
                    previewCategory="personality"
                    previewPath={previewPath}
                  />
                </>
              ) : null}

              {step.key === "prompt" ? (
                <>
                  <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
                    <div className="text-sm font-semibold text-white">Prompt</div>
                    <div className="mt-3 space-y-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-40 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
                        placeholder="Describe the vibe, style, details…"
                      />
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold text-white/80">Example prompt</div>
                          <button
                            type="button"
                            onClick={() => setPromptExampleSeed(Date.now().toString())}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white hover:bg-black/60"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Shuffle
                          </button>
                        </div>
                        <div className="mt-2 text-sm text-white/80">{promptExample}</div>
                        <button
                          type="button"
                          onClick={() => setPrompt(promptExample)}
                          className="mt-3 inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-200 to-amber-400 px-4 py-2 text-xs font-semibold text-zinc-900 hover:from-amber-300 hover:to-amber-500"
                        >
                          Use this example
                        </button>
                      </div>
                      <div className="text-xs text-white/55">Your prompt will be combined with the guided attributes.</div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-300/10 via-black/30 to-black/40 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/20">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">VIP perk</div>
                        <div className="mt-1 text-xs text-white/60">At the end you will get 3 candidates to pick from.</div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white/75">
                      Use the prompt to shape the story, personality details, style, and subtle features.
                    </div>
                  </div>
                </>
              ) : null}
              {step.key === "worldbook" ? (
                <>
                  <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">Worldbook</div>
                      <div className="flex items-center gap-2">
                        {[
                          { key: "write", label: "Write" },
                          { key: "upload", label: "Upload file" },
                        ].map((x) => (
                          <button
                            key={x.key}
                            type="button"
                            onClick={() => setWorldbookMode(x.key)}
                            className={cn(
                              "rounded-2xl px-3 py-2 text-xs font-semibold transition",
                              worldbookMode === x.key
                                ? "bg-white/15 text-white"
                                : "border border-white/10 bg-black/30 text-white/70 hover:bg-black/45 hover:text-white",
                            )}
                          >
                            {x.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-white/70">Title</div>
                          <input
                            value={worldbookTitle}
                            onChange={(e) => setWorldbookTitle(e.target.value)}
                            className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-amber-300/50"
                            placeholder="e.g. Travel English Playbook"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-semibold text-white/70">Content</div>
                            <div className="text-[11px] font-semibold text-white/50">
                              {worldbookText.trim() ? `${worldbookText.trim().length.toLocaleString()} chars` : "Optional"}
                            </div>
                          </div>
                          <textarea
                            value={worldbookText}
                            onChange={(e) => setWorldbookText(e.target.value)}
                            className="min-h-52 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
                            placeholder={
                              worldbookMode === "upload"
                                ? "Upload a file to auto-fill, then refine it here."
                                : "Write your worldbook here. Separate paragraphs with blank lines. You can start with “# Title”."
                            }
                          />
                        </div>
                        {worldbookMode === "upload" ? (
                          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                            <input
                              ref={worldbookFileRef}
                              type="file"
                              accept=".txt,.md,.json,text/plain,application/json"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;
                                setWorldbookParsing(true);
                                setWorldbookFileName(file.name || "");
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const raw = typeof reader.result === "string" ? reader.result : "";
                                  window.setTimeout(() => {
                                    setWorldbookText(raw);
                                    const parsed = parseWorldbookDraft({ title: worldbookTitle, text: raw });
                                    if (parsed && !worldbookTitle.trim()) setWorldbookTitle(parsed.title);
                                    setWorldbookParsing(false);
                                  }, 650);
                                };
                                reader.onerror = () => {
                                  setWorldbookParsing(false);
                                };
                                reader.readAsText(file);
                              }}
                            />
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                                  <FileText className="h-4 w-4" />
                                  <div className="truncate">
                                    {worldbookFileName ? worldbookFileName : "Upload a worldbook file (.txt / .md / .json)"}
                                  </div>
                                </div>
                                <div className="mt-1 text-[11px] font-semibold text-white/50">
                                  {worldbookParsing ? "Parsing…" : worldbookFileName ? "Parsed. You can edit the content above." : "We’ll extract text and build a preview."}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => worldbookFileRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white hover:bg-black/55"
                              >
                                <FileUp className="h-4 w-4" />
                                Upload
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="text-xs text-white/55">
                          Add your tutor’s teaching rules, role-play settings, and “do / don’t” guidelines. You can always refine it later.
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold text-white/80">Preview</div>
                          {parsedWorldbook?.paragraphs?.length ? (
                            <div className="text-[11px] font-semibold text-white/50">
                              {parsedWorldbook.paragraphs.length} sections
                            </div>
                          ) : (
                            <div className="text-[11px] font-semibold text-white/50">Empty</div>
                          )}
                        </div>
                        {parsedWorldbook?.paragraphs?.length ? (
                          <div className="mt-3 space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                              <div className="text-sm font-semibold text-white">{parsedWorldbook.title}</div>
                              {parsedWorldbook.summary ? (
                                <div className="mt-2 text-sm leading-relaxed text-white/70">{parsedWorldbook.summary}</div>
                              ) : null}
                            </div>
                            <div className="space-y-2">
                              {parsedWorldbook.paragraphs.slice(0, 3).map((p) => (
                                <div key={p} className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/70">
                                  {p}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/60">
                            Add content to see a structured preview.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[980px]">
              <div className="grid w-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-black/35">
                  <div className="p-5">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">{name.trim() || "Character"}</div>
                      <div className="mt-0.5 text-xs text-white/55">{generated.age} years</div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {candidates.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPickedCandidate(idx)}
                          className={cn(
                            "overflow-hidden rounded-3xl border bg-black/40 text-left",
                            idx === pickedCandidate ? "border-amber-200/60" : "border-white/10 hover:border-white/20",
                          )}
                        >
                          <div className="mx-auto w-full max-w-[220px]">
                            <div className="aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black">
                              <img
                                src={c.heroUrl}
                                alt={`Candidate ${idx + 1}`}
                                className="h-full w-full object-cover opacity-95"
                                style={{ maxHeight: "44dvh" }}
                              />
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            <div className="text-xs font-semibold text-white/90">Candidate {idx + 1}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-black/35">
                  <div className="border-b border-white/10 px-5 py-4">
                    <div className="text-sm font-semibold text-white">Your choices</div>
                  </div>
                  <div className="min-h-0 overflow-auto px-5 py-4">
                    <div className="space-y-2">
                      {Object.entries(summary).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 px-3 py-2">
                          <div className="text-xs font-semibold text-white/55">{k}</div>
                          <div className="truncate text-xs font-semibold text-white">{v}</div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 px-3 py-2">
                        <div className="text-xs font-semibold text-white/55">Prompt</div>
                        <div className="truncate text-xs font-semibold text-white">{prompt.trim()}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 px-3 py-2">
                        <div className="text-xs font-semibold text-white/55">Worldbook</div>
                        <div className="truncate text-xs font-semibold text-white">{parsedWorldbook?.title || "-"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 px-5 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={startChat}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-amber-400 px-4 py-3 text-sm font-semibold text-zinc-900 hover:from-amber-300 hover:to-amber-500"
                      >
                        <Sparkles className="h-4 w-4" />
                        Start Chat
                      </button>
                      <button
                        type="button"
                        onClick={createAgain}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white hover:bg-black/60"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Create Again
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-white/55">
                      <Crown className="h-3.5 w-3.5 text-amber-200/80" />
                      VIP crafted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {step.key !== "result" ? (
        <div className="shrink-0 border-t border-white/10 px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (stepIndex === 0 ? navigate("/create") : prev())}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-white hover:bg-black/60"
              >
                <ChevronLeft className="h-4 w-4" />
                {stepIndex === 0 ? "Change mode" : "Back"}
              </button>
              <div className="text-xs font-semibold text-white/55">
                {stepIndex + 1} / {steps.length}
              </div>
              <button
                type="button"
                onClick={next}
                disabled={nextDisabled}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-amber-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:from-amber-300 hover:to-amber-500 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
