"use client";

import { useState } from "react";
import { Download, Save, FileDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ScannedPage } from "./ImageUploadZone";
import { buildFilter, type EnhanceSettings } from "./ImageEnhancer";
import { addFile, bumpUsage } from "@/lib/store";

interface Props {
  pages: ScannedPage[];
  settings: EnhanceSettings;
}

export default function ScannerExport({ pages, settings }: Props) {
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [filename, setFilename] = useState("مستند-ممسوح");

  const applyFilters = (img: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;

    // Same filter string as the live preview — WYSIWYG export
    ctx.filter = buildFilter(settings);

    ctx.drawImage(img, 0, 0);
    return canvas;
  };

  const exportToPDF = async () => {
    if (pages.length === 0) return;
    setExporting(true);
    setDone(false);
    setProgress(0);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const a4W = 210;
      const a4H = 297;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (i > 0) pdf.addPage();

        // All pages now have a rendered image URL (PDFs are pre-rendered to canvas)
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = applyFilters(img);
            const imgData = canvas.toDataURL("image/jpeg", 0.92);
            const ratio = Math.min(a4W / img.naturalWidth, a4H / img.naturalHeight);
            const w = img.naturalWidth * ratio;
            const h = img.naturalHeight * ratio;
            pdf.addImage(imgData, "JPEG", (a4W - w) / 2, (a4H - h) / 2, w, h);
            resolve();
          };
          img.src = page.previewUrl; // always a renderable image URL
        });

        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      const safeName = `${filename || "مستند-ممسوح"}.pdf`;
      pdf.save(safeName);

      // Save a copy to "ملفاتي" and record usage
      try {
        const dataUrl = pdf.output("datauristring");
        addFile({ name: safeName, type: "pdf", dataUrl, source: "scanner" });
      } catch { /* ignore store errors */ }
      bumpUsage({ pages: pages.length, operations: 1 });

      setDone(true);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <h3 className="text-sm font-700 text-slate-200 flex items-center gap-2">
        <FileDown className="w-4 h-4 text-gold-400" />
        تصدير PDF
      </h3>

      {/* Filename */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">اسم الملف</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="input-glass flex-1 text-sm"
            placeholder="اسم الملف"
          />
          <span className="text-sm text-slate-600">.pdf</span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-slate-500 mb-1">عدد الصفحات</p>
          <p className="text-lg font-700 text-gold-400">{pages.length}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-slate-500 mb-1">الصيغة</p>
          <p className="text-lg font-700 text-slate-200">PDF</p>
        </div>
      </div>

      {/* Progress */}
      {exporting && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>جاري المعالجة...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Success */}
      {done && !exporting && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-600 text-emerald-400"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <CheckCircle className="w-4 h-4" />
          تم التصدير بنجاح!
        </div>
      )}

      {/* Export button */}
      <Button
        variant="gold"
        size="lg"
        className="w-full"
        onClick={exportToPDF}
        loading={exporting}
        disabled={pages.length === 0}
      >
        <Download className="w-4 h-4" />
        {exporting ? "جاري التصدير..." : "تصدير كـ PDF"}
      </Button>
    </div>
  );
}
