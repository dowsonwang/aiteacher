# Heartbits ai 钻石明细列表功能执行稿 v1.0

## 0. 基本信息

- 文档类型：功能执行稿
- 适用范围：仅覆盖钻石明细弹窗的展示逻辑、筛选逻辑、明细类型和展示文案规范
- 执行口径：按当前真实产品规则整理，不把旧 Demo 里的废弃 mock 类型直接带入正式版
- 特别说明：本文档主体说明使用中文，但所有用户可见字段、标签、标题、说明文案、空状态文案统一使用英文

---

## 1. 功能目标

钻石明细列表不是财务账单中心，它的核心目标是让用户快速看明白 3 件事：

- 现在还剩多少钻石
- 钻石主要是怎么获得的
- 钻石主要花在了哪里

因此这个页面必须优先保证：

- 类型清楚
- 文案直白
- 获得和消耗区分明确
- 每一笔钻石变化的原因可理解

---

## 2. 页面结构

钻石明细弹窗固定由以下 5 个区域组成：

1. 当前余额卡片
2. 累计获得卡片
3. 累计消耗卡片
4. 筛选标签
5. 明细列表

### 2.1 顶部三个统计卡片

用户看到的字段统一为英文：

- `Current Balance`
- `Total Earned`
- `Total Spent`

逻辑说明：

- `Current Balance` 展示用户当前可用钻石余额
- `Total Earned` 展示所有成功获得类流水的累计值
- `Total Spent` 展示所有成功消耗类流水的累计值
- 这里只定义展示名称和统计逻辑，不定义每种类型的具体数量规则
- 三个统计值都必须基于真实流水计算，不能写死

### 2.2 筛选标签

用户看到的筛选标签统一为英文：

- `All`
- `Earned`
- `Spent`

筛选逻辑：

- 默认选中 `All`
- 点击 `Earned` 后，只显示获得类记录
- 点击 `Spent` 后，只显示消耗类记录
- 切换筛选时，不关闭弹窗，不重置滚动外的其他页面状态

### 2.3 明细列表列结构

列表固定展示 3 列，用户看到的列名统一为英文：

| 列 | 用户看到的字段 | 说明 |
| --- | --- | --- |
| 第一列 | `Details` | 展示标题、说明文案、时间 |
| 第二列 | `Type` | 展示类型标签 |
| 第三列 | `Amount` | 展示本条记录是增加还是减少 |

补充说明：

- 本文档不展开金额数值配置
- 这里只定义“属于获得还是消耗”以及“对应展示什么文案”

---

## 3. 列表通用逻辑

### 3.1 展示范围

钻石明细列表只展示“已经真实引起钻石变化”的记录。

也就是说：

- 成功发放的获得记录要展示
- 成功扣除的消耗记录要展示
- 已经发生的过期、回收、撤销记录要展示
- 用户只是点击但业务未成功，不展示
- 用户只是打开支付弹窗、创作弹窗、分享弹窗，不展示

### 3.2 排序规则

- 列表按时间倒序排列
- 最新记录永远排在最上面

### 3.3 时间格式

每条记录都展示完整时间，用户看到的格式统一为：

- `YYYY-MM-DD HH:mm`

时间口径：

- 以服务端最终确认时间为准

### 3.4 类型标签规则

所有类型标签都改成英文展示。

统一格式如下：

- 获得类：`Earned · xxx`
- 消耗类：`Spent · xxx`

其中：

- `xxx` 必须是用户能看懂的英文归类名称
- 不允许直接暴露服务端字段名
- 不允许继续使用模糊表达，例如 `Auto consume`

### 3.5 每条记录的文案结构

每条记录固定包含两层用户可见文案：

- `Title`
- `Description`

文案要求：

- `Title` 要短，直接说这笔记录是什么
- `Description` 要解释为什么发生
- 不使用内部研发术语
- 不展示类似“回调成功”“接口执行完成”这类研发视角文案

---

## 4. 获得类型表

以下为当前版本钻石明细列表中应支持的获得类记录。文档说明是中文，但表格中所有用户可见内容均为英文。

