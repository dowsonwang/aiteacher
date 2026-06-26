# 产品交互说明（基于 Demo）— Heartbits ai

## 0. 这份文档写给谁

给开发与 AI 开发：你可以把它当成“交互规格”。重点回答：

- 用户在每个页面能看到什么
- 点哪里会去哪里
- 点了之后页面有什么反馈/状态变化
- 空状态/未登录/不足额度时怎么表现

备注：本 Demo 中的登录、订阅支付、AI 能力、内容推荐等均为本地 Mock；但交互逻辑与状态变化可直接迁移到真实产品。

## 1. 全局规则（所有页面通用）

### 1.1 导航结构

左侧侧边栏常驻入口：

- Home（主页）/browse
- Discover（发现）/feed
- Shorts（短剧）/shorts
- Create（创建人物）/create
- Chat（聊天）/chat
- Favorites（收藏）/favorites
- Subscription（订阅）/subscribe

### 1.2 登录触发（Login Gate）

当用户未登录时：

- 点击某些需要登录的功能，会弹出登录弹窗（Login Modal）
- 登录成功后，会自动回跳到触发登录前的目标页面（例如 /favorites、/chat/:id、/subscribe）

### 1.3 顶部栏（Top bar）

右上角有订阅入口按钮（Subscription）：

- 未订阅：显示订阅按钮文案
- 已订阅：显示当前计划 + 钻石余额（💎）

右上角 Profile/Account 菜单：

- 未登录：显示 Login 按钮，点击弹登录
- 已登录：显示用户头像与“Profile”按钮，点开下拉菜单：
  - Account Center：进入 /account
  - Logout：退出登录（Demo 为本地态）

## 2. 页面级交互说明

### 2.1 Home（/browse）

页面结构（顶部核心区）：

- 左：头部标题 + 一段介绍文案 + 3 个入口按钮
  - 入口按钮：Shorts / Discover / Create
- 右：Shorts 模块（横向可滑动的一排短剧卡）
  - 第 1 张：正在播放短剧（仅播放画面；hover 才出现 Pause/Play 与 Mute/Unmute）
  - 后续卡片：短剧封面卡，展示集数标签（例如 “8 eps”）、底部剧名与主演头像

数据需求（页面需要哪些数据 / 字段名建议）：

- 入口按钮（3 个）
  - `entry.label`：按钮文案（Shorts / Discover / Create）
  - `entry.href`：点击跳转路由（/shorts、/feed、/create）
  - `entry.coverUrl`：按钮背景图（可选，用于质感卡片）
  - `entry.icon`：按钮图标（可选）
- Shorts 模块（横滑卡片）
  - `shortDrama.id`：短剧 id（用于跳转 /shorts/:id）
  - `shortDrama.title`：短剧标题（卡片底部展示）
  - `shortDrama.episodes`：总集数（卡片左上 “x eps”）
  - `shortDrama.coverUrl`：9:16 封面图（若使用固定封面也可用 `shortDrama.coverSrc` 覆盖）
  - `shortDrama.characterId`：关联角色 id（用于拿主演头像）
  - `character.avatarUrl`：主演头像（卡片底部小圆头像）
  - `featured.videoSrc`：正在播放短剧的视频源（Demo 为固定资源；真实产品可来自短剧资源表）
- Characters 模块（人物卡片网格）
  - `character.id`：角色 id（点击卡片 → 创建/打开会话）
  - `character.name`：角色名（卡片底部展示）
  - `character.age`：年龄（卡片右下展示，可选）
  - `character.bio`：角色介绍文案（卡片底部一行/hover 详情）
  - `character.heroUrl` / `character.photoUrl` / `character.avatarUrl`：人物大图（卡片主图，优先 hero）
  - `character.fallbackUrl`：图片兜底（可选）
  - `character.kind`：类型筛选（female / male / anime）
- FAQ 模块
  - `faqItem.q`：问题
  - `faqItem.a`：答案

