import { useMemo, useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore.js";
import { cn } from "../lib/utils.js";
import { CreditCard, Gem } from "lucide-react";

export default function Account() {
  const session = useAppStore((s) => s.session);
  const updateSessionProfile = useAppStore((s) => s.updateSessionProfile);
  const subscription = useAppStore((s) => s.subscription);
  const diamonds = useAppStore((s) => s.diamonds);

  const [name, setName] = useState(session.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl || "");
  const fileRef = useRef(null);
  const [tab, setTab] = useState("profile");

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

                  {subscription.status !== "active" ? (
                    <div className="mt-5 text-sm text-zinc-600">Go to Subscription page to start a plan.</div>
                  ) : null}
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
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
