"use client";

import { useRef, useState, useEffect } from "react";
import {
  Sparkles, FileText, Edit3, BookOpen, HelpCircle,
  Send, Download, Copy, CheckCheck, Upload, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIMode } from "@/lib/gemini";
import { getAISession, setAISession } from "@/lib/session-store";

type ModeConfig = {
  id: AIMode;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  desc: string;
  color: string;
  needsFile: boolean;
};

const MODES: ModeConfig[] = [
  {
    id: "create",
    label: "إنشاء وثيقة",
    icon: <FileText className="w-5 h-5" />,
    placeholder: "صف الوثيقة التي تريد إنشاءها... مثال: اكتب تقريراً عن أهمية القراءة في حياة الإنسان بثلاثة أقسام رئيسية",
    desc: "أنشئ وثائق ومقالات وتقارير بالكامل بمجرد وصف ما تريد",
    color: "#F59E0B",
    needsFile: false,
  },
  {
    id: "edit",
    label: "تحرير وثيقة",
    icon: <Edit3 className="w-5 h-5" />,
    placeholder: "اشرح كيف تريد تعديل الوثيقة... مثال: أعد صياغة النص بأسلوب أكثر رسمية، أو اختصر المحتوى إلى نصف الحجم",
    desc: "ارفع ملفاً وأخبر الذكاء الاصطناعي كيف يعدله",
    color: "#3B82F6",
    needsFile: true,
  },
  {
    id: "summarize",
    label: "تلخيص",
    icon: <BookOpen className="w-5 h-5" />,
    placeholder: "لا تحتاج لكتابة أي شيء — فقط ارفع الملف وسيلخصه تلقائياً",
    desc: "لخّص أي ملف PDF أو نص بشكل مفيد ومركّز",
    color: "#10B981",
    needsFile: true,
  },
  {
    id: "qa",
    label: "أسئلة وأجوبة",
    icon: <HelpCircle className="w-5 h-5" />,
    placeholder: "اسأل أي سؤال حول محتوى الملف المرفوع... مثال: ما هي النقاط الرئيسية في هذا التقرير؟",
    desc: "ارفع ملفاً واسأل أي سؤال عن محتواه",
    color: "#8B5CF6",
    needsFile: true,
  },
];