关键交互：

- 点左侧 3 个入口按钮：
  - Shorts → 跳转 /shorts
  - Discover → 跳转 /feed
  - Create → 跳转 /create
- Shorts 模块右上角 “View all →”：
  - 跳转 /shorts
- Shorts 横滑：
  - 可水平滑动浏览更多卡片（滚动条默认隐藏）
- 点任意短剧卡：
  - 跳转到对应短剧详情页 /shorts/:id（可能附带 ep 查询参数）

### 2.2 Discover（/feed）

页面结构：

- 左侧：竖屏 9:16 主视频（类似短视频 feed）
- 右侧：角色信息/操作区 + 评论区（含输入框）
- 桌面端右侧还有一列预览 clip（可点击解锁并切换）

数据需求（页面需要哪些数据 / 字段名建议）：

- Feed 主列表（每条一组数据）
  - `feedItem.id`：条目 id（用于解锁状态、分享链接、路由 query）
  - `feedItem.videoSrc`：主视频源
  - `feedItem.coverUrl`：封面图（用于 clip/预览图，可选）
  - `feedItem.username`：发布者/账号名（展示用）
  - `feedItem.caption`：文案（展示用）
  - `feedItem.tags[]`：标签数组（展示用）
  - `feedItem.characterId`：关联角色（用于右侧角色信息）
  - `feedItem.likeCount` / `feedItem.shareCount`：计数（展示用）
  - `feedItem.hasShorts`：是否有关联短剧入口
  - `feedItem.shortId`：关联短剧 id（hasShorts=true 时用于跳转 /shorts/:id）
  - `feedItem.requiresUnlock`：是否需要解锁
  - `feedItem.unlockCost`：解锁成本（💎）
- 角色信息（右侧面板）
  - `character.id`
  - `character.name`
  - `character.avatarUrl`
  - `character.age`（可选）
  - `character.bio`
- 解锁与资产
  - `wallet.diamonds`：当前 💎 余额
  - `unlockedFeedVideos[feedId] = true/false`：解锁状态（应账号维度）
- 评论（右侧评论区）
  - `comment.id`
  - `comment.user.name`
  - `comment.user.avatar`
  - `comment.createdAt`
  - `comment.text`
  - `comment.likes`
  - `comment.replies[]`：回复数组（同结构）

关键交互（主视频）：

- 鼠标滚轮/键盘上下键：
  - 切换上一条/下一条 feed 内容
- 点击主视频画面：
  - 播放/暂停（未解锁时不可播放）
- hover 主视频：
  - 出现 Pause/Play、Mute/Unmute 与音量滑杆
- Like：
  - 点心形按钮切换 liked 状态，数字会随状态 +1/-1（Demo 表现为本地变化）

关键交互（解锁与扣费）：

- 部分 feed 内容或 clip 需要解锁（弹层显示 Unlock required）
- 点 Unlock：
  - 若钻石不足：toast “Not enough 💎.”
  - 若足够：扣除钻石并提示已解锁（toast），此内容在本机“已解锁”状态保存

关键交互（Start chat / Shorts）：

- 右侧 Character Tab：Start chat
  - 若未登录：弹登录；登录后回到对应 /chat/:id
  - 若已登录：直接进入 /chat/:id
- 右侧 Shorts Tab（当 feed 项带 shorts）：
  - 点 “Watch now” 跳到对应短剧 /shorts/:id

关键交互（评论）：

- 未登录输入评论并 Send：
  - 先弹登录；登录后把这条评论补发到当前 feed 的评论列表顶部
- 已登录 Send：
  - 评论即时出现在列表顶部（本地 mock）
- 评论 Like / 展开 replies：
  - 点心形切换 liked；点 “x replies ▲/▼” 展开或收起回复列表

### 2.3 Shorts 列表（/shorts）

页面结构：

- 按短剧系列分组显示（每组包含角色头像、名字、简介 + 一排 episode 预览卡）

