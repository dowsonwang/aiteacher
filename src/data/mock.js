const imageUrl = (prompt, imageSize = "square") =>
  `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;

const animeImageUrl = (prompt, imageSize = "square") =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
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
    ctaText: "Watch Micro-Dramas",
    href: "/shorts",
    imageUrl: imageUrl(
      "Cinematic collage background for short drama app banner, film grain, warm contrast, modern editorial style, high quality, no text",
      "landscape_16_9",
    ),
  },
];

/* =======================================================================
 * Reusable placeholder image set (content-aware, replaces static files).
 * These are returned directly by the mock layer and imported by pages.
 * ======================================================================= */
export const publicAssets = {
  // 登录/授权弹窗背景图 (16:9 hero banner with soft blur area for form overlay)
  loginBanner: imageUrl(
    "Soft warm editorial background for a language app login page, calm gradient sky, city window at dusk, blurry bokeh lights in foreground, lots of clean negative space for form overlay, premium app aesthetic, no text, ultra realistic",
    "landscape_16_9",
  ),
  // 首页Banner轮播备用图
  homeBanner3: imageUrl(
    "Premium horizontal banner for a language learning product, cinematic collage of people chatting, coffee cup, notebook, warm neutral palette, soft focus, editorial magazine style, no text, ultra realistic",
    "landscape_16_9",
  ),
  // 首页人物展示卡（竖版全身/半身像，男女混排用的公共大图）
  homePeoplePortrait: imageUrl(
    "Full body vertical studio portrait of a handsome friendly young man, casual smart outfit, neutral beige background, warm soft studio light, relaxed pose, language tutor vibe, ultra realistic, high detail, no text",
    "portrait_16_9",
  ),
  // 直播模块封面（9:16 预览感）
  liveCover: imageUrl(
    "Immersive vertical live stream screenshot preview, cozy bedroom studio, neon led strip lights, host talking to camera, laptop glow, realistic webcam quality, cinematic color grade, no text, ultra realistic",
    "portrait_16_9",
  ),
  // 短剧封面组 - 6张可循环复用，按不同学习主题给场景感
  shortsCovers: [
    imageUrl(
      "Vertical 9:16 short drama cover for daily conversation theme, cafe interior, two people talking over latte, warm afternoon window light, cinematic shallow depth of field, premium movie poster vibe, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Vertical 9:16 short drama cover for grammar class theme, bright classroom, whiteboard with English sentences, young teacher holding book, soft daylight, educational atmosphere, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Vertical 9:16 short drama cover for travel English theme, airport departure gate, woman with suitcase looking at flight board, warm overhead lights, cinematic mood, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Vertical 9:16 short drama cover for workplace English theme, modern open office, two coworkers in meeting with laptop, cool neutral tone, professional lighting, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Vertical 9:16 short drama cover for listening practice theme, girl with headphones in city park, sunset golden hour, warm lens flare, relaxed mood, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Vertical 9:16 short drama cover for pronunciation theme, close-up of woman speaking in front of mirror and microphone, recording studio soft lights, focused vibe, no text, ultra realistic",
      "portrait_16_9",
    ),
  ],
  // 创建结果：Standard 档 3 张头像
  createStandardHero: [
    imageUrl(
      "Waist-up vertical portrait of a charming young man, light sweater, soft grey background, cinematic studio light, friendly smile, premium dating app profile quality, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Waist-up vertical portrait of an elegant young woman, white shirt and blazer, warm beige background, soft studio light, professional but approachable, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Waist-up vertical portrait of a sporty athletic young man, navy jacket, dark muted background, rim lighting, confident relaxed look, no text, ultra realistic",
      "portrait_16_9",
    ),
  ],
  // 创建结果：VIP 档 3 张头像（更精致/氛围感）
  createVIPHero: [
    imageUrl(
      "Editorial vertical portrait of a stylish young woman in silk camisole, velvet curtain background, dramatic side light, cinematic high end fashion photo, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Editorial vertical portrait of a handsome businessman in tailored suit, rooftop city skyline at dusk, cinematic blue hour lighting, luxury magazine quality, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Editorial vertical portrait of an artistic young woman, knit sweater, large window morning light, film grain aesthetic, cozy pensive mood, no text, ultra realistic",
      "portrait_16_9",
    ),
  ],
  // 创建页固定肖像（男女各一张）
  createFixedPortrait: [
    imageUrl(
      "Cinematic three-quarter vertical portrait of a sophisticated young woman, black turtleneck, dark moody studio, Rembrandt lighting, no text, ultra realistic",
      "portrait_16_9",
    ),
    imageUrl(
      "Cinematic three-quarter vertical portrait of a cool confident young man, denim jacket, rooftop at sunset, golden backlight, hair blow in wind, no text, ultra realistic",
      "portrait_16_9",
    ),
  ],
  // Feed页动漫封面
  animeFeedCover: animeImageUrl(
    "Anime style vertical cover illustration for a social media feed, two anime characters chatting on balcony at sunset, soft purple orange sky, detailed line art, vibrant background, high quality, no text",
    "portrait_16_9",
  ),
  // ChatRoom 对话中AI发送的图片回复
  chatAIImage: imageUrl(
    "Warm vertical photo of a small gift box on wooden desk, coffee cup beside it, morning window light, cozy and personal vibe, shallow depth of field, ultra realistic, no text",
    "portrait_4_3",
  ),
  // 短剧故事作者头像组
  authorAvatars: [
    imageUrl("Square avatar portrait of a creative girl named Maya, curly hair, warm smile, clean background, realistic, high detail, no text", "square"),
    imageUrl("Square avatar portrait of a calm young man named Noah, neat hair, gentle gaze, clean background, realistic, high detail, no text", "square"),
    imageUrl("Square avatar portrait of a stylish woman named Ava, elegant makeup, soft lighting, clean background, realistic, high detail, no text", "square"),
    imageUrl("Square avatar portrait of a handsome Heartbits Studio producer, friendly smile, dark blazer, neutral background, realistic, high detail, no text", "square"),
  ],
  // 直播主播头像组（10个）
  liveAvatars: [
    imageUrl("Realistic square portrait of a female live streamer named Lynn, soft makeup, ring light glow, no text", "square"),
    imageUrl("Realistic square portrait of a male live streamer named Ryo, short dark hair, casual hoodie, no text", "square"),
    imageUrl("Realistic square portrait of a female live streamer named Mika, dyed pink hair highlight, no text", "square"),
    imageUrl("Realistic square portrait of a male live streamer named Noah, beard, warm smile, no text", "square"),
    imageUrl("Realistic square portrait of a female live streamer named Ava, wavy long hair, cozy sweater, no text", "square"),
    imageUrl("Realistic square portrait of a male live streamer named Kai, mixed race, earring, no text", "square"),
    imageUrl("Realistic square portrait of a female live streamer named Yuna, asian girl, beret, no text", "square"),
    imageUrl("Realistic square portrait of a male live streamer named Mason, blond curly hair, no text", "square"),
    imageUrl("Realistic square portrait of a female live streamer named Lia, silver hair, cat ear headphones, no text", "square"),
    imageUrl("Realistic square portrait of a male live streamer named Ethan, glasses, plaid shirt, no text", "square"),
  ],
  // 直播封面组（10张9:16，不同场景）
  liveCovers: [
    imageUrl("Live stream vertical cover, cozy bedroom, soft neon pink lights, girl talking on bed, realistic, cinematic, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, modern desk setup, dual monitor glow, guy gaming, RGB keyboard, realistic, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, city night view from window, fashion girl in front of camera, warm key light, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, minimal podcast studio, white backdrop, host with mic, spotlight, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, sunrise window light, girl writing journal, calm mood, film grain, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, RGB gaming room, guy in headset, purple blue led strip, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, warm living room, girl on couch, bokeh lamp, storytelling night vibe, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, clean workspace daylight, man working at laptop, productivity session, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, coffee shop interior, girl with latte, warm bulbs overhead, chatting, no text", "portrait_16_9"),
    imageUrl("Live stream vertical cover, recording studio, open mic, spotlight, girl speaking into mic, no text", "portrait_16_9"),
  ],
};

/* 6张优质的角色hero大图，按索引给 makeCharacter 默认复用 */
const localCharacterImages = [
  publicAssets.homePeoplePortrait,
  publicAssets.createStandardHero[0],
  publicAssets.createStandardHero[1],
  publicAssets.createStandardHero[2],
  publicAssets.createVIPHero[0],
  publicAssets.createVIPHero[1],
  publicAssets.createVIPHero[2],
  publicAssets.createFixedPortrait[0],
  publicAssets.createFixedPortrait[1],
  publicAssets.shortsCovers[0],
  publicAssets.shortsCovers[1],
];

const localCharacterImageForIndex = (index) => {
  const pattern = [0, 4, 1, 7, 2, 9, 3, 10, 5, 8, 6, 1, 9, 2, 7, 3, 10, 4, 8, 5, 6, 2, 7, 1];
  const pick = pattern[(Math.max(1, index) - 1) % pattern.length];
  const safeIdx = Math.abs(pick ?? 0) % Math.max(1, localCharacterImages.length);
  return localCharacterImages[safeIdx] || localCharacterImages[0];
};

const animeLanguagePool = ["Japanese", "English", "Chinese", "French", "German"];

const makeCharacter = ({ index, name, age, bio, starter, avatarPrompt, heroUrl, tags = [], kind, language }) => {
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
    ...(language ? { language } : {}),
    stats: { heat: 0, online: true },
  };
};

const animeMockPresets = [
  {
    name: "Sora",
    prompt: "an adult anime sky adventurer with silver-blue hair and a light jacket",
    bio: "Anime adventure partner. Bright stories, quick encouragement, and imaginative role-play scenes.",
    starter: "Tell me where you want our story to begin, and I’ll set the scene.",
  },
  {
    name: "Mina",
    prompt: "an adult anime cafe owner with warm brown hair and a cozy apron",
    bio: "Anime cafe companion. Cozy conversations, daily stories, and gentle emotional support.",
    starter: "Welcome in. Tell me what kind of day you had, and I’ll make it a little softer.",
  },
  {
    name: "Theo",
    prompt: "an adult anime bookshop keeper with dark hair and round glasses",
    bio: "Anime story curator. Thoughtful chats, fictional worlds, and quiet late-night conversations.",
    starter: "Pick a mood: mystery, comfort, adventure, or something strange and beautiful.",
  },
  {
    name: "Rin",
    prompt: "an adult anime sword instructor with tied black hair and a calm expression",
    bio: "Anime discipline coach. Focused conversations, confidence practice, and steady motivation.",
    starter: "Tell me one thing you want to improve, and I’ll help you take the first step.",
  },
  {
    name: "Emi",
    prompt: "an adult anime illustrator with colorful hair and a paint-splattered jacket",
    bio: "Anime creative partner. Visual ideas, playful prompts, and expressive character storytelling.",
    starter: "Give me three random words, and I’ll turn them into a scene.",
  },
  {
    name: "Kaede",
    prompt: "an adult anime garden designer with green eyes and soft autumn colors",
    bio: "Anime nature companion. Calm chats, reflective prompts, and peaceful slice-of-life stories.",
    starter: "Let’s slow down. Tell me one small thing you noticed today.",
  },
  {
    name: "Riku",
    prompt: "an adult anime pilot with navy hair and a futuristic flight jacket",
    bio: "Anime sci-fi companion. Fast-moving stories, curious questions, and cinematic role-play.",
    starter: "Our ship is ready. Tell me whether we’re heading toward danger or discovery.",
  },
  {
    name: "Nao",
    prompt: "an adult anime radio host with short copper hair and headphones",
    bio: "Anime late-night host. Easy conversation, music moods, and honest talks after dark.",
    starter: "You’re on the air. Tell me what song or feeling fits your night.",
  },
  {
    name: "Airi",
    prompt: "an adult anime astronomer with lavender hair and a star-patterned coat",
    bio: "Anime stargazing partner. Wonder-filled chats, gentle curiosity, and dreamy story prompts.",
    starter: "Choose a star, and I’ll tell you what kind of story might live there.",
  },
  {
    name: "Sena",
    prompt: "an adult anime detective with ash-gray hair and a long dark coat",
    bio: "Anime mystery partner. Clever clues, tense scenes, and interactive detective role-play.",
    starter: "Give me one strange detail, and I’ll start building the case.",
  },
  {
    name: "Haru",
    prompt: "an adult anime chef with black hair and a clean white uniform",
    bio: "Anime kitchen companion. Warm conversations, comfort food stories, and playful challenges.",
    starter: "Tell me your favorite comfort food, and I’ll invent a scene around it.",
  },
  {
    name: "Yuna",
    prompt: "an adult anime violinist with long auburn hair and a burgundy dress",
    bio: "Anime music companion. Expressive conversations, emotional scenes, and lyrical storytelling.",
    starter: "Tell me a feeling you can’t explain, and I’ll turn it into music.",
  },
  {
    name: "Toma",
    prompt: "an adult anime mechanic with messy blond hair and a workshop backdrop",
    bio: "Anime workshop partner. Practical chats, humor, and energetic problem-solving stories.",
    starter: "Bring me a problem, big or small, and we’ll tinker with it together.",
  },
  {
    name: "Riko",
    prompt: "an adult anime archivist with teal hair and a high-collared uniform",
    bio: "Anime archive guide. Secret histories, strange documents, and careful investigative chats.",
    starter: "Ask me to open one forbidden file, and I’ll tell you what it contains.",
  },
  {
    name: "Mira",
    prompt: "an adult anime fashion designer with rose gold hair and bold earrings",
    bio: "Anime style companion. Playful conversations, character looks, and confident self-expression.",
    starter: "Tell me the mood you want to wear today, and I’ll style the scene.",
  },
  {
    name: "Kyo",
    prompt: "an adult anime stage actor with dark red hair and theatrical lighting",
    bio: "Anime drama partner. Bold role-play, emotional scenes, and theatrical storytelling.",
    starter: "Give me a role to play, and I’ll step onto the stage.",
  },
  {
    name: "Niko",
    prompt: "an adult anime photographer with sandy hair and a camera strap",
    bio: "Anime travel companion. Visual memories, city stories, and curious conversations.",
    starter: "Tell me one place you miss, and I’ll describe the photo I would take there.",
  },
  {
    name: "Lumi",
    prompt: "an adult anime light researcher with white hair and iridescent clothing",
    bio: "Anime dream guide. Soft sci-fi chats, luminous worlds, and calming imaginative scenes.",
    starter: "Close your eyes for a second, then tell me what color your thoughts feel like.",
  },
];

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
  ...animeMockPresets.map((item, index) =>
    makeCharacter({
      index: index + 31,
      name: item.name,
      age: null,
      language: animeLanguagePool[index % animeLanguagePool.length],
      bio: item.bio,
      starter: item.starter,
      kind: "anime",
      avatarPrompt: `Anime style portrait of ${item.prompt}, expressive eyes, clean background, polished modern character art, high detail, no text`,
      heroUrl: animeImageUrl(
        `Anime style three-quarter portrait of ${item.prompt}, expressive eyes, clean vibrant background, polished modern character art, high quality, no text, vertical`,
        "portrait_16_9",
      ),
    }),
  ),
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
  avatarUrl: publicAssets.liveAvatars[i % publicAssets.liveAvatars.length],
  coverUrl: publicAssets.liveCovers[i % publicAssets.liveCovers.length],
}));

export const shortDramas = [
  {
    id: "s1",
    title: "Daily Small Talk",
    episodes: 15,
    protagonist: "Lin",
    characterId: "c1",
    tags: ["Speaking", "Fluency", "Confidence"],
    description: "Short speaking prompts to build confidence and natural rhythm.",
    coverUrl: publicAssets.shortsCovers[0], // cafe small talk
    likeCount: 18320,
    favoriteCount: 4260,
  },
  {
    id: "s2",
    title: "Grammar in 60 Seconds",
    episodes: 8,
    protagonist: "Su",
    characterId: "c2",
    tags: ["Grammar"],
    description: "One rule per clip—examples, mistakes to avoid, and quick practice.",
    coverUrl: publicAssets.shortsCovers[1], // classroom grammar
    likeCount: 12640,
    favoriteCount: 2950,
  },
  {
    id: "s11",
    title: "Grammar Detective",
    episodes: 9,
    protagonist: "Su",
    characterId: "c2",
    tags: ["Grammar", "Correction"],
    description: "Spot the mistake, fix it fast, and learn the rule behind it.",
    coverUrl: publicAssets.shortsCovers[1], // classroom grammar
    likeCount: 9840,
    favoriteCount: 2140,
  },
  {
    id: "s12",
    title: "Rewrite Like a Native",
    episodes: 7,
    protagonist: "Su",
    characterId: "c2",
    tags: ["Writing", "Style"],
    description: "Turn stiff sentences into clean, natural English with quick rewrites.",
    coverUrl: publicAssets.createFixedPortrait[0], // sophisticated woman
    likeCount: 8820,
    favoriteCount: 1960,
  },
  {
    id: "s3",
    title: "Travel English",
    episodes: 10,
    protagonist: "Lan",
    characterId: "c3",
    tags: ["Vocabulary", "Situations"],
    description: "Bite-sized scenarios for airports, hotels, directions, and ordering food.",
    coverUrl: publicAssets.shortsCovers[2], // airport travel
    likeCount: 11670,
    favoriteCount: 2710,
  },
  {
    id: "s4",
    title: "Workplace English",
    episodes: 6,
    protagonist: "Jiran",
    characterId: "c4",
    tags: ["Business", "Email"],
    description: "Useful phrases for meetings, emails, and polite professional tone.",
    coverUrl: publicAssets.shortsCovers[3], // office meeting
    likeCount: 7930,
    favoriteCount: 1680,
  },
  {
    id: "s5",
    title: "Listening Mini Drills",
    episodes: 9,
    protagonist: "Character 5",
    characterId: "c5",
    tags: ["Listening", "Comprehension"],
    description: "Train your ear with short dialogues and quick comprehension checks.",
    coverUrl: publicAssets.shortsCovers[4], // headphones in park
    likeCount: 9280,
    favoriteCount: 2050,
  },
  {
    id: "s6",
    title: "Pronunciation Fixes",
    episodes: 7,
    protagonist: "Character 6",
    characterId: "c6",
    tags: ["Pronunciation", "Accent"],
    description: "Common sounds, stress patterns, and quick mouth-position tips.",
    coverUrl: publicAssets.shortsCovers[5], // recording studio
    likeCount: 8650,
    favoriteCount: 1890,
  },
  {
    id: "s7",
    title: "Vocabulary Boost",
    episodes: 12,
    protagonist: "Character 7",
    characterId: "c7",
    tags: ["Words", "Usage"],
    description: "Learn high-frequency words with examples you can reuse immediately.",
    coverUrl: publicAssets.createStandardHero[1], // elegant tutor woman
    likeCount: 10240,
    favoriteCount: 2310,
  },
  {
    id: "s8",
    title: "Exam Prep Bites",
    episodes: 8,
    protagonist: "Character 8",
    characterId: "c8",
    tags: ["Tests", "Strategy"],
    description: "Short practice tasks for common exam question types and timing.",
    coverUrl: publicAssets.createVIPHero[1], // suit businessman
    likeCount: 7540,
    favoriteCount: 1620,
  },
  {
    id: "s9",
    title: "Everyday Idioms",
    episodes: 10,
    protagonist: "Character 9",
    characterId: "c9",
    tags: ["Idioms", "Phrases"],
    description: "Understand meaning, tone, and when to use common idioms naturally.",
    coverUrl: publicAssets.createStandardHero[2], // sporty athletic man
    likeCount: 9410,
    favoriteCount: 2130,
  },
  {
    id: "s10",
    title: "Writing Polished Sentences",
    episodes: 6,
    protagonist: "Character 10",
    characterId: "c10",
    tags: ["Writing", "Clarity"],
    description: "Rewrite practice: make your sentences clearer, shorter, and more natural.",
    coverUrl: publicAssets.createVIPHero[2], // artistic young woman
    likeCount: 6880,
    favoriteCount: 1490,
  },
];

export const shortStoryBranches = {
  s1: [
    {
      id: "s1-official-1",
      parentId: null,
      episode: 1,
      title: "The question after midnight",
      prompt: "Official story opening",
      author: "Heartbits Studio",
      authorAvatar: publicAssets.authorAvatars[3], // producer
      duration: "1:14",
      views: "18.6K",
      videoUrl: "/videos/feed/feed-01.mp4",
      official: true,
    },
    {
      id: "s1-branch-2a",
      parentId: "s1-official-1",
      episode: 2,
      title: "Lin follows the last train",
      prompt: "Lin notices the stranger left a handwritten ticket and follows them onto the final train, where the lights suddenly go out.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:08",
      views: "4.8K",
      videoUrl: "/videos/feed/feed-02.mp4",
    },
    {
      id: "s1-branch-2b",
      parentId: "s1-official-1",
      episode: 2,
      title: "A call from an unknown number",
      prompt: "Before Lin can answer, an unknown caller reveals one detail that only his childhood friend could know.",
      author: "Noah",
      authorAvatar: publicAssets.authorAvatars[1], // calm Noah
      duration: "1:02",
      views: "2.1K",
      videoUrl: "/videos/feed/feed-03.mp4",
    },
    {
      id: "s1-branch-2c",
      parentId: "s1-official-1",
      episode: 2,
      title: "She was waiting across the street",
      prompt: "Lin looks through the cafe window and realizes the woman from his memory has been watching the entire conversation.",
      author: "Ava",
      authorAvatar: publicAssets.authorAvatars[2], // stylish Ava
      duration: "1:11",
      views: "986",
      videoUrl: "/videos/feed/feed-04.mp4",
    },
    {
      id: "s1-branch-3a",
      parentId: "s1-branch-2a",
      episode: 3,
      title: "The empty carriage",
      prompt: "The train restarts, but every passenger has disappeared except Lin and a child holding the same handwritten ticket.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:16",
      views: "1.7K",
      videoUrl: "/videos/feed/feed-04.mp4",
    },
    {
      id: "s1-branch-4a",
      parentId: "s1-branch-3a",
      episode: 4,
      title: "A name on the fogged window",
      prompt: "When the train tunnel fills with fog, a name appears on the window in Lin's own handwriting, even though he never touched the glass.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:10",
      views: "1.4K",
      videoUrl: "/videos/feed/feed-01.mp4",
    },
    {
      id: "s1-branch-5a",
      parentId: "s1-branch-4a",
      episode: 5,
      title: "The station that should not exist",
      prompt: "The train stops at a platform with no signs, no staff, and one bench where an old radio is already playing Lin's voice from tomorrow.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:09",
      views: "1.2K",
      videoUrl: "/videos/feed/feed-02.mp4",
    },
    {
      id: "s1-branch-6a",
      parentId: "s1-branch-5a",
      episode: 6,
      title: "He answers his own warning",
      prompt: "Lin follows the radio message to a ringing payphone and hears himself begging him not to leave the station alone.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:13",
      views: "1.0K",
      videoUrl: "/videos/feed/feed-03.mp4",
    },
    {
      id: "s1-branch-7a",
      parentId: "s1-branch-6a",
      episode: 7,
      title: "The child knows the ending",
      prompt: "The child from the empty carriage appears again and repeats the exact final sentence Lin has not said yet, then points toward the locked exit gate.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:05",
      views: "938",
      videoUrl: "/videos/feed/feed-04.mp4",
    },
    {
      id: "s1-branch-8a",
      parentId: "s1-branch-7a",
      episode: 8,
      title: "A photo from the next morning",
      prompt: "Inside the station office, Lin finds a printed photo taken tomorrow morning, showing him standing beside someone he has not met yet.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:07",
      views: "876",
      videoUrl: "/videos/feed/feed-01.mp4",
    },
    {
      id: "s1-branch-9a",
      parentId: "s1-branch-8a",
      episode: 9,
      title: "The platform lights go red",
      prompt: "As dawn should be breaking, every light on the platform turns red and an announcement orders Lin to choose one memory to give up.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:12",
      views: "821",
      videoUrl: "/videos/feed/feed-02.mp4",
    },
    {
      id: "s1-branch-10a",
      parentId: "s1-branch-9a",
      episode: 10,
      title: "The stranger finally turns around",
      prompt: "The stranger Lin has chased since episode two finally faces him, revealing the same ticket scar folded in the corner of their sleeve.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:15",
      views: "793",
      videoUrl: "/videos/feed/feed-03.mp4",
    },
    {
      id: "s1-branch-11a",
      parentId: "s1-branch-10a",
      episode: 11,
      title: "One question, one lost memory",
      prompt: "The stranger offers Lin one truthful answer, but every question he asks erases one piece of the night he is trying to remember.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:08",
      views: "741",
      videoUrl: "/videos/feed/feed-04.mp4",
    },
    {
      id: "s1-branch-12a",
      parentId: "s1-branch-11a",
      episode: 12,
      title: "The message he never sent",
      prompt: "Lin recovers an unsent voice note in his phone, and the first three seconds prove he knew this entire route before midnight began.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:11",
      views: "688",
      videoUrl: "/videos/feed/feed-01.mp4",
    },
    {
      id: "s1-branch-13a",
      parentId: "s1-branch-12a",
      episode: 13,
      title: "The last stop opens twice",
      prompt: "When the doors finally open at the last stop, Lin sees two versions of the same exit corridor and must choose which reality to step into.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:06",
      views: "644",
      videoUrl: "/videos/feed/feed-02.mp4",
    },
    {
      id: "s1-branch-14a",
      parentId: "s1-branch-13a",
      episode: 14,
      title: "She remembers him first",
      prompt: "On the other side of the corridor, Lin meets the woman from the cafe again, but this time she remembers exactly what he is about to forget.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:14",
      views: "611",
      videoUrl: "/videos/feed/feed-03.mp4",
    },
    {
      id: "s1-branch-15a",
      parentId: "s1-branch-14a",
      episode: 15,
      title: "The morning finally arrives",
      prompt: "Lin walks out into sunrise carrying only half the truth, while the handwritten ticket changes one final time and reveals who started the loop.",
      author: "Maya",
      authorAvatar: publicAssets.authorAvatars[0], // creative girl Maya
      duration: "1:18",
      views: "579",
      videoUrl: "/videos/feed/feed-04.mp4",
    },
  ],
};

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

// Micro-Dramas 玩法介绍三步图文（播放页 / SEO 介绍页共用）
export const microDramaGuideSteps = [
  {
    key: "watch-official",
    title: "Watch the official first episode",
    body: "Every Micro-Drama opens with an official first episode. Watch it to meet the characters and understand where the story begins.",
    imageUrl: imageUrl(
      "Clean app screenshot of a vertical short drama video playing on a smartphone, dark cinematic frame, play button overlay, episode title bar at top, minimal modern UI, high quality mockup, no readable text",
      "portrait_4_3",
    ),
  },
  {
    key: "continue",
    title: "Continue the story yourself",
    body: "When the episode ends, tap Continue and describe what should happen next. Spend Diamonds to generate a new video branch for the next episode.",
    imageUrl: imageUrl(
      "Clean app screenshot of a Continue episode composer modal on a smartphone, split layout with story recap on the left and a text input area on the right, primary Generate button with a diamond icon, minimal modern UI, high quality mockup, no readable text",
      "portrait_4_3",
    ),
  },
  {
    key: "rewrite",
    title: "Rewrite an episode you don't like",
    body: "Not satisfied with how someone continued an episode? Tap Rewrite to reimagine the current episode with your own idea and branch from there.",
    imageUrl: imageUrl(
      "Clean app screenshot of a Rewrite episode composer modal on a smartphone, split layout with previous story recap on the left and a text input area on the right, primary Generate button with a diamond icon, minimal modern UI, high quality mockup, no readable text",
      "portrait_4_3",
    ),
  },
];

