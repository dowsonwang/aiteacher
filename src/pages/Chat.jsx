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
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const latestConversationId = useMemo(() => {
    if (!conversations.length) return "";
    return conversations[0]?.id || "";
  }, [conversations]);

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
        <div className="flex h-full min-h-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex h-full w-16 min-h-0 flex-col items-center overflow-auto py-4" />
          <div className="flex min-w-0 flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <div className="text-base font-semibold text-zinc-900">No chats yet</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-600">
                Go to Home and pick a tutor you want to chat with. Your conversations will show up here.
              </div>
              <button
                type="button"
                onClick={() => navigate("/browse")}
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Go to Home
              </button>
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
