# 产品功能文档（AI 可读版）- AI Language Coach Demo

版本：Demo（以当前代码行为为准）  
定位：AI 外语学习教练（AI Language Coach / AI 学外语）  
目的：给开发/AI “直接读得懂并可按功能复刻”的产品说明文档（不包含接口/数据库/表结构建议）

---

## 0. 文档使用方式（给 AI/开发）

1) 本文档以“页面 → 模块 → 字段 → 数据来源 → 交互/状态机 → 异常/提示 → 与其它页面关系”的粒度描述。  
2) 文中“数据来源”会明确指出来自：
- Mock 静态数据（`src/data/mock.js` / `src/data/articles.js`）
- 本地状态（Zustand persist，本地设备持久化）
- URL 参数（path params / query params）
- 浏览器能力（SpeechSynthesis、Clipboard）
3) Demo 中很多数据目前是“设备本地持久化”；真实产品通常应迁移为“账号服务端保存”。本文档不会展开后端实现，仅标注“当前 Demo 来源”。

---

## 1. 路由与页面清单（以代码为准）

路由定义见：[App.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/App.jsx#L25-L55)

- `/` → 重定向到 `/browse`
- `/browse`：首页（Banner + Quick Access + Shorts + Characters + FAQ/SEO + Footer）
- `/feed`：Discover（短视频主播放 + 侧边解锁 clip 列 + 右侧人物信息/评论/分享）
- `/shorts`：Shorts 列表（按角色聚合的剧集入口）
- `/shorts/:id`：Shorts 播放详情（9:16，滑动切集，解锁，分享，收藏）
- `/create`：Create 容器（Outlet）
  - `/create`：模式选择（Standard / VIP）
  - `/create/normal`：Standard 创建向导
  - `/create/vip`：VIP 创建向导（含 Prompt + Worldbook）
- `/chat`：会话列表页（Outlet）
  - `/chat/:id`：ChatRoom（聊天窗口 + 右侧 Profile/Story/Shorts）
- `/favorites`：收藏聚合（Shorts / Characters / Created）
- `/subscribe`：订阅与💎购买（模拟支付流程）
- `/subscription`：订阅管理页（独立管理页，i18n 文案）
- `/account`：Account Center（Profile / Subscription 两个 Tab）
- `/blog`：博客聚合
- `/articles/:slug`：文章详情（feature/blog）
- `/privacy`：隐私政策
- `/terms`：用户协议
- `/faq`：FAQ 页面

---

## 2. 数据对象与数据来源（全局）

### 2.1 Mock 静态数据

#### 2.1.1 Characters（平台预置导师）
文件： [mock.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/mock.js#L63-L218)

字段（产品视角）：
- `id: string`（如 `c1`）
- `name: string`（导师名）
- `age: number`
- `bio: string`（导师介绍/教学风格）
- `starter: string`（聊天开场白）
- `avatarUrl: string`（头像：文生图 URL）
- `heroUrl: string`（大图：本地静态图或文生图 URL）
- `fallbackUrl: string`（avatar fallback）
- `tags: string[]`（角色标签，用于 profile 展示）
- `kind: "female" | "male" | "anime"`（首页筛选）
- `stats: { heat: number, online: boolean }`（热度/在线，仅展示或未来扩展）

#### 2.1.2 ShortDramas（Shorts 数据）
文件： [mock.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/mock.js#L262-L393)

字段：
- `id: string`（如 `s1`）
- `title: string`
- `episodes: number`
- `protagonist: string`（主角名；与角色名存在映射关系）
- `characterId: string`（绑定到 Characters，用于列表/头像/主演信息）
- `tags: string[]`（作品标签）
- `description: string`
- `coverUrl: string`（默认封面：文生图 URL）

#### 2.1.3 Articles（Blog/Feature）
文件： [articles.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/articles.js#L1-L120)

字段：
- `slug: string`
- `type: "feature" | "blog"`
- `title: string`
- `subtitle: string`
- `date?: string`（blog 专用）
- `coverUrl?: string`（blog 专用）
- `body: string[]`（段落数组）

#### 2.1.4 其它 mock
- `banners`： [mock.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/mock.js#L6-L40)（当前首页未使用轮播模块）

---

### 2.2 本地状态（Zustand persist）

文件： [useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js)

持久化说明：
- persist key：`ai-dialog-home`
- 持久化字段列表：见 [partialize](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js#L268-L284)
- 产品理解：当前 Demo 的“账号/订阅/💎/解锁/收藏/会话”等都保存在本机浏览器（同设备同浏览器有效）

#### 2.2.1 全局状态字段（含含义与来源）

**A. language**
- `language: string`（例如 `en-US`）
- 来源：初始默认值（store）+ 用户在侧边栏语言按钮修改

**B. session（登录态）**
- `session: { isLoggedIn: boolean, displayName: string, avatarUrl: string, email: string, provider: string }`
- 来源：
  - 未登录：默认值
  - 登录：AuthModal 模拟登录写入（email 登录或 Quick login）
- 影响范围：
  - 控制 Chat/Favorites 是否可访问
  - 评论发送、个人中心信息展示

**C. subscription（订阅态）**
- `subscription: { planId: null | "month" | "quarter" | "year", status: "none" | "active" | "canceled", renew: boolean, expiresAt: number | null }`
- 来源：/subscribe 模拟支付确认后写入，或 /account、/subscription 页面触发取消/续费切换

**D. diamonds（💎余额）**
- `diamonds: number`
- 来源：
  - 订阅成功赠送（Demo：150）
  - 购买💎包增加
  - 解锁/媒体请求/解锁剧集消耗

**E. createdCharacters（用户创建角色）**
- `createdCharacters: Character[]`
- 来源：/create/normal 与 /create/vip 完成后写入
- 与平台预置角色合并：`getAllCharacters() = seedCharacters + createdCharacters`

**F. conversations（会话列表）**
- `conversations: Array<{ id, characterId, updatedAt, messages: Message[] }>`
- `Message: { id, role: "user" | "assistant", text: string, attachments: Attachment[], createdAt }`
- `Attachment: { kind: "image" | "video" | "file", url, fallbackUrl?, name? }`（实际消息中使用 image/video）
- 来源：
  - openConversationForCharacter：首次创建会话 + 注入角色 starter
  - sendMessage / replyAsAssistant：追加消息

**G. mediaRequests（媒体请求次数计数）**
- `mediaRequests: { dateKey: string|null, used: number }`
- 规则：
  - `dateKey` 与本地日期（YYYY-MM-DD）不同时会重置 used
  - `freeLimit = 3`，超出后每次 `cost = 5💎`

**H. unlockedShortEpisodes（Shorts 剧集解锁）**
- `unlockedShortEpisodes: Record<dramaId, Record<episodeNumber, true>>`
- 来源：ShortDetail 解锁按钮/点集数按钮触发 `unlockShortEpisode`
- 产品规则：1-5 集免费（写死在 ShortDetail）

**I. unlockedFeedVideos（Discover clip 解锁）**
- `unlockedFeedVideos: Record<feedIdOrClipId, true>`
- 来源：Feed 页面中 Unlock 行为触发 `unlockFeedVideo`
- 注意：同一页存在两类 key：
  - 主 feed item id：如 `feed-02`
  - clip id：如 `feed-02-clip-01`

**J. favorites（收藏）**
- `favoriteShorts: string[]`（drama id 列表）
- `favoriteCharacters: string[]`（character id 列表）
- 来源：ShortDetail 的 Save、以及（部分页面的）收藏入口；Favorites 页读取展示

#### 2.2.2 关键行为函数（产品逻辑）

以下函数均在 store 内实现（产品可视为“业务动作”）：
- `login({ displayName, avatarUrl, email, provider })`
- `logout()`：会重置 session、subscription、diamonds、mediaRequests
- `subscribeToPlan({ planId, bonusDiamonds })`：设置订阅 active + 赠送💎 + expiresAt
- `cancelSubscription()`：subscription.status → canceled，renew → false
- `toggleRenew()`：自动续费开关
- `addDiamonds(amount)` / `spendDiamonds(amount)`
- `unlockShortEpisode({ dramaId, episode, cost })`：消耗💎并写入解锁 map
- `unlockFeedVideo({ feedId, cost })`
- `openConversationForCharacter(characterId)`：创建或返回已有会话；会话初始包含角色 starter
- `sendMessage({ conversationId, text, attachments })` / `replyAsAssistant({ ... })`
- `consumeMediaRequest({ freeLimit, cost })` / `getMediaRequestSummary({ freeLimit })`

---

### 2.3 UI 状态（非业务数据）

文件： [useUIStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useUIStore.js#L1-L36)

字段：
- `authOpen: boolean` / `authMode: "login" | "register"`：登录弹窗状态
- `postAuthPath: string|null`：登录成功后的回跳路径（关键）
- `languageOpen: boolean`：语言弹窗
- `sidebarCollapsed: boolean`：侧边栏折叠（并写入 localStorage）

关键逻辑：
- `openAuth({ mode, postAuthPath })`：打开登录弹窗并设置回跳路径
- `consumePostAuthPath()`：AuthModal 登录成功后读取并清空回跳路径

Auth 具体实现： [AuthModal.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/components/AuthModal.jsx#L68-L82)

---

## 3. 跨页面通用逻辑（必须理解）

### 3.1 登录拦截与回跳（postAuthPath）

模式：
1) 页面发现未登录 → 调用 `openAuth({ mode: "login", postAuthPath: 当前目标路由 })`
2) 用户登录成功 → AuthModal 内部 `consumePostAuthPath()` → `navigate(next, { replace: true })`

已覆盖页面：
- Chat： [Chat.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Chat.jsx#L20-L25)
- ChatRoom： [ChatRoom.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/ChatRoom.jsx#L268-L281)
- Favorites： [Favorites.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Favorites.jsx)（未登录态 + 自动弹窗）
- Subscribe：选 plan/pack 时如果未登录会弹登录并回跳 /subscribe
- 其它：Feed 评论发送/Start chat 也会用该逻辑

### 3.2 💎展示与消耗的统一表达

规则：
- UI 使用 “💎”或 `DiamondIcon`，不出现 “diamond(s)” 文本
- 余额来自 store `diamonds`
  - TopBar 会展示订阅计划名与余额： [TopBar.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/components/TopBar.jsx#L35-L48)

### 3.3 媒体预览与 TTS

Chat 中媒体预览：
- 消息附件（image/video）点击后打开 Modal 预览（图片可放大、视频为 loop autoplay，且无 controls）
- 入口实现： [ChatRoom.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/ChatRoom.jsx#L298-L330)

TTS（Read aloud）规则：
- 仅对 assistant 的纯文本消息提供（如果消息包含 image/video attachments，则不显示朗读按钮）
- 判定：`canSpeak = !isUser && Boolean(m.text) && !hasMedia`

---

## 4. 页面级功能说明（逐页，含字段与数据来源）

### 4.1 AppShell（全局布局）
文件： [AppShell.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/layouts/AppShell.jsx#L15-L33)

结构：
- 左：Sidebar（导航、语言、Legal、社交）
- 上：TopBar（订阅入口、登录/个人菜单）
- 中：主内容 Outlet
- 浮层：AuthModal、LanguageModal

---

### 4.2 Sidebar（左侧导航）
文件： [Sidebar.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/components/Sidebar.jsx#L23-L31)

导航项（数据来源：代码常量 navItems）：
- Home → `/browse`
- Discover → `/feed`
- Shorts → `/shorts`
- Create → `/create`
- Chat → `/chat`
- Favorites → `/favorites`
- Subscription → `/subscribe`

语言按钮：
- 点击打开 LanguageModal（`useUIStore.openLanguage`）
- 当前语言展示来自 store `language` + `languageOptions`

Legal 列表（数据来源：protocols 常量）：
- Privacy Policy → `/privacy`
- User Agreement → `/terms`
- FAQ → `/faq`
- Blog → `/blog`

社交链接（数据来源：socialLinks 常量）：
- Discord/X/Instagram/TikTok（外链）

---

### 4.3 TopBar（顶部条）
文件： [TopBar.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/components/TopBar.jsx#L28-L105)

左侧（实际是右对齐布局）：
1) Subscription 按钮（一直显示）
- 点击：导航到 `/subscribe`
- 文案：
  - 未订阅：显示 i18n 的 `top_subscribe`
  - 已订阅：显示计划名（Yearly/Quarterly/Monthly）+ 当前💎余额
- 数据来源：
  - `subscription`、`diamonds` from store

2) 用户区域：
- 未登录：Login 按钮 → openAuth
- 已登录：头像 + “Profile”按钮，弹出菜单：
  - Account Center → `/account`
  - Sign out → `useAppStore.logout()`

---

### 4.4 首页 `/browse`（BrowseHome）
文件： [BrowseHome.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/BrowseHome.jsx)

页面数据来源：
- Characters：`useAppStore.getAllCharacters()`（seed + created）
- ShortDramas：`shortDramas` from mock
- Quick Access 背景图：运行时拼 `text_to_image` URL（t2i）

模块 1：顶部 Banner（静态文案区块）
- 字段：
  - Title：`AI Language Coach`
  - Subtitle：固定英文介绍
- 数据来源：页面常量（非 store / 非 mock）

模块 2：Quick Access（快速入口卡片）
- 入口项（4 个）：
  - Shorts `/shorts`
  - Discover `/feed`
  - Create `/create`
  - Chat `/chat`
- 每项字段：
  - `label`
  - `href`
  - `coverUrl`（文生图 URL）
- 交互：
  - 点击 → navigate 到对应路由

模块 3：Shorts（首页短剧模块）
- 数据来源：`shortDramas`（mock）
- Featured 卡片（正在播放）：
  - 视频源：`/videos/feed/feed-02.mp4?v=...`
  - 展示规则：
    - 不展示人物信息/标题/描述/Hot
    - hover 才显示控制按钮：Pause/Play + Mute/Unmute
  - 交互：
    - 点击卡片空白区域 → 进入 `/shorts/${featuredDrama.id}`
    - 点击 Pause/Play → 仅控制播放，不跳转
    - 点击 Mute → 切换视频静音
- 其它短剧卡片：
  - 使用 `ShortCard` 渲染（封面来自 getShortsCoverSrc fallback）
  - 字段：title、episodes、protagonistAvatarUrl
  - 交互：点击 → `/shorts/:id`

模块 4：Characters 列表 + 类型筛选
- 数据来源：`getAllCharacters()`
- 筛选：
  - `character.kind === female/anime/male`
- 展示：
  - ImmersiveCharacterCard
  - Start Chat：走“创建/打开会话→未登录弹登录→登录后跳 chat/:id”

模块 5：FAQ + SEO 文案
- FAQ：页面内 `faqItems` 常量 + accordion state
- SEO：静态文案块
- Footer：HomeFooter（Feature/Blog/Legal/Payments）

---

### 4.5 Discover `/feed`（Feed）
文件： [Feed.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Feed.jsx)

页面目标：
- 左侧：主视频沉浸播放（9:16）
- 右侧：人物信息 + Comments（可发送）+ Share
- 右侧侧栏：多条 clip（全部以“解锁才能播放”为核心机制）

页面数据来源：
- 基础角色：`getAllCharacters()`，取前 4 个作为 feed 关联角色
- feed items：页面内 useMemo 构造（`feed-01..04`）
  - 字段：
    - `id`
    - `videoSrc`
    - `requiresUnlock?: boolean`
    - `unlockCost?: number`（默认 5）
    - `username`、`caption`、`tags`
    - `characterId`
    - `hasShorts`、`shortId`
    - `likeCount`、`shareCount`
- clips：页面内 useMemo 构造 8 条
  - 字段：
    - `id: ${activeId}-clip-XX`
    - `videoSrc: /videos/feed/feed-0n.mp4`
    - `coverUrl: /images/home/shorts-covern.png`

关键状态与规则：
- 主视频锁定判断：
  - 如果选中 clip：锁定取 `unlockedFeedVideos[clip.id]`
  - 否则：锁定取 `active.requiresUnlock && !unlockedFeedVideos[active.id]`
- clip 全部可点：
  - 未解锁：点击会消耗 5💎 并写入 `unlockedFeedVideos[clip.id]=true`
  - 已解锁：切换为主视频播放（selectedClipId）

用户交互：
- 滚轮/键盘上下切换 feed item：
  - wheel delta threshold + 节流（650ms）
  - ArrowUp/ArrowDown 切换
- 主视频点击：toggle Play/Pause（锁定时无效）
- 音量控制：
  - hover 露出 Pause/Play、Mute、音量滑杆
- Like：
  - 右侧心形按钮仅影响本地 liked 状态（UI+1）
- Follow：
  - 右侧人物卡 Follow/Following 切换（本地状态）
- Start chat：
  - openConversationForCharacter(character.id)
  - 未登录弹登录并回跳到 `/chat/:conversationId`
- Shorts tab：
  - 如果 active.hasShorts：显示 Shorts tab
  - 点击 Watch now：跳到 `/shorts/${active.shortId}`
- Comments：
  - commentsByFeed 是页面内 local state（按 feed-xx 分组）
  - 未登录发送评论：会暂存 pendingCommentRef，并弹登录；登录后自动补发
  - 点 Reply 目前仅 UI（不产生输入框）
  - 点展开 replies：expandedReplies 控制
- Share：
  - 弹窗展示渠道列表 + Link + Copy（Clipboard）
  - shareUrl：`${origin}/feed?item=${active.id}`

异常与提示：
- 解锁失败（余额不足）：toast “Not enough 💎.”
- Copy 失败：toast “Copy failed.”

---

### 4.6 Shorts 列表 `/shorts`
文件： [Shorts.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Shorts.jsx)

页面数据来源：
- `characters`（注意：这里直接从 mock 引用，不包含用户创建角色）
- `shortDramas` from mock

列表结构：
- 按 shortDrama 映射到 `characterId` 找角色信息（必须存在才展示）
- 每条展示：
  - 左侧角色信息：avatar、name、bio（2 行）
  - 右侧剧集封面入口：默认展示前 6 集 + More

剧集封面图策略：
- preferred：`/images/shorts/episodes/${drama.id}/ep-XX.png`
- fallback：`/images/home/shorts-cover*.png`
- onError：切换到 fallback

交互：
- 点击某集封面：`/shorts/${drama.id}?ep=${ep}`（带 query 定位集数）
- 点击 More：`/shorts/${drama.id}`

---

### 4.7 Shorts 播放详情 `/shorts/:id`
文件： [ShortDetail.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/ShortDetail.jsx)

页面数据来源：
- `drama`：按 `:id` 从 mock.shortDramas 查找（找不到则 fallback 到第一条）
- diamonds：store
- unlockedShortEpisodes：store
- favoriteShorts：store

核心字段与规则：
- `totalEpisodes = min(10, drama.episodes)`
- `episode` 当前集数：
  - 优先从 query `?ep=` 初始化（requestedEpisode）
  - 不合法则回退到 1
- 解锁规则：
  - 1–5 集免费（写死）
  - 6+ 集：需要 `unlockedShortEpisodes[drama.id][ep] === true`
  - 解锁成本：固定 `unlockCost=5`

视频源策略（强保证可播放）：
- preferred：`/videos/shorts/${drama.id}/ep-XX.mp4`
- fallback：轮换 `/videos/feed/feed-01..04.mp4`
- onError：preferred 失败自动切 fallback

交互：
- 视频滑动切集：
  - wheel / touch swipe，上下滑切换 episode（节流 320ms）
  - 切到未解锁集：视频继续显示但覆盖锁定毛玻璃
- 解锁：
  - 点击 Unlock：调用 `unlockShortEpisode({ dramaId, episode, cost: 5 })`
  - 余额不足：toast “Not enough 💎.”
- Episodes grid：
  - 点击集数按钮：
    - 已解锁：切换集数
    - 未解锁：直接发起解锁，成功后切换
- 收藏（Save）：
  - toggleFavoriteShort(drama.id)
  - saved 状态：favoriteShorts includes drama.id
- Share：
  - 弹窗渠道 + Copy link
  - shareUrl：`${origin}/shorts/${drama.id}`
- Like：
  - local state liked（不入库）

页面展示字段：
- 作品标签区展示 3 个 pill：
  - protagonist（主角）
  - tags[0], tags[1]（不足补 “Drama”）

---

### 4.8 Create `/create`（容器）
文件： [CreateEntry.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/CreateEntry.jsx)

说明：
- 仅为容器与布局，实际步骤在 ModeSelect/Normal/VIP

---

### 4.9 Create 模式选择 `/create`
文件： [CreateModeSelect.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/CreateModeSelect.jsx)

数据来源：
- `subscription.status` from store

规则：
- Standard：任何用户可进入 `/create/normal`
- VIP：
  - 如果 `subscription.status === "active"`：进入 `/create/vip`
  - 否则：跳转 `/subscribe`

展示字段：
- 两张 cover：文生图 URL（standardCover/vipCover）
- 每个卡片说明固定文案（步骤说明）
- VIP 卡片展示 `Locked/Unlocked` 标记（由订阅状态决定）

---

### 4.10 Standard 创建 `/create/normal`
文件： [CreateNormal.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/CreateNormal.jsx)

目标：
- 游戏化 stepper（outer → inner → result）
- result 生成一个角色并可 Start Chat

步骤：
- `outer-1`：Race + Age
- `outer-2`：Body type + Eye color
- `outer-3`：Hair style + Hair color
- `inner`：Name + Personality
- `result`：展示生成结果 + CTA

字段与来源：
1) 用户选择字段（组成 profile）：
- `race, age, hairStyle, hairColor, eyeColor, body, personality`
- `name`

2) 生成字段（generated，受 assetVersion/variant 影响）：
- `heroUrl`：`/images/create/results/standard/hero-${variant}.png`
- `avatarUrl`：`/images/create/results/standard/avatar-${variant}.png`
- `starter`：固定开场白
- `bio`：根据 summary 组合
- `tags`：从选择项组合
- `age`：沿用用户选择

3) 写入 createdCharacters 的 character 对象结构：
- `id: u-...`
- `name, age, bio, starter, avatarUrl, heroUrl, tags, stats`
- `profile: { race, age, hairStyle, hairColor, eyeColor, body, personality }`

交互：
- Stepper 圆点可点击跳转 step
- 键盘 ←/→ 可切步（非 input/textarea 聚焦时）
- Name：
  - 支持输入
  - 支持 Shuffle 名字建议（6 个建议）
- Result：
  - Start Chat：创建角色→写入 store→打开会话→未登录弹登录→登录后进入 chat
  - Create Again：重置所有字段

---

### 4.11 VIP 创建 `/create/vip`
文件： [CreateVip.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/CreateVip.jsx)

入口条件：
- 必须 `subscription.status === "active"`
- 否则展示拦截页并引导 `/subscribe`

步骤：
- `outer-1/2/3`：同 Standard
- `inner`：同 Standard
- `prompt`：Prompt 输入（可 Shuffle 示例并一键 Use）
- `worldbook`：Worldbook（新增，Write/Upload 二选一，解析后可预览与编辑）
- `result`：生成 3 个候选形象，用户选择其一后 Start Chat

新增字段（VIP 专属）：
- `prompt: string`
- `profile.prompt` 会写入角色 profile

Worldbook 功能（VIP 新环节，产品逻辑）：
1) 输入方式二选一：
- `Write`：直接在 textarea 输入世界书文本
- `Upload file`：上传文件（`.txt/.md/.json`）
2) 上传解析：
- 当前 Demo 解析方式：FileReader `readAsText()` 读文本 + 延迟 650ms 模拟“解析中”
- 上传后自动填充到 `worldbookText`，用户可继续修改
3) 结构化预览（Preview）：
- `title` 来源：
  - 用户 Title input
  - 或从正文首行 `# ` Markdown 标题推断
  - 否则默认 “Worldbook”
- `paragraphs` 切分规则：按空行分段（`\n\n` 及以上）
- `summary`：取第一段前 120 字

Worldbook 写入角色（Start Chat 时）：
- 如果 worldbook 解析后 paragraphs 非空：
  - 写入 `profile.worldbooks = [{ id: "wb-user", title, summary, paragraphs }]`
- ChatRoom 的 Story 会优先展示该 worldbook（见 4.13）

Result（3 candidates）：
- 候选图路径：
  - hero：`/images/create/results/vip/candidate-n-hero.png`
  - avatar：`/images/create/results/vip/candidate-n-avatar.png`
- 用户选择 candidate 后 Start Chat：
  - avatarUrl/heroUrl 取选中候选
  - 其它字段与 Standard 类似

---

### 4.12 Chat 列表 `/chat`
文件： [Chat.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Chat.jsx)

入口条件：
- 未登录：自动弹登录（postAuthPath 为 `/chat` 或 `/chat/:id`）

数据来源：
- conversations：store
- characters：`getAllCharacters()`

会话项字段（派生）：
- `conversationId`
- `character`（由 conversation.characterId 查找）
- `preview`：
  - 优先 last.text
  - 否则如果 last.attachments 存在：显示 `[Image]` / `[Video]` / `[File]`
  - 否则 “…”
- `ts`：
  - conversation.updatedAt 或 last.createdAt
- 时间格式化规则：
  - 当天：HH:MM
  - 非当天：YYYY-MM-DD

交互：
- 点击会话项：进入 `/chat/:conversationId`

---

### 4.13 ChatRoom `/chat/:id`
文件： [ChatRoom.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/ChatRoom.jsx)

入口条件：
- 必须登录；未登录显示提示 + Login 按钮（并可自动弹窗）

数据来源：
- conversation：store.conversations by `:id`
- character：`getAllCharacters()` by conversation.characterId
- diamonds：store
- mediaRequests/quota：store.getMediaRequestSummary({ freeLimit: 3 })

页面结构：
1) 顶部条（角色头像/名/标签 + 💎余额 + 今日免费次数剩余）
2) 消息区（左侧主区域）
3) 输入区（输入框 + Send）
4) 右侧信息面板（仅桌面端显示）Tabs：
  - Profile
  - Story（Worldbook）
  - Shorts

消息模型与展示规则：
- 用户消息：右对齐深色气泡
- AI 消息：左对齐浅色气泡
- attachments：
  - image：在气泡内展示缩略图，点击打开 Preview modal
  - video：在气泡内展示 9:16 video 缩略（muted）+ play 覆盖层，点击打开 Preview modal
- TTS（Read aloud）：
  - 仅 AI 的纯文本消息显示

消息发送与 AI 回复（Demo 行为）：
- onSend：
  - 将用户输入写入 messages
  - 等待 550ms
  - 生成 mock 回复（buildAssistantReply）
- requestMedia(kind):
  - 调用 `consumeMediaRequest({ freeLimit: 3, cost: 5 })`
  - 免费：toast “Request sent (free).”
  - 付费：toast “Request sent (-5 💎).”
  - 余额不足：toast “Not enough 💎.”
  - AI 回复带 attachments（image/video）并可预览

Story / Worldbook（重点规则）：
- worldbooks 数据来源优先级：
  1) 如果 `character.profile.worldbooks` 存在且有内容：优先使用（VIP Create 写入）
  2) 否则：使用页面内 useMemo 基于角色信息生成（对部分角色 id 会生成多本）