数据需求（页面需要哪些数据 / 字段名建议）：

- 短剧系列（list）
  - `shortDrama.id`
  - `shortDrama.characterId`：用于关联主演/角色信息
  - `shortDrama.episodes`：总集数（用于生成 Ep 预览数量）
- 角色信息（每个系列左侧）
  - `character.id`
  - `character.name`
  - `character.avatarUrl`（圆头像）
  - `character.heroUrl` / `character.fallbackUrl`（兜底）
  - `character.bio`（两行简介）
- 每集预览卡（Ep x）
  - `episode.ep`：集数编号（1..N）
  - `episode.coverUrl`：单集封面（Demo 优先使用固定路径，不存在则 fallback 到通用封面）

关键交互：

- 点某个 episode 小卡（Ep x）：
  - 跳转 /shorts/:id?ep=x
- 点 “More”：
  - 跳转 /shorts/:id（进入该短剧详情页）

### 2.4 Shorts 详情（/shorts/:id）

页面结构：

- 左：竖屏 9:16 视频播放区（支持滚轮/触摸上下滑切集）
- 右：短剧信息（标题、描述、标签）、钻石余额、当前集数、操作按钮（Like/Save/Share）
- 下方：集数网格（1~N）

数据需求（页面需要哪些数据 / 字段名建议）：

- 短剧基础信息
  - `shortDrama.id`
  - `shortDrama.title`
  - `shortDrama.description`
  - `shortDrama.episodes`：总集数（生成 1..N）
  - `shortDrama.protagonist`：主演名（用于标签展示）
  - `shortDrama.tags[]`：标签（用于展示两个 tag）
- 播放资源
  - `episode.videoSrc`：某一集的视频源（9:16）
  - `episode.coverUrl`：某一集封面（可选）
- 解锁与资产
  - `wallet.diamonds`：当前 💎 余额
  - `unlockedShortEpisodes[dramaId][ep] = true/false`：某剧某集是否已解锁（应账号维度）
  - `unlockCost`：解锁成本（💎，Demo 固定 5）
- 收藏
  - `favoriteShorts[]`：收藏的短剧 id 列表（用于 Save 状态）

关键规则（免费与解锁）：

- 第 1–5 集免费
- 第 6 集及以后默认锁定，需要消耗 💎 解锁（每集固定成本，Demo 为 5 💎）
- 解锁状态保存在本机（刷新后仍保留）

关键交互（播放区）：

- 滚轮/触摸上滑下滑：
  - 切换上一集/下一集（有节流）
- 当当前集锁定：
  - 播放区显示 Unlock required 弹层
  - 点 Unlock：
    - 钻石不足：toast “Not enough 💎.”
    - 足够：扣钻并 toast “Unlocked.”，解锁后可播放

关键交互（右侧信息区）：

- Like：
  - 点心形切换 liked（本地态）
- Save：
  - 点书签切换收藏；收藏结果进入 Favorites 的 Shorts Tab
- Share：
  - 打开 Share 弹窗，提供平台按钮（X/Instagram/TikTok/Facebook）与 Link copy

关键交互（集数网格）：

- 点某一集：
  - 若已解锁或免费：直接切换播放该集
  - 若锁定：尝试解锁（同 Unlock 逻辑），成功后切换到该集

### 2.5 Create（/create）

入口逻辑：

- 进入 /create 默认先到模式选择页（Standard / VIP）

数据需求（页面需要哪些数据 / 字段名建议）：

- 当前订阅状态
  - `subscription.status`：是否 active（决定 VIP 是否可进入）
  - `subscription.planId`（可选，仅展示用）

模式选择（/create，模式选择页）：

- Standard：
  - 直接进入标准创建流程（/create/normal）
- VIP：
  - 若已订阅：进入 VIP 创建流程（/create/vip）
  - 若未订阅：跳转到订阅页（/subscribe）

