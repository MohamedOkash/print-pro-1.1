"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Download, FileDown, CheckCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ScannedPage } from "./ImageUploadZone";
import { type EnhanceSettings } from "./ImageEnhancer";
import { enhanceToCanvas } from "@/lib/scan";
import { addFile, bumpUsage } from "@/lib/store";

interface Props {
  pages: ScannedPage[];
  settings: EnhanceSettings;
}

export default function ScannerExport({ pages, settings }: Props) {
  const [progress, setProgress]       = useState(0);
  const [exporting, setExporting]     = useState(false);
  const [savedName, setSavedName]     = useState<string | null>(null);
  const [blobUrl, setBlobUrl]         = useState<string | null>(null);
  const [inFiles, setInFiles]         = useState(false);
  const [filename, setFilename]       = useState("مستند-ممسوح");
  const blobRef = useRef<string | null>(null);

  // Revoke old blob URL when component unmounts to free memory
  useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

  const applyFilters = (img: HTMLImageElement): HTMLCanvasElement =>
    enhanceToCanvas(img, {
      grayscale:    settings.grayscale,
      contrast:     settings.contrast,
      brightness:   settings.brightness,
      sepia:        settings.sepia,
      invert:       settings.invert,
      smartWhiten:  settings.smartWhiten,
    });

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToPDF = async () => {
    if (!pages.length) return;
    setExporting(true);
    setSavedName(null);
    setBlobUrl(null);
    setInFiles(false);
    setProgress(0);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const a4W  = 210;
      const a4H  = 297;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas  = applyFilters(img);
            const imgData = canvas.toDataURL("image/jpeg", 0.94);
            const scale   = Math.min(a4W / img.naturalWidth, a4H / img.naturalHeight);
            const w       = img.naturalWidth  * scale;
            const h       = img.naturalHeight * scale;
            pdf.addImage(imgData, "JPEG", (a4W - w) / 2, (a4H - h) / 2, w, h);
            resolve();
          };
          img.onerror = reject;
          img.crossOrigin = "anonymous";
          img.src = pages[i].previewUrl;
        });

        setProgress(Math.round(((i + 1) / pages.length) * 80));
      }

      setProgress(90);
      const safeName = `${filename.trim() || "مستند-ممسوح"}.pdf`;

      // ── Build Blob & create a persistent Object URL for in-app re-download ──
      // (more reliable than pdf.save() on mobile/PWA browsers)
      const pdfBytes = pdf.output("arraybuffer");
      const blob     = new Blob([pdfBytes], { type: "application/pdf" });
      const url      = URL.createObjectURL(blob);

      // Trigger browser download
      triggerDownload(url, safeName);

      // Store the URL for the re-download button (valid for this session)
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      blobRef.current = url;
      setBlobUrl(url);
      setSavedName(safeName);

      setProgress(95);

      // ── Save to "ملفاتي" ──
      // Try full quality; if the data URL is too big the store will gracefully
      // drop it but still record the file's metadata so it appears in the list.
      try {
        const dataUrl = pdf.output("datauristring");
        addFile({ name: safeName, type: "pdf", dataUrl, source: "scanner" });
        setInFiles(true);
      } catch { /* ignore — store will keep metadata */ }

      bumpUsage({ pages: pages.length, operations: 1 });
      setProgress(100);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("حدث خطأ أثناء التصدير، يرجى المحاولة مجدداً.");
    } finally {
      setExporting(false);
    }
  };

  const reDownload = () => {
    if (blobUrl && savedName) triggerDownload(blobUrl, savedName);
  };

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

      <h3 className="text-sm font-700 text-slate-200 flex items-center gap-2">
        <FileDown className="w-4 h-4 text-gold-400" />
        تصدير PDF
      </h3>

      {/* Filename */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">اسم الملف</label>
        <div className="flex items-center gap-2">
          <input type="text" value={filename}
            onChange={(e) => { setFilename(e.target.value); setSavedName(null); setBlobUrl(null); }}
            className="input-glass flex-1 text-sm" placeholder="اسم الملف" />
          <span className="text-sm text-slate-600">.pdf</span>
        </div>
      </div>

      {/* Stats */}
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

      {/* Progress bar */}
      {exporting && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>جاري المعالجة والتصدير…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* ── Success card — shown after first export ── */}
      {savedName && !exporting && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>

          <div className="flex items-center gap-2 text-sm font-600 text-emerald-400">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>تم الحفظ — <strong className="text-white">{savedName}</strong></span>
          </div>

          {/* Re-download button (uses the in-memory Blob URL) */}
          <button onClick={reDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff" }}>
            <Download className="w-4 h-4" />
            تحميل الملف
          </button>

          {/* Go to ملفاتي */}
          <Link href="/dashboard/files"
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-600 transition-colors hover:text-slate-200"
            style={{ color: "#64748b" }}>
            <FolderOpen className="w-3.5 h-3.5" />
            {inFiles ? "محفوظ في ملفاتي ✓ — اضغط للفتح" : "فتح ملفاتي"}
          </Link>
        </div>
      )}

      {/* Main export button */}
      <Button variant="gold" size="lg" className="w-full"
        onClick={exportToPDF} loading={exporting} disabled={pages.length === 0}>
        <Download className="w-4 h-4" />
        {exporting ? "جاري التصدير…" : savedName ? "تصدير مرة أخرى" : "تصدير كـ PDF"}
      </Button>
    </div>
  );
}
