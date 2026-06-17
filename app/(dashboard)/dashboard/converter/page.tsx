"use client";

import { RefreshCw } from "lucide-react";
import ConvertPanel from "@/components/converter/ConvertPanel";

const supportedFormats = [
  { ext: "PDF", desc: "ملف PDF" },
  { ext: "DOCX", desc: "Word" },
  { ext: "PPTX", desc: "PowerPoint" },
  { ext: "XLSX", desc: "Excel" },
  { ext: "JPG/PNG", desc: "صور" },
];

export default function ConverterPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
        >
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-800 text-slate-100">محول الملفات</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            تحويل سريع بين جميع الصيغ — PDF، Word، Excel، PowerPoint والصور
          </p>
        </div>
      </div>

      {/* Supported formats */}
      <div className="flex gap-2 flex-wrap">
        {supportedFormats.map(({ ext, desc }) => (
          <div
            key={ext}
            className="px-3 py-1.5 rounded-xl text-xs font-600"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}
          >
            <span className="text-electric-400">{ext}</span>
            <span className="text-slate-600 mr-1">— {desc}</span>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div
        className="rounded-3xl p-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <ConvertPanel />
      </div>

      {/* Note about server conversion */}
      <div
        className="px-4 py-3 rounded-xl text-xs text-slate-500"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <strong className="text-slate-400">ملاحظة:</strong> تحويل PDF ↔ Word/PowerPoint/Excel يتطلب LibreOffice على الخادم.
        تحويل الصور إلى PDF ومن PDF إلى صور يعمل مباشرة في المتصفح بدون خادم.
      </div>
    </div>
  );
}
