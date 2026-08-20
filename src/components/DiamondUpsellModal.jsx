import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import DiamondIcon from "./DiamondIcon.jsx";
import { cn } from "../lib/utils.js";
import { diamondPacks, formatUsd, planRank, subscriptionPlans, subscriptionRules } from "../lib/diamondCommerce.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function DiamondUpsellModal() {
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const addDiamonds = useAppStore((s) => s.addDiamonds);
  const subscribeToPlan = useAppStore((s) => s.subscribeToPlan);
  const diamondUpsellOpen = useUIStore((s) => s.diamondUpsellOpen);
  const diamondUpsellContext = useUIStore((s) => s.diamondUpsellContext);
  const closeDiamondUpsell = useUIStore((s) => s.closeDiamondUpsell);
  const openAuth = useUIStore((s) => s.openAuth);
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const isSubscribed = subscription.status === "active";
  const currentRank = subscription.planId ? planRank(subscription.planId) : 0;
  const requiredAmount = Math.max(
    0,
    Number(diamondUpsellContext?.requiredAmount ?? diamondUpsellContext?.cost) || 0,
  );

  useEffect(() => {
    if (diamondUpsellOpen) return;
    setSelectedItem(null);
    setPaymentMethod("");
    setSubmitting(false);
    setToast(null);
  }, [diamondUpsellOpen]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const currentPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return `${window.location.pathname}${window.location.search}`;
  }, []);

  const title = diamondUpsellContext?.title || "Not enough Diamonds";
  const description =
    diamondUpsellContext?.description || "Subscribe or buy a diamond pack below without leaving this page.";

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

  const selectItem = (item) => {
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: currentPath });
      return;
    }
    if (item.type === "plan" && planButtonDisabled(item)) return;
    setSelectedItem(item);
    if (!paymentMethod) setPaymentMethod("card");
  };

  const pay = async () => {
    if (!selectedItem || !paymentMethod || submitting) return;
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: currentPath });
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 850));

    if (selectedItem.type === "pack") {
      addDiamonds(selectedItem.diamonds, "reward");
      showToast("success", "Diamonds added.");
    } else {
      subscribeToPlan({
        planId: selectedItem.id,
        upfrontDiamonds: selectedItem.upfrontDiamonds,
      });
      showToast("success", "Subscription activated.");
    }
    setSubmitting(false);
    window.setTimeout(() => closeDiamondUpsell(), 500);
  };

  return (
    <>
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[70] -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl",
              toast.type === "success" ? "bg-emerald-600" : "bg-zinc-900",
            )}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
      <Modal open={diamondUpsellOpen} onClose={closeDiamondUpsell} title={title} className="max-w-5xl">
        <div className="max-h-[calc(100dvh-120px)] space-y-6 overflow-y-auto pr-1">
          <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900">{description}</div>
                <div className="mt-2 text-sm text-zinc-600">
                  You can complete the purchase right here and continue your action without leaving this page.
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Balance</div>
                <div className="mt-1 inline-flex items-center gap-1 text-base font-semibold text-zinc-900">
                  <DiamondIcon className="h-4 w-4" />
                  <span>{diamonds.toLocaleString()}</span>
                </div>
                {requiredAmount > 0 ? (
                  <div className="mt-1 text-xs text-zinc-500">Need {requiredAmount.toLocaleString()} Diamonds for this action.</div>
                ) : null}
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-zinc-900">Subscription plans</div>
                <div className="text-sm text-zinc-600">Choose one of the three plans below.</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {subscriptionPlans.map((plan) => {
                const selected = selectedItem?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-[28px] border bg-white p-5 shadow-sm transition",
                      plan.highlight ? "border-zinc-900" : "border-zinc-200",
                      selected ? "ring-2 ring-zinc-900/15" : "",
                    )}
                  >
                    {plan.highlight ? (
                      <div className="absolute -top-3 left-5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Best value</div>
                    ) : null}
                    <div className="text-sm font-semibold text-zinc-900">{plan.name}</div>
                    <div className="mt-3 flex items-end gap-2">
                      <div className="text-3xl font-semibold text-zinc-900">{formatUsd(plan.monthlyPrice)}</div>
                      <div className="pb-1 text-sm text-zinc-500">{plan.period}</div>
                    </div>
                    <div className="mt-2 flex min-h-6 items-center gap-2">
                      {plan.discountLabel ? (
                        <>
                          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {plan.discountLabel}
                          </span>
                          <span className="text-xs text-zinc-400 line-through">{formatUsd(plan.originalMonthlyPrice)}</span>
                        </>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">{plan.billingNote}</div>
                    <div className="mt-5 inline-flex items-center gap-1 text-base font-semibold text-zinc-900">
                      <DiamondIcon className="h-4 w-4" />
                      <span>100 Diamonds/month</span>
                    </div>
                    <button
                      type="button"
                      disabled={planButtonDisabled(plan)}
                      onClick={() => selectItem(plan)}
                      className={cn(
                        "mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                        selected ? "bg-zinc-900 text-white" : plan.highlight ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                        planButtonDisabled(plan) ? "cursor-not-allowed opacity-60" : "",
                      )}
                    >
                      {selected ? "Selected" : planButtonLabel(plan)}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <div className="text-base font-semibold text-zinc-900">Diamond packs</div>
              <div className="text-sm text-zinc-600">Buy a one-time pack if you only need extra Diamonds right now. Diamond packs require an active subscription.</div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {diamondPacks.map((pack) => {
                const selected = selectedItem?.id === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={cn("rounded-[24px] border bg-white p-5 shadow-sm transition", selected ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200")}
                  >
                    <div className="text-sm font-semibold text-zinc-900">{pack.name}</div>
                    <div className="mt-3 text-3xl font-semibold text-zinc-900">{formatUsd(pack.price)}</div>
                    <div className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-zinc-900">
                      <DiamondIcon className="h-4 w-4" />
                      <span>{pack.diamonds.toLocaleString()} Diamonds</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectItem(pack)}
                      className={cn(
                        "mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                        selected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                      )}
                    >
                      {selected ? "Selected" : "Buy now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={cn("grid gap-4", selectedItem ? "lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]" : "grid-cols-1")}>
            <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-base font-semibold text-zinc-900">Plan rules</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-700">
                {subscriptionRules.map((rule) => (
                  <div key={rule} className="rounded-2xl bg-zinc-50 px-4 py-3">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {selectedItem ? (
              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="text-base font-semibold text-zinc-900">Checkout</div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-sm font-semibold text-zinc-900">{selectedItem.name}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Amount:{" "}
                      <span className="font-semibold text-zinc-900">
                        {formatUsd(selectedItem.type === "pack" ? selectedItem.price : selectedItem.billedTotal)}
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-600">
                      <DiamondIcon className="h-4 w-4" />
                      <span>
                        {selectedItem.type === "pack"
                          ? `${selectedItem.diamonds.toLocaleString()} Diamonds added instantly`
                          : `100 Diamonds issued immediately, then 100 Diamonds/month`}
                      </span>
                    </div>
                  </div>

                  {selectedItem.type === "pack" ? null : (
                    <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                      Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access
                      continues through the end of your paid term.
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-zinc-900">Payment method</div>
                    <div className="grid grid-cols-2 gap-2">
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
                    {submitting ? "Processing..." : "Pay now"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </Modal>
    </>
  );
}
