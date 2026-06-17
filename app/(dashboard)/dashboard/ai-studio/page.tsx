"use client";

import { useRef, useState } from "react";
import {
  Sparkles, FileText, Edit3, BookOpen, HelpCircle,
  Send, Download, Copy, CheckCheck, Upload, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIMode } from "@/lib/gemini";

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

  const exportResultAsPDF = async () => {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Simple text wrapping — Arabic needs special handling
    const lines = result.split("\n");
    let y = 20;
    const maxWidth = 170;

    for (const line of lines) {
      if (y > 270) { pdf.addPage(); y = 20; }
      if (line.startsWith("##")) {
        pdf.setFontSize(16);
        pdf.text(line.replace(/^#+\s*/, ""), 200, y, { align: "right" });
        pdf.setFontSize(11);
        y += 10;
      } else if (line.trim()) {
        const wrapped = pdf.splitTextToSize(line, maxWidth);
        wrapped.forEach((wl: string) => {
          if (y > 270) { pdf.addPage(); y = 20; }
          pdf.text(wl, 200, y, { align: "right" });
          y += 7;
        });
      } else {
        y += 4;
      }
    }

    pdf.save("وثيقة-AI.pdf");
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 text-xs text-gold-400 hover:text-gold-300 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
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
