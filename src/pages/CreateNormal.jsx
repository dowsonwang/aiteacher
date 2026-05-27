import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCcw, Sparkles } from "lucide-react";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const PreviewImage = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-zinc-100 text-[11px] font-semibold text-zinc-500", className)}>
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
        "group w-[168px] shrink-0 overflow-hidden rounded-2xl border bg-white text-left transition duration-200 will-change-transform",
        selected
          ? "scale-[1.03] border-zinc-900 shadow-[0_10px_28px_-16px_rgba(0,0,0,0.35)]"
          : "border-zinc-200 hover:scale-[1.01] hover:border-zinc-300 hover:shadow-sm",
      )}
    >
      <div className="aspect-square w-full overflow-hidden bg-zinc-100">
        <PreviewImage src={previewSrc} alt={title} className="h-full w-full object-contain" />
      </div>
      <div className="px-3 py-2">
        <div className="truncate text-xs font-semibold text-zinc-900">{title}</div>
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
    <div className="rounded-3xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={randomPick}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Random
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            aria-label="Prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
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
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
        ) : null}
        {canNext ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
        ) : null}
      </div>
    </div>
  );
};

const AgeSlider = ({ value, onChange, min = 19, max = 45 }) => {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-900">Age</div>
        <div className="text-sm font-semibold text-zinc-900">{value}</div>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-zinc-900"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
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
  { key: "result", title: "Result" },
];

export default function CreateNormal() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const upsertCharacter = useAppStore((s) => s.upsertCharacter);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const openAuth = useUIStore((s) => s.openAuth);

  const [stepIndex, setStepIndex] = useState(0);
  const [assetVersion, setAssetVersion] = useState(() => Date.now().toString());
  const [resultVariant, setResultVariant] = useState(1);

  const [race, setRace] = useState(defaultOptions.race[0].key);
  const [age, setAge] = useState(26);
  const [hairStyle, setHairStyle] = useState(defaultOptions.hairStyle[1].key);
  const [hairColor, setHairColor] = useState(defaultOptions.hairColor[0].key);
  const [eyeColor, setEyeColor] = useState(defaultOptions.eyeColor[0].key);
  const [body, setBody] = useState(defaultOptions.body[2].key);
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState(defaultOptions.personality[0].key);
  const [nameSeed, setNameSeed] = useState(() => Date.now().toString());

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
    const v = resultVariant;
    const heroUrl = `/images/create/results/standard/hero-${v}.png?v=${assetVersion}`;
    const avatarUrl = `/images/create/results/standard/avatar-${v}.png?v=${assetVersion}`;
    return {
      heroUrl,
      avatarUrl,
      starter: "Hi—want to talk about something fun, or something real today?",
      bio: `A ${summary.Personality.toLowerCase()} personality. ${summary.Race}, ${age}.`,
      tags: [summary.Personality, summary["Body type"], summary["Hair style"]].filter(Boolean).slice(0, 6),
      age,
    };
  }, [age, assetVersion, resultVariant, summary]);

  const nextDisabled = useMemo(() => {
    if (step.key === "inner") return !name.trim();
    return step.key === "result";
  }, [name, step.key]);

  const goToStep = (idx) => {
    if (idx === steps.length - 1) {
      setResultVariant(Math.floor(Math.random() * 3) + 1);
      setAssetVersion(Date.now().toString());
    }
    setStepIndex(idx);
  };

  const next = () => goToStep(Math.min(steps.length - 1, stepIndex + 1));
  const prev = () => goToStep(Math.max(0, stepIndex - 1));

  const createAgain = () => {
    setRace(defaultOptions.race[0].key);
    setAge(26);
    setHairStyle(defaultOptions.hairStyle[1].key);
    setHairColor(defaultOptions.hairColor[0].key);
    setEyeColor(defaultOptions.eyeColor[0].key);
    setBody(defaultOptions.body[2].key);
    setName("");
    setPersonality(defaultOptions.personality[0].key);
    setNameSeed(Date.now().toString());
    setResultVariant(1);
    setAssetVersion(Date.now().toString());
    setStepIndex(0);
  };

  const startChat = () => {
    const id = `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const character = {
      id,
      name: name.trim(),
      age: generated.age,
      bio: generated.bio,
      starter: generated.starter,
      avatarUrl: generated.avatarUrl,
      heroUrl: generated.heroUrl,
      tags: generated.tags,
      stats: { heat: 0, online: true },
      profile: { race, age, hairStyle, hairColor, eyeColor, body, personality },
    };
    upsertCharacter(character);
    const conversationId = openConversationForCharacter(id);
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/chat/${conversationId}` });
      return;
    }
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-50">
      {step.key !== "result" ? (
        <div className="shrink-0 border-b border-zinc-200 bg-white px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold text-zinc-900">Standard creation</div>
                  <div className="text-xs font-semibold text-zinc-500">· {step.title}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">Use ← → to navigate. Pick options by swiping.</div>
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
                        i === stepIndex ? "bg-zinc-900" : i < stepIndex ? "bg-zinc-500" : "bg-zinc-200 hover:bg-zinc-300",
                      )}
                      aria-label={`Go to ${s.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 transition-all"
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
                  <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-900">Name</div>
                      <button
                        type="button"
                        onClick={() => setNameSeed(Date.now().toString())}
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Shuffle
                      </button>
                    </div>
                    <div className="mt-3 max-w-md space-y-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                        placeholder="e.g. Lina"
                      />
                      <div className="flex flex-wrap gap-2">
                        {nameSuggestions.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setName(n)}
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-500">This will be shown in chat and profile.</div>
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
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[980px]">
              <div className="grid w-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-h-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
                  <div className="p-5">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-zinc-900">{name.trim() || "Character"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">{generated.age} years</div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-3xl bg-zinc-100">
                      <div className="mx-auto w-full max-w-[340px]">
                        <div className="aspect-[9/16] w-full overflow-hidden rounded-3xl bg-zinc-100">
                          <img
                            src={generated.heroUrl}
                            alt={name || "Character"}
                            className="h-full w-full object-cover"
                            style={{ maxHeight: "62dvh" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 px-5 py-4">
                    <div className="text-sm font-semibold text-zinc-900">Your choices</div>
                  </div>
                  <div className="min-h-0 overflow-auto px-5 py-4">
                    <div className="space-y-2">
                      {Object.entries(summary).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-3 py-2">
                          <div className="text-xs font-semibold text-zinc-600">{k}</div>
                          <div className="truncate text-xs font-semibold text-zinc-900">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-zinc-200 px-5 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={startChat}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                      >
                        <Sparkles className="h-4 w-4" />
                        Start Chat
                      </button>
                      <button
                        type="button"
                        onClick={createAgain}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Create Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {step.key !== "result" ? (
        <div className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (stepIndex === 0 ? navigate("/create") : prev())}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {stepIndex === 0 ? "Change mode" : "Back"}
              </button>
              <div className="text-xs font-semibold text-zinc-500">
                {stepIndex + 1} / {steps.length}
              </div>
              <button
                type="button"
                onClick={next}
                disabled={nextDisabled}
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
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
