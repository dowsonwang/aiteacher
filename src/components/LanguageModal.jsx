import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import { cn } from "../lib/utils.js";
import { languageOptions } from "../i18n/i18n.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function LanguageModal() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const open = useUIStore((s) => s.languageOpen);
  const close = useUIStore((s) => s.closeLanguage);

  const title = useMemo(() => "Select language", []);
  const [pending, setPending] = useState(language);

  useEffect(() => {
    if (!open) return;
    setPending(language);
  }, [open, language]);

  return (
    <Modal open={open} onClose={close} title={title} className="max-w-2xl">
      <div className="space-y-4">
        <div className="max-h-[360px] overflow-auto pr-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {languageOptions.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setPending(opt.code)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                  pending === opt.code
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                )}
              >
                <span className="text-lg">{opt.flag}</span>
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage(pending);
              close();
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
