import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImmersiveCharacterCard from "../components/ImmersiveCharacterCard.jsx";
import ShortCard from "../components/ShortCard.jsx";
import { shortDramas } from "../data/mock.js";
import { cn } from "../lib/utils.js";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const tabs = [
  { key: "shorts", label: "Shorts" },
  { key: "characters", label: "Characters" },
  { key: "created", label: "Created" },
];

export default function Favorites() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const getAllCharacters = useAppStore((s) => s.getAllCharacters);
  const createdCharacters = useAppStore((s) => s.createdCharacters);
  const openConversationForCharacter = useAppStore((s) => s.openConversationForCharacter);
  const favoriteShorts = useAppStore((s) => s.favoriteShorts);
  const favoriteCharacters = useAppStore((s) => s.favoriteCharacters);
  const openAuth = useUIStore((s) => s.openAuth);
  const [tab, setTab] = useState("shorts");
  const askedAuthRef = useRef(false);

  useEffect(() => {
    if (session.isLoggedIn) return;
    if (askedAuthRef.current) return;
    askedAuthRef.current = true;
    openAuth({ mode: "login", postAuthPath: "/favorites" });
  }, [openAuth, session.isLoggedIn]);

  const onStartChat = (characterId) => {
    const conversationId = openConversationForCharacter(characterId);
    if (!session.isLoggedIn) {
      openAuth({ mode: "login", postAuthPath: `/chat/${conversationId}` });
      return;
    }
    navigate(`/chat/${conversationId}`);
  };

  const shortItems = useMemo(() => {
    const picked = Array.isArray(favoriteShorts) ? favoriteShorts : [];
    const map = new Map(shortDramas.map((d) => [d.id, d]));
    return picked.map((id) => map.get(id)).filter(Boolean);
  }, [favoriteShorts]);

  const characterItems = useMemo(() => {
    const picked = Array.isArray(favoriteCharacters) ? favoriteCharacters : [];
    const all = getAllCharacters();
    const map = new Map(all.map((c) => [c.id, c]));
    return picked.map((id) => map.get(id)).filter(Boolean);
  }, [favoriteCharacters, getAllCharacters]);

  if (!session.isLoggedIn) {
    const assetVersion = useMemo(() => Date.now().toString(), []);
    const gateImgSrc = `/images/home/login.png?v=${assetVersion}`;
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden px-6 py-6">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="relative h-52 overflow-hidden bg-zinc-100">
              <img
                src={gateImgSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth({ mode: "login", postAuthPath: "/favorites" })}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/browse")}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden px-6 py-6">
      <div className="shrink-0">
        <div className="text-2xl font-semibold text-zinc-900">Favorites</div>
        <div className="mt-1 text-sm text-zinc-500">Your saved tutors and lesson series.</div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                tab === t.key ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-auto">
        {tab === "shorts" ? (
          shortItems.length ? (
            <div className="flex flex-wrap gap-3">
              {shortItems.map((d) => (
                <ShortCard key={d.id} drama={d} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white text-sm font-semibold text-zinc-500">
              No saved shorts yet.
            </div>
          )
        ) : null}

        {tab === "characters" ? (
          characterItems.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {characterItems.map((c) => (
                <ImmersiveCharacterCard key={c.id} character={c} onStartChat={onStartChat} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white text-sm font-semibold text-zinc-500">
              No saved characters yet.
            </div>
          )
        ) : null}

        {tab === "created" ? (
          createdCharacters.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {createdCharacters.map((c) => (
                <ImmersiveCharacterCard key={c.id} character={c} onStartChat={onStartChat} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white text-sm font-semibold text-zinc-500">
              You haven’t created any characters yet.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
