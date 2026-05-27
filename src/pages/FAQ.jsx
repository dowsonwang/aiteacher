import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function FAQ() {
  const items = useMemo(
    () => [
      {
        q: "What is AI Language Coach?",
        a: "AI Language Coach is an AI-assisted English learning app. It helps you practice speaking and writing, gives instant corrections, explains grammar in plain English, and provides short drills to build fluency.",
      },
      {
        q: "How do I practice effectively in chat?",
        a: "Send one sentence (or a short paragraph). You’ll get a corrected version, a natural alternative, and one quick follow-up question to practice. Repeat with new examples to build habit and accuracy.",
      },
      {
        q: "Can I practice pronunciation here?",
        a: "Yes. Try shadowing a sentence, then ask for stress and intonation guidance. You can also request minimal pairs and drills for tricky sounds.",
      },
      {
        q: "What English levels does this support?",
        a: "It supports beginners to advanced learners. Start by telling your goal and level, and the tutor will adapt the difficulty, speed, and amount of explanation.",
      },
      {
        q: "What happens to my chat messages?",
        a: "Your messages are used to deliver the service (corrections, coaching, and practice). Please avoid sharing sensitive personal information. See the Privacy Policy for details.",
      },
      {
        q: "Does subscription change how learning works?",
        a: "Subscription can unlock more usage and premium benefits. Pricing and plan details are shown in the Subscription page inside the app.",
      },
    ],
    [],
  );

  const [open, setOpen] = useState(() => new Set([0]));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="text-base font-semibold text-zinc-900">FAQ</div>
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {items.map((item, idx) => {
          const isOpen = open.has(idx);
          return (
            <button
              key={item.q}
              type="button"
              onClick={() => {
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(idx)) next.delete(idx);
                  else next.add(idx);
                  return next;
                });
              }}
              className={cn("w-full text-left", idx === 0 ? "" : "border-t border-zinc-200")}
            >
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="text-sm font-semibold text-zinc-900">{item.q}</div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-zinc-500">{isOpen ? "Hide" : "View"}</div>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition", isOpen ? "rotate-180" : "")} />
                </div>
              </div>
              {isOpen ? <div className="px-6 pb-5 text-sm leading-relaxed text-zinc-700">{item.a}</div> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
