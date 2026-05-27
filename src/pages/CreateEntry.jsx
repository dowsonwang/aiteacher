import { Outlet } from "react-router-dom";

export default function CreateEntry() {
  return (
    <div className="-mx-6 -my-6 flex h-full min-h-0 w-full justify-center overflow-hidden p-3">
      <div className="flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
