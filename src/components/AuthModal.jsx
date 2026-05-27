import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chrome, Mail, ShieldCheck, X } from "lucide-react";
import Modal from "./Modal.jsx";
import { useAppStore } from "../stores/useAppStore.js";
import { useUIStore } from "../stores/useUIStore.js";

const avatarFromName = (name) =>
  `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `Minimal studio portrait avatar, calm lighting, neutral background, realistic, high quality, no text, person name: ${name || "User"}`,
  )}&image_size=square`;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function AuthModal() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const authOpen = useUIStore((s) => s.authOpen);
  const authMode = useUIStore((s) => s.authMode);
  const setAuthMode = useUIStore((s) => s.setAuthMode);
  const closeAuth = useUIStore((s) => s.closeAuth);
  const consumePostAuthPath = useUIStore((s) => s.consumePostAuthPath);

  const [assetVersion, setAssetVersion] = useState(() => Date.now().toString());
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const primaryBg = `/images/home/login.png?v=${assetVersion}`;
  const fallbackBg = `/images/home/banner3.png?v=${assetVersion}`;
  const [bgSrc, setBgSrc] = useState(primaryBg);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!authOpen) return;
    const nextVersion = Date.now().toString();
    setAssetVersion(nextVersion);
    setEmail("");
    setCode("");
    setCodeSent(false);
    setSendingCode(false);
    setLoading(false);
    setToast(null);
    setBgSrc(`/images/home/login.png?v=${nextVersion}`);
  }, [authOpen, authMode]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const title = useMemo(
    () => (authMode === "login" ? "Login" : "Sign up"),
    [authMode],
  );

  const doLogin = async ({ displayName, email, provider }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    login({
      displayName,
      avatarUrl: avatarFromName(displayName),
      email,
      provider,
    });
    setLoading(false);
    closeAuth();
    const next = consumePostAuthPath();
    if (next) navigate(next, { replace: true });
  };

  const sendCode = async () => {
    if (!isValidEmail(email.trim())) {
      showToast("error", "Please enter a valid email address.");
      return;
    }
    setSendingCode(true);
    await new Promise((r) => setTimeout(r, 650));
    setSendingCode(false);
    setCodeSent(true);
    showToast("success", "Verification code sent.");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email.trim())) {
      showToast("error", "Please enter a valid email address.");
      return;
    }
    if (!codeSent) {
      showToast("error", "Please request the verification code first.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      showToast("error", "Invalid code. Please try again.");
      return;
    }
    const displayName = email.includes("@") ? email.split("@")[0] : "User";
    await doLogin({ displayName, email: email.trim(), provider: "email" });
  };

  const switchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title={title} className="max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl">
        {toast ? (
          <div className="pointer-events-none fixed left-1/2 top-6 z-[60] -translate-x-1/2">
            <div
              className={
                toast.type === "success"
                  ? "rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl"
                  : "rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-xl"
              }
            >
              {toast.message}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden p-6 pr-3 md:block">
            <div className="relative min-h-[520px] overflow-hidden rounded-3xl">
              <img
                src={bgSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => {
                  setBgSrc((current) => (current === fallbackBg ? current : fallbackBg));
                }}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>

          <div className="relative p-6 md:pl-3">
            <div className="rounded-3xl border border-white/30 bg-white/55 p-5 shadow-xl backdrop-blur-xl">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-800">Email</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:border-zinc-400"
                      placeholder="name@email.com"
                      inputMode="email"
                      autoComplete="email"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={sendingCode}
                    className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingCode ? "Sending…" : "Send code"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-800">Verification code</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder={codeSent ? "Enter the 6-digit code" : "Request code first"}
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Working…" : authMode === "login" ? "Login" : "Create account"}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-200" />
                <div className="relative mx-auto w-fit bg-white/60 px-3 text-xs font-semibold text-zinc-600">
                  Quick login
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => doLogin({ displayName: "Google user", email: "google.user@example.com", provider: "google" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => doLogin({ displayName: "Discord user", email: "discord.user@example.com", provider: "discord" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  <span className="text-base">🎮</span>
                  Continue with Discord
                </button>
                <button
                  type="button"
                  onClick={() => doLogin({ displayName: "X user", email: "x.user@example.com", provider: "x" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  <X className="h-4 w-4" />
                  Continue with X
                </button>
              </div>

              <div className="pt-2 text-center text-sm text-zinc-600">
                {authMode === "login" ? (
                  <span>
                    Don’t have an account?{" "}
                    <button type="button" onClick={switchMode} className="font-semibold text-zinc-900 hover:underline">
                      Sign up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button type="button" onClick={switchMode} className="font-semibold text-zinc-900 hover:underline">
                      Login
                    </button>
                  </span>
                )}
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
