"use client";

import { useRef, useState } from "react";
import {
  Combine, Scissors, Minimize2, ShieldCheck,
  Upload, X, Download, Loader2, GripVertical, FileText, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addFile, bumpUsage } from "@/lib/store";

type ToolId = "merge" | "split" | "compress" | "protect";

const TOOLS: { id: ToolId; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { id: "merge",    label: "دمج PDF",   desc: "اجمع عدة ملفات في ملف واحد", icon: <Combine className="w-5 h-5" />,    color: "#3B82F6" },
  { id: "split",    label: "تقسيم PDF", desc: "قسّم الملف إلى صفحات أو نطاقات", icon: <Scissors className="w-5 h-5" />,  color: "#F59E0B" },
  { id: "compress", label: "ضغط PDF",   desc: "قلّل حجم الملف مع الحفاظ على الجودة", icon: <Minimize2 className="w-5 h-5" />, color: "#10B981" },
  { id: "protect",  label: "حماية PDF", desc: "أقفل الملف بكلمة مرور (تشفير)", icon: <ShieldCheck className="w-5 h-5" />, color: "#8B5CF6" },
];

function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function saveToFiles(blob: Blob, name: string, source: string) {
  try {
    if (blob.size < 4_000_000) {
      const dataUrl = await blobToDataUrl(blob);
      addFile({ name, type: name.endsWith(".zip") ? "other" : "pdf", size: blob.size, dataUrl, source });
    } else {
      addFile({ name, type: name.endsWith(".zip") ? "other" : "pdf", size: blob.size, source });
    }
  } catch { /* ignore */ }
}

