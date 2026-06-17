"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/Logo";
import { loginWithEmail, loginWithGoogle, registerWithEmail } from "@/lib/firebase";
import { setSession } from "@/lib/auth";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  // Shared
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────
  function saveAndRedirect(user: { uid: string; email: string | null; displayName: string | null }) {
    setSession({
      uid: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? user.email ?? "مستخدم",
    });
    router.push("/dashboard");
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { user, error: err } = await loginWithEmail(loginEmail, loginPassword);
    if (err || !user) {
      setError(err ?? "فشل تسجيل الدخول");
      setLoading(false);
      return;
    }
    saveAndRedirect(user);
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (regPassword !== regConfirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (regPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    const { user, error: err } = await registerWithEmail(regEmail, regPassword, regName);
    if (err || !user) {
      setError(err ?? "فشل إنشاء الحساب");
      setLoading(false);
      return;
    }
    saveAndRedirect(user);
  };

  // ── Google ─────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { user, error: err } = await loginWithGoogle();
    if (err || !user) {
      setError(err ?? "فشل تسجيل الدخول بجوجل");
      setGoogleLoading(false);
      return;
    }
    saveAndRedirect(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <LogoIcon size={76} className="mb-4 drop-shadow-[0_8px_32px_rgba(109,92,240,0.45)]" />
          <h1 className="text-3xl font-900 logo-gradient">Print Pro</h1>
          <p className="text-slate-500 text-sm mt-1">منصة الطباعة الذكية</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div
            className="flex rounded-xl mb-7 p-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <button
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-600 transition-all duration-200 flex items-center justify-center gap-2"
              style={
                tab === "login"
                  ? { background: "linear-gradient(135deg,#6D5CF0,#9B87F5)", color: "#fff", boxShadow: "0 4px 12px rgba(109,92,240,0.4)" }
                  : { color: "#94a3b8" }
              }
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-600 transition-all duration-200 flex items-center justify-center gap-2"
              style={
                tab === "register"
                  ? { background: "linear-gradient(135deg,#6D5CF0,#9B87F5)", color: "#fff", boxShadow: "0 4px 12px rgba(109,92,240,0.4)" }
                  : { color: "#94a3b8" }
              }
            >
              <UserPlus className="w-4 h-4" />
              إنشاء حساب
            </button>
          </div>

          {/* ── Google Button ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-5 text-sm font-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
            }}
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              /* Google SVG icon */
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-5.8C34.4 3.5 29.6 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.3 13.8 17.6 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.2 5.2-4.6 6.8l7.1 5.5c4.2-3.9 6.6-9.5 6.6-16.3z"/>
                <path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5L3.3 14C1.2 17.7 0 22 0 24s1.2 6.3 3.3 10l7.4-5.5z"/>
                <path fill="#34A853" d="M24 47c5.6 0 10.4-1.9 13.9-5l-7.1-5.5c-1.9 1.3-4.3 2-6.8 2-6.4 0-11.7-4.3-13.6-10l-7 5.4C7 41.3 14.8 47 24 47z"/>
              </svg>
            )}
            {googleLoading ? "جاري الدخول..." : "المتابعة مع Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs text-slate-500">أو</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-glass"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-glass pl-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </div>
              )}

              <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading}>
                <LogIn className="w-4 h-4" />
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">الاسم</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="input-glass"
                  placeholder="اسمك الكامل"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input-glass"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showRegPass ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input-glass pl-10"
                    placeholder="6 أحرف على الأقل"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="input-glass"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="px-4 py-3 rounded-xl text-sm text-green-400"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  {success}
                </div>
              )}

              <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading}>
                <UserPlus className="w-4 h-4" />
                {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
