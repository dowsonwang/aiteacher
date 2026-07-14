import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { useAppStore } from "../stores/useAppStore.js";

const recordFallbackUrl = "/images/chat/ai-reply-01.png";

export default function CreateRecordDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const session = useAppStore((s) => s.session);
  const characterCreations = useAppStore((s) => s.characterCreations);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const deleteCharacterCreation = useAppStore((s) => s.deleteCharacterCreation);

  const record = useMemo(() => {
    const list = Array.isArray(characterCreations) ? characterCreations : [];
    return list.find((r) => r.id === id);
  }, [characterCreations, id]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!record) {
    return (
      <div className="px-6 pb-10 pt-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">创建记录不存在或已被清理</div>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            返回创建页
          </button>
        </div>
      </div>
    );
  }

  if (!record.characterId) {
    return (
      <div className="px-6 pb-10 pt-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">该人物尚未生成创造记录</div>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            返回创建页
          </button>
        </div>
      </div>
    );
  }

  const isOwner = session?.accountKey ? record.ownerKey === session.accountKey : true;
  const privacyLabel = record.isPublic ? "公开" : "私密";

  return (
    <div className="px-6 pb-10 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" />
          返回
        </button>

        {isOwner ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                const convId = openConversationForCharacter(record.characterId);
                if (convId) navigate(`/chat/${convId}`);
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              开始对话
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              删除角色
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-5">
          <div className="aspect-[9/16] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
            {record.portraitUrl ? (
              <img
                src={record.portraitUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = recordFallbackUrl;
                }}
              />
            ) : null}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-zinc-900">{record.appearance?.name || "未命名人物"}</div>
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                {privacyLabel}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(record.appearance?.personality || []).slice(0, 3).map((personality) => (
                <span key={personality} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  {personality}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold text-zinc-900">人物设定</div>
          <div className="mt-4 space-y-3">
            {[
              { key: "relation", label: "人物与用户关系" },
              { key: "scenario", label: "对话场景" },
              { key: "firstMessage", label: "对话的第一句话" },
              { key: "example", label: "消息案例" },
            ].map((item) => (
              <div key={item.key} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div className="text-xs font-semibold text-zinc-500">{item.label}</div>
                <div className={`mt-2 whitespace-pre-wrap text-sm ${record.texts?.[item.key] ? "text-zinc-900" : "text-zinc-400"}`}>
                  {record.texts?.[item.key] || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="确认删除角色？">
        <div className="text-sm leading-7 text-zinc-700">删除后该角色与其创造记录、相关对话将被移除，无法恢复。</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              deleteCharacterCreation(record.id);
              setDeleteOpen(false);
              navigate("/create");
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
          >
            删除
          </button>
        </div>
      </Modal>
    </div>
  );
}
