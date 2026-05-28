const imageUrl = (prompt, imageSize = "square") =>
  `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;

export const banners = [
  {
    id: "b1",
    title: "Practice English in minutes",
    subtitle: "Speak, get corrected, and improve fast with an AI coach.",
    ctaText: "Explore",
    href: "/browse",
    imageUrl: imageUrl(
      "Minimal editorial hero banner for a chat product, soft neutral background, subtle gradient mesh, clean empty space for text, modern calm mood, high quality, no text",
      "landscape_16_9",
    ),
  },
  {
    id: "b2",
    title: "Speaking practice, on demand",
    subtitle: "Role-play real scenarios and get instant feedback on your English.",
    ctaText: "Start Practice",
    href: "/browse#live",
    imageUrl: imageUrl(
      "Cinematic live streaming scene, modern studio lighting, subtle neon accents, bokeh, high quality, no text",
      "landscape_16_9",
    ),
  },
  {
    id: "b3",
    title: "Short lessons that stick",
    subtitle: "Learn one pattern, then practice it in chat with a tutor.",
    ctaText: "Watch Shorts",
    href: "/shorts",
    imageUrl: imageUrl(
      "Cinematic collage background for short drama app banner, film grain, warm contrast, modern editorial style, high quality, no text",
      "landscape_16_9",
    ),
  },
];

const assetVersion = Date.now().toString();
const localCharacterImages = [
  `/images/home/people.png?v=${assetVersion}`,
  `/images/create/results/standard/hero-1.png?v=${assetVersion}`,
  `/images/create/results/standard/hero-2.png?v=${assetVersion}`,
  `/images/create/results/standard/hero-3.png?v=${assetVersion}`,
  `/images/create/results/vip/candidate-1-hero.png?v=${assetVersion}`,
  `/images/create/results/vip/candidate-2-hero.png?v=${assetVersion}`,
  `/images/create/results/vip/candidate-3-hero.png?v=${assetVersion}`,
];

const localCharacterImageForIndex = (index) => {
  const pattern = [0, 4, 1, 7, 2, 9, 3, 10, 5, 8, 6, 1, 9, 2, 7, 3, 10, 4, 8, 5, 6, 2, 7, 1];
  const pick = pattern[(Math.max(1, index) - 1) % pattern.length];
  const safeIdx = Math.abs(pick ?? 0) % Math.max(1, localCharacterImages.length);
  return localCharacterImages[safeIdx] || localCharacterImages[0];
};

const makeCharacter = ({ index, name, age, bio, starter, avatarPrompt, heroUrl, tags = [], kind }) => {
  const avatarUrl = imageUrl(avatarPrompt, "square");
  return {
    id: `c${index}`,
    name,
    age,
    bio,
    starter,
    avatarUrl,
    heroUrl: heroUrl || localCharacterImageForIndex(index),
    fallbackUrl: avatarUrl,
    tags,
    kind,
    stats: { heat: 0, online: true },
  };
};

export const characters = [
  makeCharacter({
    index: 1,
    name: "Lin",
    age: 23,
    bio: "English pronunciation coach. Friendly drills, clear corrections, and confidence-building speaking practice.",
    starter: "Quick warm-up: say one sentence about your day, and I’ll help you refine it.",
    kind: "male",
    avatarPrompt:
      "Studio portrait of a gentle young man, clean background, soft light, realistic, high detail, no text",
  }),
  makeCharacter({
    index: 2,
    name: "Su",
    age: 26,
    bio: "Grammar-first English tutor. Explains patterns, fixes mistakes, and turns confusion into simple rules.",
    starter: "Tell me what grammar topic you struggle with, and I’ll give you a clear mini-lesson.",
    kind: "female",
    avatarPrompt:
      "Studio portrait of a confident woman with sharp gaze, clean background, realistic, high detail, no text",
  }),
  makeCharacter({
    index: 3,
    name: "Lan",
    age: 21,
    bio: "Conversation practice partner. Fun role-plays, natural expressions, and fast feedback on fluency.",
    starter: "Pick a scenario: café order, job interview, travel, or small talk—and we’ll practice.",
    kind: "female",
    avatarPrompt:
      "Studio portrait of a cheerful girl, warm tone, clean background, realistic, high detail, no text",
  }),
  makeCharacter({
    index: 4,
    name: "Jiran",
    age: 29,
    bio: "Structured English coach. Builds a weekly plan, tracks progress, and keeps you consistent.",
    starter: "What’s your goal: speaking, writing, exams, or workplace English? I’ll design a plan.",
    kind: "male",
    avatarPrompt:
      "Studio portrait of a calm mature man, minimal background, realistic, high detail, no text",
  }),
  ...Array.from({ length: 20 }, (_, i) => {
    const index = i + 5;
    return makeCharacter({
      index,
      name: `Character ${index}`,
      age: 20 + (index % 10),
      bio: "English practice tutor. Focuses on speaking, vocabulary, and quick corrections for everyday situations.",
      starter: "What English skill do you want to practice today: speaking, listening, vocabulary, or writing?",
      kind: index % 2 === 0 ? "male" : "female",
      avatarPrompt:
        "Realistic portrait photo, clean background, soft light, high-end social app avatar, no text",
    });
  }),
  makeCharacter({
    index: 25,
    name: "Aki",
    age: 19,
    bio: "Anime-style English tutor. Gentle explanations, fun examples, and speaking practice for beginners.",
    starter: "Let’s practice a simple English intro. Tell me: name, country, and one hobby.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a friendly young teacher, clean background, soft colors, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, friendly English teacher vibe, clean soft lighting, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
  makeCharacter({
    index: 26,
    name: "Hana",
    age: 20,
    bio: "Anime conversation partner. Role-play scenes and learn natural English phrases.",
    starter: "Choose a scene: café order, school club, or travel. I’ll play the other role.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a cheerful woman, clean background, soft light, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, modern casual outfit, warm color palette, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
  makeCharacter({
    index: 27,
    name: "Ren",
    age: 22,
    bio: "Anime pronunciation coach. Helps with stress, rhythm, and clear speaking.",
    starter: "Say one sentence in English. I’ll correct pronunciation and give a shadowing drill.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a calm young man, clean background, soft lighting, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, calm teacher pose, minimal background, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
  makeCharacter({
    index: 28,
    name: "Mio",
    age: 21,
    bio: "Anime grammar tutor. Simple rules, clear examples, and quick practice questions.",
    starter: "Tell me your sentence. I’ll correct it and explain the grammar in one minute.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a smart young woman, clean background, gentle colors, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, classroom vibe, modern minimal style, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
  makeCharacter({
    index: 29,
    name: "Kaito",
    age: 24,
    bio: "Anime interview trainer. Practice answers, get corrections, and sound more natural.",
    starter: "What job are you applying for? Let’s practice an interview question.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a confident young man, clean background, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, business casual, studio light, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
  makeCharacter({
    index: 30,
    name: "Yuki",
    age: 20,
    bio: "Anime travel English tutor. Useful phrases and fast role-play practice.",
    starter: "Let’s practice at the airport. Ask me about the gate and boarding time in English.",
    kind: "anime",
    avatarPrompt:
      "Anime style portrait of a friendly woman, travel theme, clean background, high detail, no text",
    heroUrl: imageUrl(
      "Anime style full body portrait, travel theme, bright clean colors, high quality, no text, vertical",
      "portrait_16_9",
    ),
  }),
];

const liveNames = ["Lynn", "Ryo", "Mika", "Noah", "Ava", "Kai", "Yuna", "Mason", "Lia", "Ethan"];
const liveHeadlines = [
  "Late-night talk & cozy music",
  "Real-time advice, no fluff",
  "Fashion chat + daily stories",
  "Chill Q&A + story time",
  "Morning vibes & journaling",
  "Gaming + hangout",
  "Storytelling live",
  "Productivity session",
  "Coffee chat",
  "Open mic questions",
];
const liveScenes = [
  "cozy room, soft neon lighting",
  "modern desk, monitor glow",
  "city night window, warm key light",
  "minimal studio backdrop",
  "sunrise window light, calm mood",
  "gaming desk, RGB lights",
  "warm living room, bokeh",
  "clean workspace, daylight",
  "coffee shop vibe, warm lights",
  "studio with mic, spotlight",
];

export const liveHosts = Array.from({ length: 10 }, (_, i) => ({
  id: `l${i + 1}`,
  name: liveNames[i],
  isLive: true,
  watching: `${(600 + i * 220).toLocaleString()}`,
  headline: liveHeadlines[i],
  avatarUrl: imageUrl(
    `Realistic portrait photo of a live streamer, social app avatar style, no text, person name: ${liveNames[i]}`,
    "square",
  ),
  coverUrl: imageUrl(
    `Immersive live stream preview screenshot, ${liveScenes[i]}, vertical 9:16, realistic, cinematic, no text`,
    "portrait_16_9",
  ),
}));

export const shortDramas = [
  {
    id: "s1",
    title: "Daily Small Talk",
    episodes: 12,
    protagonist: "Lin",
    characterId: "c1",
    tags: ["Speaking", "Fluency"],
    description: "Short speaking prompts to build confidence and natural rhythm.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, night city alley, dramatic lighting, film grain, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s2",
    title: "Grammar in 60 Seconds",
    episodes: 8,
    protagonist: "Su",
    characterId: "c2",
    tags: ["Grammar", "Accuracy"],
    description: "One rule per clip—examples, mistakes to avoid, and quick practice.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, modern apartment, warm window light, romantic tension, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s3",
    title: "Travel English",
    episodes: 10,
    protagonist: "Lan",
    characterId: "c3",
    tags: ["Vocabulary", "Situations"],
    description: "Bite-sized scenarios for airports, hotels, directions, and ordering food.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, foggy morning street, soft blue tone, dramatic composition, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s4",
    title: "Workplace English",
    episodes: 6,
    protagonist: "Jiran",
    characterId: "c4",
    tags: ["Business", "Email"],
    description: "Useful phrases for meetings, emails, and polite professional tone.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, modern office, warm rim light, romantic tension, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s5",
    title: "Listening Mini Drills",
    episodes: 9,
    protagonist: "Character 5",
    characterId: "c5",
    tags: ["Listening", "Comprehension"],
    description: "Train your ear with short dialogues and quick comprehension checks.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, ocean night, neon reflections, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s6",
    title: "Pronunciation Fixes",
    episodes: 7,
    protagonist: "Character 6",
    characterId: "c6",
    tags: ["Pronunciation", "Accent"],
    description: "Common sounds, stress patterns, and quick mouth-position tips.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, futuristic city, moody lighting, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s7",
    title: "Vocabulary Boost",
    episodes: 12,
    protagonist: "Character 7",
    characterId: "c7",
    tags: ["Words", "Usage"],
    description: "Learn high-frequency words with examples you can reuse immediately.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, school hallway, warm sunset, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s8",
    title: "Exam Prep Bites",
    episodes: 8,
    protagonist: "Character 8",
    characterId: "c8",
    tags: ["Tests", "Strategy"],
    description: "Short practice tasks for common exam question types and timing.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, modern apartment, cool shadows, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s9",
    title: "Everyday Idioms",
    episodes: 10,
    protagonist: "Character 9",
    characterId: "c9",
    tags: ["Idioms", "Phrases"],
    description: "Understand meaning, tone, and when to use common idioms naturally.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, rainy street, reflections, film grain, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
  {
    id: "s10",
    title: "Writing Polished Sentences",
    episodes: 6,
    protagonist: "Character 10",
    characterId: "c10",
    tags: ["Writing", "Clarity"],
    description: "Rewrite practice: make your sentences clearer, shorter, and more natural.",
    coverUrl: imageUrl(
      "Cinematic vertical poster still, blue hour skyline, soft haze, high quality, 9:16, no text",
      "portrait_16_9",
    ),
  },
];

export const subscriptionPlans = [
  {
    id: "month",
    titleKey: "subscribe_plan_month",
    price: "¥29",
    period: " / mo",
    perks: ["More chat credits", "Faster replies", "Exclusive content access"],
  },
  {
    id: "year",
    titleKey: "subscribe_plan_year",
    price: "¥199",
    period: " / yr",
    perks: ["All monthly perks", "Annual badge", "Early access to new features"],
  },
];

export const feedItems = characters.map((c) => ({
  id: `f-${c.id}`,
  characterId: c.id,
  coverUrl: imageUrl(
    `Cinematic vertical frame for an AI language learning app, study vibe, modern clean mood, high quality, no text, tutor theme: ${c.name}`,
    "portrait_16_9",
  ),
}));
