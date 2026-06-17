"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ArrowLeftRight, Download, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatFileSize, getFileExtension } from "@/lib/utils";

type ConversionOption = {
  from: string[];
  to: string;
  label: string;
  mode: "client" | "server";
  icon: string;
  color: string;
};

const CONVERSIONS: ConversionOption[] = [
  { from: ["jpg","jpeg","png","webp","bmp","gif"], to: "pdf", label: "صور ← PDF", mode: "client", icon: "📄", color: "#EF4444" },
  { from: ["pdf"], to: "jpg", label: "PDF ← صور JPG", mode: "client", icon: "🖼️", color: "#10B981" },
  { from: ["pdf"], to: "docx", label: "PDF ← Word", mode: "server", icon: "📝", color: "#3B82F6" },
  { from: ["pdf"], to: "pptx", label: "PDF ← PowerPoint", mode: "server", icon: "📊", color: "#F97316" },
  { from: ["pdf"], to: "txt", label: "PDF ← نص", mode: "server", icon: "📃", color: "#94A3B8" },
  { from: ["docx","doc"], to: "pdf", label: "Word ← PDF", mode: "server", icon: "📄", color: "#EF4444" },
  { from: ["pptx","ppt"], to: "pdf", label: "PowerPoint ← PDF", mode: "server", icon: "📄", color: "#EF4444" },
  { from: ["xlsx","xls"], to: "pdf", label: "Excel ← PDF", mode: "server", icon: "📄", color: "#EF4444" },
  { from: ["docx","doc"], to: "txt", label: "Word ← نص", mode: "server", icon: "📃", color: "#94A3B8" },
];

export default function ConvertPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedConv, setSelectedConv] = useState<ConversionOption | null>(null);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const ext = file ? getFileExtension(file.name) : null;
  const available = ext ? CONVERSIONS.filter((c) => c.from.includes(ext)) : [];

  const setFileAndReset = (f: File) => {
    setFile(f);
    setSelectedConv(null);
    setResultUrl(null);
    setErrorMsg("");
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFileAndReset(f);
  };

  /* ── Client-side: images → PDF ── */
  const convertImagesToPDF = async () => {
    if (!file) return;
    const { jsPDF } = await import("jspdf");
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise<void>((res) => { img.onload = () => res(); });
    const pdf = new jsPDF({ orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pw / img.naturalWidth, ph / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    pdf.addImage(url, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
    pdf.save(`${file.name.replace(/\.[^.]+$/, "")}.pdf`);
    URL.revokeObjectURL(url);
  };

  /* ── Client-side: PDF → JPG images (ZIP) ── */
  const convertPDFToImages = async () => {
    if (!file) return;
    setProgress(5);

    const { loadPdfjs } = await import("@/lib/pdf");
    const pdfjsLib = await loadPdfjs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx as any, viewport, canvas: canvas as any }).promise;
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
      );
      zip.file(`صفحة-${i}.jpg`, blob);
      setProgress(Math.round((i / pdf.numPages) * 90) + 5);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    setProgress(100);
    const url = URL.createObjectURL(zipBlob);
    const name = `${file.name.replace(/\.[^.]+$/, "")}-صور.zip`;
    setResultUrl(url);
    setResultName(name);
  };

  /* ── Server-side via LibreOffice ── */
  const convertServerSide = async (conv: ConversionOption) => {
    const formData = new FormData();
    formData.append("file", file!);
    formData.append("targetFormat", conv.to);

    // Fake progress animation
    const interval = setInterval(() => setProgress((p) => (p < 85 ? p + 5 : p)), 400);

    try {
      const res = await fetch("/api/convert", { method: "POST", body: formData });
      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "خطأ غير معروف" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setProgress(100);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name = `${file!.name.replace(/\.[^.]+$/, "")}.${conv.to}`;
      setResultUrl(url);
      setResultName(name);
    } catch (err) {
      clearInterval(interval);
      throw err;
    }
  };

  const runConversion = async () => {
    if (!selectedConv || !file) return;
    setConverting(true);
    setProgress(0);
    setResultUrl(null);
    setErrorMsg("");

    try {
      if (selectedConv.mode === "client") {
        if (selectedConv.to === "pdf") {
          await convertImagesToPDF();
        } else {
          await convertPDFToImages();
        }
      } else {
        await convertServerSide(selectedConv);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء التحويل");
    } finally {
      setConverting(false);
    }
  };

  const reset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setSelectedConv(null);
    setResultUrl(null);
    setErrorMsg("");
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          className={cn("upload-zone p-14 text-center cursor-pointer", dragging && "drag-over")}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(e) => e.target.files?.[0] && setFileAndReset(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
              style={{ background: "rgba(59,130,246,0.1)", border: "2px dashed rgba(59,130,246,0.3)" }}>
              <Upload className="w-9 h-9 text-electric-400" />
            </div>
            <div>
              <p className="text-lg font-700 text-slate-200 mb-1">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-sm text-slate-500">PDF • Word • PowerPoint • Excel • صور</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="text-3xl">
              {ext === "pdf" ? "📄" : ["jpg","jpeg","png","webp"].includes(ext!) ? "🖼️" : "📝"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-slate-100 truncate">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)} • {ext?.toUpperCase()}</p>
            </div>
            <button onClick={reset} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversion options */}
          {available.length > 0 ? (
            <div>
              <p className="text-sm font-700 text-slate-300 mb-3">اختر الصيغة المطلوبة</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {available.map((conv) => (
                  <button key={`${conv.from}-${conv.to}`}
                    onClick={() => { setSelectedConv(conv); setResultUrl(null); setErrorMsg(""); }}
                    className="p-4 rounded-xl text-right transition-all duration-200"
                    style={{
                      background: selectedConv?.to === conv.to ? `${conv.color}15` : "rgba(255,255,255,0.04)",
                      border: `2px solid ${selectedConv?.to === conv.to ? conv.color + "60" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: selectedConv?.to === conv.to ? `0 0 20px ${conv.color}15` : "none",
                    }}
                  >
                    <span className="text-2xl block mb-2">{conv.icon}</span>
                    <span className="text-sm font-700 text-slate-100 block">{conv.label}</span>
                    <span className="text-xs mt-1 block" style={{ color: conv.color }}>
                      {conv.mode === "server" ? "LibreOffice ✓" : "تحويل فوري ⚡"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>هذه الصيغة غير مدعومة حالياً للتحويل</p>
            </div>
          )}

          {/* Progress */}
          {converting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  جاري التحويل...
                </span>
                <span className="text-gold-400 font-600">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-700 text-red-400 mb-1">فشل التحويل</p>
                <p className="text-xs text-red-400/70">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Download result */}
          {resultUrl && !converting && (
            <a href={resultUrl} download={resultName}
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(16,185,129,0.08)", border: "2px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-700 text-emerald-400">تم التحويل بنجاح! 🎉</p>
                <p className="text-xs text-slate-400 mt-0.5">{resultName} — اضغط للتنزيل</p>
              </div>
              <Download className="w-5 h-5 text-emerald-400" />
            </a>
          )}

          {/* Convert button */}
          {selectedConv && !resultUrl && (
            <Button variant="electric" size="lg" className="w-full" onClick={runConversion} loading={converting}>
              <ArrowLeftRight className="w-4 h-4" />
              {converting ? "جاري التحويل..." : `تحويل إلى ${selectedConv.to.toUpperCase()}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
