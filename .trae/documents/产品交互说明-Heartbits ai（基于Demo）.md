# 产品交互说明（基于 Demo，最新版）— Heartbits ai

## 0. 适用范围

这份文档写给开发与 AI 开发，把 Demo 当作“可执行交互规格”来复刻。重点回答：

- 用户在每个页面能看到什么
- 点哪里会去哪里
- 点击/hover 后会出现什么反馈与状态变化
- 未登录、额度不足、资源缺失时怎么表现

本次重写只覆盖当前 Demo 的最新实现，且**不包含**：

- 创建人物模块（/create…）
- 订阅/订阅管理模块（/subscribe、/subscription）

> 备注：Demo 中的登录、支付、内容与 AI 能力均为本地 Mock；交互与状态机可迁移到真实产品。

## 1. 信息架构（路由）

路由入口来自 [App.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/App.jsx)：

- /browse：Home
- /feed：Discover
- /shorts：Shorts 列表
- /shorts/:id：短剧播放页
- /chat：Chat 入口（左侧会话列 + 右侧内容）
- /chat/:id：ChatRoom 会话详情
- /favorites：Favorites
- /account：Account Center

## 2. 核心数据概念（字段建议）

### 2.1 Character（角色）

来源：`seedCharacters`（mock）+ `createdCharacters`（用户创建）合并，详见 [useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js) 与 [mock.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/mock.js)。

- `character.id: string` — 角色唯一标识（如 `c1`）；用于：Discover/Shorts/Chat 等页面的“角色关联”、会话绑定 `conversation.characterId`、收藏 `favoriteCharacters[]`
- `character.name: string` — 角色显示名；用于：人物卡标题、ChatRoom 顶部标题、Discover 右侧角色信息
- `character.age: number` — 年龄；用于：人物卡/ChatRoom Profile 中展示（可选信息）
- `character.bio: string` — 角色简介；用于：人物卡/Discover 右侧简介/ChatRoom Profile 简介
- `character.starter: string` — 会话开场白；用于：首次创建会话时的 assistant 第一条消息
- `character.avatarUrl: string` — 方形头像；用于：Chat 左侧会话头像、ChatRoom 顶部头像、Discover/Shorts 列表的头像等
- `character.heroUrl: string` — 人物大图；用于：ChatRoom Profile tab 的大图、人物卡主图（优先）
- `character.fallbackUrl: string` — 大图加载失败兜底；用于：Profile 大图 onError fallback，避免空白
- `character.tags: string[]` — 角色标签（文本）；用于：ChatRoom 顶部副标题（可选）
- `character.kind: "female" | "male" | "anime" | undefined` — 角色类型；用于：Home Characters 的筛选、All Characters（已移除二级页）筛选逻辑

### 2.2 Conversation / Message（会话与消息）

来源：[useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js)

- `conversation.id: string` — 会话唯一标识；用于：路由 `/chat/:id`、Chat 左侧列表选中态、删除会话
- `conversation.characterId: string` — 会话绑定角色；用于：通过会话找到对应角色信息（头像、名字、Profile）
- `conversation.updatedAt: number` — 最近更新时间；用于：会话列表排序（最新在前）
- `conversation.messages: Message[]` — 消息列表；用于：ChatRoom 中渲染气泡与滚动到底部

`Message`：
- `message.id: string` — 消息唯一标识；用于：React 渲染 key
- `message.role: "user" | "assistant"` — 消息归属；用于：决定气泡左右/颜色（用户右侧深色，AI 左侧浅色）
- `message.text: string` — 文本正文；用于：ChatRoom 文本渲染；AI 支持“旁白/正文混排”
- `message.attachments?: Attachment[]` — 附件数组；用于：AI 返回图片/视频、用户发送文件（Demo 有结构）
- `message.createdAt: number` — 时间戳；用于：排序/扩展（当前 UI 不展示时间）