export default function AIStudioPage() {
  const [activeMode, setActiveMode] = useState<ModeConfig>(MODES[0]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromFile = async (f: File): Promise<string> => {
    if (f.type === "application/pdf") {
      const { loadPdfjs } = await import("@/lib/pdf");
      const pdfjsLib = await loadPdfjs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let text = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    } else {
      return await f.text();
    }
  };

  const handleFileChange = async (f: File) => {
    setFile(f);
    setError("");
    try {
      const text = await extractTextFromFile(f);
      setFileText(text);
      // Keep buffer in session so we can show file info after navigation
      const buf = await f.arrayBuffer();
      sessionSnap.current = { ...sessionSnap.current, fileBuffer: buf, fileName: f.name, fileText: text };
    } catch {
      setError("تعذّر قراءة الملف. تأكد أن الملف يحتوي على نص.");
      setFileText("");
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!prompt.trim() && activeMode.id !== "summarize") {
      setError("يرجى كتابة طلبك أولاً");
      return;
    }
    if (activeMode.needsFile && !fileText) {
      setError("يرجى رفع ملف أولاً");
      return;
    }

    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeMode.id,
          prompt: activeMode.id === "summarize" ? "لخّص هذا النص" : prompt,
          context: fileText || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ غير معروف");
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "حدث خطأ. يرجى التحقق من مفتاح Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [exporting, setExporting] = useState(false);

  // ── session persistence: restore on mount, save on unmount ──────────────
  // We keep a ref so the unmount closure always reads the latest values.
  const sessionSnap = useRef({ modeId: MODES[0].id, prompt: "", result: "", fileText: "", fileName: "", fileBuffer: null as ArrayBuffer | null });
  useEffect(() => {
    sessionSnap.current = { modeId: activeMode.id, prompt, result, fileText, fileName: file?.name ?? "", fileBuffer: null };
  });
  useEffect(() => {
    // Restore previous session on mount
    const s = getAISession();
    if (s.modeId !== "create" || s.prompt || s.result) {
      const mode = MODES.find(m => m.id === s.modeId);
      if (mode) setActiveMode(mode);
      if (s.prompt) setPrompt(s.prompt);
      if (s.result) setResult(s.result);
      if (s.fileText && s.fileName) {
        setFileText(s.fileText);
        // Recreate a dummy File from the stored buffer if available
        if (s.fileBuffer) {
          const ext = s.fileName.split(".").pop() ?? "txt";
          const mime = ext === "pdf" ? "application/pdf" : "text/plain";
          setFile(new File([s.fileBuffer], s.fileName, { type: mime }));
        }
      }
    }
    return () => {
      setAISession(sessionSnap.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Make sure the Cairo Arabic font is actually registered before we paint text
     onto a canvas. The browser shapes/joins Arabic glyphs correctly on canvas
     (unlike jsPDF's built-in Latin fonts, which produce mojibake), but it needs
     a font that has Arabic coverage to be loaded first. */
  const ensureArabicFont = async () => {
    if (!document.getElementById("ai-pdf-font")) {
      const link = document.createElement("link");
      link.id = "ai-pdf-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    try {
      const f: any = (document as any).fonts;
      await Promise.all([
        f?.load?.("400 24px Cairo"),
        f?.load?.("600 24px Cairo"),
        f?.load?.("700 24px Cairo"),
        f?.load?.("800 30px Cairo"),
      ]);
      await f?.ready;
    } catch {}
  };

  /* Render the AI result as a properly laid-out, RTL Arabic PDF.
     We paint each A4 page onto a high-DPI canvas (browser handles Arabic
     shaping + RTL natively) then drop the canvas into jsPDF as a full-page
     image. This guarantees correct Arabic — no more garbled/encoded text — and
     gives a clean document layout with headings, bullets and spacing. */
  const exportResultAsPDF = async () => {
    if (!result || exporting) return;
    setExporting(true);
    try {
      await ensureArabicFont();
      const { jsPDF } = await import("jspdf");

      const SCALE = 2;                       // high-DPI for crisp text
      const PAGE_W = 595 * SCALE;            // A4 width  (pt → px)
      const PAGE_H = 842 * SCALE;            // A4 height
      const M = 54 * SCALE;                  // page margin
      const contentW = PAGE_W - M * 2;

      const pages: HTMLCanvasElement[] = [];
      let canvas!: HTMLCanvasElement;
      let ctx!: CanvasRenderingContext2D;
      let y = 0;

      const newPage = () => {
        canvas = document.createElement("canvas");
        canvas.width = PAGE_W;
        canvas.height = PAGE_H;
        ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, PAGE_W, PAGE_H);
        (ctx as any).direction = "rtl";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        pages.push(canvas);
        y = M;
      };
      newPage();

      const stripMd = (s: string) =>
        s.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "").trim();

      type Block = {
        size: number;
        weight: string;
        color: string;
        lineGap: number;
        gapAfter: number;
        marker?: string;
        markerColor?: string;
      };

      const draw = (text: string, b: Block) => {
        const indent = b.marker ? 26 * SCALE : 0;
        const rightX = PAGE_W - M;
        const avail = contentW - indent;
        const setFont = () => {
          ctx.font = `${b.weight} ${b.size}px Cairo, "Segoe UI", sans-serif`;
        };
        setFont();

        // greedy word-wrap measured against the available width
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = "";
        for (const w of words) {
          const test = line ? line + " " + w : w;
          if (ctx.measureText(test).width > avail && line) {
            lines.push(line);
            line = w;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        if (lines.length === 0) lines.push("");

        const lh = b.size * b.lineGap;
        for (let i = 0; i < lines.length; i++) {
          if (y + lh > PAGE_H - M) newPage();
          setFont();
          ctx.textAlign = "right";
          ctx.fillStyle = b.color;
          ctx.fillText(lines[i], rightX - indent, y);
          if (b.marker && i === 0) {
            ctx.fillStyle = b.markerColor || "#C8860D";
            ctx.fillText(b.marker, rightX, y);
          }
          y += lh;
        }
        y += b.gapAfter;
      };

      const rawLines = result.replace(/\r/g, "").split("\n");
      for (const raw of rawLines) {
        const t = raw.trim();
        if (!t) { y += 8 * SCALE; continue; }

        const heading = t.match(/^(#{1,6})\s+(.*)/);
        if (heading) {
          const level = heading[1].length;
          const size = (level <= 1 ? 22 : level === 2 ? 18 : 15.5) * SCALE;
          if (y > M) y += 6 * SCALE;
          draw(stripMd(heading[2]), {
            size, weight: "800",
            color: level <= 1 ? "#0A1628" : "#1D4ED8",
            lineGap: 1.4, gapAfter: 7 * SCALE,
          });
          continue;
        }

        const bullet = t.match(/^[-*•]\s+(.*)/);
        if (bullet) {
          draw(stripMd(bullet[1]), {
            size: 13 * SCALE, weight: "400", color: "#1F2937",
            lineGap: 1.55, gapAfter: 3 * SCALE,
            marker: "•", markerColor: "#C8860D",
          });
          continue;
        }

        const numbered = t.match(/^(\d+)[.)]\s+(.*)/);
        if (numbered) {
          draw(stripMd(numbered[2]), {
            size: 13 * SCALE, weight: "400", color: "#1F2937",
            lineGap: 1.55, gapAfter: 3 * SCALE,
            marker: numbered[1] + ".", markerColor: "#0A1628",
          });
          continue;
        }

        const wholeBold = /^\*\*.*\*\*$/.test(t);
        draw(stripMd(t), {
          size: 13 * SCALE, weight: wholeBold ? "700" : "400",
          color: wholeBold ? "#0A1628" : "#374151",
          lineGap: 1.6, gapAfter: 5 * SCALE,
        });
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pages.forEach((cv, i) => {
        if (i > 0) pdf.addPage();
        pdf.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, ph);
      });
      pdf.save("وثيقة-AI.pdf");
    } finally {
      setExporting(false);
    }
  };

  // Simple markdown-ish rendering
  const renderResult = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-700 text-gold-400 mt-5 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-800 text-gold-300 mt-6 mb-3">{line.slice(2)}</h1>;
      if (line.startsWith("- ")) return <li key={i} className="text-slate-300 text-sm mb-1 mr-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-slate-100 font-700 text-sm mb-1">{line.slice(2, -2)}</p>;
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return <p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-800 text-slate-100">استوديو الذكاء الاصطناعي</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            مدعوم بـ Gemini — أنشئ وحرّر ولخّص ملفاتك بالذكاء الاصطناعي
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => { setActiveMode(mode); setResult(""); setError(""); }}
            className="p-4 rounded-2xl text-right transition-all duration-200"
            style={{
              background: activeMode.id === mode.id
                ? `${mode.color}15`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeMode.id === mode.id ? mode.color + "40" : "rgba(255,255,255,0.08)"}`,
              boxShadow: activeMode.id === mode.id ? `0 0 20px ${mode.color}15` : "none",
            }}
          >
            <div className="mb-2" style={{ color: activeMode.id === mode.id ? mode.color : "#64748b" }}>
              {mode.icon}
            </div>
            <p className="text-sm font-700 text-slate-200">{mode.label}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mode.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          {/* File upload (if needed) */}
          {activeMode.needsFile && (
            <div>
              {!file ? (
                <div
                  className="upload-zone p-6 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm font-600 text-slate-300">ارفع الملف (PDF، TXT، Word)</p>
                  <p className="text-xs text-slate-600 mt-1">حتى 20 صفحة</p>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: `${activeMode.color}10`, border: `1px solid ${activeMode.color}25` }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: `${activeMode.color}15` }}>
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fileText ? `${fileText.length.toLocaleString()} حرف` : "قراءة..."}</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setFileText(""); }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt */}
          {activeMode.id !== "summarize" && (
            <div>
              <label className="text-xs text-slate-500 mb-2 block">طلبك</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeMode.placeholder}
                rows={6}
                className="input-glass resize-none w-full leading-relaxed"
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(); }}
              />
              <p className="text-xs text-slate-700 mt-1">Ctrl+Enter للإرسال</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            loading={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {activeMode.id === "create" ? "إنشاء الوثيقة" :
                  activeMode.id === "summarize" ? "تلخيص الملف" :
                    activeMode.id === "edit" ? "تحرير الوثيقة" :
                      "الحصول على إجابة"}
              </>
            )}
          </Button>
        </div>

        {/* Result panel */}
        <div
          className="rounded-2xl flex flex-col"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: "400px",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <h3 className="text-sm font-700 text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              النتيجة
            </h3>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400 hover:text-slate-200 transition-all"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
                <button
                  onClick={exportResultAsPDF}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 text-xs text-gold-400 hover:text-gold-300 transition-all disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  PDF
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto" style={{ maxHeight: "500px" }}>
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-gold-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gold-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 border-transparent animate-spin" />
                </div>
                <p className="text-sm text-slate-500">يفكر الذكاء الاصطناعي...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Sparkles className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">ستظهر النتيجة هنا</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-1 text-right leading-relaxed">
                {renderResult(result)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
