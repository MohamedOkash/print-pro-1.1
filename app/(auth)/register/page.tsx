"use client";

import Link from "next/link";
import { Printer, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Registration is disabled. Print Pro uses a fixed allow-list of accounts
 * (see lib/auth.ts). New accounts can only be handed out by the administrator.
 */
export default function RegisterPage() {
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

        <div className="glass-card p-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Lock className="w-6 h-6 text-gold-400" />
          </div>
          <h2 className="text-xl font-700 text-slate-100 mb-2">التسجيل غير متاح</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            هذه المنصة للحسابات المعتمدة فقط. للحصول على حساب، يُرجى التواصل مع مسؤول النظام.
          </p>
          <Link href="/login">
            <Button variant="gold" size="lg" className="w-full">العودة لتسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