`Attachment`：
- `attachment.kind: "image" | "video" | "file"` — 附件类型；用于：决定渲染组件（图片/视频预览、文件条目）
- `attachment.url: string` — 资源地址；用于：预览与播放
- `attachment.fallbackUrl?: string` — 资源兜底地址；用于：加载失败时切换 fallback
- `attachment.name?: string` — 展示名；用于：文件/视频标题（可选）

### 2.3 ShortDrama（短剧系列）

来源：[mock.js](file:///Users/kexuan/Desktop/AI对话项目/src/data/mock.js)

- `shortDrama.id: string` — 短剧系列唯一标识（如 `s2`）；用于：路由 `/shorts/:id`、收藏 `favoriteShorts[]`
- `shortDrama.title: string` — 短剧标题；用于：Home/Favorites 卡片标题、ShortDetail 标题
- `shortDrama.description: string` — 短剧简介；用于：ShortDetail 右侧描述
- `shortDrama.episodes: number` — 总集数；用于：ShortDetail 集数网格（1..N）、卡片左上 `x eps`
- `shortDrama.characterId: string` — 关联角色；用于：Shorts 列表页按角色展示系列、Discover/ChatRoom 的“参演短剧/Featured shorts”关联
- `shortDrama.protagonist: string` — 主演名；用于：ShortDetail 标签之一（pill）
- `shortDrama.tags: string[]` — 短剧标签；用于：ShortDetail 右侧标签展示（取 2 个）
- `shortDrama.coverUrl: string` — 默认封面（Demo 有）；用于：Shorts 列表页的小封面、以及兜底；但 Home/Favorites 统一覆盖为本地 `/images/home/shorts-cover*.png`

### 2.4 Unlock / Favorites（解锁与收藏，本地 persist）

来源：[useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js)

- `unlockedFeedVideos: Record<string, boolean>` — Discover clip 的解锁表（key 为 `clip.id`）；用于：决定 clip 是否可点/是否可播放、是否显示锁定态
- `unlockedShortEpisodes: Record<dramaId, Record<episodeNumber, boolean>>` — ShortDetail 的解锁表；用于：决定某剧某集是否锁定、集数按钮是否显示锁 icon
- `favoriteShorts: string[]` — 收藏的短剧 id 列表；用于：ShortDetail 书签状态、Favorites → Shorts tab 列表数据源
- `favoriteCharacters: string[]` — 收藏的角色 id 列表；用于：Favorites → Characters tab 列表数据源

### 2.5 Free Requests（Request Image/Video 的免费次数）

来源：[useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js) 与 [ChatRoom.jsx](file:///Users/kexuan/Desktop/AI对话项目/src/pages/ChatRoom.jsx)

- `mediaRequests.used: number` — 已消耗 Request 次数（账号维度，Demo 为本地 persist）；用于：计算 `freeLeft`
- `freeLimit = 3` — 免费上限；用于：前 3 次不扣钻
- `cost = 5` — 超出免费后单次成本（💎）；用于：第 4 次起每次请求扣 5
- “用完提示弹窗” — 当免费次数从 `>0` 变为 `0` 的那一次弹窗；用于：提醒订阅但不阻止继续付费请求

### 2.6 Diamonds（钻石余额）

来源：[useAppStore.js](file:///Users/kexuan/Desktop/AI对话项目/src/stores/useAppStore.js)

- `diamonds: number` — 当前账号可用钻石余额（Demo 为本地 persist）；用于：
  - Discover：解锁付费 clip（每次 5 💎）
  - Shorts 播放页：解锁 6+ 集（每集 5 💎）
  - ChatRoom：免费次数用完后 Request Image/Video 每次扣 5 💎
  - 顶部栏（TopBar）：订阅状态下会展示计划与钻石余额（订阅模块本身不在本文档范围）

## 3. 全局通用规则

### 3.1 Login Gate（未登录拦截）

- 未登录访问 Chat / Favorites 等页面，会触发登录弹窗或引导登录
- 用户在未登录时触发某些动作（如发评论、Start chat、收藏等）：
  - 弹登录
  - 登录成功后回到原目标页面或完成“待提交动作”（例如：评论补发）

### 3.2 文案/展示禁令（已在 Demo 统一）

- Chat 页不展示钻石余额（输入框上方仅展示 `Free requests left: x/3`，且当 x=0 时隐藏这行）

## 4. 页面级交互说明

### 4.1 Home（/browse）

#### 4.1.1 模块结构

- 顶部左侧：品牌文案区 + 3 个入口按钮（Shorts / Discover / Create）
- 顶部右侧：Shorts 横滑卡片列表（9:16）
- 下方：Characters（带类型筛选）+ FAQ + SFW 宣言文案

#### 4.1.1A 入口按钮（左侧 3 个）

- 点击 Shorts：
  - 跳转到 `/shorts`
  - 页面效果：进入 Shorts 列表页，展示各短剧系列与 Ep 预览卡
- 点击 Discover：
  - 跳转到 `/feed`
  - 页面效果：进入 Discover，默认展示第一个 feed 项并自动播放其“免费 clip”
- 点击 Create：
  - 跳转到 `/create`
  - 页面效果：进入创建人物流程（该模块不在本文档范围）

#### 4.1.2 Shorts 卡片（Home 右侧横滑）

数据字段：
- `shortDrama.id`
- `shortDrama.title`
- `shortDrama.episodes`
- 封面：优先使用本地 `/images/home/shorts-cover*.png`
- hover 预览视频：Demo 使用 `/videos/feed/feed-0X.mp4`

交互：
- hover 到某张卡：
  - 效果：封面淡出、视频预览淡入并开始播放（muted）
  - 鼠标移出：视频暂停并回到 0s，封面恢复显示
- 点击任意短剧卡：
  - 跳转到 `/shorts/:id`
  - 页面效果：进入短剧播放页，默认播放第 1 集；若 URL 带 `?ep=` 则从指定集开始
- 点击右上角 “View all →”：
  - 跳转到 `/shorts`

#### 4.1.3 Characters（人物网格）

数据字段：
- `character.id / name / age / bio / heroUrl / avatarUrl / kind`

交互：
- 点击类型筛选：Female / Anime / Male
  - 效果：只筛选当前类型的角色卡片列表（本地筛选，不请求后端）
- 点击某个角色卡：
  - 效果 1：若该角色没有会话，则创建新会话；若已有会话，则复用原会话
  - 效果 2：跳转到 `/chat/:conversationId` 进入聊天页
  - 未登录时：会先弹登录；登录成功后回跳到对应 `/chat/:conversationId`
- Home 的 Characters 区不提供 “View all”

#### 4.1.4 FAQ

交互：
- 点击某条问题行：
  - 若当前收起：展开回答内容
  - 若当前展开：收起回答内容
  - 右侧箭头 icon 旋转表示展开态
- 右侧不显示 “Hide / View” 文案，仅保留箭头

### 4.2 Discover（/feed）

#### 4.2.1 页面结构

- 左侧：9:16 主视频区域（点击切换播放/暂停）
- 右侧：角色信息卡（Character / Shorts tab）、Start chat、Share、评论区
- 桌面端右侧有 clip 预览列（1 免费 + 多个待解锁）

#### 4.2.2 Clip 列表规则（该角色的视频列表）

- 每个角色固定有一个“免费 clip”，必须排第一（clip-01）
- 进入该角色时默认选中并播放 clip-01
- 其他 clip 默认锁定，点击后会尝试解锁（5 💎）；解锁后可播放

字段/状态建议：
- `clip.id`（Demo 形如 `${feedId}-clip-01`）
- `clip.free: boolean`（clip-01 为 true）
- `unlockedFeedVideos[clip.id]`

#### 4.2.3 主视频播放交互

- 滚轮/键盘：
  - 鼠标滚轮在视频区域滚动：切换上一条/下一条 feed（节流）
  - 键盘 ↑ / ↓：切换上一条/下一条 feed
  - 效果：切换后会重置为该 feed 的 `clip-01` 并自动播放
- 点击主视频画面：
  - 若当前 clip 已解锁/免费：切换播放/暂停
  - 若当前 clip 锁定：点击无效（需先解锁）
- 暂停状态：
  - 视频正中显示玻璃质感“三角形播放” icon
- 音量：
  - 页面不提供音量按钮与音量滑杆

#### 4.2.4 Share 规则（重要）

- 即使用户当前在看的是付费 clip，分享链接也必须是该角色的“免费 clip 链接”
- Demo 分享链接格式：
  - `GET /feed?item=<feedId>&clip=01`

#### 4.2.5 评论区规则（重要）

- Comments 标题不显示计数数字
- 不支持 Reply / 不支持评论的评论
- 每条评论仅包含：用户头像、用户名、评论正文、点赞数
- 不展示“发布时间/xx ago”
- 评论归属是“对当前角色”的评论，不是对 clip 的评论
  - 切换 clip 不改变评论
  - 切换角色才切换评论列表

未登录发送评论：
- 点击输入框输入内容 + 点击 Send：
  - 若未登录：弹登录；登录成功后自动把这条评论补发到“当前角色”的评论列表顶部
  - 若已登录：评论立即插入到“当前角色”的评论列表顶部
- 点评论上的心形：
  - 效果：切换点赞态；数值本地 +1/-1（Demo 仅本地变化）

#### 4.2.6 右侧角色卡按钮交互（Character Tab）

- 点击 Follow / Following：
  - 效果：仅切换按钮文案与样式（本地 mock），不影响其他页面
- 点击 Like（视频右侧的心形按钮）：
  - 效果：切换 liked 状态，数字即时 +1/-1（本地 mock）
  - 交互约束：点击 Like 不触发主视频播放/暂停（按钮会阻止事件冒泡）
- 点击 Start chat：
  - 若未登录：弹登录；登录成功后进入 `/chat/:conversationId`
  - 若已登录：
    - 创建或复用该角色会话（按 `character.id` 复用）
    - 跳转到 `/chat/:conversationId` 进入聊天
- 点击 Share：
  - 效果：打开 Share 弹窗（modal）
  - 弹窗里 Link 输入框默认填充“该角色免费 clip 链接”（始终 `clip=01`）
  - 点击 Copy：复制链接到剪贴板，toast 提示 “Link copied.”

#### 4.2.7 Shorts Tab（参演短剧入口）

- 点击右侧 tab：Shorts
  - 效果：在右侧展示该角色关联的短剧卡片横滑列表（9:16）
- 点击某个短剧卡：
  - 跳转到 `/shorts/:id`

#### 4.2.8 Clip 预览列（右侧竖列）

- clip 卡片的状态标签：
  - 第一条固定 Free
  - 已解锁但非播放中：Unlocked
  - 当前播放中的：Playing
- 点击某个 clip 卡：
  - 若为 Free 或已解锁：
    - 直接切换主播放器播放该 clip
  - 若为锁定：
    - 自动尝试解锁（固定扣 5 💎）
    - 若钻石不足：toast “Not enough 💎.”，不切换播放
    - 若钻石足够：扣钻并 toast “Unlocked.”，随后切换播放该 clip

### 4.3 Chat（/chat）

#### 4.3.1 左侧会话列（头像竖排）

- 只显示头像，不显示昵称/最近消息/时间
- 选中会话头像有 ring 表示正在对话

右键菜单（桌面端）：
- 左键点击某个头像：
  - 跳转到 `/chat/:conversationId`，右侧切换到该会话内容
- 右键点击某个头像：
  - 弹出右键菜单，只有一个动作：`Delete chat history`
  - 点击该菜单项：弹二次确认弹窗（Cancel / Delete）
  - 点击 Cancel：关闭弹窗，不做任何变更
  - 点击 Delete：
    - 本地删除该会话及所有消息
    - 若当前正在该会话：自动跳转到“删除后列表的第一个会话”；若已经没有会话则回到 `/chat`

#### 4.3.2 入口默认态

- 已登录且存在会话：
  - 进入 `/chat` 时自动跳转到最近一条会话 `/chat/:id`（避免出现右侧空白）
- 已登录但没有会话：
  - 右侧显示空状态卡片：提示去 Home 选择角色
  - 点击空态按钮：跳转 `/browse`

### 4.4 ChatRoom（/chat/:id）

#### 4.4.1 消息区

- 用户消息：右侧深色气泡
- AI 消息：左侧浅色气泡
- 支持附件消息：图片/视频点击可预览弹窗

AI 文本混排（旁白 vs 正文）：
- 旁白：`*...*` 包裹的片段，用灰色斜体展示
- 正文：普通文本，用黑色正体展示
- Demo 的 mock 回复默认会同时包含旁白与正文

交互（文本发送）：
- 输入框内按 Enter：
  - 效果：发送一条 user 消息（右侧气泡）
  - 随后进入“typing…”状态（出现 `…` 气泡）
  - 约 0.55s 后 AI 返回一条 assistant 文本（左侧气泡）
  - AI 返回后列表自动滚到最底部

交互（附件预览）：
- 点击图片/视频缩略卡：
  - 效果：打开 Modal 预览
  - Modal 关闭：点击遮罩或 Close（由 Modal 组件处理）

#### 4.4.2 Request Image / Request Video

交互：
- 点击 Request Image：
  - 先发送一条 user 文本消息：`Request image.`
  - 显示 typing `…`
  - 约 0.52s 后 AI 返回一条 assistant 消息：仅包含 `image` 附件（无正文）
  - 自动滚到底部
- 点击 Request Video：
  - 先发送一条 user 文本消息：`Request video.`
  - 显示 typing `…`
  - 约 0.52s 后 AI 返回一条 assistant 消息：仅包含 `video` 附件（无正文）
  - 自动滚到底部

免费次数与扣费：
- `freeLimit=3`（账号维度）
- 第 1~3 次：免费，不扣钻
- 第 4 次起：每次请求扣 `5 💎`
- 免费刚用完（从 1 变为 0 的那一次）：
  - 弹窗提示：Free requests used up
  - 两个按钮：Subscribe（跳 `/subscription`）与 Cancel（关闭弹窗）
- 当 `freeLeft=0`：
  - 不显示 `Free requests left: x/3` 这一行
  - 两个按钮右侧显示 `💎 5`
- 当钻石不足时：
  - toast 提示 `Not enough 💎.`，不发送请求消息、不产生 AI 回复

#### 4.4.3 右侧 Profile

Profile tab：
- 展示人物大图、name、age、bio
- 仅保留两个信息块：Country、Personality
- Personality 以“主标签 + 3 个 tag”形式展示（pill）

Shorts tab：
- 标题文案为 “Featured shorts”
- 不展示 “From this tutor”
- 列表为该角色关联短剧
- 点击某条短剧的 Play：
  - 跳转到 `/shorts`（Demo 当前逻辑）

### 4.5 Favorites（/favorites）

登录门禁：
- 未登录进入：
  - 展示 Login 引导卡
  - 点击 Login：弹登录
  - 点击 Home：跳转 `/browse`

Tabs：
- Shorts / Characters / Created

Shorts tab（收藏短剧）：
- 卡片样式与 Home Shorts 完全一致
- hover 播放预览，移开停止回到 0s
- hover 到某张卡：封面淡出、视频预览淡入并播放；移出暂停并回到 0s
- 点击卡片：跳转到 `/shorts/:id`
- 封面使用本地 `/images/home/shorts-cover*.png`

Characters tab：
- 展示已收藏角色卡片
- 点击卡片上的 Start chat：
  - 若未登录：弹登录；登录后回跳 `/chat/:conversationId`
  - 若已登录：创建/打开会话并跳转 `/chat/:conversationId`

Created tab：
- 展示用户创建的角色卡片（Demo 为本地态）

### 4.6 Shorts 列表（/shorts）

- 每个短剧系列卡片：
  - 左侧：关联角色头像/名字/简介
  - 右侧：一排 Ep 预览卡（最多预览 6 集）+ 一个 More 卡
- 点击某个 Ep 卡（Ep x）：
  - 跳转到 `/shorts/:id?ep=<ep>`
  - 页面效果：进入短剧播放页，初始化选择对应集数并尝试播放
- 点击 More：
  - 跳转到 `/shorts/:id`
  - 页面效果：进入短剧播放页（默认第 1 集）

### 4.7 Shorts 播放页（/shorts/:id）

#### 4.7.1 左侧竖屏播放区

- 播放资源：优先 `/videos/shorts/<id>/ep-XX.mp4`，失败 fallback 到 feed 视频
- 滚轮/触摸上下滑可切集（有节流）

解锁规则（Demo）：
- 1–5 集免费
- 6+ 默认锁定，点击 Unlock 扣 5 💎，不足则 toast

播放器控件（hover 显示）：
- 展示与隐藏：
  - 鼠标 hover 到视频区域：控件淡入显示
  - 鼠标移出视频区域：控件淡出隐藏，并自动关闭倍速菜单
  - 触摸：touchStart 时会显示控件（Demo 行为）
- 播放/暂停按钮：
  - 点击：切换 `play()` / `pause()`；按钮 icon 随状态切换
- 进度条（range）：
  - 拖动：立即 seek 到目标时间点（`video.currentTime = value`）
- 下一集按钮：
  - 点击：切换到 `episode + 1`
  - 当当前为最后一集：按钮 disabled，不可点击
- 倍速按钮：
  - 点击打开倍速选择菜单
  - 可选：1.25x / 1.5x / 2x
  - 选择后：设置 `video.playbackRate` 并关闭菜单

#### 4.7.2 右侧信息区（已做减法）

保留：
- 标题、描述、标签（protagonist + 2 个 tag）
- Like / Save / Share

移除（不展示）：
- “Short drama” 顶部小标签
- 右上角钻石余额与 Episode x/y
- “Free: 1–5 · Locked: …” 规则文案

Share：
- 弹窗提供平台按钮 + Link copy

#### 4.7.3 页面内所有按钮交互（开发验收用）

- 点击顶部 Back：
  - 跳转到 `/shorts`
- 锁定态（6+ 集）覆盖层：
  - 点击 Unlock：
    - 若钻石不足：toast “Not enough 💎.”
    - 若钻石足够：扣 5 💎 并 toast “Unlocked.”，覆盖层消失，视频可播放
- 集数网格（Episodes 1..N）：
  - 点击已解锁集数按钮：
    - 效果：切换到该集并开始播放
  - 点击锁定集数按钮：
    - 效果：立即尝试解锁该集（扣 5 💎）
    - 钻石不足：toast “Not enough 💎.”，不切换
    - 钻石足够：解锁成功后自动切换到该集并开始播放
- Like（心形）：
  - 效果：切换 liked；旁边数字即时 +1/-1（本地 mock）
- Save（书签）：
  - 效果：切换收藏状态；旁边数字即时 +1/-1（本地 mock）
  - 收藏后：Favorites → Shorts tab 会出现该短剧卡片
- Share：
  - 效果：打开 Share 弹窗
  - 点击 Copy：复制链接；toast “Link copied.”

## 5. Demo → 真产品迁移提示（给开发）

- Unlock / Favorites / Conversations / FreeRequests 在 Demo 中都保存在本地 persist；真产品应改为账号维度服务端存储
- Discover 的评论归属是 Character，而不是 clip：真实产品评论 key 建议使用 `characterId`
- 短剧播放器控件与解锁是短剧页核心体验，后续可补充播放进度保存（`dramaId + episode + progressSeconds`）