VIP 创建（/create/vip）核心交互（Demo 表现）：

- 多步流程：Looks（多步）→ Core → Prompt → Worldbook → Result
- 每一步右上可点圆点跳转步骤；底部 Back/Next 导航
- Prompt 步：必须填写 prompt 才能 Next
- Worldbook 步：
  - Write / Upload file 二选一
  - Upload：上传 .txt/.md/.json → 解析中（Parsing…）→ 填入内容并生成 Preview
- Result 步：
  - 显示 3 个候选角色卡，用户可点击切换选中
  - 点 Start Chat：
    - 生成角色并创建会话
    - 未登录：弹登录，登录后回到 /chat/:id
    - 已登录：直接进入 /chat/:id

数据需求（VIP 创建流程需要哪些数据 / 字段名建议）：

- 选择项（用户输入/选择）
  - `profile.race`
  - `profile.age`
  - `profile.hairStyle`
  - `profile.hairColor`
  - `profile.eyeColor`
  - `profile.body`
  - `character.name`
  - `profile.personality`
  - `profile.prompt`
- Worldbook（创建时可携带到角色）
  - `profile.worldbooks[]`
    - `worldbook.id`
    - `worldbook.title`
    - `worldbook.summary`
    - `worldbook.paragraphs[]`
- 候选结果（3 张图）
  - `candidate.heroUrl`：候选人物大图
  - `candidate.avatarUrl`：候选头像

### 2.6 Chat（/chat）

进入状态（重要）：

- 如果用户登录后从未和任何角色聊过：
  - 显示空状态：提示去主页找想聊天的人，并提供“Go to Home”按钮
- 如果用户已有聊天记录：
  - 进入 /chat 会自动选中“最近聊天的人”，直接打开对应对话页（不需要再点头像）

页面结构：

- 左：极窄头像竖列（会话列表），仅显示头像
  - 当前会话头像有光圈高亮
- 右：对话内容区（/chat/:id）

数据需求（页面需要哪些数据 / 字段名建议）：

- 会话列表（按最近更新时间倒序）
  - `conversation.id`
  - `conversation.characterId`
  - `conversation.updatedAt`
  - `conversation.messages[]`（至少需要最后一条用于排序/预览；当前列表已不展示预览文字，但仍用于更新时间）
- 角色信息（用于左侧头像）
  - `character.id`
  - `character.avatarUrl`

### 2.7 ChatRoom（/chat/:id）

页面结构：

- 中间：消息列表 + 输入框
- 底部：Request Image / Request Video 按钮 + 输入框 + Send
- 右侧：Profile / Shorts 两个 tab
  - Profile：角色大图 + 角色信息块（仅 Country / Personality）
  - Shorts：该角色相关短剧入口（如果有）

数据需求（页面需要哪些数据 / 字段名建议）：

- 会话与消息
  - `conversation.id`
  - `conversation.characterId`
  - `conversation.messages[]`
    - `message.id`
    - `message.role`：user / assistant
    - `message.text`
    - `message.createdAt`
    - `message.attachments[]`（可选）
      - `attachment.kind`：image / video
      - `attachment.url`
      - `attachment.fallbackUrl`（可选）
      - `attachment.name`（可选）
- 角色信息（顶部/右侧 Profile）
  - `character.id`
  - `character.name`
  - `character.avatarUrl`
  - `character.heroUrl`（右侧大图）
  - `character.fallbackUrl`（兜底）
- Free requests（免费次数）
  - `mediaRequests.dateKey`：当日 key（用于每日重置）
  - `mediaRequests.used`：当日已使用次数
  - `freeLimit`：每日免费次数上限（Demo=3）
  - `freeLeft`：剩余免费次数（页面展示 Free requests left: x/3）
- 钻石与扣费
  - `wallet.diamonds`
  - `requestCost`：超出免费次数后的单次成本（Demo=5 💎）

关键交互（消息）：

