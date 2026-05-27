import { create } from "zustand";

export const useUIStore = create((set) => ({
  authOpen: false,
  authMode: "login",
  postAuthPath: null,
  languageOpen: false,
  sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "1",

  openAuth: ({ mode = "login", postAuthPath = null } = {}) =>
    set({ authOpen: true, authMode: mode, postAuthPath }),

  closeAuth: () => set({ authOpen: false }),

  setAuthMode: (authMode) => set({ authMode }),

  openLanguage: () => set({ languageOpen: true }),

  closeLanguage: () => set({ languageOpen: false }),

  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return { sidebarCollapsed: next };
    }),

  consumePostAuthPath: () => {
    let next = null;
    set((s) => {
      next = s.postAuthPath;
      return { postAuthPath: null };
    });
    return next;
  },
}));