export default function PdfTools() {
  const [tool, setTool] = useState<ToolId | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState("");

  // shared file list (used by all tools)
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);

  // tool-specific options
  const [splitMode, setSplitMode] = useState<"each" | "ranges">("each");
  const [ranges, setRanges] = useState("");
  const [quality, setQuality] = useState(60);
  const [watermark, setWatermark] = useState("سري - Print Pro");
  const [password, setPassword] = useState("");
  const [addWatermark, setAddWatermark] = useState(false);

  const reset = () => { setFiles([]); setMsg(""); setDone(""); };

  const pickTool = (id: ToolId) => { setTool(id); reset(); };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (tool === "merge") setFiles((prev) => [...prev, ...picked]);
    else setFiles(picked.slice(0, 1)); // single-file tools
    e.target.value = "";
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const reorder = (to: number) => {
    const from = dragIdx.current;
    if (from === null || from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
    dragIdx.current = to;
  };

  /* parse "1-3,5,8-9" into zero-based page index groups */
  function parseRanges(input: string, total: number): number[][] {
    const groups: number[][] = [];
    for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        let a = +m[1], b = +m[2];
        if (a > b) [a, b] = [b, a];
        const g: number[] = [];
        for (let p = a; p <= b; p++) if (p >= 1 && p <= total) g.push(p - 1);
        if (g.length) groups.push(g);
      } else if (/^\d+$/.test(part)) {
        const p = +part;
        if (p >= 1 && p <= total) groups.push([p - 1]);
      }
    }
    return groups;
  }

  /* ── MERGE ──────────────────────────────────────────────────────────── */
  const runMerge = async () => {
    if (files.length < 2) { setMsg("اختر ملفّين على الأقل للدمج"); return; }
    setBusy(true); setMsg(""); setDone("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const name = "مدمج.pdf";
      downloadBlob(blob, name);
      await saveToFiles(blob, name, "editor");
      bumpUsage({ pages: out.getPageCount(), operations: 1 });
      setDone(`تم دمج ${files.length} ملفات (${out.getPageCount()} صفحة)`);
    } catch (e) {
      console.error(e); setMsg("تعذّر الدمج. تأكد أن الملفات سليمة وغير محمية.");
    } finally { setBusy(false); }
  };

  /* ── SPLIT ──────────────────────────────────────────────────────────── */
  const runSplit = async () => {
    if (!files[0]) { setMsg("اختر ملف PDF لتقسيمه"); return; }
    setBusy(true); setMsg(""); setDone("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const JSZip = (await import("jszip")).default;
      const src = await PDFDocument.load(await files[0].arrayBuffer());
      const total = src.getPageCount();

      const groups: number[][] =
        splitMode === "each"
          ? src.getPageIndices().map((i) => [i])
          : parseRanges(ranges, total);

      if (!groups.length) { setMsg("أدخل نطاقات صحيحة مثل: 1-3,5,8"); setBusy(false); return; }

      const base = files[0].name.replace(/\.pdf$/i, "");
      const zip = new JSZip();
      for (let g = 0; g < groups.length; g++) {
        const doc = await PDFDocument.create();
        const copied = await doc.copyPages(src, groups[g]);
        copied.forEach((p) => doc.addPage(p));
        const bytes = await doc.save();
        const label = groups[g].length === 1 ? `صفحة-${groups[g][0] + 1}` : `جزء-${g + 1}`;
        zip.file(`${base}-${label}.pdf`, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const name = `${base}-مقسّم.zip`;
      downloadBlob(blob, name);
      await saveToFiles(blob, name, "editor");
      bumpUsage({ operations: 1 });
      setDone(`تم إنشاء ${groups.length} ملف داخل ملف مضغوط`);
    } catch (e) {
      console.error(e); setMsg("تعذّر التقسيم. تأكد أن الملف سليم.");
    } finally { setBusy(false); }
  };

  /* ── COMPRESS (re-render pages to JPEG at lower quality) ─────────────── */
  const runCompress = async () => {
    if (!files[0]) { setMsg("اختر ملف PDF لضغطه"); return; }
    setBusy(true); setMsg(""); setDone("");
    try {
      const { loadPdfjs } = await import("@/lib/pdf");
      const { PDFDocument } = await import("pdf-lib");
      const pdfjs = await loadPdfjs();
      const ab = await files[0].arrayBuffer();
      const original = files[0].size;
      const doc = await pdfjs.getDocument({ data: new Uint8Array(ab) }).promise;
      const out = await PDFDocument.create();

      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const vp = page.getViewport({ scale: 1.3 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render as any)({ canvasContext: ctx, viewport: vp }).promise;
        const jpeg = canvas.toDataURL("image/jpeg", quality / 100);
        const bytes = Uint8Array.from(atob(jpeg.split(",")[1]), (c) => c.charCodeAt(0));
        const img = await out.embedJpg(bytes);
        const pg = out.addPage([canvas.width, canvas.height]);
        pg.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
        setMsg(`جاري الضغط… صفحة ${p}/${doc.numPages}`);
      }

      const outBytes = await out.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const name = files[0].name.replace(/\.pdf$/i, "") + "-مضغوط.pdf";
      downloadBlob(blob, name);
      await saveToFiles(blob, name, "editor");
      bumpUsage({ pages: doc.numPages, operations: 1 });
      const saved = Math.max(0, Math.round((1 - blob.size / original) * 100));
      setMsg("");
      setDone(`تم الضغط — توفير ${saved}% من الحجم تقريباً`);
    } catch (e) {
      console.error(e); setMsg(""); setMsg("تعذّر الضغط. تأكد أن الملف سليم.");
    } finally { setBusy(false); }
  };

  /* ── PROTECT (password encryption + optional watermark) ──────────────── */
  const runProtect = async () => {
    if (!files[0]) { setMsg("اختر ملف PDF"); return; }
    if (password.length < 4) { setMsg("أدخل كلمة مرور من ٤ أحرف على الأقل"); return; }
    setBusy(true); setMsg(""); setDone("");
    try {
      // @cantoo/pdf-lib is a drop-in pdf-lib fork that adds real AES encryption.
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("@cantoo/pdf-lib");
      // ignoreEncryption lets us re-protect PDFs that already carry restriction
      // (owner-password) encryption — a very common case that would otherwise throw.
      const doc = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });

      // Optional watermark (Latin only — standard fonts can't draw Arabic glyphs).
      if (addWatermark && watermark.trim()) {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const text = /[\u0600-\u06FF]/.test(watermark) ? "PROTECTED - Print Pro" : watermark;
        for (const page of doc.getPages()) {
          const { width, height } = page.getSize();
          const size = Math.min(width, height) / 12;
          page.drawText(text, {
            x: width / 2 - (text.length * size) / 4,
            y: height / 2,
            size, font,
            color: rgb(0.6, 0.6, 0.6),
            opacity: 0.25,
            rotate: degrees(45),
          });
        }
      }

      // Encrypt: the same password unlocks the file; printing/copying restricted.
      doc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: "highResolution", copying: false, modifying: false },
      });

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const name = files[0].name.replace(/\.pdf$/i, "") + "-محمي.pdf";
      downloadBlob(blob, name);
      await saveToFiles(blob, name, "editor");
      bumpUsage({ pages: doc.getPageCount(), operations: 1 });
      setPassword("");
      setDone("تم تشفير الملف بكلمة المرور — سيُطلب إدخالها عند الفتح");
    } catch (e) {
      console.error(e); setMsg("تعذّرت الحماية. تأكد أن الملف سليم وغير محمي مسبقاً.");
    } finally { setBusy(false); }
  };

  const run = () => {
    if (tool === "merge") runMerge();
    else if (tool === "split") runSplit();
    else if (tool === "compress") runCompress();
    else if (tool === "protect") runProtect();
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <FileText className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-100">أدوات PDF</h3>
          <p className="text-xs text-slate-500">دمج • تقسيم • ضغط • حماية — مباشرة في متصفحك</p>
        </div>
      </div>

      {/* Tool picker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => pickTool(t.id)}
            className={cn(
              "text-right p-3 rounded-xl transition-all border",
              tool === t.id ? "bg-white/8" : "bg-white/3 hover:bg-white/6"
            )}
            style={{ borderColor: tool === t.id ? t.color : "rgba(255,255,255,0.08)" }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${t.color}1f`, color: t.color }}>
              {t.icon}
            </div>
            <p className="text-sm font-700 text-slate-200">{t.label}</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {tool && (
        <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* File picker */}
          <div>
            <input
              ref={inputRef} type="file" accept="application/pdf"
              multiple={tool === "merge"} className="hidden" onChange={onPick}
            />
            <Button variant="glass" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              {tool === "merge" ? "أضف ملفات PDF" : "اختر ملف PDF"}
            </Button>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div
                  key={i}
                  draggable={tool === "merge"}
                  onDragStart={() => (dragIdx.current = i)}
                  onDragOver={(e) => { e.preventDefault(); if (tool === "merge") reorder(i); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {tool === "merge" && <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />}
                  <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="flex-1 truncate text-slate-300">{f.name}</span>
                  <span className="text-xs text-slate-600">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tool options */}
          {tool === "split" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setSplitMode("each")}
                  className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-600 transition-all",
                    splitMode === "each" ? "bg-gold-500/20 text-gold-400 border border-gold-500/40" : "bg-white/5 text-slate-400")}>
                  كل صفحة بملف
                </button>
                <button onClick={() => setSplitMode("ranges")}
                  className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-600 transition-all",
                    splitMode === "ranges" ? "bg-gold-500/20 text-gold-400 border border-gold-500/40" : "bg-white/5 text-slate-400")}>
                  نطاقات مخصصة
                </button>
              </div>
              {splitMode === "ranges" && (
                <input
                  value={ranges} onChange={(e) => setRanges(e.target.value)}
                  placeholder="مثال: 1-3, 5, 8-10"
                  className="input-glass text-sm" dir="ltr"
                />
              )}
            </div>
          )}

          {tool === "compress" && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>جودة الضغط</span>
                <span className="text-gold-400 font-700">{quality}%</span>
              </div>
              <input type="range" min={25} max={90} value={quality}
                onChange={(e) => setQuality(+e.target.value)} className="w-full" />
              <p className="text-[11px] text-slate-600 mt-1">جودة أقل = حجم أصغر</p>
            </div>
          )}

          {tool === "protect" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">كلمة المرور</label>
                <input
                  type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-glass text-sm" dir="ltr" placeholder="••••••"
                  autoComplete="off"
                />
                <p className="text-[11px] text-slate-600 mt-1">
                  سيُطلب إدخال كلمة المرور هذه عند فتح الملف في أي قارئ PDF. احفظها جيداً — لا يمكن استرجاعها.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={addWatermark}
                  onChange={(e) => setAddWatermark(e.target.checked)}
                  className="accent-violet-500 w-4 h-4" />
                إضافة علامة مائية أيضاً
              </label>

              {addWatermark && (
                <div>
                  <input value={watermark} onChange={(e) => setWatermark(e.target.value)}
                    className="input-glass text-sm" placeholder="سري" />
                  <p className="text-[11px] text-slate-600 mt-1">
                    العلامة المائية العربية تُستبدل بنص لاتيني لضمان العرض الصحيح.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {msg && <p className="text-sm text-slate-400 flex items-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin text-gold-400" />}{msg}
          </p>}
          {done && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 text-emerald-400"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle className="w-4 h-4" />{done}
            </div>
          )}

          {/* Run */}
          <Button variant="gold" className="w-full" onClick={run} loading={busy} disabled={files.length === 0}>
            <Download className="w-4 h-4" />
            {busy ? "جاري المعالجة…" :
              tool === "merge" ? "دمج وتنزيل" :
              tool === "split" ? "تقسيم وتنزيل" :
              tool === "compress" ? "ضغط وتنزيل" : "حماية وتنزيل"}
          </Button>
        </div>
      )}
    </div>
  );
}