- 发送文字消息：
  - 用户输入 → 点 Send → 立即插入一条 user 消息
  - 随后模拟 AI 回复（Demo）
- AI 回复后自动滚动：
  - 每次新增消息后，消息列表自动滚到最底部，保证看到最新消息

关键交互（Request Image / Request Video）：

- 用户点击 Request Image：
  1. 先插入一条“用户发起请求”的消息（用户有感知）
  2. 再由 AI 返回图片消息（仅附件，不带文字）
- 用户点击 Request Video：
  1. 先插入一条“用户发起请求”的消息
  2. 再由 AI 返回视频消息（仅附件，不带文字）

关键规则（Free requests left / 扣费）：

- 每天有 3 次免费请求次数（Free requests left: x/3）
- 超出免费次数后，每次请求消耗固定 💎（Demo 默认 5 💎）
- 若钻石不足：弹 toast “Not enough 💎.”

Profile 大图兜底：

- 如果角色图加载失败，会自动替换为默认图片，避免出现空白

### 2.8 Favorites（/favorites）

登录门禁：

- 未登录进入：
  - 自动弹登录
  - 页面仍显示一个简约引导卡：一张图 + Login + Home 两个按钮

已登录页面结构：

- 顶部 Tabs：Shorts / Characters / Created
- 列表区域：
  - Shorts：展示收藏的短剧卡
  - Characters：展示收藏的角色卡；点卡片可 Start chat
  - Created：展示用户创建过的角色卡；点卡片可 Start chat

空状态：

- 每个 tab 在没有内容时会显示对应的 “No … yet.” 空状态卡片

数据需求（页面需要哪些数据 / 字段名建议）：

- 登录态
  - `session.isLoggedIn`
- 收藏数据
  - `favoriteShorts[]`：短剧 id 列表
  - `favoriteCharacters[]`：角色 id 列表
- 用户创建角色
  - `createdCharacters[]`：角色对象列表（同 Character 结构）
- 依赖基础数据
  - `shortDramas[]`：短剧列表（用于根据 id 找到短剧对象）
  - `characters[]`：角色列表（用于根据 id 找到角色对象）

### 2.9 Subscription（/subscribe）

页面结构：

- 订阅计划卡（Monthly / Quarterly / Yearly，Yearly 有“Best value”）
- 钻石包 Packs（购买钻石）
- Rules 规则说明
- 购买确认弹窗（选择支付方式 + Pay now）

数据需求（页面需要哪些数据 / 字段名建议）：

- 订阅状态与资产
  - `session.isLoggedIn`
  - `subscription.status`：free / active / canceled
  - `subscription.planId`：month / quarter / year
  - `wallet.diamonds`
- 订阅计划（可来自后端配置；Demo 为前端常量）
  - `plan.id`：month / quarter / year
  - `plan.name`：展示名（Monthly / Quarterly / Yearly）
  - `plan.original`：原价
  - `plan.discounted`：折后价
  - `plan.discountLabel`：折扣标签（可选）
  - `plan.period`：计费周期文案（/mo /quarter /year）
  - `plan.highlight`：是否推荐（Best value）
- 钻石包（可来自后端配置；Demo 为前端常量）
  - `pack.id`
  - `pack.diamonds`
  - `pack.original`
  - `pack.discounted`
  - `pack.label`：折扣标签（例如 40% OFF）
- 支付流程（Demo 为 mock）
  - `paymentMethod`：card / crypto
  - `confirmOpen`：确认弹窗开关

关键交互（订阅计划）：

- 未登录点 Subscribe/Upgrade：
  - 弹登录，登录后回到 /subscribe
- 已订阅：
  - 当前计划按钮为 Current plan（不可点）
  - 允许 Upgrade 到更高档，不支持降级（Downgrades are not supported.）
- 支付成功（Demo）：
  - 订阅状态变为 active，并发 toast “Subscription activated.”
  - 订阅附带赠送 💎（Demo：150 bonus）

