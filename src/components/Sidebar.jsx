import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Compass,
  FileText,
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
import { languageOptions, t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

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
  const navigate = useNavigate();
  const language = useAppStore((s) => s.language);
  const openLanguage = useUIStore((s) => s.openLanguage);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const currentLanguage = useMemo(
    () => languageOptions.find((x) => x.code === language) || languageOptions[0],
    [language],
  );
  const [legalOpen, setLegalOpen] = useState(false);
  const protocols = useMemo(
    () => [
      { key: "privacy", label: "Privacy Policy", href: "/privacy" },
      { key: "terms", label: "User Agreement", href: "/terms" },
      { key: "faq", label: "FAQ", href: "/faq" },
      { key: "blog", label: "Blog", href: "/blog" },
    ],
    [],
  );
  const socialLinks = useMemo(
    () => [
      { name: "Discord", href: "https://discord.com/", Icon: MessageCircle },
      { name: "X", href: "https://x.com/", Icon: Twitter },
      { name: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
      { name: "TikTok", href: "https://www.tiktok.com/", Icon: Video },
    ],
    [],
  );
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
          <img src={brandLogoUrl} alt="AI Language Coach" className="h-9 w-9 rounded-xl object-cover" />
        ) : (
          <div className="flex items-center gap-3">
            <img src={brandLogoUrl} alt="AI Language Coach" className="h-9 w-9 rounded-xl object-cover" />
            <div className="text-sm font-semibold text-zinc-900">AI Language Coach</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setLegalOpen(false);
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

      <div className={cn("sticky bottom-0 border-t border-zinc-200 bg-white pt-4", sidebarCollapsed ? "px-1" : "px-0")}>
        <div
          className={cn(
            "w-full",
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

        <button
          type="button"
          onClick={openLanguage}
          className={cn(
            "rounded-xl border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50",
            sidebarCollapsed ? "mx-auto mt-3 flex h-9 w-9 items-center justify-center" : "mt-3 w-full px-3",
          )}
        >
          {sidebarCollapsed ? (
            <span className="text-base">🌐</span>
          ) : (
            <span className="inline-flex w-full items-center">
              <span className="mr-2">🌐</span>
              <span className="flex-1 text-center">{currentLanguage.label}</span>
            </span>
          )}
        </button>

        {sidebarCollapsed ? (
          <div className="relative mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setLegalOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50"
              aria-label="Legal"
            >
              <FileText className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute bottom-12 left-0 -ml-3 w-44 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl",
                legalOpen ? "block" : "hidden",
              )}
            >
              {protocols.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setLegalOpen(false);
                    navigate(p.href);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 pb-5 text-xs text-zinc-500">
            {protocols.map((p, idx) => (
              <span key={p.key}>
                <a
                  href={p.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(p.href);
                  }}
                  className="hover:text-zinc-900"
                >
                  {p.label}
                </a>
                {idx === protocols.length - 1 ? null : <span className="px-1.5">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
