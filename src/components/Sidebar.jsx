import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Compass,
  Film,
  Home,
  Instagram,
  MessageCircle,
  Sparkles,
  Twitter,
  Video,
  WalletCards,
} from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";
import Modal from "./Modal.jsx";

const navItems = [
  { to: "/browse", icon: Home, labelKey: "nav_home" },
  { to: "/feed", icon: Compass, labelKey: "nav_feed" },
  { to: "/shorts", icon: Film, labelKey: "nav_shorts" },
  { to: "/create", icon: Sparkles, labelKey: "nav_create" },
  { to: "/chat", icon: MessageCircle, labelKey: "nav_chat" },
  { to: "/favorites", icon: Bookmark, labelKey: "nav_favorites" },
  { to: "/subscribe", icon: WalletCards, labelKey: "nav_subscription" },
];

export default function Sidebar() {
  const language = useAppStore((s) => s.language);
  const grantDailyShareReward = useAppStore((s) => s.grantDailyShareReward);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const [freeDiamondOpen, setFreeDiamondOpen] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const [discordHint, setDiscordHint] = useState("");

  const socialLinks = useMemo(
    () => [
      { name: "Discord", href: "https://discord.com/", Icon: MessageCircle },
      { name: "X", href: "https://x.com/", Icon: Twitter },
      { name: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
      { name: "TikTok", href: "https://www.tiktok.com/", Icon: Video },
    ],
    [],
  );

  const shareEntryUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location?.origin || "" : "";
    return base ? `${base}/browse` : "/browse";
  }, []);

  const brandLogoUrl = useMemo(
    () =>
      `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
        "Minimal app logo icon for a chat product, flat vector style, simple geometric mark, black and white, no text",
      )}&image_size=square`,
    [],
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-3 border-r border-zinc-200 bg-white py-5",
        sidebarCollapsed ? "w-16 px-2" : "w-56 px-4",
      )}
    >
      <div className={cn("flex items-center justify-between", sidebarCollapsed ? "px-1" : "px-0")}>
        {sidebarCollapsed ? (
          <img src={brandLogoUrl} alt="Heartbits ai" className="h-9 w-9 rounded-xl object-cover" />
        ) : (
          <div className="flex items-center gap-3">
            <img src={brandLogoUrl} alt="Heartbits ai" className="h-9 w-9 rounded-xl object-cover" />
            <div className="text-sm font-semibold text-zinc-900">Heartbits ai</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            toggleSidebar();
          }}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50",
            sidebarCollapsed ? "" : "",
          )}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                  sidebarCollapsed ? "justify-center px-0" : "",
                  isActive ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {sidebarCollapsed ? null : <span className="truncate">{t(language, item.labelKey)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn("mt-auto bg-white pt-4", sidebarCollapsed ? "px-1" : "px-0")}>
        <button
          type="button"
          onClick={() => setFreeDiamondOpen(true)}
          className={cn(
            "rounded-xl bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800",
            sidebarCollapsed ? "mx-auto flex h-9 w-9 items-center justify-center" : "w-full px-3 py-2",
          )}
          aria-label="Daily free diamonds"
        >
          {sidebarCollapsed ? <span className="text-base leading-none">🎁</span> : "每日免费钻石"}
        </button>

        <div
          className={cn(
            "w-full pt-3",
            sidebarCollapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between gap-3",
          )}
        >
          {socialLinks.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50"
              aria-label={s.name}
            >
              <s.Icon className="h-4 w-4 text-zinc-800" />
            </a>
          ))}
        </div>

        <Modal
          open={freeDiamondOpen}
          onClose={() => {
            setFreeDiamondOpen(false);
            setShareHint("");
            setDiscordHint("");
          }}
          title="每日免费钻石"
        >
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm font-semibold text-zinc-900">方式 1：分享到社交平台</div>
            <div className="mt-2 text-sm leading-6 text-zinc-600">
              每日首次分享可获得 5 个免费钻石。你可以直接选择下方平台完成分享。
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                {
                  key: "x",
                  label: "X",
                  run: () => {
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareEntryUrl)}&text=${encodeURIComponent("分享获取免费钻石")}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                    grantDailyShareReward?.({ amount: 5 });
                    setShareHint("已打开 X 分享窗口，若为今日首次分享将获得 5 个免费钻石");
                  },
                },
                {
                  key: "facebook",
                  label: "Facebook",
                  run: () => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareEntryUrl)}`, "_blank", "noopener,noreferrer");
                    grantDailyShareReward?.({ amount: 5 });
                    setShareHint("已打开 Facebook 分享窗口，若为今日首次分享将获得 5 个免费钻石");
                  },
                },
                {
                  key: "whatsapp",
                  label: "WhatsApp",
                  run: () => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`分享获取免费钻石 ${shareEntryUrl}`)}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                    grantDailyShareReward?.({ amount: 5 });
                    setShareHint("已打开 WhatsApp 分享窗口，若为今日首次分享将获得 5 个免费钻石");
                  },
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.run}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  {item.label}
                </button>
              ))}
            </div>
            {shareHint ? <div className="mt-2 text-xs font-medium text-zinc-500">{shareHint}</div> : null}
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">方式 2：加入 Discord 社区领取钻石</div>
            <div className="mt-2 text-sm leading-6 text-zinc-600">
              请按以下步骤完成领取：
              <div className="mt-2 space-y-1 text-zinc-700">
                <div>1. 进入我们的 Discord 社区</div>
                <div>2. 在社区内点击“获取积分”</div>
                <div>3. 填写你的邮箱，即可获得免费钻石</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDiscordHint("已触发 Discord 社区入口（当前为 mock，未真实跳转）");
              }}
              className="mt-3 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              加入 Discord 社区
            </button>
            {discordHint ? <div className="mt-2 text-xs font-medium text-zinc-500">{discordHint}</div> : null}
          </div>
        </Modal>
      </div>
    </aside>
  );
}