| 明细类型 | 触发场景 | Title | Description | Type Tag | 备注 |
| --- | --- | --- | --- | --- | --- |
| 每日登录奖励 | 用户当天首次成功登录 | `Daily Login Reward` | `First login of the day. Free diamonds have been added to your balance.` | `Earned · Free Diamonds` | 同一账号每天最多 1 条 |
| 首次购买订阅赠送 | 用户首次购买订阅成功 | `Subscription Bonus` | `You purchased the {subscription_plan_name}. Bonus diamonds have been added to your balance.` | `Earned · Subscription Diamonds` | `{subscription_plan_name}` 例如 `Monthly`、`Quarterly`、`Yearly` |
| 订阅续费赠送 | 用户续费订阅成功 | `Subscription Renewal Bonus` | `Your {subscription_plan_name} renewed successfully. Bonus diamonds have been added to your balance.` | `Earned · Subscription Diamonds` | 必须和首次购买区分开 |
| 购买钻石礼包 | 用户购买钻石礼包成功 | `Diamond Pack Purchase` | `You purchased the {pack_name}. Diamonds have been added to your balance.` | `Earned · Purchased Diamonds` | `{pack_name}` 例如 `Small Pack`、`Medium Pack`、`Large Pack` |
| 每日首次分享奖励 | 用户当天首次完成有效分享 | `First Share Reward of the Day` | `Your first valid share today has been completed. Reward diamonds have been added to your balance.` | `Earned · Reward Diamonds` | 只有有效分享成功后才生成记录 |
| 业务失败退回 | 某个扣钻业务失败，系统原路退回钻石 | `Diamond Refund` | `Your diamonds were returned because {action_name} did not complete successfully.` | `Earned · Refunded Diamonds` | 例如聊天请求失败、生成失败 |
| 系统或人工补发 | 客服或系统补发钻石 | `Diamond Compensation` | `Diamonds have been added to your balance due to {compensation_reason}.` | `Earned · Compensation Diamonds` | 这是异常处理场景，不是常规获得方式 |

### 4.1 获得类文案补充规则

- 订阅相关记录的 `Description` 必须带套餐名称
- 礼包相关记录的 `Description` 必须带礼包名称
- 退回、补发类记录的 `Description` 必须带原因
- 如果原因过长，前端可以截断，但完整原因需要可查看

---

## 5. 消耗类型表

以下为当前版本钻石明细列表中应支持的消耗类记录。文档说明是中文，但表格中所有用户可见内容均为英文。

| 明细类型 | 触发场景 | Title | Description | Type Tag | 备注 |
| --- | --- | --- | --- | --- | --- |
| Discover 主视频解锁 | 用户解锁当前人物主视频 | `Unlock Discover Video` | `You unlocked the current character's main video content.` | `Spent · Content Unlock` | Discover 主内容消费 |
| Discover 附加视频解锁 | 用户解锁右侧预览列表中的额外视频 | `Unlock Discover Clip` | `You unlocked an extra video from the side preview list.` | `Spent · Content Unlock` | 必须与主视频解锁区分 |
| 聊天请求图片 | 免费次数用完后，用户请求图片 | `Chat Image Request` | `Your free requests were used up, so this image request consumed diamonds.` | `Spent · Chat Feature` | 只有真正扣钻成功后才生成记录 |
| 聊天请求视频 | 免费次数用完后，用户请求视频 | `Chat Video Request` | `Your free requests were used up, so this video request consumed diamonds.` | `Spent · Chat Feature` | 只有真正扣钻成功后才生成记录 |
| 创建人物 | 用户成功创建第 2 个及之后的人物 | `Character Creation` | `Creating your second or later character consumed diamonds.` | `Spent · Character Creation` | 第 1 个人物免费，不生成消耗记录 |
| 短剧继续创作 | 用户发起继续创作并成功扣钻 | `Shorts Continue Creation` | `You continued the story to generate the next episode branch. Diamonds were consumed.` | `Spent · Shorts Creation` | 当前真实有效消费类型 |
| 短剧重写 | 用户发起重写并成功扣钻 | `Shorts Rewrite` | `You rewrote the current episode branch. Diamonds were consumed.` | `Spent · Shorts Creation` | 重写虽基于同一链路，但标题必须单独显示 |
| 直播间付费礼物 | 用户发送付费礼物 | `Paid Live Gift` | `You sent a paid gift in the live room. Diamonds were consumed.` | `Spent · Live Interaction` | 免费礼物不生成消耗记录 |
| 免费钻石过期 | 当天未用完的免费钻石到期 | `Free Diamonds Expired` | `Your unused free diamonds expired at the end of the valid period.` | `Spent · Free Diamond Expiration` | 系统自动生成的消耗记录 |
| 退款回收 | 订阅或礼包退款后回收未使用钻石 | `Diamond Reclaim` | `Unused diamonds were reclaimed because of a {order_type} refund.` | `Spent · Refund Reclaim` | `{order_type}` 例如 `subscription order`、`pack order` |
| 奖励撤销 | 平台撤销异常奖励钻石 | `Reward Revocation` | `Reward diamonds were revoked due to {revocation_reason}.` | `Spent · Reward Revocation` | 例如作弊、重复发放、误发 |

### 5.1 消耗类文案补充规则

- 内容解锁类记录必须明确写是 `Discover Video` 还是 `Discover Clip`
- 短剧创作类记录必须明确区分 `Shorts Continue Creation` 和 `Shorts Rewrite`
- 系统类扣减必须带原因，例如过期、退款、撤销
- 不允许把多种消耗都写成模糊的 `Auto consume`

