import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clapperboard, Gem, Image as ImageIcon, Sparkles } from "lucide-react";
import DiamondIcon from "../components/DiamondIcon.jsx";
import Modal from "../components/Modal.jsx";
import { publicAssets } from "../data/mock.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const recordFallbackUrl = publicAssets.chatAIImage;

const assetCost = (kind) => (kind === "video" ? 10 : 2);

const imageUrl = (prompt) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `${prompt}, cinematic portrait, consistent character, high quality, no text`,
  )}&image_size=portrait_16_9`;

const demoVideos = ["/videos/characters/demo-1.mp4", "/videos/characters/demo-2.mp4", "/videos/characters/demo-3.mp4"];

const inspirationIdeas = ["雨天的咖啡馆", "海边日落", "夜晚霓虹街头", "雪后的清晨", "演唱会现场", "公路旅行"];

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

  const characterAssets = useAppStore((s) => s.characterAssets);
  const addCharacterAsset = useAppStore((s) => s.addCharacterAsset);
  const diamonds = useAppStore((s) => s.diamonds);
  const spendDiamonds = useAppStore((s) => s.spendDiamonds);
  const openDiamondUpsell = useUIStore((s) => s.openDiamondUpsell);
  const [assetPrompt, setAssetPrompt] = useState("");
  const [assetKind, setAssetKind] = useState("image");
  const [generating, setGenerating] = useState(false);

  const assets = useMemo(() => {
    const cid = record?.characterId;
    return cid ? characterAssets?.[cid] || [] : [];
  }, [characterAssets, record?.characterId]);

  const onGenerateAsset = async () => {
    const prompt = assetPrompt.trim();
    if (!prompt || !record?.characterId) return;
    const cost = assetCost(assetKind);
    if (!spendDiamonds(cost)) {
      openDiamondUpsell({
        title: "Not enough Diamonds",
        description:
          assetKind === "video"
            ? "Generating a video costs 10 Diamonds. Subscribe or buy a diamond pack in this modal."
            : "Generating an image costs 2 Diamonds. Subscribe or buy a diamond pack in this modal.",
        cost,
        source: "character-asset",
      });
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, assetKind === "video" ? 1200 : 900));
    if (assetKind === "image") {
      addCharacterAsset({ characterId: record.characterId, kind: "image", url: imageUrl(prompt), prompt });
    } else {
      const url = demoVideos[Math.floor(Math.random() * demoVideos.length)];
      addCharacterAsset({ characterId: record.characterId, kind: "video", url, prompt });
    }
    setAssetPrompt("");
    setGenerating(false);
  };

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

      <div className="mt-6 rounded-[28px] border border-zinc-200 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">角色资产</div>
          <div className="text-xs text-zinc-500">TA 的生活瞬间，由你亲手生成</div>
        </div>

        <div className="mt-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-start gap-3">
            <img
              src={record.portraitUrl || recordFallbackUrl}
              alt=""
              className="h-10 w-10 rounded-full border border-zinc-200 object-cover"
            />
            <div className="min-w-0 flex-1">
              <input
                value={assetPrompt}
                onChange={(e) => setAssetPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onGenerateAsset();
                }}
                placeholder={`给 ${record.appearance?.name || "TA"} 描述一个场景，比如「雨天的咖啡馆」…`}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {inspirationIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setAssetPrompt(idea)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
                  >
                    {idea}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssetKind("image")}
                    className={
                      assetKind === "image"
                        ? "inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                        : "inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                    }
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    照片
                    <span className="inline-flex items-center gap-0.5 opacity-80">
                      <Gem className="h-3 w-3" />
                      2
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetKind("video")}
                    className={
                      assetKind === "video"
                        ? "inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                        : "inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                    }
                  >
                    <Clapperboard className="h-3.5 w-3.5" />
                    视频
                    <span className="inline-flex items-center gap-0.5 opacity-80">
                      <Gem className="h-3 w-3" />
                      10
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!assetPrompt.trim() || generating}
                  onClick={onGenerateAsset}
                  className={
                    assetPrompt.trim() && !generating
                      ? "inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                      : "inline-flex items-center gap-2 rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-500"
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? "生成中…" : assetKind === "image" ? "生成照片" : "生成视频"}
                  <span className="inline-flex items-center gap-1 opacity-80">
                    <Gem className="h-3.5 w-3.5" />
                    {assetCost(assetKind)}
                  </span>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-end gap-1 text-xs text-zinc-500">
                余额：
                <DiamondIcon className="h-3.5 w-3.5" />
                {diamonds.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {assets.length ? (
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="aspect-[9/16] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                {a.kind === "image" ? (
                  <img src={a.url} alt={a.prompt} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = recordFallbackUrl; }} />
                ) : (
                  <video src={a.url} muted loop playsInline autoPlay className="h-full w-full bg-black object-cover" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
            <div className="text-sm font-semibold text-zinc-700">还没有任何瞬间</div>
            <div className="mt-1 text-xs text-zinc-500">写下第一个场景，为 TA 生成一张照片或一段视频吧。</div>
          </div>
        )}
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