关键交互（购买钻石包）：

- 未登录点 Buy：
  - 先弹登录；登录后会继续引导购买
- 未订阅点 Buy：
  - toast 提示需要订阅（Subscription required to buy 💎.）
  - 自动弹出订阅购买确认（优先引导 Yearly）
- 已订阅点 Buy：
  - 弹出钻石包确认 → 选择支付方式 → Pay now → 增加 💎 并 toast “💎 added.”

### 2.10 Subscription Management（/subscription）

未订阅：

- 显示无订阅说明 + 去订阅按钮（跳 /subscribe）

已订阅：

- 显示当前计划、到期时间
- Auto-renew 开关（On/Off）
- Cancel subscription（取消订阅）

数据需求（页面需要哪些数据 / 字段名建议）：

- 订阅信息
  - `subscription.status`
  - `subscription.planId`
  - `subscription.expiresAt`
  - `subscription.renew`：自动续费开关
- 操作能力（真实产品应为 API；Demo 为本地动作）
  - `cancelSubscription()`
  - `toggleRenew()`

### 2.11 Account Center（/account）

未登录：

- 显示提示 “Please sign in to view your account.”

已登录：

- 顶部 Tabs：Profile / Subscription

Profile Tab：

- 展示头像与用户名、注册邮箱
- Upload：上传头像（本地读取为 dataURL）
- Save：保存 Profile（仅当内容有变化才可点）
- Cancel：回滚到当前 session 的 profile 值

Subscription Tab（交付型 mock）：

- Subscription 卡：展示状态（Active/Canceled/Free）、Next billing date、Auto-renew（仅展示）
- Cancel subscription：弹确认框
  - Confirm cancel：订阅状态变为 canceled（Demo）
- Diamonds：展示余额说明
- Diamond usage：消费明细列表（mock）
- How cancellation works：取消订阅流程说明（文字）

数据需求（页面需要哪些数据 / 字段名建议）：

- 用户信息（Profile Tab）
  - `session.isLoggedIn`
  - `session.displayName`
  - `session.avatarUrl`
  - `session.email`
- 订阅信息（Subscription Tab）
  - `subscription.status`
  - `subscription.planId`
  - `subscription.expiresAt`
  - `subscription.renew`
- 钻石资产
  - `wallet.diamonds`
- 💎消费明细（Demo 为 mock；真实产品应来自账本）
  - `diamondLedger[]`
    - `ledger.id`
    - `ledger.type`：earn / spend
    - `ledger.title`
    - `ledger.subtitle`
    - `ledger.amount`：正负数（单位 💎）
    - `ledger.at`：时间戳

### 2.12 法律/内容页（/privacy、/terms、/faq、/blog、/articles/:slug）

数据需求（页面需要哪些数据 / 字段名建议）：

- 静态内容
  - `page.title`
  - `page.sections[]`：段落/小节内容（可为 Markdown）
- Blog 列表
  - `article.slug`
  - `article.title`
  - `article.summary`
  - `article.coverUrl`（可选）
  - `article.publishedAt`（可选）
- Article 详情
  - `article.slug`
  - `article.title`
  - `article.content`（Markdown/HTML）

## 3. Demo 与真实产品的差异（开发注意）

### 3.1 当前为 Mock 的部分（但交互可复用）

- 登录：Demo 直接模拟登录成功，并写入本地 session
- 支付：订阅与钻石包购买为模拟支付
- AI：对话、图片、视频返回为本地模拟与固定资源
- 解锁：Shorts/Feed 解锁状态保存在本机（真实产品应与账号绑定）

### 3.2 真实产品落地时需要“账号维度”的状态

- 会话与消息：应从本地持久化迁移到账号数据
- 💎余额与消费明细：应从本地迁移到账号资产系统
- 解锁记录：短剧集数/Discover clip 解锁应账号可跨设备同步
- 收藏：收藏短剧/角色/创建角色列表应账号可跨设备同步