- 多本 worldbook 交互：
  - `list`：展示 worldbook 列表，当前 activeWorldbookId 标记 “In use”
  - 点击某本进入 `detail`：
    - 先进入 Preview（不立即切换使用中）
    - 底部两个按钮：
      - Back：回到 list
      - Switch：将 viewedWorldbookId 设为 activeWorldbookId，切换为 In use
    - 如果 viewed 已是 active：Switch 按钮置灰

Shorts tab：
- 依据角色名与 shortDramas.protagonist 匹配，找不到则 fallback 取前 6 条
- 每条展示封面、title、episodes，并提供 Play 按钮（跳 /shorts）

---

### 4.14 Favorites `/favorites`
文件： [Favorites.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Favorites.jsx)

入口条件：
- 必须登录
- 未登录：
  - 自动弹登录（只触发一次，避免无限弹）
  - 页面展示极简卡：顶部图片 + Login + Home

数据来源（已登录态）：
- favoriteShorts：store（drama id 数组）
- favoriteCharacters：store（character id 数组）
- createdCharacters：store
- all characters：`getAllCharacters()`
- shortDramas：mock

Tabs（页面常量）：
- Shorts
- Characters
- Created

每个 tab 展示逻辑：
- Shorts：
  - 用 favoriteShorts 映射到 shortDramas，展示 ShortCard
  - 为空：空态 “No saved shorts yet.”
