import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils.js";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const CARD_W = 360;
const CARD_H = 176;

export default function OnboardingTour({ open, step, steps, onNext, onClose }) {
  const target = steps?.[step]?.target || null;
  const title = steps?.[step]?.title || "";
  const body = steps?.[step]?.body || "";
  const actionText = steps?.[step]?.actionText || "";
  const isLastStep = step >= (steps?.length || 1) - 1;

  const [rect, setRect] = useState(null);
  const safeRect = rect || { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 };

  useEffect(() => {
    if (!open) return;
    if (!target) return;

    const update = () => {
      const r = target.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      });
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(target);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, target, step]);

  useEffect(() => {
    if (!open) return;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [open, target, step]);

  const cardPos = useMemo(() => {
    const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
    const vh = typeof window === "undefined" ? 800 : window.innerHeight;
    const gap = 16;
    const margin = 16;

    const rightSpace = vw - safeRect.right - gap;
    const leftSpace = safeRect.left - gap;
    const placeRight = rightSpace >= CARD_W || rightSpace >= leftSpace;

    const x = placeRight ? safeRect.right + gap : safeRect.left - gap - CARD_W;
    const y = safeRect.top + safeRect.height / 2 - CARD_H / 2;

    return {
      left: clamp(x, margin, vw - margin - CARD_W),
      top: clamp(y, margin, vh - margin - CARD_H),
      width: CARD_W,
    };
  }, [safeRect.bottom, safeRect.height, safeRect.left, safeRect.right, safeRect.top, safeRect.width]);

  const connector = useMemo(() => {
    const hx = safeRect.left + safeRect.width / 2;
    const hy = safeRect.top + safeRect.height / 2;
    const cx = cardPos.left + cardPos.width / 2;
    const cy = cardPos.top + CARD_H / 2;
    const endX = cx > hx ? cardPos.left + 10 : cardPos.left + cardPos.width - 10;
    const endY = cy;
    const dx = endX - hx;

    const c1x = hx + dx * 0.35;
    const c1y = hy;
    const c2x = hx + dx * 0.7;
    const c2y = endY;

    return { hx, hy, endX, endY, c1x, c1y, c2x, c2y };
  }, [cardPos.left, cardPos.top, cardPos.width, safeRect.height, safeRect.left, safeRect.top, safeRect.width]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0" onMouseDown={onClose} />

      <div
        className="absolute rounded-[28px] ring-2 ring-white/90 ring-offset-0 shadow-[0_0_0_2px_rgba(255,255,255,0.12),0_0_36px_rgba(255,255,255,0.28)]"
        style={{
          left: safeRect.left - 8,
          top: safeRect.top - 8,
          width: safeRect.width + 16,
          height: safeRect.height + 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
        }}
      />

      <svg className="pointer-events-none absolute inset-0">
        <path
          d={`M ${connector.hx} ${connector.hy} C ${connector.c1x} ${connector.c1y}, ${connector.c2x} ${connector.c2y}, ${connector.endX} ${connector.endY}`}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="3 7"
        />
        <circle cx={connector.hx} cy={connector.hy} r="4.5" fill="rgba(255,255,255,0.95)" />
      </svg>

      <div
        className="absolute"
        style={{
          left: cardPos.left,
          top: cardPos.top,
          width: cardPos.width,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-white/85">{body}</div>
          <div className="mt-5 flex items-center justify-end gap-2">
            {actionText ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                {actionText}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className={cn(
                    "rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100",
                  )}
                >
                  {isLastStep ? "Done" : "Next"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
