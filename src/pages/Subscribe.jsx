import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../components/Modal.jsx";
import DiamondIcon from "../components/DiamondIcon.jsx";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const planRank = (id) => (id === "year" ? 3 : id === "quarter" ? 2 : 1);

const toNinetyNine = (amount) => {
  const safe = Number(amount);
  if (!Number.isFinite(safe) || safe <= 0) return 0;
  const dollars = Math.floor(safe);
  return Number((dollars + 0.99).toFixed(2));
};

const fmt = (amount) => `$${Number(amount).toFixed(2)}`;

export default function Subscribe() {
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const subscribeToPlan = useAppStore((s) => s.subscribeToPlan);
  const addDiamonds = useAppStore((s) => s.addDiamonds);
  const openAuth = useUIStore((s) => s.openAuth);

  const plans = useMemo(() => {
    const month = { id: "month", name: "Monthly", original: 9.99, discounted: 9.99, discountLabel: null, period: "/mo" };
    const quarterOriginal = 28.99;
    const yearOriginal = 118.99;
    const quarterDiscounted = toNinetyNine(quarterOriginal * 0.7);
    const yearDiscounted = toNinetyNine(yearOriginal * 0.3);
    return [
      {
        ...month,
        highlight: false,
      },
      {
        id: "quarter",
        name: "Quarterly",
        original: quarterOriginal,
        discounted: quarterDiscounted,
        discountLabel: "30% OFF",
        period: "/quarter",
        highlight: false,
      },
      {
        id: "year",
        name: "Yearly",
        original: yearOriginal,
        discounted: yearDiscounted,
        discountLabel: "70% OFF",
        period: "/year",
        highlight: true,
      },
    ];
  }, []);

  const diamondPacks = useMemo(() => {
    const packs = [
      { id: "d100", diamonds: 100, original: 9.9, multiplier: 0.8, label: "20% OFF" },
      { id: "d300", diamonds: 300, original: 28.99, multiplier: 0.6, label: "40% OFF" },
      { id: "d600", diamonds: 600, original: 58.99, multiplier: 0.4, label: "60% OFF" },
      { id: "d1000", diamonds: 1000, original: 99.99, multiplier: 0.3, label: "70% OFF" },
    ];
    return packs.map((p) => ({ ...p, discounted: toNinetyNine(p.original * p.multiplier) }));
  }, []);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingPack, setPendingPack] = useState(null);

  const isSubscribed = subscription.status === "active";
  const currentRank = subscription.planId ? planRank(subscription.planId) : 0;

  useEffect(() => {
    if (!session.isLoggedIn) return;
    if (!pendingPack) return;
    if (subscription.status === "active") {
      openPackConfirm(pendingPack);
      setPendingPack(null);
      return;
    }
    const yearly = plans.find((p) => p.id === "year") || plans[0];
    showToast("info", "Subscription required to buy 💎.");
    openPlanConfirm(yearly);
  }, [pendingPack, plans, session.isLoggedIn, subscription.status]);

  const openPlanConfirm = (plan) => {
    setConfirmKind("plan");
    setConfirmItem(plan);
    setPaymentMethod(null);
    setConfirmOpen(true);
  };

  const openPackConfirm = (pack) => {
    setConfirmKind("pack");
    setConfirmItem(pack);
    setPaymentMethod(null);
    setConfirmOpen(true);
  };

  const onSelectPlan = (plan) => {
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: "/subscribe" });
      return;
    }
    if (isSubscribed && planRank(plan.id) < currentRank) {
      showToast("error", "Downgrades are not supported.");
      return;
    }
    openPlanConfirm(plan);
  };

  const onSelectPack = (pack) => {
    if (!session.isLoggedIn) {
      setPendingPack(pack);
      openAuth({ mode: "login", postAuthPath: "/subscribe" });
      return;
    }
    if (!isSubscribed) {
      setPendingPack(pack);
      const yearly = plans.find((p) => p.id === "year") || plans[0];
      showToast("info", "Subscription required to buy 💎.");
      openPlanConfirm(yearly);
      return;
    }
    openPackConfirm(pack);
  };

  const pay = async () => {
    if (!confirmItem || !paymentMethod) return;
    if (!session.isLoggedIn) return;

    if (confirmKind === "pack" && !isSubscribed) {
      setConfirmOpen(false);
      showToast("info", "Subscription required to buy 💎.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 850));

    if (confirmKind === "plan") {
      subscribeToPlan({ planId: confirmItem.id, bonusDiamonds: 150 });
      showToast("success", "Subscription activated.");
      setConfirmOpen(false);
      setSubmitting(false);
      if (pendingPack) {
        window.setTimeout(() => {
          openPackConfirm(pendingPack);
          setPendingPack(null);
        }, 150);
      }
      return;
    }

    addDiamonds(confirmItem.diamonds);
    showToast("success", "💎 added.");
    setConfirmOpen(false);
    setSubmitting(false);
  };

  const planButtonLabel = (plan) => {
    if (!isSubscribed) return plan.id === "year" ? "Subscribe (Recommended)" : "Subscribe";
    if (plan.id === subscription.planId) return "Current plan";
    if (planRank(plan.id) > currentRank) return "Upgrade";
    return "Not available";
  };

  const planButtonDisabled = (plan) => {
    if (!isSubscribed) return false;
    if (plan.id === subscription.planId) return true;
    return planRank(plan.id) < currentRank;
  };

  const rules = [
    "Subscription unlocks all platform features.",
    "Each subscription purchase includes 150 bonus 💎.",
    "💎 packs require an active subscription.",
    "You can upgrade to a higher plan; downgrades are not supported.",
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[60] -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl",
              toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-zinc-900",
            )}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-zinc-900">Subscription</div>
          <div className="text-sm text-zinc-600">
            {isSubscribed ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span>Current: {plans.find((p) => p.id === subscription.planId)?.name || "Subscription"}</span>
                <span className="text-zinc-400">·</span>
                <span className="inline-flex items-center gap-1">
                  <DiamondIcon className="h-4 w-4" />
                  <span>{diamonds.toLocaleString()}</span>
                </span>
              </span>
            ) : (
              "Choose a plan that fits you."
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative rounded-3xl border bg-white p-6 shadow-sm",
              p.highlight ? "border-zinc-900" : "border-zinc-200",
            )}
          >
            {p.highlight ? (
              <div className="absolute -top-3 left-6 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                Best value
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{p.name}</div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="text-3xl font-semibold text-zinc-900">{fmt(p.discounted)}</div>
                  <div className="pb-1 text-sm text-zinc-500">{p.period}</div>
                </div>
                {p.discountLabel ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {p.discountLabel}
                    </div>
                    <div className="text-xs text-zinc-500">
                      <span className="line-through">{fmt(p.original)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-zinc-500">
                    <span className="line-through opacity-0">{fmt(p.original)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-zinc-700">
              <div>All platform features</div>
              <div className="inline-flex items-center gap-1">
                <span>150 bonus</span>
                <DiamondIcon className="h-4 w-4" />
                <span>/ month</span>
              </div>
            </div>

            <button
              type="button"
              disabled={planButtonDisabled(p)}
              onClick={() => onSelectPlan(p)}
              className={cn(
                "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                p.highlight ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                planButtonDisabled(p) ? "cursor-not-allowed opacity-60 hover:bg-inherit" : "",
              )}
            >
              {planButtonLabel(p)}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <DiamondIcon className="h-4 w-4" />
          Packs
        </div>
        <div className="mt-1 text-sm text-zinc-600">
          Buy <span className="inline-flex items-center gap-1 align-middle"><DiamondIcon className="h-4 w-4" /></span> for content consumption. Subscription required.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          {diamondPacks.map((p) => (
            <div key={p.id} className="rounded-3xl border border-zinc-200 bg-white p-5">
              <div className="inline-flex items-center gap-1 text-base font-semibold text-zinc-900">
                <DiamondIcon className="h-4 w-4" />
                <span>{p.diamonds.toLocaleString()}</span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-2xl font-semibold text-zinc-900">{fmt(p.discounted)}</div>
                <div className="pb-0.5 text-sm text-zinc-500">
                  <span className="line-through">{fmt(p.original)}</span>
                </div>
              </div>
              <div className="mt-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 inline-flex">
                {p.label}
              </div>
              <button
                type="button"
                onClick={() => onSelectPack(p)}
                className="mt-5 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Rules</div>
        <div className="mt-3 space-y-1">
          {rules.map((r) => (
            <div key={r}>{r}</div>
          ))}
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm purchase" className="max-w-xl">
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm font-semibold text-zinc-900">
              {confirmKind === "plan"
                ? `${confirmItem?.name || "Subscription"}`
                : null}
              {confirmKind === "pack" ? (
                <span className="inline-flex items-center gap-1">
                  <DiamondIcon className="h-4 w-4" />
                  <span>{confirmItem?.diamonds?.toLocaleString?.() || 0}</span>
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Amount:{" "}
              <span className="font-semibold text-zinc-900">
                {confirmItem ? fmt(confirmKind === "plan" ? confirmItem.discounted : confirmItem.discounted) : "-"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-zinc-900">Payment method</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm font-semibold",
                  paymentMethod === "card" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                )}
              >
                Bank card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("crypto")}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm font-semibold",
                  paymentMethod === "crypto" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                )}
              >
                Crypto
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={!paymentMethod || submitting}
            onClick={pay}
            className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Processing…" : "Pay now"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
