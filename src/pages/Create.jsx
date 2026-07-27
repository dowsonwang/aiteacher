import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Globe2, Image as ImageIcon, Lock, RefreshCw, Sparkles, X } from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import Modal from "../components/Modal.jsx";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const imageUrl = (prompt, image_size = "portrait_16_9") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${image_size}`;

const heroBackgroundUrl = imageUrl(
  "immersive cinematic collage of diverse attractive ai characters, premium character creator landing page, soft neon lights, elegant luxury atmosphere, layered portraits, realistic, no text, no watermark",
  "landscape_16_9",
);

const fixedPortraitUrls = ["/images/create/fixed-portrait.png", "/images/create/fixed-portrait-2.png"];
const recordFallbackUrl = "/images/chat/ai-reply-01.png";
const optionLabel = (options, value) => options.find((o) => o.value === value)?.label || value;

const APPEARANCE_OPTIONS = {
  gender: [
    { value: "Male", label: "男" },
    { value: "Female", label: "女" },
  ],
  race: [
    { value: "east-asian", label: "East Asian" },
    { value: "south-asian", label: "South Asian" },
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "latino", label: "Latino" },
  ],
  body: [
    { value: "slim", label: "Slim" },
    { value: "athletic", label: "Athletic" },
    { value: "curvy", label: "Curvy" },
    { value: "petite", label: "Petite" },
    { value: "tall", label: "Tall" },
  ],
  eye: [
    { value: "brown", label: "Brown" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "gray", label: "Gray" },
    { value: "hazel", label: "Hazel" },
  ],
  hairStyle: [
    { value: "short", label: "Short" },
    { value: "long", label: "Long" },
    { value: "curly", label: "Curly" },
    { value: "straight", label: "Straight" },
    { value: "wavy", label: "Wavy" },
  ],
  hairColor: [
    { value: "black", label: "Black" },
    { value: "brown", label: "Brown" },
    { value: "blonde", label: "Blonde" },
    { value: "red", label: "Red" },
    { value: "silver", label: "Silver" },
  ],
  countries: ["USA", "Japan", "Korea", "France", "Canada", "Germany", "UK"],
  nameSuggestions: ["Luna", "Nova", "Mina", "Ava", "Sofia", "Kai", "Leo", "Ethan", "Nora", "Maya"],
  personalitySuggestions: [
    "Warm",
    "Gentle",
    "Caring",
    "Supportive",
    "Patient",
    "Calm",
    "Thoughtful",
    "Kind",
    "Sweet",
    "Soft-spoken",
    "Cheerful",
    "Playful",
    "Funny",
    "Witty",
    "Humorous",
    "Energetic",
    "Lively",
    "Optimistic",
    "Curious",
    "Adventurous",
    "Confident",
    "Bold",
    "Brave",
    "Independent",
    "Ambitious",
    "Reliable",
    "Loyal",
    "Honest",
    "Sincere",
    "Mature",
    "Elegant",
    "Graceful",
    "Romantic",
    "Flirty",
    "Charming",
    "Mysterious",
    "Dreamy",
    "Artistic",
    "Creative",
    "Intellectual",
    "Smart",
    "Rational",
    "Focused",
    "Disciplined",
    "Organized",
    "Easygoing",
    "Relaxed",
    "Shy",
    "Reserved",
    "Sensitive",
  ],
};

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const pickRandomMany = (list, count) => {
  const pool = list.slice();
  const result = [];
  const total = Math.min(count, pool.length);
  for (let i = 0; i < total; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
};

const buildRandomAppearance = () => ({
  gender: pickRandom(APPEARANCE_OPTIONS.gender).value,
  race: pickRandom(APPEARANCE_OPTIONS.race).value,
  bodyChoice: pickRandom(APPEARANCE_OPTIONS.body).value,
  bodyCustom: "",
  eyeChoice: pickRandom(APPEARANCE_OPTIONS.eye).value,
  eyeCustom: "",
  hairStyleChoice: pickRandom(APPEARANCE_OPTIONS.hairStyle).value,
  hairStyleCustom: "",
  hairColorChoice: pickRandom(APPEARANCE_OPTIONS.hairColor).value,
  hairColorCustom: "",
  name: pickRandom(APPEARANCE_OPTIONS.nameSuggestions),
  country: pickRandom(APPEARANCE_OPTIONS.countries),
  age: String(18 + Math.floor(Math.random() * 25)),
  personality: pickRandomMany(APPEARANCE_OPTIONS.personalitySuggestions, 3),
});

const getRecordProgressLabel = () => "已完成";

const buildPortraitPrompt = (appearance, seed = "") => {
  const body = appearance.bodyCustom || appearance.bodyChoice;
  const eyes = appearance.eyeCustom || appearance.eyeChoice;
  const hairStyle = appearance.hairStyleCustom || appearance.hairStyleChoice;
  const hairColor = appearance.hairColorCustom || appearance.hairColorChoice;
  const parts = [
    "ultra realistic portrait photo, high detail, cinematic lighting, sharp focus",
    appearance.gender ? `${appearance.gender} adult` : "",
    appearance.race ? `${appearance.race} ethnicity` : "",
    body ? `body type: ${body}` : "",
    eyes ? `eye color: ${eyes}` : "",
    hairStyle ? `hair style: ${hairStyle}` : "",
    hairColor ? `hair color: ${hairColor}` : "",
    "wearing casual clothing, t-shirt, covered shoulders, no nudity",
    "neutral background, studio portrait, head and shoulders, no text, no watermark",
    seed ? `seed:${seed}` : "",
  ].filter(Boolean);
  return parts.join(", ");
};

const generateTexts = (appearance, characterIdea) => {
  const name = `${appearance.name || "Character"}`.trim() || "Character";
  const personality = (Array.isArray(appearance.personality) ? appearance.personality : []).slice(0, 3).join(", ");
  const country = appearance.country || "your country";
  const idea = `${characterIdea || ""}`.trim() || "Build a natural relationship and conversation style based on the character’s identity and personality.";
  const relation = `You are chatting with ${name} as a close companion shaped by this character concept: ${idea}`;
  const scenario = `A private conversation set in ${country}, guided by this concept: ${idea}${personality ? ` The tone reflects ${personality}.` : ""}`;
  const firstMessage = `*${name} looks up, ready to embody the personality you imagined.* Hi, I'm ${name}. ${idea}`;
  const example = [
    `User: Tell me what makes you different.`,
    `${name}: *${name} responds with a thoughtful expression.* ${idea} That's the side of me you'll notice whenever we talk.`,
    `User: How would you spend time with me?`,
    `${name}: I'd follow the kind of relationship and atmosphere you imagined for us. *${name} smiles softly.* We can let every conversation grow from there.`,
  ].join("\n");
  return { relation, scenario, firstMessage, example };
};

