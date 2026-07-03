import { useMemo, useState } from "react";
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";
import DiamondIcon from "./DiamondIcon.jsx";
import Modal from "./Modal.jsx";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function ShareModal() {
  const session = useAppStore((s) => s.session);
  const grantDailyShareReward = useAppStore((s) => s.grantDailyShareReward);
  const shareOpen = useUIStore((s) => s.shareOpen);
  const shareUrl = useUIStore((s) => s.shareUrl);
  const shareTitle = useUIStore((s) => s.shareTitle);
  const closeShare = useUIStore((s) => s.closeShare);

  const [copied, setCopied] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [quickShareMessage, setQuickShareMessage] = useState("");

  const safeUrl = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window === "undefined") return "";
    return window.location?.href || "";
  }, [shareUrl]);

  const onClose = () => {
    setCopied(false);
    setRewarded(false);
    setQuickShareMessage("");
    closeShare();
  };

  const rewardShare = () => {
    if (!session?.isLoggedIn) return;
    const res = grantDailyShareReward?.({ amount: 5 });
    if (res?.granted) setRewarded(true);
  };

  const quickShareOptions = useMemo(
    () => [
      {
        key: "x",
        label: "X",
        Icon: Twitter,
        action: () => {
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(safeUrl)}&text=${encodeURIComponent(shareTitle || "分享")}`,
            "_blank",
            "noopener,noreferrer",
          );
          setQuickShareMessage("已打开 X 分享窗口");
        },
      },
      {
        key: "facebook",
        label: "Facebook",
        Icon: Facebook,
        action: () => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(safeUrl)}`, "_blank", "noopener,noreferrer");
          setQuickShareMessage("已打开 Facebook 分享窗口");
        },
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        Icon: MessageCircle,
        action: async () => {
          await navigator.clipboard.writeText(safeUrl || "");
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${shareTitle || "分享"} ${safeUrl}`)}`,
            "_blank",
            "noopener,noreferrer",
          );
          setQuickShareMessage("已打开 WhatsApp 分享窗口");
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        },
      },
      {
        key: "instagram",
        label: "Instagram",
        Icon: Instagram,
        action: async () => {
          await navigator.clipboard.writeText(safeUrl || "");
          setQuickShareMessage("链接已复制，可前往 Instagram 发布");
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        },
      },
    ],
    [safeUrl, shareTitle],
  );

  return (
    <Modal open={shareOpen} onClose={onClose} title={shareTitle || "分享"} className="max-w-[520px]">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="text-sm font-semibold text-zinc-900">每日首次分享得 5 钻石</div>
        {rewarded ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            <DiamondIcon className="h-4 w-4 text-emerald-600" />
            <span>+5</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
        <div className="text-xs font-semibold text-zinc-500">分享链接</div>
        <div className="mt-2 break-all text-sm text-zinc-900">{safeUrl}</div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-zinc-500">快速分享</div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickShareOptions.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={async () => {
                  try {
                    await item.action();
                    rewardShare();
                  } catch {
                    setQuickShareMessage("分享失败，请重试");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {quickShareMessage ? <div className="mt-2 text-xs font-medium text-zinc-500">{quickShareMessage}</div> : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(safeUrl || "");
              setCopied(true);
              rewardShare();
              setQuickShareMessage("链接已复制");
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
              setQuickShareMessage("复制失败，请重试");
            }
          }}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          {copied ? "已复制" : "复制链接"}
        </button>
      </div>
    </Modal>
  );
}