- Characters：
  - 用 favoriteCharacters 映射到角色对象，展示 ImmersiveCharacterCard（含 Start Chat）
  - 为空：空态
- Created：
  - 直接展示 createdCharacters
  - 为空：空态

---

### 4.15 Subscription `/subscribe`
文件： [Subscribe.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Subscribe.jsx)

目标：
1) 订阅计划购买（模拟）
2) 💎包购买（前置条件：必须已订阅）

数据来源：
- session、subscription、diamonds：store
- 动作：subscribeToPlan、addDiamonds、openAuth
- plans、diamondPacks：页面内 useMemo 构造

订阅计划（plans）字段：
- `id: "month" | "quarter" | "year"`
- `name`
- `original` / `discounted`（价格展示）
- `discountLabel?: string`
- `period: "/mo" | "/quarter" | "/year"`
- `highlight: boolean`（年付推荐）

💎包（diamondPacks）字段：
- `id`
- `diamonds`
- `original` / `discounted`
- `label`（折扣）

关键规则（按代码行为）：
- 选 plan：
  - 未登录：弹登录（postAuthPath=/subscribe）
  - 已订阅：
    - 不支持降级（planRank 更低 → toast “Downgrades are not supported.”）
  - 打开确认弹窗（confirmKind="plan"）
