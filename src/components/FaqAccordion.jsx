import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-zinc-200 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : idx)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-zinc-900">{item.q}</span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition", open ? "rotate-180" : "")} />
            </button>
            {open ? (
              <div className="px-5 pb-4 text-sm leading-relaxed text-zinc-600">{item.a}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