export default function Create() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const session = useAppStore((s) => s.session);
  const diamonds = useAppStore((s) => s.diamonds);
  const spendDiamonds = useAppStore((s) => s.spendDiamonds);
  const startCharacterCreation = useAppStore((s) => s.startCharacterCreation);
  const updateCharacterCreation = useAppStore((s) => s.updateCharacterCreation);
  const completeCharacterCreation = useAppStore((s) => s.completeCharacterCreation);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const characterCreations = useAppStore((s) => s.characterCreations);
  const createdCharacters = useAppStore((s) => s.createdCharacters);
  const deleteCharacterCreation = useAppStore((s) => s.deleteCharacterCreation);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);

  const openAuth = useUIStore((s) => s.openAuth);
  const openDiamondUpsell = useUIStore((s) => s.openDiamondUpsell);

  const draftId = searchParams.get("draft") || "";
  const record = useMemo(
    () => (Array.isArray(characterCreations) ? characterCreations.find((r) => r.id === draftId) : null),
    [characterCreations, draftId],
  );

  const myRecords = useMemo(() => {
    const list = Array.isArray(characterCreations) ? characterCreations : [];
    const ownerKey = session?.accountKey;
    return list
      .filter((r) => (ownerKey ? r.ownerKey === ownerKey : true))
      .filter((r) => Boolean(r?.characterId))
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [characterCreations, session?.accountKey]);
  const pendingDraft = useMemo(() => {
    const ownerKey = session?.accountKey;
    if (!ownerKey) return null;
    return (Array.isArray(characterCreations) ? characterCreations : [])
      .filter((r) => r?.ownerKey === ownerKey && !r?.characterId)
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
  }, [characterCreations, session?.accountKey]);

  const sampleCards = useMemo(() => getAllCharacters().slice(0, 10), [getAllCharacters]);
  const completedCreations = useMemo(() => {
    const ownerKey = session?.accountKey;
    const list = Array.isArray(createdCharacters) ? createdCharacters : [];
    return list.filter((item) => (ownerKey ? item?.ownerKey === ownerKey : false));
  }, [createdCharacters, session?.accountKey]);
  const hasFreeCreation = completedCreations.length === 0;

  const options = APPEARANCE_OPTIONS;

  const [toast, setToast] = useState(null);
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [bodyChoice, setBodyChoice] = useState("");
  const [bodyCustom, setBodyCustom] = useState("");
  const [eyeChoice, setEyeChoice] = useState("");
  const [eyeCustom, setEyeCustom] = useState("");
  const [hairStyleChoice, setHairStyleChoice] = useState("");
  const [hairStyleCustom, setHairStyleCustom] = useState("");
  const [hairColorChoice, setHairColorChoice] = useState("");
  const [hairColorCustom, setHairColorCustom] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [personality, setPersonality] = useState([]);
  const [personalityPage, setPersonalityPage] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [characterIdea, setCharacterIdea] = useState("");
  const [texts, setTexts] = useState({ relation: "", scenario: "", firstMessage: "", example: "" });
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const [manualLeaveIntent, setManualLeaveIntent] = useState("");
  const skipAutoResumeRef = useRef(false);
  const [openGroup, setOpenGroup] = useState("gender");
  const [promptText, setPromptText] = useState("");
  const randomizedDraftRef = useRef("");

  useEffect(() => {
    if (!record) return;
    let a = record.appearance || {};
    const isFreshDraft =
      (record.status === "gender" || record.status === "appearance") &&
      !record.portraitUrl &&
      !a.gender &&
      !a.name;
    if (isFreshDraft && randomizedDraftRef.current !== record.id) {
      a = buildRandomAppearance();
      randomizedDraftRef.current = record.id;
      updateCharacterCreation(record.id, { appearance: a, status: "appearance" });
    }
    setGender(a.gender || "");
    setRace(a.race || "");
    setBodyChoice(a.bodyChoice || "");
    setBodyCustom(a.bodyCustom || "");
    setEyeChoice(a.eyeChoice || "");
    setEyeCustom(a.eyeCustom || "");
    setHairStyleChoice(a.hairStyleChoice || "");
    setHairStyleCustom(a.hairStyleCustom || "");
    setHairColorChoice(a.hairColorChoice || "");
    setHairColorCustom(a.hairColorCustom || "");
    setName(a.name || "");
    setCountry(a.country || "");
    setAge(a.age !== undefined && a.age !== null && `${a.age}` !== "" ? `${a.age}` : "");
    setPersonality(Array.isArray(a.personality) ? a.personality : []);
    setCharacterIdea(record.characterIdea || "");
    setTexts(record.texts || { relation: "", scenario: "", firstMessage: "", example: "" });
    setIsPublic(record.isPublic === undefined ? true : Boolean(record.isPublic));
    setPromptText(record.portraitPrompt || "");
    setOpenGroup("gender");
  }, [record?.id]);

  const majorStep = useMemo(() => {
    if (!record) return 0;
    if (record.status === "gender" || record.status === "appearance" || record.status === "portrait") return 1;
    if (record.status === "description" || record.status === "text") return 2;
    if (record.status === "video") return 2;
    if (record.status === "completed") return 2;
    return 1;
  }, [record?.status]);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2200);
  };

  const shouldPromptLeave = Boolean(draftId && record && !record.characterId);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldPromptLeave && nextLocation.pathname !== currentLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") setLeavePromptOpen(true);
  }, [blocker.state]);

  useEffect(() => {
    if (!shouldPromptLeave) setLeavePromptOpen(false);
  }, [shouldPromptLeave]);

  useEffect(() => {
    if (!shouldPromptLeave) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [shouldPromptLeave]);

  const exitDraft = () => {
    skipAutoResumeRef.current = true;
    setSearchParams({});
  };

  const buildAppearancePayload = () => ({
    gender,
    race,
    bodyChoice,
    bodyCustom,
    eyeChoice,
    eyeCustom,
    hairStyleChoice,
    hairStyleCustom,
    hairColorChoice,
    hairColorCustom,
    name,
    country,
    age: age.trim() ? Number(age) : "",
    personality: personality.slice(0, 3),
  });

  const persistAppearance = (nextStatus) => {
    if (!record) return;
    const nextAppearance = buildAppearancePayload();
    updateCharacterCreation(record.id, { appearance: nextAppearance, status: nextStatus });
  };

  const groupSummaries = {
    gender: gender ? optionLabel(options.gender, gender) : "未选择",
    race: race ? optionLabel(options.race, race) : "未选择",
    body: bodyCustom || (bodyChoice ? optionLabel(options.body, bodyChoice) : "未选择"),
    eye: eyeCustom || (eyeChoice ? optionLabel(options.eye, eyeChoice) : "未选择"),
    hairStyle: hairStyleCustom || (hairStyleChoice ? optionLabel(options.hairStyle, hairStyleChoice) : "未选择"),
    hairColor: hairColorCustom || (hairColorChoice ? optionLabel(options.hairColor, hairColorChoice) : "未选择"),
    basic: [name || "未命名", country || "未选国家", age ? `${age}岁` : "未填年龄"].join(" · "),
    personality: personality.length ? personality.join("、") : "未选择",
  };

  const groupOrder = ["gender", "race", "body", "eye", "hairStyle", "hairColor", "basic", "personality"];
  const personalityBatchSize = 10;
  const personalityPageCount = Math.ceil(options.personalitySuggestions.length / personalityBatchSize);
  const personalityPageStart = personalityPage * personalityBatchSize;
  const visiblePersonalityOptions = [...options.personalitySuggestions.slice(personalityPageStart), ...options.personalitySuggestions.slice(0, personalityPageStart)]
    .filter((item) => !personality.includes(item))
    .slice(0, personalityBatchSize);
  const groupTitles = {
    gender: "性别",
    race: "人种",
    body: "身材",
    eye: "眼睛",
    hairStyle: "发型",
    hairColor: "发色",
    basic: "基本信息",
    personality: "性格",
  };

  const saveDraftProgress = () => {
    if (!record || record.characterId) return;
    const patch = {
      appearance: buildAppearancePayload(),
      characterIdea,
      texts: majorStep >= 2 ? { ...texts } : record.texts,
      isPublic: Boolean(isPublic),
      portraitPrompt: promptText,
      status:
        majorStep === 2
          ? "description"
          : gender || record.portraitUrl
            ? "appearance"
            : "gender",
    };
    updateCharacterCreation(record.id, patch);
  };

  const closeLeavePrompt = () => {
    setLeavePromptOpen(false);
    setManualLeaveIntent("");
    if (blocker.state === "blocked") blocker.reset();
  };

  const leaveAfterDecision = ({ save }) => {
    if (save) saveDraftProgress();
    else if (record?.id) deleteCharacterCreation(record.id);
    setLeavePromptOpen(false);
    if (manualLeaveIntent === "exit-draft") {
      setManualLeaveIntent("");
      exitDraft();
      return;
    }
    setManualLeaveIntent("");
    if (blocker.state === "blocked") blocker.proceed();
  };

  const onStartCreate = () => {
    if (!session?.isLoggedIn) {
      openAuth?.({ mode: "login", postAuthPath: "/create" });
      return;
    }
    skipAutoResumeRef.current = false;
    const res = startCharacterCreation({});
    if (!res?.ok) return;
    setSearchParams({ draft: res.id });
  };

  const onContinueDraft = () => {
    if (!session?.isLoggedIn) {
      openAuth?.({ mode: "login", postAuthPath: "/create" });
      return;
    }
    if (!pendingDraft?.id) return;
    skipAutoResumeRef.current = false;
    setSearchParams({ draft: pendingDraft.id });
  };

  const onRestartCreate = () => {
    if (!session?.isLoggedIn) {
      openAuth?.({ mode: "login", postAuthPath: "/create" });
      return;
    }
    if (pendingDraft?.id) deleteCharacterCreation(pendingDraft.id);
    skipAutoResumeRef.current = false;
    const res = startCharacterCreation({});
    if (!res?.ok) return;
    setSearchParams({ draft: res.id });
  };

  const onGeneratePortrait = ({ isRegenerate }) => {
    if (!record) return;
    if (!name.trim()) {
      showToast("error", "请先填写姓名");
      return;
    }
    if (!promptText.trim()) {
      showToast("error", "请先生成并确认提示词");
      return;
    }
    if (isRegenerate) {
      const ok = spendDiamonds(5);
      if (!ok) {
        openDiamondUpsell({
          title: "Not enough diamonds",
          description: "Regenerate the portrait by subscribing or buying a diamond pack in this modal.",
          cost: 5,
          source: "create-portrait-regenerate",
        });
        return;
      }
    }
    const current = `${record.portraitUrl || ""}`;
    const next =
      isRegenerate && current === fixedPortraitUrls[0]
        ? fixedPortraitUrls[1]
        : isRegenerate && current === fixedPortraitUrls[1]
          ? fixedPortraitUrls[0]
          : fixedPortraitUrls[0];
    const url = next;
    persistAppearance("portrait");
    updateCharacterCreation(record.id, { portraitUrl: url, portraitPrompt: promptText });
  };

  const onToPortraitStep = () => {
    if (!record) return;
    if (!name.trim()) {
      showToast("error", "请先填写姓名");
      return;
    }
    const prompt = promptText.trim() ? promptText : buildPortraitPrompt(buildAppearancePayload());
    setPromptText(prompt);
    const nextAppearance = buildAppearancePayload();
    updateCharacterCreation(record.id, {
      appearance: nextAppearance,
      status: "portrait",
      portraitPrompt: prompt,
    });
  };

  const onBackToAppearance = () => {
    if (!record) return;
    updateCharacterCreation(record.id, { appearance: buildAppearancePayload(), status: "appearance" });
  };

  const onToDescriptionStep = () => {
    if (!record) return;
    if (!name.trim()) {
      showToast("error", "请先填写姓名");
      return;
    }
    if (!record.portraitUrl) {
      showToast("error", "请先生成形象");
      return;
    }
    persistAppearance("description");
    updateCharacterCreation(record.id, { characterIdea, status: "description" });
  };

  const onGenerateCharacterTexts = () => {
    if (!record) return;
    const idea = characterIdea.trim();
    const nextTexts = generateTexts({ name, country, personality }, idea);
    setCharacterIdea(idea);
    setTexts(nextTexts);
    updateCharacterCreation(record.id, { characterIdea: idea, texts: nextTexts, status: "description" });
    showToast("success", record.texts?.relation ? "人物设定已重新生成" : "人物设定已生成");
  };

  const onFinishCharacter = () => {
    if (!record) return;
    updateCharacterCreation(record.id, { texts, isPublic: Boolean(isPublic) });
    const res = completeCharacterCreation({ creationId: record.id, isPublic: Boolean(isPublic) });
    if (!res?.ok) {
      if (res?.reason === "diamonds") {
        openDiamondUpsell({
          title: "Not enough diamonds",
          description: "Finish creating this character by subscribing or buying a diamond pack in this modal.",
          cost: 5,
          source: "create-character-finish",
        });
      }
      if (res?.reason === "login") showToast("error", "请先登录");
      return;
    }
    showToast("success", res?.charged ? "人物已创建（已扣 5 钻石）" : "人物已创建（首个免费）");
  };

  const onStartChat = () => {
    if (!record?.characterId) return;
    const convId = openConversationForCharacter(record.characterId);
    if (convId) navigate(`/chat/${convId}`);
  };

  if (!draftId) {
    return (
      <div className="px-6 pb-10 pt-6">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950">
          <img src={heroBackgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.78)_58%,rgba(0,0,0,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.12),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.12),transparent_22%)]" />
          <div className="relative min-h-[560px] px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto flex min-h-[460px] max-w-4xl flex-col items-center justify-center text-center">
              <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/38 px-6 py-10 shadow-2xl backdrop-blur-md sm:px-10">
                <div className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-6xl">创造人物</div>
                <div className="mt-4 text-base leading-8 text-white/90">
                  自定义创建你梦想中的人物，从外貌、性格到开场对白，全部由你亲手定义。
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={pendingDraft ? onRestartCreate : onStartCreate}
                    className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
                  >
                    <Sparkles className="h-4 w-4" />
                    {hasFreeCreation ? (
                      "创建人物"
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span>创建人物</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
                          <DiamondIcon className="h-3.5 w-3.5 text-sky-300" />
                          <span>5</span>
                        </span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-sm font-medium text-white/82">每个用户可免费创建 1 个角色</div>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {sampleCards.slice(0, 6).map((c) => (
                  <div key={c.id} className="h-11 w-11 overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {pendingDraft ? (
          <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-zinc-900">检测到未完成的草稿</div>
                <div className="mt-1 text-sm text-zinc-600">
                  你可以继续上次的草稿，或重新创建（将放弃当前草稿，从选择性别开始）。
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onContinueDraft}
                  className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  继续上次草稿
                </button>
                <button
                  type="button"
                  onClick={onRestartCreate}
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  重新创建
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {myRecords.length ? (
          <div className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-6">
            <div>
              <div className="text-lg font-semibold text-zinc-900">创建记录</div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {myRecords.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/create/record/${r.id}`)}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                    <img
                      src={r.portraitUrl || recordFallbackUrl}
                      alt={r.appearance?.name || "人物形象"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {getRecordProgressLabel(r)}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">{r.appearance?.name || "未命名人物"}</div>
                        <div className="mt-0.5 truncate text-xs text-zinc-500">
                          {r.appearance?.country || "未设置国家"}
                          {r.appearance?.gender ? ` · ${r.appearance.gender === "Male" ? "男" : "女"}` : ""}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {toast ? (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
            {toast.message}
          </div>
        ) : null}
      </div>
    );
  }

  if (!record) {
    return (
      <div className="px-6 pb-10 pt-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">创建记录不存在或已被清理</div>
          <button type="button" onClick={() => setSearchParams({})} className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-10 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (!shouldPromptLeave) {
              exitDraft();
              return;
            }
            setManualLeaveIntent("exit-draft");
            setLeavePromptOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" />
          退出创建
        </button>
      </div>

      <div className="mt-4 rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-zinc-900">创建人物</div>
            <div className="mt-1 text-sm text-zinc-500">
              Step {majorStep}/2 · {majorStep === 1 ? "外貌" : "人物设定"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", majorStep >= 1 ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-500")}>
              <ImageIcon className="h-3.5 w-3.5" />
              外貌
            </div>
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", majorStep >= 2 ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-500")}>
              <Sparkles className="h-3.5 w-3.5" />
              人物设定
            </div>
          </div>
        </div>

        {record.status === "gender" || record.status === "appearance" ? (
          <div className="mt-6">
            <div className="mx-auto max-w-2xl rounded-[26px] border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900">外貌设定</div>
              </div>

              <div className="mt-4 space-y-4">
                  {groupOrder.map((key) => {
                    const open = true;
                    return (
                      <div key={key} className="overflow-hidden rounded-2xl border border-zinc-200">
                        <div className="flex w-full items-center justify-between gap-3 bg-zinc-50 px-4 py-3 text-left">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="text-sm font-semibold text-zinc-900">{groupTitles[key]}</span>
                            {!open ? (
                              <span className="truncate text-xs text-zinc-500">{groupSummaries[key]}</span>
                            ) : null}
                          </div>
                        </div>
                        {open ? (
                          <div className="px-4 py-4">
                            {key === "gender" ? (
                              <div className="flex flex-wrap gap-2">
                                {options.gender.map((o) => (
                                  <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => setGender(o.value)}
                                    className={cn(
                                      "rounded-full px-3 py-1.5 text-sm font-semibold",
                                      gender === o.value ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                    )}
                                  >
                                    {o.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            {key === "race" ? (
                              <div className="flex flex-wrap gap-2">
                                {options.race.map((o) => (
                                  <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => setRace(o.value)}
                                    className={cn(
                                      "rounded-full px-3 py-1.5 text-sm font-semibold",
                                      race === o.value ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                    )}
                                  >
                                    {o.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            {key === "body" ? (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {options.body.map((o) => (
                                    <button
                                      key={o.value}
                                      type="button"
                                      onClick={() => {
                                        setBodyChoice(o.value);
                                        setBodyCustom("");
                                      }}
                                      className={cn(
                                        "rounded-full px-3 py-1.5 text-sm font-semibold",
                                        bodyChoice === o.value && !bodyCustom ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                      )}
                                    >
                                      {o.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={bodyCustom}
                                  onChange={(e) => {
                                    setBodyCustom(e.target.value);
                                    setBodyChoice("");
                                  }}
                                  placeholder="或输入自定义身材"
                                  className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                />
                              </div>
                            ) : null}

                            {key === "eye" ? (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {options.eye.map((o) => (
                                    <button
                                      key={o.value}
                                      type="button"
                                      onClick={() => {
                                        setEyeChoice(o.value);
                                        setEyeCustom("");
                                      }}
                                      className={cn(
                                        "rounded-full px-3 py-1.5 text-sm font-semibold",
                                        eyeChoice === o.value && !eyeCustom ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                      )}
                                    >
                                      {o.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={eyeCustom}
                                  onChange={(e) => {
                                    setEyeCustom(e.target.value);
                                    setEyeChoice("");
                                  }}
                                  placeholder="或输入自定义眼睛"
                                  className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                />
                              </div>
                            ) : null}

                            {key === "hairStyle" ? (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {options.hairStyle.map((o) => (
                                    <button
                                      key={o.value}
                                      type="button"
                                      onClick={() => {
                                        setHairStyleChoice(o.value);
                                        setHairStyleCustom("");
                                      }}
                                      className={cn(
                                        "rounded-full px-3 py-1.5 text-sm font-semibold",
                                        hairStyleChoice === o.value && !hairStyleCustom ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                      )}
                                    >
                                      {o.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={hairStyleCustom}
                                  onChange={(e) => {
                                    setHairStyleCustom(e.target.value);
                                    setHairStyleChoice("");
                                  }}
                                  placeholder="或输入自定义发型"
                                  className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                />
                              </div>
                            ) : null}

                            {key === "hairColor" ? (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {options.hairColor.map((o) => (
                                    <button
                                      key={o.value}
                                      type="button"
                                      onClick={() => {
                                        setHairColorChoice(o.value);
                                        setHairColorCustom("");
                                      }}
                                      className={cn(
                                        "rounded-full px-3 py-1.5 text-sm font-semibold",
                                        hairColorChoice === o.value && !hairColorCustom ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                      )}
                                    >
                                      {o.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={hairColorCustom}
                                  onChange={(e) => {
                                    setHairColorCustom(e.target.value);
                                    setHairColorChoice("");
                                  }}
                                  placeholder="或输入自定义发色"
                                  className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                />
                              </div>
                            ) : null}

                            {key === "basic" ? (
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">姓名（必填）</div>
                                  <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="输入人物姓名"
                                    className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                  />
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {options.nameSuggestions.slice(0, 5).map((n) => (
                                      <button
                                        key={n}
                                        type="button"
                                        onClick={() => setName(n)}
                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                                      >
                                        {n}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">国家</div>
                                  <div className="relative mt-2">
                                    <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <select
                                      value={country}
                                      onChange={(e) => setCountry(e.target.value)}
                                      className="h-10 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-10 pr-10 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-900"
                                    >
                                      <option value="">请选择国家</option>
                                      {options.countries.map((c) => (
                                        <option key={c} value={c}>
                                          {c}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">年龄</div>
                                  <input
                                    inputMode="numeric"
                                    type="number"
                                    min={18}
                                    max={70}
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    onBlur={() => {
                                      const raw = `${age || ""}`.trim();
                                      if (!raw) return;
                                      const n = Number(raw);
                                      if (!Number.isFinite(n)) {
                                        setAge("");
                                        return;
                                      }
                                      const next = Math.min(70, Math.max(18, Math.round(n)));
                                      setAge(String(next));
                                    }}
                                    placeholder="输入18-70之间的数字"
                                    className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                                  />
                                </div>
                              </div>
                            ) : null}

                            {key === "personality" ? (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {personality.map((p) => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setPersonality(personality.filter((x) => x !== p))}
                                      className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
                                      aria-label={`删除性格 ${p}`}
                                    >
                                      {p}
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {visiblePersonalityOptions.map((p) => {
                                    const selected = personality.includes(p);
                                    const disabled = !selected && personality.length >= 3;
                                    return (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                          if (selected) setPersonality(personality.filter((x) => x !== p));
                                          else if (personality.length < 3) setPersonality([...personality, p]);
                                        }}
                                        disabled={disabled}
                                        className={cn(
                                          "rounded-full px-3 py-1.5 text-sm font-semibold",
                                          selected ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                                          disabled ? "opacity-40" : "",
                                        )}
                                      >
                                        {p}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPersonalityPage((v) => (v + 1) % personalityPageCount)}
                                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  换一换
                                </button>
                              </div>
                            ) : null}

                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onToPortraitStep}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  下一步
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {record.status === "portrait" ? (
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col rounded-[26px] border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold text-zinc-900">预览和修改提示词</div>
              <div className="mt-1 text-xs leading-5 text-zinc-500">这是根据你填选的内容生成的提示词，可自由修改后再生成图片。</div>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="提示词生成后可在此查看并修改"
                className="mt-4 h-[46vh] max-h-[440px] min-h-[220px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-900"
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBackToAppearance}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => onGeneratePortrait({ isRegenerate: Boolean(record.portraitUrl) })}
                  disabled={!promptText.trim()}
                  className={cn(
                    "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold",
                    promptText.trim() ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-200 text-zinc-500",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  {record.portraitUrl ? (
                    <span className="inline-flex items-center gap-2">
                      重新生成图片
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                        <DiamondIcon className="h-3.5 w-3.5 text-sky-200" />
                        <span>5</span>
                      </span>
                    </span>
                  ) : (
                    "生成图片"
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-zinc-500">首次生成免费，重新生成将消耗 5 钻石。</div>
            </div>

            <div className="flex flex-col rounded-[26px] border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold text-zinc-900">生成图片展示</div>
              <div className="mt-1 whitespace-nowrap text-xs leading-5 text-zinc-500">满意后进入下一步，不满意可重新生成。</div>
              <div className="mx-auto mt-4 aspect-[9/16] h-[46vh] max-h-[440px] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
                {record.portraitUrl ? (
                  <img
                    src={record.portraitUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = recordFallbackUrl;
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-sm font-semibold text-zinc-500">点击“生成图片”后展示</div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onToDescriptionStep}
                  disabled={!record.portraitUrl}
                  className={cn(
                    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold",
                    record.portraitUrl ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-zinc-200 text-zinc-500",
                  )}
                >
                  下一步
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {record.status === "description" || record.status === "text" ? (
          <div className="mx-auto mt-4 max-w-6xl rounded-[26px] border border-zinc-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.45fr)]">
              <div className="flex min-h-[300px] flex-col">
                <textarea
                  value={characterIdea}
                  onChange={(e) => setCharacterIdea(e.target.value)}
                  placeholder={`你希望这个人是什么样的？可以从下面几个方面描述：
人物关系：TA 是你的恋人、朋友、同事、医生，还是只属于你的特别陪伴？
对话场景：你们通常在哪里、什么情况下聊天？整体氛围是轻松、暧昧、治愈还是克制？
第一句话：希望 TA 第一次见到你时怎么开口？语气温柔、主动、幽默，还是略带距离感？
消息案例：希望 TA 平时如何回应你？回复长短、表达方式、边界和互动节奏是什么样的？`}
                  maxLength={500}
                  aria-label="你希望这个人是什么样的"
                  className="min-h-[230px] w-full flex-1 resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                />
                <div className="mt-2 flex items-center justify-end text-xs tabular-nums text-zinc-400">{characterIdea.length}/500</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onGenerateCharacterTexts}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {texts.relation ? "重新生成" : "生成"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCharacterCreation(record.id, { characterIdea, texts, status: "portrait" })}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一步
                  </button>
                </div>
              </div>

              <div className="grid min-h-[300px] grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { key: "relation", label: "人物与用户关系" },
                  { key: "scenario", label: "对话场景" },
                  { key: "firstMessage", label: "对话的第一句话" },
                  { key: "example", label: "消息案例" },
                ].map((item) => (
                  <div key={item.key} className="flex min-h-[142px] flex-col rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5">
                    <div className="shrink-0 text-xs font-semibold text-zinc-500">{item.label}</div>
                    {texts.relation ? (
                      <div className="mt-2 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap pr-1 text-sm leading-6 text-zinc-800">{texts[item.key]}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4">
              <label className="flex h-10 items-center gap-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5">
                <span className="text-sm font-semibold text-zinc-700">公开人物</span>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only" />
                <span className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", isPublic ? "bg-emerald-600" : "bg-zinc-300")}>
                  <span className={cn("absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform", isPublic ? "translate-x-5" : "translate-x-0")} />
                </span>
              </label>
              <button
                type="button"
                onClick={onFinishCharacter}
                disabled={!texts.relation}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold",
                  texts.relation ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-200 text-zinc-500",
                )}
              >
                <Sparkles className="h-4 w-4" />
                保存并生成人物
              </button>
            </div>
          </div>
        ) : null}

        {record.status === "completed" || record.status === "video" ? (
          <div className="mx-auto mt-6 max-w-4xl rounded-[26px] border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div className="mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
                {record.portraitUrl ? (
                  <img
                    src={record.portraitUrl}
                    alt={record.appearance?.name || "人物形象"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = recordFallbackUrl;
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">暂无形象</div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  人物已完成
                </div>
                <div className="mt-3 text-2xl font-semibold text-zinc-900">{record.appearance?.name || "未命名人物"}</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3">
                    <div className="text-xs text-zinc-500">年龄</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      {record.appearance?.age !== undefined && record.appearance?.age !== null && `${record.appearance?.age}` !== ""
                        ? `${record.appearance.age} 岁`
                        : "未设置"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3">
                    <div className="text-xs text-zinc-500">国家/地区</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">{record.appearance?.country || "未设置"}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3">
                  <div className="text-xs text-zinc-500">性格</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(record.appearance?.personality || []).length ? (
                      (record.appearance?.personality || []).slice(0, 3).map((p) => (
                        <span key={p} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-400">未设置</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={onStartChat}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    <Sparkles className="h-4 w-4" />
                    开始对话
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
          {toast.message}
        </div>
      ) : null}

      <Modal open={leavePromptOpen} onClose={closeLeavePrompt} title="是否保存当前生成的人物？">
        <div className="text-sm leading-7 text-zinc-700">保存后不会展示草稿记录，但下次进入创建页时可选择继续该草稿或重新创建；不保存则放弃当前内容。</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => leaveAfterDecision({ save: false })}
            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            不保存
          </button>
          <button
            type="button"
            onClick={() => leaveAfterDecision({ save: true })}
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            保存
          </button>
        </div>
      </Modal>
    </div>
  );
}