- 选 💎包：
  - 未登录：先暂存 pendingPack → 弹登录（回跳 /subscribe）
  - 已登录但未订阅：提示 “Subscription required to buy 💎.” 并强引导先订阅（默认选 yearly）
  - 已订阅：打开确认弹窗（confirmKind="pack"）
- pay：
  - 需要选择 paymentMethod（UI 模拟）
  - confirmKind="plan"：调用 subscribeToPlan({ planId, bonusDiamonds: 150 })
  - confirmKind="pack"：调用 addDiamonds(pack.diamonds)
  - 订阅完成后若 pendingPack 存在，会自动再打开 pack confirm（150ms 延迟）

展示字段：
- 顶部状态：
  - 未订阅：引导选择计划
  - 已订阅：显示 Current plan + 💎余额
- rules 文本列表（固定）

---

### 4.16 Subscription Management `/subscription`
文件： [SubscriptionManagement.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/SubscriptionManagement.jsx)

目标：
- 展示当前订阅状态
- Auto-renew 开关
- Cancel subscription

数据来源：
- language：store（i18n）
- subscription：store
- cancelSubscription / toggleRenew：store

展示逻辑：
- 未订阅：显示 “无订阅”文案 + 按钮去 `/subscribe`
- 已订阅：
  - 展示 planLabel（month/year/其它）
  - expiresAt 使用 `formatDateTime()` 格式化
  - Auto-renew 开关按钮（ToggleLeft/ToggleRight）
  - Cancel subscription 按钮

