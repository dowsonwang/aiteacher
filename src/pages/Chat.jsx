import { useEffect, useMemo, useRef } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const language = useAppStore((s) => s.language);
  const session = useAppStore((s) => s.session);
  const openAuth = useUIStore((s) => s.openAuth);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const conversations = useAppStore((s) => s.conversations);

  const characters = getAllCharacters();
  const prompted = useRef(false);

  useEffect(() => {
    if (session.isLoggedIn) return;
    if (prompted.current) return;
    prompted.current = true;
    openAuth({ mode: "login", postAuthPath: id ? `/chat/${id}` : "/chat" });
  }, [id, openAuth, session.isLoggedIn]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const pad = (n) => `${n}`.padStart(2, "0");
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const listItems = useMemo(
    () =>
      conversations.map((c) => {
        const character = characters.find((x) => x.id === c.characterId);
        const last = c.messages?.slice(-1)[0] || null;
        const preview = last?.text
          ? last.text
          : last?.attachments?.length
            ? `[${last.attachments[0]?.kind === "image" ? "Image" : last.attachments[0]?.kind === "video" ? "Video" : "File"}]`
            : "…";
        const ts = c.updatedAt || last?.createdAt || null;
        return { conversation: c, character, preview, ts };
      }),
    [characters, conversations],
  );

  if (!session.isLoggedIn) {
    return (
      <div className="-mx-6 -my-6 flex h-[calc(100dvh-56px)] w-full items-center justify-center overflow-hidden p-3">
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-200 bg-white px-6 shadow-sm">
        <div className="text-sm text-zinc-600">{t(language, "chat_need_login")}</div>
        <button
          type="button"
          onClick={() => openAuth({ mode: "login", postAuthPath: id ? `/chat/${id}` : "/chat" })}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          {t(language, "top_login")}
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-6 -my-6 relative h-[calc(100dvh-56px)] w-full overflow-hidden p-3">
      <div className="flex h-full min-h-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex h-full w-72 min-h-0 flex-col border-r border-zinc-200">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="text-sm font-semibold text-zinc-900">{t(language, "chat_title")}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
          {conversations.length ? (
            <div className="space-y-1">
              {listItems.map(({ conversation, character, preview, ts }) => {
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => navigate(`/chat/${conversation.id}`)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left hover:bg-zinc-50",
                      id === conversation.id ? "bg-zinc-900 text-white hover:bg-zinc-900" : "text-zinc-900",
                    )}
                  >
                    <img
                      src={character?.avatarUrl}
                      alt={character?.name || ""}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold">{character?.name || "-"}</div>
                        <div className={cn("shrink-0 text-[11px]", id === conversation.id ? "text-white/70" : "text-zinc-400")}>
                          {formatTime(ts)}
                        </div>
                      </div>
                      <div className={cn("mt-1 truncate text-xs", id === conversation.id ? "text-white/80" : "text-zinc-500")}>
                        {preview}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-6 text-sm text-zinc-500">{t(language, "chat_empty_title")}</div>
          )}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          {id ? (
            <Outlet />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">{t(language, "chat_empty_title")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
