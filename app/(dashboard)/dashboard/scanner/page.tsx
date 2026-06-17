"use client";

import { useState } from "react";
import { ScanLine, Info } from "lucide-react";
import ImageUploadZone, { type ScannedPage } from "@/components/scanner/ImageUploadZone";
import ImageEnhancer, { defaultSettings, type EnhanceSettings } from "@/components/scanner/ImageEnhancer";
import ScannerExport from "@/components/scanner/ScannerExport";
import ScannerPreview from "@/components/scanner/ScannerPreview";

export default function ScannerPage() {
  const [pages, setPages]         = useState<ScannedPage[]>([]);
  const [settings, setSettings]   = useState<EnhanceSettings>(defaultSettings);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Keep selectedIdx in range when pages change
  const handlePagesChange = (next: ScannedPage[]) => {
    setPages(next);
    if (selectedIdx >= next.length) setSelectedIdx(Math.max(0, next.length - 1));
  };

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
        >
          <ScanLine className="w-6 h-6 text-navy-900" />
        </div>
        <div>
          <h1 className="text-2xl font-800 text-slate-100">الماسح الضوئي</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            حوّل صورك ومستنداتك إلى ملف PDF احترافي — عدّل الفلاتر وشاهد النتيجة فوراً
          </p>
        </div>
      </div>

      {/* Info tip */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-blue-300"
        style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-electric-400" />
        <p>
          ارفع صوراً متعددة، عدّل السطوع والتباين والفلاتر، ثم اضغط على الصورة لمعاينتها بحجم كامل.
          يمكنك التبديل بين <strong className="text-slate-300">قبل التحسين</strong> و<strong className="text-slate-300">بعده</strong> في المعاينة.
        </p>
      </div>

      {pages.length === 0 ? (
        /* ── No pages yet: full-width upload ── */
        <ImageUploadZone pages={pages} onPagesChange={handlePagesChange} />
      ) : (
        /* ── Pages loaded: 2-column layout ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Preview + thumbnails upload */}
          <div className="lg:col-span-2 space-y-5">
            {/* Live preview */}
            <ScannerPreview
              pages={pages}
              settings={settings}
              selectedIdx={selectedIdx}
              onSelectIdx={setSelectedIdx}
            />

            {/* Upload zone (compact) */}
            <ImageUploadZone pages={pages} onPagesChange={handlePagesChange} />
          </div>

          {/* Right: Enhancer + Export */}
          <div className="space-y-4">
            <ImageEnhancer
              settings={settings}
              onSettingsChange={setSettings}
              disabled={pages.length === 0}
            />
            <ScannerExport pages={pages} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
}