---

### 4.17 Account Center `/account`
文件： [Account.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Account.jsx)

入口条件：
- 必须登录；未登录显示提示

结构：
- 顶部 Tab：Profile / Subscription

Profile Tab：
- 字段：
  - avatar（可上传）
  - username（可编辑）
  - registered email（只读展示 session.email）
- 数据来源：
  - session from store
  - updateSessionProfile 写回 store
- 交互：
  - Upload：FileReader → dataURL 写入本地 avatarUrl
  - Cancel：恢复为 session 值
  - Save：updateSessionProfile（仅当有变化且 name 非空）

Subscription Tab（精致 mock + 流程完整）：
- Subscription 卡：
  - 状态：Active/Canceled/Free（由 subscription.status）
  - 计划：planLabel（month/quarter/year）
  - Next billing date：用 expiresAt 本地格式化
  - Auto-renew：展示 subscription.renew
  - Cancel subscription：弹窗确认后调用 cancelSubscription
- Diamonds 卡：
  - 展示 diamonds balance
- Diamond usage（消费明细）：
  - Demo 内部 mock ledger（earn/spend，包含时间、标题、副标题、±💎）
- How cancellation works：
  - 固定说明文案

---

### 4.18 Blog `/blog` 与 Article `/articles/:slug`
文件：
- Blog： [Blog.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Blog.jsx)
- Article： [Article.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Article.jsx)
- 数据： [articles.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/articles.js)

