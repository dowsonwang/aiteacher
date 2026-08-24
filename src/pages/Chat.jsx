import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { cn } from "../lib/utils.js";
import { t } from "../i18n/i18n.js";
import Modal from "../components/Modal.jsx";
import { useAppStore } from "../stores/useAppStore.js";

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const language = useAppStore((s) => s.language);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const conversations = useAppStore((s) => s.conversations);
  const deleteConversation = useAppStore((s) => s.deleteConversation);

  const characters = getAllCharacters();
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const latestConversationId = useMemo(() => {
    if (!conversations.length) return "";
    return conversations[0]?.id || "";
  }, [conversations]);

  const recommendedCharacters = useMemo(() => {
    const official = characters.filter((c) => !String(c.id).startsWith("u_"));
    const groups = { female: [], male: [], anime: [] };
    official.forEach((c) => {
      const kind = c?.kind === "male" || c?.kind === "anime" ? c.kind : "female";
      groups[kind].push(c);
    });
    const picked = [];
    for (let i = 0; i < 2; i++) {
      if (groups.female[i]) picked.push(groups.female[i]);
      if (groups.male[i]) picked.push(groups.male[i]);
      if (groups.anime[i]) picked.push(groups.anime[i]);
    }
    return picked;
  }, [characters]);

  const startChat = (characterId) => {
    const conversationId = openConversationForCharacter(characterId);
    navigate(`/chat/${conversationId}`);
  };

  useEffect(() => {
    if (id) return;
    if (!latestConversationId) return;
    navigate(`/chat/${latestConversationId}`, { replace: true });
  }, [id, latestConversationId, navigate]);

  const listItems = useMemo(
    () =>
      conversations.map((c) => {
        const character = characters.find((x) => x.id === c.characterId);
        return { conversation: c, character };
      }),
    [characters, conversations],
  );

  useEffect(() => {
    if (!contextMenu) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contextMenu]);

  if (!conversations.length) {
    return (
      <div className="-mx-6 -my-6 relative h-[calc(100dvh-56px)] w-full overflow-hidden p-3">
        <div className="h-full min-h-0 overflow-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <div className="text-center">
              <div className="text-2xl font-semibold tracking-tight text-zinc-950">Start your first conversation</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-600">
                Pick a companion below and say hi — your chats will show up here.
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCharacters.map((character) => {
                const isAnime = character?.kind === "anime";
                const showAge = !isAnime && character?.age != null;
                return (
                  <div
                    key={character.id}
                    className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={character.avatarUrl}
                        alt={character.name || ""}
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="truncate text-base font-semibold text-zinc-950">{character.name}</span>
                          {showAge ? <span className="shrink-0 text-sm text-zinc-500">{character.age}</span> : null}
                        </div>
                        <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
                          {isAnime ? "Anime" : character?.kind === "male" ? "Male" : "Female"}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600">{character.bio}</p>
                    <button
                      type="button"
                      onClick={() => startChat(character.id)}
                      className="mt-4 inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Chat now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-6 -my-6 relative h-[calc(100dvh-56px)] w-full overflow-hidden p-3">
      <Modal open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId("")} title="Delete chat?" className="max-w-md">
        <div className="text-sm text-zinc-600">This will delete this chat history on this device.</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteConfirmId("")}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const idToDelete = deleteConfirmId;
              setDeleteConfirmId("");
              deleteConversation(idToDelete);
              if (id === idToDelete) {
                const nextId = conversations.filter((c) => c.id !== idToDelete)[0]?.id || "";
                navigate(nextId ? `/chat/${nextId}` : "/chat", { replace: true });
              }
            }}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>

      {contextMenu ? (
        <div
          className="fixed inset-0 z-[70]"
          onMouseDown={() => {
            setContextMenu(null);
          }}
        >
          <div
            className="fixed w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                setDeleteConfirmId(contextMenu.conversationId);
              }}
              className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-zinc-50"
            >
              Delete chat history
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex h-full min-h-0 gap-3 overflow-hidden">
        <div className="flex h-full w-16 min-h-0 flex-col items-center overflow-auto py-4">
          {conversations.length ? (
            <div className="flex w-full flex-col items-center gap-3">
              {listItems.map(({ conversation, character }) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, conversationId: conversation.id });
                  }}
                  className="flex h-12 w-12 items-center justify-center"
                  aria-label={character?.name || "Chat"}
                >
                  <img
                    src={character?.avatarUrl}
                    alt={character?.name || ""}
                    className={cn(
                      "h-10 w-10 rounded-full object-cover",
                      id === conversation.id ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white" : "",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2 py-6 text-xs text-zinc-400">{t(language, "chat_empty_title")}</div>
          )}
        </div>

        <div className="flex h-full min-h-0 flex-1 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="min-w-0 flex-1 overflow-hidden">
            {id ? <Outlet /> : <div className="flex h-full items-center justify-center text-sm text-zinc-500">…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
