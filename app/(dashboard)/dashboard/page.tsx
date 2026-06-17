"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ScanLine, RefreshCw, FileEdit, Palette, Sparkles, FolderOpen,
  ArrowLeft, Zap, Shield, Star,
} from "lucide-react";
import StatsPanel from "@/components/dashboard/StatsPanel";
import { LogoIcon } from "@/components/Logo";
import { getSession } from "@/lib/auth";

const modules = [
  {
    href: "/dashboard/scanner",
    label: "الماسح الضوئي",
    desc: "حوّل صورك ومستنداتك إلى PDF باحترافية كاملة",
    icon: ScanLine,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glow: "245,158,11",
    badge: "جديد",
  },
  {
    href: "/dashboard/converter",
    label: "محول الملفات",
    desc: "PDF إلى Word وPowerPoint وExcel والعكس",
    icon: RefreshCw,
    gradient: "from-blue-500 via-cyan-500 to-sky-400",
    glow: "59,130,246",
    badge: null,
  },
  {
    href: "/dashboard/editor",
    label: "محرر PDF",
    desc: "أضف نصوصاً وتعليقات ورسومات على ملفاتك",
    icon: FileEdit,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glow: "139,92,246",
    badge: null,
  },
  {
    href: "/dashboard/designer",
    label: "مصمم الأغلفة",
    desc: "صمّم أغلفة مدرسية واحترافية بقوالب جاهزة",
    icon: Palette,
    gradient: "from-pink-500 via-rose-500 to-red-400",
    glow: "236,72,153",
    badge: "مميز",
  },
  {
    href: "/dashboard/ai-studio",
    label: "استوديو الذكاء الاصطناعي",
    desc: "أنشئ ولخّص وحرّر مستنداتك بقوة Gemini AI",
    icon: Sparkles,
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    glow: "16,185,129",
    badge: "AI",
  },
  {
    href: "/dashboard/files",
    label: "ملفاتي",
    desc: "كل ملفاتك المحفوظة في مكان واحد مع الرفع والتحميل",
    icon: FolderOpen,
    gradient: "from-slate-400 via-slate-500 to-slate-600",
    glow: "100,116,139",
    badge: null,
  },
];

const perks = [
  { icon: Zap, label: "سريع", desc: "تحويل في ثوانٍ", color: "#F59E0B" },
  { icon: Shield, label: "آمن", desc: "ملفاتك محمية", color: "#3B82F6" },
  { icon: Star, label: "احترافي", desc: "نتائج عالية الجودة", color: "#8B5CF6" },
];

export default function DashboardPage() {
  const [name, setName] = useState<string>("");
  useEffect(() => { setName(getSession()?.name ?? ""); }, []);

  return (
    <div className="space-y-10 pb-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl animate-fade-in"
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(59,130,246,0.10) 50%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(245,158,11,0.18)",
        }}>
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-600 text-gold-400 mb-4"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              منصة الطباعة الذكية
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-900 leading-tight mb-3">
              <span className="text-slate-100">{name ? `أهلاً ${name}، ` : "مرحباً في "}</span>
              <span className="text-gold-gradient">Print Pro</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
              كل أدواتك لإدارة الملفات والطباعة في مكان واحد — ماسح، محوّل، محرر، مصمم وذكاء اصطناعي
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 mt-5">
              {perks.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-700 text-slate-200">{label}</p>
                    <p className="text-xs text-slate-600 hidden sm:block">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center animate-float"
              style={{
                background: "linear-gradient(135deg, rgba(84,104,255,0.18), rgba(139,92,246,0.12))",
                border: "1px solid rgba(109,92,240,0.28)",
                boxShadow: "0 20px 60px rgba(109,92,240,0.22)",
              }}>
              <LogoIcon size={84} className="drop-shadow-[0_0_18px_rgba(109,92,240,0.45)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Statistics ── */}
      <StatsPanel />

      {/* ── Modules Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-800 text-slate-100">أدوات المنصة</h2>
          <span className="text-xs text-slate-600">{modules.length} أدوات متاحة</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map(({ href, label, desc, icon: Icon, gradient, glow, badge }, i) => (
            <Link key={href} href={href} className="group block animate-slide-up"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}>
              <div className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                  hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer h-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${glow},0.35)`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px rgba(${glow},0.18), 0 4px 24px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
                }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, rgba(${glow},0.08) 0%, transparent 60%)` }} />

                <div className="relative flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-700 text-slate-100 text-base">{label}</h3>
                      {badge && (
                        <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                          style={{ background: `rgba(${glow},0.15)`, color: `rgb(${glow})`, border: `1px solid rgba(${glow},0.3)` }}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-end mt-4 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs font-600 flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                    style={{ color: `rgb(${glow})` }}>
                    افتح الأداة
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { emoji: "📸", title: "ماسح ذكي", tip: "ارفع أكثر من صورة دفعة واحدة لدمجها في PDF واحد" },
          { emoji: "🤖", title: "ذكاء اصطناعي", tip: "اكتب موضوعك واترك Gemini يكتب التقرير كاملاً" },
          { emoji: "🎨", title: "قوالب مدرسية", tip: "اختر قالباً جاهزاً وعدّل عليه في ثوانٍ للطباعة" },
        ].map(({ emoji, title, tip }, i) => (
          <div key={title} className="rounded-2xl p-5 flex gap-4 transition-all hover:-translate-y-0.5 animate-slide-up"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}>
            <div className="text-3xl flex-shrink-0">{emoji}</div>
            <div>
              <p className="text-sm font-700 text-slate-200 mb-1">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