---

## 6. 类型合并与拆分规则

为了让用户看得懂，明细列表里的类型不能合得太粗，也不能拆得太碎。

### 6.1 必须拆开显示的类型

以下类型必须拆开显示，不允许共用同一个标题：

- `Subscription Bonus`
- `Subscription Renewal Bonus`
- `Chat Image Request`
- `Chat Video Request`
- `Shorts Continue Creation`
- `Shorts Rewrite`
- `Unlock Discover Video`
- `Unlock Discover Clip`

原因：

- 这些动作虽然可能同属一个业务大类，但用户感知完全不同
- 合并后会降低用户对钻石来源和去向的理解

### 6.2 可以共用同一标签大类的类型

以下记录可以共用同一个 `Type Tag` 大类，但 `Title` 和 `Description` 仍需区分：

- `Subscription Bonus`、`Subscription Renewal Bonus` 共用 `Earned · Subscription Diamonds`
- `Chat Image Request`、`Chat Video Request` 共用 `Spent · Chat Feature`
- `Shorts Continue Creation`、`Shorts Rewrite` 共用 `Spent · Shorts Creation`
- `Unlock Discover Video`、`Unlock Discover Clip` 共用 `Spent · Content Unlock`

---

## 7. 不应出现的旧类型

以下类型属于旧 Demo 逻辑或已废弃规则，正式版钻石明细列表中不应再出现。

| 不应出现的旧类型 | 原因 |
| --- | --- |
| `Unlock Shorts Episode` | 当前短剧观看已经全部免费，不再存在“看短剧扣钻石” |
| `Share Reward from Shorts Playback Page` | 当前短剧播放页分享功能不做，不应产生对应记录 |
| `Auto consume` | 表达模糊，用户无法理解具体花在了哪里 |
| 原始 bucket 文案如 `Free diamonds`、`Reward diamonds`、`Subscription diamonds` 直接裸露 | 正式 UI 应显示完整英文标签，不应直接暴露内部 bucket 命名 |

---

## 8. 空状态与边界状态

### 8.1 无记录时

当用户还没有任何钻石明细记录时：

- 列表展示空状态
- 空状态标题建议为：`No diamond history yet`
- 辅助说明建议为：`Your diamond activity will appear here after you log in, subscribe, purchase, or use diamonds.`

### 8.2 某个筛选下无结果时

例如：

- 用户整体有记录，但 `Spent` 筛选下为空

则该筛选下显示空状态：

- `Spent` 下显示：`No spending records`
- `Earned` 下显示：`No earning records`

---

## 9. 统计口径

虽然本文档不展开每种业务的具体数值配置，但统计逻辑必须明确：

- `Current Balance`：当前真实可用钻石余额
- `Total Earned`：所有成功获得类记录之和
- `Total Spent`：所有成功消耗类记录之和

补充说明：

- 退回类记录计入 `Total Earned`
- 过期、回收、撤销类记录计入 `Total Spent`
- 失败但未真正改动资产的业务，不计入任何统计

---

## 10. 实现要求

### 10.1 服务端要求

钻石明细列表必须基于真实流水返回，前端不能自己拼接假记录。

每条记录至少需要返回：

- 记录 ID
- 用户 ID
- 获得或消耗方向
- 交易类型
- 展示标题
- 展示说明
- 标签大类
- 时间戳
- 关联业务 ID
- 关联订单 ID
- 原因备注

### 10.2 前端要求

- 前端只负责展示，不自己判断业务真伪
- 前端可以根据服务端类型码映射到英文展示文案
- 不得继续写死旧 mock 类型
- 所有用户可见标签、标题、说明、空状态文案都必须使用英文

---

## 11. 验收重点

1. 用户打开钻石明细弹窗时，能看到 `Current Balance`、`Total Earned`、`Total Spent`
2. 默认展示全部记录，并按时间倒序排列
3. 点击 `Earned` 后，只展示获得类记录
4. 点击 `Spent` 后，只展示消耗类记录
5. 每条记录都展示英文的 `Title`、`Description`、时间、`Type Tag`
6. 获得类与消耗类记录在颜色和英文文案上区分清楚
7. 列表中不再出现 `Auto consume` 这类模糊旧文案
8. 短剧相关记录只出现 `Shorts Continue Creation` 或 `Shorts Rewrite`，不出现 `Unlock Shorts Episode`
9. 过期、回收、撤销等系统类记录都能正确展示英文原因文案
10. 顶部统计卡片与真实流水结果一致

---

## 12. 一句话总结

钻石明细列表的核心是让用户看懂“钻石从哪来、花到哪去”，所以正式版应该保持中文功能文档说明，但所有用户可见字段、标签、标题、说明文案和空状态文案统一使用清晰的英文表达，并彻底移除废弃的旧 mock 类型。
