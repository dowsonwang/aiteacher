import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import { characterCategoryTabs, getCharacterCategoryFromPath } from "../lib/characterCategories.js";
import { cn } from "../lib/utils.js";
import { languageOptions, t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";
import DiamondIcon from "./DiamondIcon.jsx";
import Modal from "./Modal.jsx";

const planLabel = (planId) => {
  if (planId === "year") return "Yearly";
  if (planId === "quarter") return "Quarterly";
  if (planId === "month") return "Monthly";
  return "Subscription";
};

const cartoonAvatarUrl = (name) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `Friendly cartoon profile avatar of an adult, expressive eyes, clean rounded illustration, warm coral and sky blue palette, simple soft background, centered head and shoulders, polished app icon, no text, person name: ${name || "User"}`,
  )}&image_size=square`;

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeCategory = getCharacterCategoryFromPath(location.pathname);
  const language = useAppStore((s) => s.language);
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const diamondBreakdown = useAppStore((s) => s.diamondBreakdown);
  const diamondRewardNotice = useAppStore((s) => s.diamondRewardNotice);
  const logout = useAppStore((s) => s.logout);
  const refreshDiamondState = useAppStore((s) => s.refreshDiamondState);
  const dismissDiamondRewardNotice = useAppStore((s) => s.dismissDiamondRewardNotice);
  const openAuth = useUIStore((s) => s.openAuth);
  const openLanguage = useUIStore((s) => s.openLanguage);

  const profileAvatarUrl = session.avatarUrl?.startsWith("data:image/")
    ? session.avatarUrl
    : cartoonAvatarUrl(session.displayName);

  const [menuOpen, setMenuOpen] = useState(false);
  const [diamondMenuOpen, setDiamondMenuOpen] = useState(false);
  const [diamondDetailOpen, setDiamondDetailOpen] = useState(false);
  const [detailFilter, setDetailFilter] = useState("all");
  const menuWrapRef = useRef(null);

  useEffect(() => {
    refreshDiamondState();
    const timer = window.setInterval(() => refreshDiamondState(), 60 * 1000);
    return () => window.clearInterval(timer);
  }, [refreshDiamondState]);

  useEffect(() => {
    if (!diamondRewardNotice?.visible) return;
    const timer = window.setTimeout(() => dismissDiamondRewardNotice(), 5000);
    return () => window.clearTimeout(timer);
  }, [diamondRewardNotice?.visible, dismissDiamondRewardNotice]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (menuWrapRef.current?.contains(e.target)) return;
      setMenuOpen(false);
      setDiamondMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const currentLanguage = languageOptions.find((x) => x.code === language) || languageOptions[0];
  const diamondHistory = useMemo(
    () => [
      {
        id: "income-login",
        kind: "income",
        title: "每日登录奖励",
        description: "用户当天首次登录，系统发放免费钻石",
        amount: 5,
        bucket: "Free diamonds",
        time: "2026-06-29 09:12",
      },
      {
        id: "income-subscription",
        kind: "income",
        title: "订阅赠送钻石",
        description: "购买月度订阅后，系统发放订阅钻石",
        amount: 150,
        bucket: "Subscription diamonds",
        time: "2026-06-28 20:36",
      },
      {
        id: "income-recharge",
        kind: "income",
        title: "购买钻石礼包",
        description: "购买充值礼包后，钻石到账",
        amount: 120,
        bucket: "Reward diamonds",
        time: "2026-06-28 20:32",
      },
      {
        id: "income-share",
        kind: "income",
        title: "每日首次分享奖励",
        description: "当天首次完成分享，系统发放奖励钻石",
        amount: 5,
        bucket: "Reward diamonds",
        time: "2026-06-28 10:05",
      },
      {
        id: "expense-feed-main",
        kind: "expense",
        title: "解锁 Discover 视频",
        description: "解锁当前人物主视频内容",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-29 09:18",
      },
      {
        id: "expense-feed-clip",
        kind: "expense",
        title: "解锁 Discover 小视频",
        description: "解锁右侧预览列表中的额外视频",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-29 09:19",
      },
      {
        id: "expense-shorts",
        kind: "expense",
        title: "解锁短剧剧集",
        description: "解锁付费短剧集数",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-28 21:14",
      },
      {
        id: "expense-chat-image",
        kind: "expense",
        title: "聊天请求图片",
        description: "免费次数用完后，请求图片消耗钻石",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-28 18:46",
      },
      {
        id: "expense-chat-video",
        kind: "expense",
        title: "聊天请求视频",
        description: "免费次数用完后，请求视频消耗钻石",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-28 18:52",
      },
      {
        id: "expense-live-gift",
        kind: "expense",
        title: "直播间付费礼物",
        description: "在直播间发送付费礼物消耗钻石",
        amount: -5,
        bucket: "Auto consume",
        time: "2026-06-28 17:23",
      },
    ],
    [],
  );
  const filteredDiamondHistory = useMemo(() => {
    if (detailFilter === "income") return diamondHistory.filter((item) => item.kind === "income");
    if (detailFilter === "expense") return diamondHistory.filter((item) => item.kind === "expense");
    return diamondHistory;
  }, [detailFilter, diamondHistory]);
  const incomeTotal = useMemo(
    () => diamondHistory.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0),
    [diamondHistory],
  );
  const expenseTotal = useMemo(
    () => Math.abs(diamondHistory.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0)),
    [diamondHistory],
  );

  return (
    <div className="flex h-14 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6">
      <div className="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto">
        {activeCategory ? (
          <div id="home-category-tabs" className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
            {characterCategoryTabs.map((tab) => {
              const isActive = tab.key === activeCategory;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    if (!isActive) navigate(tab.path);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-white hover:text-zinc-900",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {session.isLoggedIn && diamondRewardNotice?.visible ? (
        <div className="pointer-events-none fixed right-6 top-16 z-[85]">
          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm shadow-xl">
            <div className="font-semibold text-zinc-900">Daily login reward</div>
            <div className="mt-1 text-zinc-600">
              Today&apos;s login grants you{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                <DiamondIcon className="h-4 w-4 text-sky-500" />
                <span>{diamondRewardNotice.amount}</span>
              </span>
              .
            </div>
          </div>
        </div>
      ) : null}

      <div ref={menuWrapRef} className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={openLanguage}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          <span className="text-base leading-none">🌐</span>
          <span>{currentLanguage.label}</span>
        </button>

        {!session.isLoggedIn ? (
        <button
          type="button"
          onClick={() => navigate("/subscribe")}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <CreditCard className="h-4 w-4" />
          {subscription.status === "active" ? (
            <>
              <span>{planLabel(subscription.planId)}</span>
              <span className="text-white/50">·</span>
              <span className="inline-flex items-center gap-1">
                <DiamondIcon className="h-4 w-4 text-sky-200" />
                <span>{diamonds.toLocaleString()}</span>
              </span>
            </>
          ) : (
            t(language, "top_subscribe")
          )}
        </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDiamondMenuOpen((v) => !v);
                setMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <DiamondIcon className="h-4 w-4 text-sky-200" />
              <span>{diamonds.toLocaleString()}</span>
              <ChevronDown className={cn("h-4 w-4 transition", diamondMenuOpen ? "rotate-180" : "")} />
            </button>

            <div
              className={cn(
                "absolute right-0 top-12 z-[80] w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg",
                diamondMenuOpen ? "block" : "hidden",
              )}
            >
              <div className="border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Diamond balance</div>
              {[
                { key: "free", label: "Free diamonds", value: diamondBreakdown?.free || 0 },
                { key: "subscription", label: "Subscription diamonds", value: diamondBreakdown?.subscription || 0 },
                { key: "reward", label: "Reward diamonds", value: diamondBreakdown?.reward || 0 },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="text-zinc-600">{item.label}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                    <DiamondIcon className="h-4 w-4 text-sky-500" />
                    <span>{item.value.toLocaleString()}</span>
                  </span>
                </div>
              ))}
              <div className="border-t border-zinc-100 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setDiamondDetailOpen(true);
                    setDiamondMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  查看明细
                </button>
              </div>
            </div>
          </div>
        )}

        {!session.isLoggedIn ? (
          <button
            type="button"
            onClick={() => openAuth({ mode: "login" })}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <UserRound className="h-4 w-4 text-zinc-700" />
            {t(language, "top_login")}
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setDiamondMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            >
              <img
                alt="User"
                src={profileAvatarUrl}
                className="h-7 w-7 rounded-full border border-zinc-200 bg-sky-50 object-cover"
              />
              <span className="text-sm font-medium text-zinc-900">Profile</span>
            </button>
            <div
              className={cn(
                "absolute right-0 top-12 z-[80] w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg",
                menuOpen ? "block" : "hidden",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
              >
                <Settings className="h-4 w-4" />
                Account Center
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4" />
                {t(language, "top_logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={diamondDetailOpen} onClose={() => setDiamondDetailOpen(false)} title="钻石明细" className="max-w-4xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">当前总额</div>
            <div className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-zinc-900">
              <DiamondIcon className="h-6 w-6 text-sky-500" />
              <span>{diamonds.toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">累计获得</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-700">+{incomeTotal.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">累计消耗</div>
            <div className="mt-2 text-2xl font-semibold text-rose-700">-{expenseTotal.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: "all", label: "全部" },
            { key: "income", label: "获得" },
            { key: "expense", label: "消耗" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setDetailFilter(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                detailFilter === item.key ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[56vh] overflow-auto rounded-2xl border border-zinc-200">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <div>明细</div>
            <div>类型</div>
            <div>数量</div>
          </div>
          <div>
            {filteredDiamondHistory.map((item) => (
              <div key={item.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-3 border-b border-zinc-100 px-4 py-4 last:border-b-0">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">{item.description}</div>
                  <div className="mt-1 text-xs text-zinc-400">{item.time}</div>
                </div>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      item.kind === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
                    )}
                  >
                    {item.kind === "income" ? `获得 · ${item.bucket}` : `消耗 · ${item.bucket}`}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center text-sm font-semibold",
                    item.kind === "income" ? "text-emerald-700" : "text-rose-700",
                  )}
                >
                  {item.kind === "income" ? "+" : ""}
                  {item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
