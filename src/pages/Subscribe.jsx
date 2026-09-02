import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../components/Modal.jsx";
import DiamondIcon from "../components/DiamondIcon.jsx";
import FaqAccordion from "../components/FaqAccordion.jsx";
import HomeFooter from "../components/HomeFooter.jsx";
import { diamondPacks, formatUsd, planRank, subscriptionPlans, subscriptionRules } from "../lib/diamondCommerce.js";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function Subscribe() {
  const session = useAppStore((s) => s.session);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const addDiamonds = useAppStore((s) => s.addDiamonds);
  const subscribeToPlan = useAppStore((s) => s.subscribeToPlan);
  const openAuth = useUIStore((s) => s.openAuth);

  const plans = useMemo(() => subscriptionPlans, []);
  const packs = useMemo(() => diamondPacks, []);

  const faqItems = useMemo(
    () => [
      {
        q: "What do I get with subscription?",
        a: "Free users can send up to 10 chat messages. A paid plan unlocks unlimited text chat plus premium features. Some actions use Diamonds, such as character images, chat media, short drama creation, and Discover unlocks.",
      },
      {
        q: "How are Diamonds issued?",
        a: "All paid plans include 100 Diamonds per month. 100 Diamonds are issued immediately after each successful payment, and 100 Diamonds are issued at the start of each subsequent billing month.",
      },
      {
        q: "How does renewal work?",
        a: "Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access continues through the end of your paid term.",
      },
      {
        q: "Can I upgrade my plan later?",
        a: "Yes. You can upgrade to a higher plan at any time. Downgrades are not supported in the current demo.",
      },
      {
        q: "Is text chat free?",
        a: "Free users can send up to 10 chat messages in total. Subscribe to chat without limits. Text chat never uses Diamonds.",
      },
    ],
    [],
  );

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
  const [confirmItem, setConfirmItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSubscribed = subscription.status === "active";
  const currentRank = subscription.planId ? planRank(subscription.planId) : 0;

  const openPurchaseConfirm = (item) => {
    setConfirmItem(item);
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
    openPurchaseConfirm(plan);
  };

  const onSelectPack = (pack) => {
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: "/subscribe" });
      return;
    }
    openPurchaseConfirm(pack);
  };

  const pay = async () => {
    if (!confirmItem || !paymentMethod) return;
    if (!session.isLoggedIn) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 850));

    if (confirmItem?.type === "pack") {
      addDiamonds(confirmItem.diamonds, "reward");
      showToast("success", "Diamonds added.");
    } else {
      subscribeToPlan({
        planId: confirmItem.id,
        upfrontDiamonds: confirmItem.upfrontDiamonds,
      });
      showToast("success", "Subscription activated.");
    }
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

  const rules = useMemo(() => subscriptionRules, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-4">
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

      <div className="space-y-1">
        <div className="text-base font-semibold text-zinc-900">Choose your subscription</div>
        <div className="text-sm text-zinc-600">
          All paid plans include 100 Diamonds per month. 100 Diamonds are issued immediately after each successful payment, and 100 Diamonds are issued at the start of each subsequent billing month.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex min-h-[340px] flex-col rounded-[32px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
          <div className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Free</div>
          <div className="text-sm font-semibold text-zinc-900">Free plan</div>
          <div className="mt-3 flex items-end gap-2">
            <div className="text-3xl font-semibold text-zinc-900">$0</div>
            <div className="pb-1 text-sm text-zinc-500">/forever</div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">Try the core experience before subscribing.</div>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm text-zinc-700">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Includes</div>
            <div className="mt-3 space-y-2">
              <div>Limited-time free chat</div>
              <div>1 free character creation</div>
              <div>3 free image or video requests</div>
              <div className="inline-flex items-center gap-1"><DiamondIcon className="h-4 w-4" />5 free Diamonds every day</div>
            </div>
          </div>
          <div className="mt-auto rounded-2xl bg-emerald-100 px-4 py-3 text-center text-sm font-semibold text-emerald-800">Current free access</div>
        </div>
        {plans.map((p) => (
          (() => {
            return (
          <div
            key={p.id}
            className={cn(
              "relative flex min-h-[340px] flex-col rounded-[32px] border bg-white p-6 shadow-sm",
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
                  <div className="text-3xl font-semibold text-zinc-900">{formatUsd(p.monthlyPrice)}</div>
                  <div className="pb-1 text-sm text-zinc-500">{p.period}</div>
                </div>
                <div className="mt-2 flex min-h-6 items-center gap-2">
                  {p.discountLabel ? (
                    <>
                      <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">{p.discountLabel}</span>
                      <span className="text-xs text-zinc-400 line-through">{formatUsd(p.originalMonthlyPrice)}</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-zinc-500">{p.billingNote}</div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-zinc-700">
              <div className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                <DiamondIcon className="h-4 w-4" />
                <span>100 Diamonds/month</span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Includes</div>
                <div className="mt-3 space-y-2">
                  <div>Includes all Free plan benefits</div>
                  <div>Unlimited free text chat</div>
                  <div>Character image generation</div>
                  <div>Chat image and video requests</div>
                  <div>Short drama creation and Discover unlocks</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={planButtonDisabled(p)}
              onClick={() => onSelectPlan(p)}
              className={cn(
                "mt-auto w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                p.highlight ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                planButtonDisabled(p) ? "cursor-not-allowed opacity-60 hover:bg-inherit" : "",
              )}
            >
              {planButtonLabel(p)}
            </button>
          </div>
            );
          })()
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
        Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access continues through
        the end of your paid term.
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-zinc-900">Diamond packs</div>
          <div className="text-sm text-zinc-600">One-time purchase for extra Diamonds. Diamond packs require an active subscription.</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packs.map((pack) => (
            <div key={pack.id} className="flex min-h-[220px] flex-col rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-zinc-900">{pack.name}</div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-3xl font-semibold text-zinc-900">{formatUsd(pack.price)}</div>
              </div>
              <div className="mt-5 inline-flex items-center gap-1 text-base font-semibold text-zinc-900">
                <DiamondIcon className="h-4 w-4" />
                <span>{pack.diamonds.toLocaleString()} Diamonds</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectPack(pack)}
                className="mt-auto w-full rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                Buy now
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-base font-semibold text-zinc-900">Plan rules</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            {rules.map((r) => (
              <div key={r} className="rounded-2xl bg-zinc-50 px-4 py-3">
                {r}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-base font-semibold text-zinc-900">FAQ</div>
          <div className="mt-5">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      <HomeFooter />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm purchase" className="max-w-xl">
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm font-semibold text-zinc-900">
              {confirmItem?.name || "Subscription"}
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Amount:{" "}
              <span className="font-semibold text-zinc-900">
                {confirmItem ? formatUsd(confirmItem.type === "pack" ? confirmItem.price : confirmItem.billedTotal) : "-"}
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-600">
              <DiamondIcon className="h-4 w-4" />
              <span>
                {confirmItem?.type === "pack"
                  ? `${confirmItem?.diamonds?.toLocaleString?.() || 0} Diamonds added instantly`
                  : `100 Diamonds issued immediately, then 100 Diamonds/month`}
              </span>
            </div>
          </div>

          {confirmItem?.type === "pack" ? null : (
            <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
              Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access continues
              through the end of your paid term.
            </div>
          )}

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
