import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function AgeGateModal({ open, mode = "signup", onConfirm, onCancel }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  const isBlocking = mode === "existing";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-zinc-500" />
          <div className="text-base font-semibold text-zinc-900">Age confirmation</div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {isBlocking ? (
            <p className="text-sm text-zinc-600">
              Before you continue, please confirm your age. This is required to keep using your account.
            </p>
          ) : null}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900"
            />
            <span className="text-sm leading-relaxed text-zinc-700">
              I confirm that I am at least 18 years old and agree to the{" "}
              <Link to="/terms" target="_blank" className="font-semibold text-zinc-900 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="font-semibold text-zinc-900 underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              {isBlocking ? "Sign out" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!checked}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
