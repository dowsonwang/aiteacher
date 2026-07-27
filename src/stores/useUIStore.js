import { create } from "zustand";

export const useUIStore = create((set) => ({
  authOpen: false,
  authMode: "login",
  postAuthPath: null,
  languageOpen: false,
  shareOpen: false,
  shareUrl: "",
  shareTitle: "",
  diamondUpsellOpen: false,
  diamondUpsellContext: null,
  sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "1",

  openAuth: ({ mode = "login", postAuthPath = null } = {}) =>
    set({ authOpen: true, authMode: mode, postAuthPath }),

  closeAuth: () => set({ authOpen: false }),

  setAuthMode: (authMode) => set({ authMode }),

  openLanguage: () => set({ languageOpen: true }),

  closeLanguage: () => set({ languageOpen: false }),

  openShare: ({ url = "", title = "" } = {}) => set({ shareOpen: true, shareUrl: url, shareTitle: title }),

  closeShare: () => set({ shareOpen: false }),

  openDiamondUpsell: (diamondUpsellContext = null) => set({ diamondUpsellOpen: true, diamondUpsellContext }),

  closeDiamondUpsell: () => set({ diamondUpsellOpen: false, diamondUpsellContext: null }),

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
