import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";
import DiamondIcon from "./DiamondIcon.jsx";

const planLabel = (planId) => {
  if (planId === "year") return "Yearly";
  if (planId === "quarter") return "Quarterly";
  if (planId === "month") return "Monthly";
  return "Subscription";
};

export default function TopBar() {
  const navigate = useNavigate();
  const language = useAppStore((s) => s.language);
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const logout = useAppStore((s) => s.logout);
  const openAuth = useUIStore((s) => s.openAuth);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-14 items-center justify-end gap-2 border-b border-zinc-200 bg-white px-6">
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
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            >
              <img
                alt="User"
                src={session.avatarUrl}
                className="h-6 w-6 rounded-full object-cover"
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
  );
}
