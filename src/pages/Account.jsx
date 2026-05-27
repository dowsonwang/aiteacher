import { useMemo, useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore.js";
import { cn } from "../lib/utils.js";
import { CreditCard, Gem, Receipt, X } from "lucide-react";

export default function Account() {
  const session = useAppStore((s) => s.session);
  const updateSessionProfile = useAppStore((s) => s.updateSessionProfile);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);
  const cancelSubscription = useAppStore((s) => s.cancelSubscription);

  const [name, setName] = useState(session.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl || "");
  const fileRef = useRef(null);
  const [tab, setTab] = useState("profile");
  const [cancelOpen, setCancelOpen] = useState(false);

  const canSave = useMemo(() => {
    if (!session.isLoggedIn) return false;
    const nextName = name.trim();
    if (!nextName) return false;
    const nextAvatar = `${avatarUrl || ""}`.trim();
    return nextName !== (session.displayName || "") || nextAvatar !== (session.avatarUrl || "");
  }, [avatarUrl, name, session.avatarUrl, session.displayName, session.isLoggedIn]);

  const onPickAvatar = async (file) => {
    if (!file) return;
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
    if (dataUrl) setAvatarUrl(dataUrl);
  };

  const planLabel = useMemo(() => {
    if (subscription.planId === "year") return "Annual";
    if (subscription.planId === "quarter") return "Quarterly";
    if (subscription.planId === "month") return "Monthly";
    return "Free";
  }, [subscription.planId]);

  const nextBill = useMemo(() => {
    if (!subscription.expiresAt) return "-";
    try {
      return new Date(subscription.expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return "-";
    }
  }, [subscription.expiresAt]);

  const diamondLedger = useMemo(() => {
    const now = Date.now();
    return [
      { id: "t1", type: "spend", title: "Unlock an episode", subtitle: "Shorts · Grammar in 60 Seconds · Ep 6", amount: -5, at: now - 3 * 24 * 60 * 60 * 1000 },
      { id: "t2", type: "spend", title: "Unlock a clip", subtitle: "Discover · Practice feed video", amount: -5, at: now - 2 * 24 * 60 * 60 * 1000 },
      { id: "t3", type: "earn", title: "Subscription bonus", subtitle: "Monthly plan bonus", amount: 50, at: now - 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000 },
      { id: "t4", type: "spend", title: "Image generation", subtitle: "Create · Request image", amount: -5, at: now - 20 * 60 * 60 * 1000 },
    ];
  }, []);

  if (!session.isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="text-base font-semibold text-zinc-900">Account Center</div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
          Please sign in to view your account.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="text-base font-semibold text-zinc-900">Account Center</div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-2 px-2 pt-2">
          {[
            { key: "profile", label: "Profile" },
            { key: "subscription", label: "Subscription" },
          ].map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => setTab(x.key)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                tab === x.key ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
              )}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "profile" ? (
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <img src={avatarUrl || session.avatarUrl} alt="" className="h-24 w-24 rounded-3xl object-cover" />
                <div className="mt-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) onPickAvatar(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">Profile</div>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-zinc-500">Username</div>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-zinc-500">Registered email</div>
                      <div className="flex h-11 w-full items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-800">
                        {session.email || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName(session.displayName || "");
                      setAvatarUrl(session.avatarUrl || "");
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={() => {
                      updateSessionProfile({ displayName: name.trim(), avatarUrl: `${avatarUrl || ""}`.trim() });
                    }}
                    className={cn(
                      "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold",
                      canSave ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-zinc-400",
                    )}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <CreditCard className="h-4 w-4" />
                        Subscription
                      </div>
                      <div className="mt-1 text-sm text-zinc-600">
                        {subscription.status === "active" ? `${planLabel} plan` : "No active subscription"}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        subscription.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : subscription.status === "canceled"
                            ? "bg-zinc-100 text-zinc-700"
                            : "bg-zinc-100 text-zinc-700",
                      )}
                    >
                      {subscription.status === "active" ? "Active" : subscription.status === "canceled" ? "Canceled" : "Free"}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-zinc-600">Next billing date</div>
                      <div className="font-semibold text-zinc-900">{subscription.status === "active" ? nextBill : "-"}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-zinc-600">Auto-renew</div>
                      <div className="font-semibold text-zinc-900">{subscription.status === "active" ? (subscription.renew ? "On" : "Off") : "-"}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {subscription.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Cancel subscription
                      </button>
                    ) : (
                      <div className="text-sm text-zinc-600">Go to Subscription page to start a plan.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Gem className="h-4 w-4" />
                    Diamonds
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-semibold text-zinc-900">{diamonds}</div>
                    <div className="text-sm font-semibold text-zinc-500">balance</div>
                  </div>
                  <div className="mt-4 text-sm text-zinc-600">
                    Diamonds are used for unlocking episodes and premium requests. Your balance updates instantly after each purchase.
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <Receipt className="h-4 w-4" />
                  Diamond usage
                </div>
                <div className="mt-4 divide-y divide-zinc-200">
                  {diamondLedger.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">{t.title}</div>
                        <div className="mt-1 text-sm text-zinc-600">{t.subtitle}</div>
                        <div className="mt-2 text-xs font-semibold text-zinc-500">
                          {new Date(t.at).toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                          t.amount < 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {t.amount < 0 ? "" : "+"}
                        {t.amount} 💎
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">How cancellation works</div>
                <div className="mt-2 space-y-2 text-sm text-zinc-600">
                  <div>1) Tap “Cancel subscription” to stop auto-renewal.</div>
                  <div>2) Your plan stays active until the end of the current billing period.</div>
                  <div>3) You can resubscribe anytime from the Subscription page.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {cancelOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="text-sm font-semibold text-zinc-900">Cancel subscription</div>
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl hover:bg-zinc-100"
              >
                <X className="h-4 w-4 text-zinc-700" />
              </button>
            </div>
            <div className="px-5 py-5 text-sm text-zinc-700">
              Your subscription will remain active until the end of the current billing period. Auto-renew will be turned off.
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Keep subscription
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSubscription();
                  setCancelOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
