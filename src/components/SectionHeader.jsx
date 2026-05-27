import { useNavigate } from "react-router-dom";

export default function SectionHeader({ title, href, actionLabel = "View all →" }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-base font-semibold text-zinc-900">{title}</div>
      {href ? (
        <button
          type="button"
          onClick={() => navigate(href)}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
