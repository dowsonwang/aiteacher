import { useEffect, useRef, useState } from "react";
import { Check, Crop, Move, ScanFace } from "lucide-react";
import { cn } from "../lib/utils.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const defaultCrop = { x: 0.5, y: 0.32, size: 0.62 };

const createCroppedAvatar = (src, crop) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const outputSize = 512;
      const sourceSize = image.naturalWidth * crop.size;
      const sourceX = clamp(image.naturalWidth * crop.x - sourceSize / 2, 0, image.naturalWidth - sourceSize);
      const sourceY = clamp(image.naturalHeight * crop.y - sourceSize / 2, 0, image.naturalHeight - sourceSize);
      canvas.width = outputSize;
      canvas.height = outputSize;
      canvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = reject;
    image.src = src;
  });

export default function AvatarCropper({ src, initialCrop, onConfirmAndNext, onError }) {
  const [crop, setCrop] = useState(initialCrop?.size ? initialCrop : defaultCrop);
  const [saving, setSaving] = useState(false);
  const frameRef = useRef(null);
  const selectionRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    setCrop(initialCrop?.size ? initialCrop : defaultCrop);
  }, [src, initialCrop?.x, initialCrop?.y, initialCrop?.size]);

  const clampCrop = (nextCrop) => {
    const frame = frameRef.current;
    if (!frame) return nextCrop;
    const radiusX = nextCrop.size / 2;
    const radiusY = (frame.clientWidth * nextCrop.size) / (frame.clientHeight * 2);
    return {
      ...nextCrop,
      x: clamp(nextCrop.x, radiusX, 1 - radiusX),
      y: clamp(nextCrop.y, radiusY, 1 - radiusY),
    };
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, x: crop.x, y: crop.y };
  };

  const onPointerMove = (event) => {
    if (!dragRef.current || !frameRef.current) return;
    const bounds = frameRef.current.getBoundingClientRect();
    setCrop(clampCrop({
      ...crop,
      x: dragRef.current.x + (event.clientX - dragRef.current.pointerX) / bounds.width,
      y: dragRef.current.y + (event.clientY - dragRef.current.pointerY) / bounds.height,
    }));
  };

  const finishDrag = (event) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const submit = async () => {
    if (!src || saving) return;
    setSaving(true);
    try {
      const avatarUrl = await createCroppedAvatar(src, crop);
      await onConfirmAndNext({ avatarUrl, crop });
    } catch {
      onError?.();
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <Crop className="h-4 w-4" />
        裁剪人物头像
      </div>
      <div className="mt-1 text-xs leading-5 text-zinc-500">在完整图片上拖动圆形选区，框出你想使用的头像。</div>

      <div className="mt-4 flex flex-1 items-center justify-center rounded-3xl bg-zinc-100 p-3">
        {src ? (
          <div ref={frameRef} className="relative aspect-[9/16] h-[46vh] max-h-[440px] overflow-hidden rounded-2xl bg-zinc-200">
            <img src={src} alt="完整人物形象" draggable="false" className="pointer-events-none h-full w-full select-none object-contain" />
            <div
              ref={selectionRef}
              className="absolute aspect-square touch-none cursor-grab rounded-full border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.48),0_4px_20px_rgba(0,0,0,0.35)] active:cursor-grabbing"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.size * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
            >
              <div className="pointer-events-none absolute inset-1 rounded-full border border-white/50" />
              <ScanFace className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white/80 drop-shadow" />
            </div>
          </div>
        ) : (
          <div className="flex aspect-[9/16] h-[46vh] max-h-[440px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-center text-xs leading-5 text-zinc-400">
            生成形象图后<br />在这里裁剪头像
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Move className="h-4 w-4 text-zinc-400" />
        <span className="text-xs text-zinc-500">拖动选区</span>
        <span className="ml-auto text-xs text-zinc-500">选区大小</span>
        <input
          type="range"
          min="0.35"
          max="0.9"
          step="0.01"
          value={crop.size}
          disabled={!src}
          onChange={(event) => setCrop(clampCrop({ ...crop, size: Number(event.target.value) }))}
          className="w-24 accent-zinc-900 disabled:opacity-40"
          aria-label="头像选区大小"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!src || saving}
        className={cn(
          "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition",
          src && !saving ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-zinc-200 text-zinc-500",
        )}
      >
        <Check className="h-4 w-4" />
        {saving ? "正在保存头像..." : "确认头像并进入下一步"}
      </button>
    </div>
  );
}
