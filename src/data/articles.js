export const articles = [
  {
    slug: "feature-image-generation",
    type: "feature",
    title: "Image Generation",
    subtitle: "Generate study visuals and prompts—fast.",
    body: [
      "Use image generation to create simple learning aids: flashcards, scenario cues, or topic boards for speaking practice.",
      "Try prompts like “airport check-in vocabulary” or “coffee shop dialogue cues”. Keep outputs simple and focus on practice, not perfection.",
      "Tip: use images as speaking triggers—describe what you see in English, then ask for corrections and better phrasing.",
    ],
  },
  {
    slug: "feature-video-generation",
    type: "feature",
    title: "Video Generation",
    subtitle: "Short practice clips for listening and shadowing.",
    body: [
      "Video generation can create short, focused clips for listening drills and pronunciation shadowing.",
      "Keep sessions short: one sentence, one intonation pattern, one repeat loop. Consistency beats long sessions.",
      "Tip: shadow twice, record your version, then compare—ask the tutor to point out stress and rhythm differences.",
    ],
  },
  {
    slug: "feature-chat",
    type: "feature",
    title: "Chat",
    subtitle: "Your main practice loop: write → correct → repeat.",
    body: [
      "Chat is the fastest way to improve. Send a sentence, get a corrected version, then try again with a new example.",
      "Ask for: (1) corrected sentence, (2) a more natural alternative, (3) one quick follow-up question to answer.",
      "Tip: save your top 10 corrected sentences and review them daily for two minutes.",
    ],
  },
  {
    slug: "feature-create-characters",
    type: "feature",
    title: "Create Characters",
    subtitle: "Build tutors for different learning styles.",
    body: [
      "Create tutors that match your goals: pronunciation coach, grammar tutor, interview trainer, travel partner, and more.",
      "Give the tutor a clear teaching style: strict corrections, gentle explanations, or role-play only.",
      "Tip: create one tutor per goal so your practice stays consistent and measurable.",
    ],
  },
  {
    slug: "blog-pronunciation-tips",
    type: "blog",
    title: "Pronunciation Tips",
    subtitle: "Small fixes that make your English sound clearer.",
    date: "2026-05-21",
    coverUrl:
      "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimal%20editorial%20blog%20cover%20image%20for%20English%20pronunciation%20practice%2C%20clean%20modern%20style%2C%20soft%20gradient%2C%20subtle%20phonetic%20shapes%2C%20high%20quality%2C%20no%20text&image_size=landscape_16_9",
    body: [
      "Focus on stress first. Clear stress can improve comprehension more than perfect individual sounds.",
      "Shadow one sentence at a time. Copy rhythm and intonation, not just words.",
      "Pick one tricky word per day and practice it in five different sentences.",
    ],
  },
  {
    slug: "blog-speaking-practice",
    type: "blog",
    title: "Speaking Practice",
    subtitle: "How to practice speaking without feeling stuck.",
    date: "2026-05-18",
    coverUrl:
      "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimal%20editorial%20blog%20cover%20image%20for%20English%20speaking%20practice%2C%20conversation%20bubbles%20abstract%2C%20soft%20light%2C%20modern%20layout%2C%20high%20quality%2C%20no%20text&image_size=landscape_16_9",
    body: [
      "Use role-play. It removes pressure and gives you a script-like structure.",
      "Answer with short sentences first, then expand. Fluency grows from small wins.",
      "Ask for feedback on: word choice, grammar, and naturalness (not all at once).",
    ],
  },
  {
    slug: "blog-grammar-shortcuts",
    type: "blog",
    title: "Grammar Shortcuts",
    subtitle: "Learn the rule you actually need.",
    date: "2026-05-12",
    coverUrl:
      "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimal%20editorial%20blog%20cover%20image%20for%20English%20grammar%20tips%2C%20simple%20shapes%2C%20notebook%20feel%2C%20clean%20modern%20design%2C%20high%20quality%2C%20no%20text&image_size=landscape_16_9",
    body: [
      "Learn grammar through examples. One pattern + five sentences beats a long chapter.",
      "If you keep repeating one mistake, turn it into a micro-drill and practice daily.",
      "Ask the tutor for a “simple rule + common mistake + two practice questions”.",
    ],
  },
  {
    slug: "blog-travel-english",
    type: "blog",
    title: "Travel English",
    subtitle: "Phrases you can use immediately.",
    date: "2026-05-05",
    coverUrl:
      "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimal%20editorial%20blog%20cover%20image%20for%20travel%20English%20phrases%2C%20airport%20icons%20abstract%2C%20clean%20white%20space%2C%20soft%20gradient%2C%20high%20quality%2C%20no%20text&image_size=landscape_16_9",
    body: [
      "Learn phrases as full chunks: “Could I get…?”, “I’d like to…”, “Is it possible to…?”",
      "Practice the same scenario three times: slow → normal → fast.",
      "Ask for polite vs casual versions so you can sound natural in different contexts.",
    ],
  },
  {
    slug: "blog-study-routine",
    type: "blog",
    title: "Study Routine",
    subtitle: "A simple routine you can keep for weeks.",
    date: "2026-04-28",
    coverUrl:
      "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimal%20editorial%20blog%20cover%20image%20for%20daily%20study%20routine%20and%20habits%2C%20calendar%20and%20checklist%20abstract%2C%20clean%20modern%2C%20high%20quality%2C%20no%20text&image_size=landscape_16_9",
    body: [
      "Daily: 10 minutes speaking + 2 minutes review of corrected sentences.",
      "Weekly: one longer session to focus on one grammar pattern and one role-play scenario.",
      "Track only two metrics: “mistakes fixed” and “new phrases used in your own sentences”.",
    ],
  },
];

export const getArticleBySlug = (slug) => articles.find((a) => a.slug === slug) || null;
export const listBlogArticles = () => articles.filter((a) => a.type === "blog");
export const listFeatureArticles = () => articles.filter((a) => a.type === "feature");
