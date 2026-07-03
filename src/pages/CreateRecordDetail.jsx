import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import Modal from "../components/Modal.jsx";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";

const recordFallbackUrl = "/images/chat/ai-reply-01.png";
const demoVideos = ["/videos/characters/demo-1.mp4", "/videos/characters/demo-2.mp4", "/videos/characters/demo-3.mp4"];

export default function CreateRecordDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const session = useAppStore((s) => s.session);
  const characterCreations = useAppStore((s) => s.characterCreations);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const updateCharacterCreation = useAppStore((s) => s.updateCharacterCreation);
  const spendDiamonds = useAppStore((s) => s.spendDiamonds);
  const addCreationVideo = useAppStore((s) => s.addCreationVideo);
  const deleteCharacterCreation = useAppStore((s) => s.deleteCharacterCreation);

  const record = useMemo(() => {
    const list = Array.isArray(characterCreations) ? characterCreations : [];
    return list.find((r) => r.id === id);
  }, [characterCreations, id]);

  const videoCount = useMemo(() => {
    if (!record) return 0;
    return Array.isArray(record.videos) ? record.videos.filter((item) => item?.url).length : 0;
  }, [record]);
  const statusText = useMemo(() => {
    if (!record) return "";
    if (!videoCount) return "未生成视频";
    if (videoCount < 3) return "视频生成中";
    return "已完成";
  }, [record, videoCount]);

  const [videoPrompts, setVideoPrompts] = useState(["", "", ""]);
  const [activeTab, setActiveTab] = useState("setting");
  const [playingVideoIndex, setPlayingVideoIndex] = useState(-1);
  const videoRefs = useRef([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!record) return;
    setVideoPrompts(
      Array.from({ length: 3 }).map((_, idx) => {
        const item = (record.videos || [])[idx];
        return item?.prompt || "";
      }),
    );
    setPlayingVideoIndex(-1);
  }, [record?.id]);

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
  const isVideoGenerating = record.status === "video" && videoCount < 3;
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

        {isOwner && record.characterId ? (
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
              {(record.appearance?.personality || []).slice(0, 3).map((p) => (
                <span key={p} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
              {[
                { key: "setting", label: "人物设定" },
                { key: "video", label: "视频" },
              ].map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                      active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-white",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "video" ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700">
                {statusText}
              </div>
            ) : null}
          </div>

          {activeTab === "setting" ? (
            <div className="mt-4 space-y-3">
              {[
                { key: "relation", label: "人物与用户关系" },
                { key: "scenario", label: "对话场景" },
                { key: "firstMessage", label: "对话的第一句话" },
                { key: "example", label: "Message example" },
              ].map((item) => (
                <div key={item.key} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <div className="text-xs font-semibold text-zinc-500">{item.label}</div>
                  <div className={cn("mt-2 whitespace-pre-wrap text-sm text-zinc-900", record.texts?.[item.key] ? "" : "text-zinc-400")}>
                    {record.texts?.[item.key] || "—"}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "video" ? (
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => {
                const existing = (record.videos || [])[idx];
                const prompt = videoPrompts[idx] || "";
                const disabled = !isOwner || Boolean(existing?.url);
                const isPlaying = playingVideoIndex === idx;
                return (
                  <div key={idx} className="rounded-[22px] border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">视频 {idx + 1}</div>
                      <div className="text-xs font-semibold text-zinc-500">{existing?.url ? "已生成" : isVideoGenerating ? "生成中" : "未生成"}</div>
                    </div>

                    {!existing?.url && isVideoGenerating ? (
                      <div className="mt-3 flex aspect-[9/16] w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                        <div className="text-sm font-semibold text-zinc-900">生成中</div>
                      </div>
                    ) : null}

                    {!existing?.url && !isVideoGenerating ? (
                      <div className="mt-3">
                        <textarea
                          value={prompt}
                          onChange={(e) => {
                            const next = videoPrompts.slice();
                            next[idx] = e.target.value;
                            setVideoPrompts(next);
                          }}
                          placeholder="输入提示词（例如：在咖啡馆里微笑打招呼）"
                          className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                          disabled={disabled}
                        />
                        <div className="mt-3 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!record) return;
                              if (!isOwner) return;
                              const ok = spendDiamonds(15);
                              if (!ok) return;
                              if (record.status !== "video") updateCharacterCreation(record.id, { status: "video" });
                              const url = demoVideos[idx] || "/videos/characters/hover.mp4";
                              addCreationVideo({ creationId: record.id, slotIndex: idx, prompt, url });
                            }}
                            disabled={disabled || !prompt.trim()}
                            className={cn(
                              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                              disabled || !prompt.trim() ? "bg-zinc-200 text-zinc-500" : "bg-zinc-900 text-white hover:bg-zinc-800",
                            )}
                          >
                            <DiamondIcon className="h-4 w-4 text-sky-200" />
                            <span>生成（15）</span>
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {existing?.url ? (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const el = videoRefs.current[idx];
                            if (!el) return;
                            if (playingVideoIndex !== idx) {
                              setPlayingVideoIndex(idx);
                              el.play?.();
                              return;
                            }
                            if (el.paused) el.play?.();
                            else el.pause?.();
                          }}
                          className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black"
                        >
                          <video
                            ref={(node) => {
                              videoRefs.current[idx] = node;
                            }}
                            src={existing.url}
                            className="aspect-[9/16] w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            onPlay={() => setPlayingVideoIndex(idx)}
                            onPause={() => setPlayingVideoIndex((cur) => (cur === idx ? -1 : cur))}
                          />
                          <div className={cn("absolute inset-0 flex items-center justify-center bg-black/25 transition", isPlaying ? "opacity-0" : "opacity-100 group-hover:bg-black/35")}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow">
                              <span className="ml-0.5 text-base leading-none">▶</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
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
