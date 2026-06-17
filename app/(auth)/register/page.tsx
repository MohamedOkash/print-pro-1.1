"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPass) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "فشل إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 8px 32px rgba(245,158,11,0.3)" }}
          >
            <Printer className="w-8 h-8 text-navy-900" />
          </div>
          <h1 className="text-3xl font-900 logo-gradient">Print Pro</h1>
          <p className="text-slate-500 text-sm mt-1">منصة الطباعة الذكية</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-700 text-emerald-400 mb-2">تم إنشاء الحساب!</h2>
              <p className="text-slate-400 text-sm mb-6">تحقق من بريدك الإلكتروني لتفعيل الحساب</p>
              <Link href="/login">
                <Button variant="gold" className="w-full">الذهاب لتسجيل الدخول</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-700 text-slate-100 mb-6">إنشاء حساب جديد</h2>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glass"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-glass pl-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="input-glass"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm text-red-400"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading}>
                  <UserPlus className="w-4 h-4" />
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="text-gold-400 hover:text-gold-300 font-600">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
