import { useNavigate } from "react-router-dom";
import { CreditCard, ToggleLeft, ToggleRight, XCircle } from "lucide-react";
import { t } from "../i18n/i18n.js";
import { formatDateTime, useAppStore } from "../stores/useAppStore.js";

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const language = useAppStore((s) => s.language);
  const subscription = useAppStore((s) => s.subscription);
  const cancelSubscription = useAppStore((s) => s.cancelSubscription);
  const toggleRenew = useAppStore((s) => s.toggleRenew);

  const isActive = subscription.status === "active";
  const planLabel =
    subscription.planId === "month"
      ? t(language, "subscribe_plan_month")
      : subscription.planId === "year"
        ? t(language, "subscribe_plan_year")
        : subscription.planId || "-";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="text-base font-semibold text-zinc-900">{t(language, "subscription_title")}</div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        {!isActive ? (
          <div className="space-y-4">
            <div className="text-sm text-zinc-700">{t(language, "subscription_none")}</div>
            <button
              type="button"
              onClick={() => navigate("/subscribe")}
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <CreditCard className="h-4 w-4" />
              {t(language, "top_subscribe")}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="text-sm text-zinc-500">{t(language, "subscription_active")}</div>
              <div className="text-lg font-semibold text-zinc-900">{planLabel}</div>
              <div className="text-sm text-zinc-600">
                {t(language, "subscription_expires")}：{subscription.expiresAt ? formatDateTime(subscription.expiresAt) : "-"}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-zinc-900">{t(language, "subscription_renew")}</div>
                <div className="text-sm text-zinc-600">{t(language, "subscription_toggle_note")}</div>
              </div>
              <button
                type="button"
                onClick={toggleRenew}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              >
                {subscription.renew ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {subscription.renew ? t(language, "subscription_on") : t(language, "subscription_off")}
              </button>
            </div>

            <button
              type="button"
              onClick={cancelSubscription}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <XCircle className="h-4 w-4 text-zinc-700" />
              {t(language, "subscription_cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