Blog：
- 展示 featured post（最新日期）
- 其余为卡片列表（cover、title、subtitle、date、Read）
- Read 跳转 `/articles/:slug`

Article：
- 按 slug 查找文章
- 页面展示：title、subtitle、date（如有）、body 段落

---

### 4.19 Legal：`/privacy`、`/terms`、`/faq`
文件：
- Privacy： [Privacy.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Privacy.jsx)
- Terms： [Terms.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/Terms.jsx)
- FAQ： [FAQ.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/FAQ.jsx)

规则：
- 都是独立页面（非 modal）
- Privacy/Terms：长文博客式文本（无图片，品牌名为占位符）
- FAQ：问答折叠交互（View/Hide）

---

## 5. 资源路径约定（Demo 行为）

短视频：
- Discover 主视频：`/videos/feed/feed-01.mp4` ~ `feed-04.mp4`
- 首页 Featured：也使用 feed-02 作为演示源
- Shorts 详情 preferred：`/videos/shorts/{dramaId}/ep-XX.mp4`（不存在则 fallback 到 feed）

图片：
- Shorts 列表剧集封面 preferred：`/images/shorts/episodes/{dramaId}/ep-XX.png`（不存在则 fallback）
- 首页/Discover/Shorts fallback 封面：`/images/home/shorts-cover*.png`
- Create 结果图：`/images/create/results/...`
- Quick Access/Logo/头像：多为 `text_to_image` URL（运行时生成）

说明：
- 代码中大量资源通过 `?v=${Date.now()}` 进行 cache busting

---

## 7. 交付核对清单（产品验收点）

> 这一节给 AI/开发做“是否实现一致”的对照，不涉及接口细节。

1) 未登录访问 Chat/Favorites：必须触发登录（并能登录后回跳原页）
2) Subscribe：
  - 未登录购买 plan/pack：必须先登录
  - 未订阅购买 pack：必须先订阅
  - 订阅成功赠送 💎，并让 VIP Create 解锁
3) Shorts 详情：
  - 1-5 集免费，6+ 集 5💎解锁
  - 解锁状态要持久化（刷新后仍有效）
  - 支持 `?ep=` 定位集数
4) Discover：
  - 主视频可锁定并解锁（5💎）
  - 侧边 clips 默认锁定，解锁后可切换主视频
  - 评论未登录发送：登录后自动补发（Demo 行为）
5) VIP Create：
  - Worldbook 支持 Write / Upload 文件二选一
  - 上传后可解析出文本（模拟解析中）并可编辑预览
  - 创建角色后 ChatRoom 的 Story 优先展示该 worldbook
