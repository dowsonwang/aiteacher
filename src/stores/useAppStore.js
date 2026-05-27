import { create } from "zustand";
import { persist } from "zustand/middleware";
import { characters as seedCharacters } from "../data/mock.js";

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const localDateKey = () => {
  const d = new Date();
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ensureConversation = (state, characterId, allCharacters) => {
  const existing = state.conversations.find((c) => c.characterId === characterId);
  if (existing) return existing.id;

  const id = generateId();
  const character = allCharacters.find((c) => c.id === characterId);
  const starter = character?.starter
    ? [{ id: generateId(), role: "assistant", text: character.starter, createdAt: Date.now() }]
    : [];
  const conv = {
    id,
    characterId,
    updatedAt: Date.now(),
    messages: starter,
  };
  return { id, conv };
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      language: "en-US",
      session: {
        isLoggedIn: false,
        displayName: "",
        avatarUrl: "",
        email: "",
        provider: "",
      },
      diamonds: 0,
      subscription: {
        planId: null,
        status: "none",
        renew: true,
        expiresAt: null,
      },
      createdCharacters: [],
      conversations: [],
      mediaRequests: { dateKey: null, used: 0 },
      unlockedShortEpisodes: {},
      unlockedFeedVideos: {},
      favoriteShorts: ["s1", "s2"],
      favoriteLiveHosts: ["l1"],
      favoriteCharacters: ["c2", "c3"],

      getAllCharacters: () => [...seedCharacters, ...get().createdCharacters],

      setLanguage: (language) => set({ language }),

      login: ({ displayName, avatarUrl, email = "", provider = "" }) =>
        set({
          session: { isLoggedIn: true, displayName, avatarUrl, email, provider },
        }),

      logout: () =>
        set({
          session: { isLoggedIn: false, displayName: "", avatarUrl: "", email: "", provider: "" },
          subscription: { planId: null, status: "none", renew: true, expiresAt: null },
          diamonds: 0,
          mediaRequests: { dateKey: null, used: 0 },
        }),

      updateSessionProfile: ({ displayName, avatarUrl }) =>
        set((state) => ({
          session: {
            ...state.session,
            displayName: typeof displayName === "string" ? displayName : state.session.displayName,
            avatarUrl: typeof avatarUrl === "string" ? avatarUrl : state.session.avatarUrl,
          },
        })),

      subscribeToPlan: ({ planId, bonusDiamonds = 0 } = {}) =>
        set((state) => {
          const now = Date.now();
          const days = planId === "year" ? 365 : planId === "quarter" ? 90 : 30;
          return {
            subscription: {
              planId,
              status: "active",
              renew: true,
              expiresAt: now + days * 24 * 60 * 60 * 1000,
            },
            diamonds: state.diamonds + Math.max(0, bonusDiamonds),
          };
        }),

      addDiamonds: (amount) =>
        set((state) => ({
          diamonds: Math.max(0, state.diamonds + Math.max(0, Number(amount) || 0)),
        })),

      spendDiamonds: (amount) => {
        const cost = Math.max(0, Number(amount) || 0);
        const current = get().diamonds;
        if (cost <= 0) return true;
        if (current < cost) return false;
        set({ diamonds: current - cost });
        return true;
      },

      unlockShortEpisode: ({ dramaId, episode, cost }) => {
        const id = `${dramaId || ""}`;
        const ep = Number(episode);
        const price = Math.max(0, Number(cost) || 0);
        if (!id || !Number.isFinite(ep) || ep <= 0) return { ok: false, reason: "invalid" };

        const current = get().unlockedShortEpisodes || {};
        const existing = current[id] || {};
        if (existing[ep]) return { ok: true, alreadyUnlocked: true, cost: 0 };

        const ok = price ? get().spendDiamonds(price) : true;
        if (!ok) return { ok: false, reason: "diamonds", cost: price };

        set({
          unlockedShortEpisodes: {
            ...current,
            [id]: { ...existing, [ep]: true },
          },
        });
        return { ok: true, alreadyUnlocked: false, cost: price };
      },

      unlockFeedVideo: ({ feedId, cost }) => {
        const id = `${feedId || ""}`;
        const price = Math.max(0, Number(cost) || 0);
        if (!id) return { ok: false, reason: "invalid" };

        const current = get().unlockedFeedVideos || {};
        if (current[id]) return { ok: true, alreadyUnlocked: true, cost: 0 };

        const ok = price ? get().spendDiamonds(price) : true;
        if (!ok) return { ok: false, reason: "diamonds", cost: price };

        set({ unlockedFeedVideos: { ...current, [id]: true } });
        return { ok: true, alreadyUnlocked: false, cost: price };
      },

      toggleFavoriteShort: (dramaId) =>
        set((state) => {
          const id = `${dramaId || ""}`;
          if (!id) return {};
          const current = Array.isArray(state.favoriteShorts) ? state.favoriteShorts : [];
          const exists = current.includes(id);
          return { favoriteShorts: exists ? current.filter((x) => x !== id) : [id, ...current] };
        }),

      toggleFavoriteLiveHost: (hostId) =>
        set((state) => {
          const id = `${hostId || ""}`;
          if (!id) return {};
          const current = Array.isArray(state.favoriteLiveHosts) ? state.favoriteLiveHosts : [];
          const exists = current.includes(id);
          return { favoriteLiveHosts: exists ? current.filter((x) => x !== id) : [id, ...current] };
        }),

      toggleFavoriteCharacter: (characterId) =>
        set((state) => {
          const id = `${characterId || ""}`;
          if (!id) return {};
          const current = Array.isArray(state.favoriteCharacters) ? state.favoriteCharacters : [];
          const exists = current.includes(id);
          return { favoriteCharacters: exists ? current.filter((x) => x !== id) : [id, ...current] };
        }),

      cancelSubscription: () =>
        set((state) => ({
          subscription: { ...state.subscription, status: "canceled", renew: false },
        })),

      toggleRenew: () =>
        set((state) => ({
          subscription: { ...state.subscription, renew: !state.subscription.renew },
        })),

      upsertCharacter: (character) =>
        set((state) => ({
          createdCharacters: [character, ...state.createdCharacters.filter((c) => c.id !== character.id)],
        })),

      openConversationForCharacter: (characterId) => {
        const state = get();
        const allCharacters = state.getAllCharacters();
        const result = ensureConversation(state, characterId, allCharacters);
        if (typeof result === "string") return result;
        set((s) => ({
          conversations: [result.conv, ...s.conversations],
        }));
        return result.id;
      },

      consumeMediaRequest: ({ freeLimit = 3, cost = 5 } = {}) => {
        const key = localDateKey();
        const state = get();
        const current = state.mediaRequests || { dateKey: null, used: 0 };
        const normalized = current.dateKey === key ? current : { dateKey: key, used: 0 };
        const isFree = normalized.used < Math.max(0, Number(freeLimit) || 0);
        const charge = Math.max(0, Number(cost) || 0);

        if (!isFree && charge) {
          const ok = state.spendDiamonds(charge);
          if (!ok) return { ok: false, reason: "diamonds", charged: false, cost: charge };
        }

        const nextUsed = normalized.used + 1;
        set({ mediaRequests: { dateKey: key, used: nextUsed } });
        const freeLeft = Math.max(0, Math.max(0, Number(freeLimit) || 0) - nextUsed);
        return { ok: true, charged: !isFree, cost: !isFree ? charge : 0, freeLeft };
      },

      getMediaRequestSummary: ({ freeLimit = 3 } = {}) => {
        const key = localDateKey();
        const current = get().mediaRequests || { dateKey: null, used: 0 };
        const normalized = current.dateKey === key ? current : { dateKey: key, used: 0 };
        const freeLeft = Math.max(0, Math.max(0, Number(freeLimit) || 0) - normalized.used);
        return { dateKey: key, used: normalized.used, freeLeft };
      },

      sendMessage: ({ conversationId, text = "", attachments = [] }) => {
        const state = get();
        const now = Date.now();
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (!conv) return;

        const next = {
          ...conv,
          updatedAt: now,
          messages: [
            ...conv.messages,
            { id: generateId(), role: "user", text, attachments, createdAt: now },
          ],
        };

        set((s) => ({
          conversations: [next, ...s.conversations.filter((c) => c.id !== conversationId)],
        }));
      },

      replyAsAssistant: ({ conversationId, text = "", attachments = [] }) => {
        const state = get();
        const now = Date.now();
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (!conv) return;
        const next = {
          ...conv,
          updatedAt: now,
          messages: [
            ...conv.messages,
            { id: generateId(), role: "assistant", text, attachments, createdAt: now },
          ],
        };
        set((s) => ({
          conversations: [next, ...s.conversations.filter((c) => c.id !== conversationId)],
        }));
      },
    }),
    {
      name: "ai-dialog-home",
      partialize: (state) => ({
        language: state.language,
        session: state.session,
        subscription: state.subscription,
        diamonds: state.diamonds,
        createdCharacters: state.createdCharacters,
        conversations: state.conversations,
        mediaRequests: state.mediaRequests,
        unlockedShortEpisodes: state.unlockedShortEpisodes,
        unlockedFeedVideos: state.unlockedFeedVideos,
        favoriteShorts: state.favoriteShorts,
        favoriteLiveHosts: state.favoriteLiveHosts,
        favoriteCharacters: state.favoriteCharacters,
      }),
    },
  ),
);

export const formatDateTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
