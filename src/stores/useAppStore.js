import { create } from "zustand";
import { persist } from "zustand/middleware";
import { characters as seedCharacters } from "../data/mock.js";

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const utcDateKey = () => new Date().toISOString().slice(0, 10);
const makeAccountKey = ({ email = "", provider = "", displayName = "" } = {}) =>
  `${provider || "local"}:${email || displayName || "guest"}`;
const createDiamondWallet = () => ({
  free: 0,
  subscription: 0,
  reward: 0,
  lastFreeGrantUtcDate: null,
  lastShareGrantUtcDate: null,
});
const normalizeDiamondWallet = (wallet) => {
  const next = { ...createDiamondWallet(), ...(wallet || {}) };
  if (next.lastFreeGrantUtcDate !== utcDateKey()) next.free = 0;
  return next;
};
const totalDiamondsOf = (wallet) => {
  const safe = normalizeDiamondWallet(wallet);
  return Math.max(0, safe.free) + Math.max(0, safe.subscription) + Math.max(0, safe.reward);
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
        accountKey: "",
      },
      diamonds: 0,
      diamondBreakdown: { free: 0, subscription: 0, reward: 0 },
      diamondWallets: {},
      diamondRewardNotice: { visible: false, amount: 0, utcDate: null },
      subscription: {
        planId: null,
        status: "none",
        renew: true,
        expiresAt: null,
      },
      createdCharacters: [],
      characterCreations: [],
      conversations: [],
      mediaRequests: { used: 0 },
      unlockedShortEpisodes: {},
      unlockedShortNodes: {},
      shortContinuationJobs: [],
      unlockedFeedVideos: {},
      favoriteShorts: ["s1", "s2"],
      likedShorts: [],
      favoriteLiveHosts: ["l1"],
      favoriteCharacters: ["c2", "c3"],

      getAllCharacters: () => {
        const state = get();
        const accountKey = state.session?.accountKey;
        const created = Array.isArray(state.createdCharacters) ? state.createdCharacters : [];
        const visible = accountKey
          ? created.filter((c) => c?.isPublic || c?.ownerKey === accountKey)
          : created.filter((c) => c?.isPublic);
        return [...seedCharacters, ...visible];
      },

      setLanguage: (language) => set({ language }),

      login: ({ displayName, avatarUrl, email = "", provider = "" }) =>
        set((state) => {
          const accountKey = makeAccountKey({ displayName, email, provider });
          const today = utcDateKey();
          const wallets = { ...(state.diamondWallets || {}) };
          const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
          const alreadyClaimedToday = currentWallet.lastFreeGrantUtcDate === today;
          const nextWallet = alreadyClaimedToday
            ? currentWallet
            : {
                ...currentWallet,
                free: currentWallet.free + 5,
                lastFreeGrantUtcDate: today,
              };
          wallets[accountKey] = nextWallet;
          return {
            session: { isLoggedIn: true, displayName, avatarUrl, email, provider, accountKey },
            diamondWallets: wallets,
            diamondBreakdown: {
              free: nextWallet.free,
              subscription: nextWallet.subscription,
              reward: nextWallet.reward,
            },
            diamonds: totalDiamondsOf(nextWallet),
            diamondRewardNotice: alreadyClaimedToday ? { visible: false, amount: 0, utcDate: today } : { visible: true, amount: 5, utcDate: today },
          };
        }),

      logout: () =>
        set({
          session: { isLoggedIn: false, displayName: "", avatarUrl: "", email: "", provider: "", accountKey: "" },
          subscription: { planId: null, status: "none", renew: true, expiresAt: null },
          diamonds: 0,
          diamondBreakdown: { free: 0, subscription: 0, reward: 0 },
          diamondRewardNotice: { visible: false, amount: 0, utcDate: null },
          mediaRequests: { used: 0 },
        }),

      refreshDiamondState: () =>
        set((state) => {
          const accountKey = state.session?.accountKey;
          if (!accountKey) {
            return {
              diamonds: 0,
              diamondBreakdown: { free: 0, subscription: 0, reward: 0 },
            };
          }
          const wallets = { ...(state.diamondWallets || {}) };
          const nextWallet = normalizeDiamondWallet(wallets[accountKey]);
          wallets[accountKey] = nextWallet;
          return {
            diamondWallets: wallets,
            diamondBreakdown: {
              free: nextWallet.free,
              subscription: nextWallet.subscription,
              reward: nextWallet.reward,
            },
            diamonds: totalDiamondsOf(nextWallet),
          };
        }),

      dismissDiamondRewardNotice: () =>
        set((state) => ({
          diamondRewardNotice: {
            ...state.diamondRewardNotice,
            visible: false,
          },
        })),

      updateSessionProfile: ({ displayName, avatarUrl }) =>
        set((state) => ({
          session: {
            ...state.session,
            displayName: typeof displayName === "string" ? displayName : state.session.displayName,
            avatarUrl: typeof avatarUrl === "string" ? avatarUrl : state.session.avatarUrl,
          },
        })),

      subscribeToPlan: ({ planId, bonusDiamonds = 0, monthlyCredits = 0, totalCredits = 0 } = {}) =>
        set((state) => {
          const now = Date.now();
          const days = planId === "year" ? 365 : planId === "quarter" ? 90 : 30;
          const accountKey = state.session?.accountKey;
          const wallets = { ...(state.diamondWallets || {}) };
          const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
          const nextWallet = accountKey
            ? {
                ...currentWallet,
                subscription: currentWallet.subscription + Math.max(0, bonusDiamonds),
              }
            : currentWallet;
          if (accountKey) wallets[accountKey] = nextWallet;
          return {
            subscription: {
              planId,
              status: "active",
              renew: true,
              expiresAt: now + days * 24 * 60 * 60 * 1000,
              monthlyCredits: Math.max(0, Number(monthlyCredits) || 0),
              totalCredits: Math.max(0, Number(totalCredits) || 0),
              nextCreditAt: planId === "month" ? null : now + 30 * 24 * 60 * 60 * 1000,
              creditedMonths: 1,
            },
            diamondWallets: wallets,
            diamondBreakdown: {
              free: nextWallet.free,
              subscription: nextWallet.subscription,
              reward: nextWallet.reward,
            },
            diamonds: totalDiamondsOf(nextWallet),
          };
        }),

      syncSubscriptionCredits: () =>
        set((state) => {
          const subscription = state.subscription || {};
          const accountKey = state.session?.accountKey;
          const monthlyCredits = Math.max(0, Number(subscription.monthlyCredits) || 0);
          const totalMonths = subscription.planId === "year" ? 12 : subscription.planId === "quarter" ? 3 : 1;
          const creditedMonths = Math.max(1, Number(subscription.creditedMonths) || 1);
          const nextCreditAt = Number(subscription.nextCreditAt) || 0;
          const now = Date.now();
          if (!accountKey || !monthlyCredits || !nextCreditAt || creditedMonths >= totalMonths || now < nextCreditAt) return {};

          const dueMonths = Math.min(
            totalMonths - creditedMonths,
            Math.floor((now - nextCreditAt) / (30 * 24 * 60 * 60 * 1000)) + 1,
          );
          const grant = dueMonths * monthlyCredits;
          const wallets = { ...(state.diamondWallets || {}) };
          const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
          const nextWallet = { ...currentWallet, subscription: currentWallet.subscription + grant };
          wallets[accountKey] = nextWallet;
          const nextCreditedMonths = creditedMonths + dueMonths;

          return {
            subscription: {
              ...subscription,
              creditedMonths: nextCreditedMonths,
              nextCreditAt: nextCreditedMonths >= totalMonths ? null : nextCreditAt + dueMonths * 30 * 24 * 60 * 60 * 1000,
            },
            diamondWallets: wallets,
            diamondBreakdown: {
              free: nextWallet.free,
              subscription: nextWallet.subscription,
              reward: nextWallet.reward,
            },
            diamonds: totalDiamondsOf(nextWallet),
          };
        }),

      addDiamonds: (amount, kind = "reward") =>
        set((state) => {
          const accountKey = state.session?.accountKey;
          if (!accountKey) return {};
          const bucket = kind === "subscription" ? "subscription" : kind === "free" ? "free" : "reward";
          const wallets = { ...(state.diamondWallets || {}) };
          const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
          const nextWallet = {
            ...currentWallet,
            [bucket]: currentWallet[bucket] + Math.max(0, Number(amount) || 0),
          };
          wallets[accountKey] = nextWallet;
          return {
            diamondWallets: wallets,
            diamondBreakdown: {
              free: nextWallet.free,
              subscription: nextWallet.subscription,
              reward: nextWallet.reward,
            },
            diamonds: totalDiamondsOf(nextWallet),
          };
        }),

      grantDailyShareReward: ({ amount = 5 } = {}) => {
        const state = get();
        const accountKey = state.session?.accountKey;
        if (!accountKey) return { granted: false, amount: 0 };
        const rewardAmount = Math.max(0, Number(amount) || 0);
        if (!rewardAmount) return { granted: false, amount: 0 };

        const today = utcDateKey();
        const wallets = { ...(state.diamondWallets || {}) };
        const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
        if (currentWallet.lastShareGrantUtcDate === today) return { granted: false, amount: 0 };

        const nextWallet = {
          ...currentWallet,
          reward: currentWallet.reward + rewardAmount,
          lastShareGrantUtcDate: today,
        };
        wallets[accountKey] = nextWallet;
        set({
          diamondWallets: wallets,
          diamondBreakdown: {
            free: nextWallet.free,
            subscription: nextWallet.subscription,
            reward: nextWallet.reward,
          },
          diamonds: totalDiamondsOf(nextWallet),
        });
        return { granted: true, amount: rewardAmount };
      },

      spendDiamonds: (amount) => {
        const cost = Math.max(0, Number(amount) || 0);
        if (cost <= 0) return true;
        const state = get();
        const accountKey = state.session?.accountKey;
        if (!accountKey) return false;
        const wallets = { ...(state.diamondWallets || {}) };
        const currentWallet = normalizeDiamondWallet(wallets[accountKey]);
        if (totalDiamondsOf(currentWallet) < cost) return false;

        let rest = cost;
        const nextWallet = { ...currentWallet };
        const buckets = ["free", "reward", "subscription"];
        buckets.forEach((bucket) => {
          if (rest <= 0) return;
          const current = Math.max(0, nextWallet[bucket]);
          const spend = Math.min(current, rest);
          nextWallet[bucket] = current - spend;
          rest -= spend;
        });

        wallets[accountKey] = nextWallet;
        set({
          diamondWallets: wallets,
          diamondBreakdown: {
            free: nextWallet.free,
            subscription: nextWallet.subscription,
            reward: nextWallet.reward,
          },
          diamonds: totalDiamondsOf(nextWallet),
        });
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

      unlockShortNode: ({ nodeId, cost }) => {
        const id = `${nodeId || ""}`;
        const price = Math.max(0, Number(cost) || 0);
        if (!id) return { ok: false, reason: "invalid" };
        const accountKey = get().session?.accountKey;
        if (!accountKey) return { ok: false, reason: "account" };
        const current = get().unlockedShortNodes || {};
        const accountUnlocks = current[accountKey] || {};
        if (accountUnlocks[id]) return { ok: true, alreadyUnlocked: true, cost: 0 };
        const ok = price ? get().spendDiamonds(price) : true;
        if (!ok) return { ok: false, reason: "diamonds", cost: price };
        set({
          unlockedShortNodes: {
            ...current,
            [accountKey]: { ...accountUnlocks, [id]: true },
          },
        });
        return { ok: true, alreadyUnlocked: false, cost: price };
      },

      createShortContinuation: ({ dramaId, parentNodeId, episode, prompt, isPublic = true, cost = 2700, kind = "continue" }) => {
        const cleanPrompt = `${prompt || ""}`.trim();
        if (!dramaId || !parentNodeId || !cleanPrompt) return { ok: false, reason: "invalid" };
        const ownerKey = get().session?.accountKey;
        if (!ownerKey) return { ok: false, reason: "account" };
        const price = Math.max(0, Number(cost) || 0);
        if (price && !get().spendDiamonds(price)) return { ok: false, reason: "diamonds", cost: price };
        const now = Date.now();
        const job = {
          id: `generated-${generateId()}`,
          ownerKey,
          dramaId,
          parentNodeId,
          episode: Math.max(2, Number(episode) || 2),
          prompt: cleanPrompt,
          isPublic: Boolean(isPublic),
          kind: kind === "rewrite" ? "rewrite" : "continue",
          createdAt: now,
          readyAt: now + 10 * 1000,
        };
        set((state) => ({ shortContinuationJobs: [job, ...(state.shortContinuationJobs || [])] }));
        return { ok: true, job, cost: price };
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

      toggleLikeShort: (dramaId) =>
        set((state) => {
          const id = `${dramaId || ""}`;
          if (!id) return {};
          const current = Array.isArray(state.likedShorts) ? state.likedShorts : [];
          const exists = current.includes(id);
          return { likedShorts: exists ? current.filter((x) => x !== id) : [id, ...current] };
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

      startCharacterCreation: ({ initialGender = "" } = {}) => {
        const state = get();
        const accountKey = state.session?.accountKey;
        if (!accountKey) return { ok: false, reason: "login" };
        const currentList = Array.isArray(state.characterCreations) ? state.characterCreations : [];
        const existingDraft = currentList
          .filter((r) => r?.ownerKey === accountKey && !r?.characterId)
          .slice()
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
        if (existingDraft?.id) return { ok: true, id: existingDraft.id, reused: true };
        const id = `cr_${generateId()}`;
        const now = Date.now();
        const record = {
          id,
          ownerKey: accountKey,
          status: initialGender ? "appearance" : "gender",
          createdAt: now,
          updatedAt: now,
          appearance: {
            gender: initialGender,
            race: "",
            bodyChoice: "",
            bodyCustom: "",
            eyeChoice: "",
            eyeCustom: "",
            hairStyleChoice: "",
            hairStyleCustom: "",
            hairColorChoice: "",
            hairColorCustom: "",
            name: "",
            country: "",
            age: "",
            personality: [],
          },
          portraitUrl: "",
          characterIdea: "",
          texts: { relation: "", scenario: "", firstMessage: "", example: "" },
          isPublic: false,
          characterId: "",
        };
        set((s) => ({
          characterCreations: [record, ...(Array.isArray(s.characterCreations) ? s.characterCreations : [])],
        }));
        return { ok: true, id };
      },

      updateCharacterCreation: (creationId, patch = {}) =>
        set((state) => {
          const list = Array.isArray(state.characterCreations) ? state.characterCreations : [];
          const next = list.map((r) => {
            if (r.id !== creationId) return r;
            return { ...r, ...patch, updatedAt: Date.now() };
          });
          return { characterCreations: next };
        }),

      completeCharacterCreation: ({ creationId, isPublic = false } = {}) => {
        const state = get();
        const accountKey = state.session?.accountKey;
        if (!accountKey) return { ok: false, reason: "login" };

        const list = Array.isArray(state.characterCreations) ? state.characterCreations : [];
        const record = list.find((r) => r.id === creationId);
        if (!record) return { ok: false, reason: "invalid" };

        const myCreated = (Array.isArray(state.createdCharacters) ? state.createdCharacters : []).filter((c) => c?.ownerKey === accountKey);
        const needPay = myCreated.length >= 1;
        if (needPay) {
          const ok = state.spendDiamonds(5);
          if (!ok) return { ok: false, reason: "diamonds" };
        }

        const appearance = record.appearance || {};
        const name = `${appearance.name || "Character"}`.trim() || "Character";
        const personality = Array.isArray(appearance.personality) ? appearance.personality : [];
        const bioParts = [`${record.texts?.relation || ""}`.trim(), `${record.texts?.scenario || ""}`.trim()].filter(Boolean);
        const bio = bioParts.length ? bioParts.join(" · ").slice(0, 160) : "A new character created by you.";
        const starter = `${record.texts?.firstMessage || "Hi—want to chat?"}`.trim() || "Hi—want to chat?";
        const characterId = `u_${generateId()}`;
        const character = {
          id: characterId,
          name,
          age: 25,
          bio,
          starter,
          avatarUrl: record.portraitUrl,
          heroUrl: record.portraitUrl,
          tags: personality.slice(0, 3),
          stats: { heat: 0, online: true },
          ownerKey: accountKey,
          isPublic: Boolean(isPublic),
          profile: { ...appearance },
        };

        set((s) => {
          const nextCreations = (Array.isArray(s.characterCreations) ? s.characterCreations : []).map((r) => {
            if (r.id !== creationId) return r;
            return { ...r, status: "completed", isPublic: Boolean(isPublic), characterId, updatedAt: Date.now() };
          });
          const nextCreated = [character, ...(Array.isArray(s.createdCharacters) ? s.createdCharacters : []).filter((c) => c.id !== character.id)];
          return { characterCreations: nextCreations, createdCharacters: nextCreated };
        });

        return { ok: true, characterId, charged: needPay, cost: needPay ? 5 : 0 };
      },

      deleteCharacterCreation: (creationId) =>
        set((state) => {
          const id = `${creationId || ""}`;
          if (!id) return {};
          const list = Array.isArray(state.characterCreations) ? state.characterCreations : [];
          const record = list.find((r) => r.id === id);
          if (!record) return {};
          const characterId = `${record.characterId || ""}`;
          return {
            characterCreations: list.filter((r) => r.id !== id),
            createdCharacters: characterId
              ? (Array.isArray(state.createdCharacters) ? state.createdCharacters : []).filter((c) => c?.id !== characterId)
              : state.createdCharacters,
            conversations: characterId
              ? (Array.isArray(state.conversations) ? state.conversations : []).filter((c) => c?.characterId !== characterId)
              : state.conversations,
            favoriteCharacters: characterId
              ? (Array.isArray(state.favoriteCharacters) ? state.favoriteCharacters : []).filter((cid) => cid !== characterId)
              : state.favoriteCharacters,
          };
        }),

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

      deleteConversation: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== conversationId),
        })),

      consumeMediaRequest: ({ freeLimit = 3, cost = 5 } = {}) => {
        const state = get();
        const current = state.mediaRequests || { used: 0 };
        const used = Math.max(0, Number(current.used) || 0);
        const limit = Math.max(0, Number(freeLimit) || 0);
        const freeLeft = Math.max(0, limit - used);
        const charge = Math.max(0, Number(cost) || 0);
        const isFree = freeLeft > 0;

        if (!isFree && charge) {
          const ok = state.spendDiamonds(charge);
          if (!ok) return { ok: false, reason: "diamonds", charged: false, cost: charge, freeLeft: 0 };
        }

        const nextUsed = used + 1;
        set({ mediaRequests: { ...current, used: nextUsed } });
        return { ok: true, charged: !isFree, cost: !isFree ? charge : 0, freeLeft: Math.max(0, limit - nextUsed) };
      },

      getMediaRequestSummary: ({ freeLimit = 3 } = {}) => {
        const current = get().mediaRequests || { used: 0 };
        const used = Math.max(0, Number(current.used) || 0);
        const limit = Math.max(0, Number(freeLimit) || 0);
        const freeLeft = Math.max(0, limit - used);
        return { used, freeLeft };
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
        diamondBreakdown: state.diamondBreakdown,
        diamondWallets: state.diamondWallets,
        diamondRewardNotice: state.diamondRewardNotice,
        createdCharacters: state.createdCharacters,
        characterCreations: state.characterCreations,
        conversations: state.conversations,
        mediaRequests: state.mediaRequests,
        unlockedShortEpisodes: state.unlockedShortEpisodes,
        unlockedShortNodes: state.unlockedShortNodes,
        shortContinuationJobs: state.shortContinuationJobs,
        unlockedFeedVideos: state.unlockedFeedVideos,
        favoriteShorts: state.favoriteShorts,
        likedShorts: state.likedShorts,
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
