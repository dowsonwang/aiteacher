import { Outlet } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import LanguageModal from "../components/LanguageModal.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { cn } from "../lib/utils.js";
import { useUIStore } from "../stores/useUIStore.js";

export default function AppShell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const expandedSidebarWidth = 224;
  const mainHorizontalPadding = 48;
  const collapsedMaxWidth = `calc(100vw - ${expandedSidebarWidth + mainHorizontalPadding}px)`;

  return (
    <div className="h-dvh w-full bg-zinc-50">
      <div className="mx-auto flex h-full w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-auto px-6 py-6">
            <div
              className={cn("w-full", sidebarCollapsed ? "mx-auto" : "")}
              style={sidebarCollapsed ? { maxWidth: collapsedMaxWidth } : undefined}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AuthModal />
      <LanguageModal />
    </div>
  );
}
