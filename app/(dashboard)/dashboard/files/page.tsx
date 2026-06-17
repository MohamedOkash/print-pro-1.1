"use client";

import { useState, useSyncExternalStore } from "react";
import {
  FolderOpen, Upload, Search, Grid3X3, List,
  Download, Trash2, File, Image, FileText, Presentation, Table,
  Trash, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatDate } from "@/lib/utils";
import {
  getFiles, addFile, deleteFile, clearFiles, subscribe,
  kindFromFile, type StoredFile, type FileKind,
} from "@/lib/store";

const FILE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pdf: { icon: <File className="w-6 h-6" />, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  image: { icon: <Image className="w-6 h-6" />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  docx: { icon: <FileText className="w-6 h-6" />, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  pptx: { icon: <Presentation className="w-6 h-6" />, color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  xlsx: { icon: <Table className="w-6 h-6" />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  other: { icon: <File className="w-6 h-6" />, color: "#64748B", bg: "rgba(100,116,139,0.1)" },
};

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF", image: "صورة", docx: "Word", pptx: "PowerPoint", xlsx: "Excel", other: "ملف",
};

/** Read a File into a base64 data URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FilesPage() {
  // Subscribe to the shared store so uploads from any module appear live.
  const files = useSyncExternalStore<StoredFile[]>(
    subscribe,
    getFiles,
    () => [] as StoredFile[]
  );

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<StoredFile | null>(null);

  const filtered = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const processFiles = async (list: File[]) => {
    if (!list.length) return;
    setUploading(true);
    setNotice(null);
    let metaOnly = 0;
    try {
      for (const f of list) {
        // Keep a downloadable copy for files small enough to fit the browser's
        // localStorage; bigger files are still saved as metadata-only entries.
        let dataUrl: string | undefined;
        if (f.size < 2_800_000) {
          try { dataUrl = await fileToDataUrl(f); } catch { /* ignore */ }
        } else {
          metaOnly++;
        }
        addFile({
          name: f.name,
          type: kindFromFile(f.name, f.type) as FileKind,
          size: f.size,
          dataUrl,
          source: "upload",
        });
      }
      if (metaOnly > 0) {
        setNotice(`تم رفع ${list.length} ملف. ${metaOnly} ملف كبير الحجم حُفظ بدون نسخة للتحميل.`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    await processFiles(Array.from(e.dataTransfer.files || []));
  };

  const download = (file: StoredFile) => {
    if (!file.dataUrl) return;
    const a = document.createElement("a");
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  const filterTypes = [
    { id: "all", label: "الكل" },
    { id: "pdf", label: "PDF" },
    { id: "image", label: "صور" },
    { id: "docx", label: "Word" },
    { id: "pptx", label: "PowerPoint" },
    { id: "xlsx", label: "Excel" },
  ];

  return (
    <div
      className="space-y-6 relative"
      onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
      onDrop={handleDrop}
    >
      {/* Drag-and-drop overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(2,6,16,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-3xl px-12 py-10 text-center"
            style={{ border: "2px dashed rgba(245,158,11,0.6)", background: "rgba(245,158,11,0.08)" }}>
            <Upload className="w-12 h-12 mx-auto mb-3 text-gold-400" />
            <p className="text-lg font-700 text-slate-100">أفلت الملفات هنا لرفعها</p>
          </div>
        </div>
      )}

      {notice && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B" }}>
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-gold-400/70 hover:text-gold-400"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #64748B, #475569)" }}>
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 text-slate-100">ملفاتي</h1>
            <p className="text-slate-400 text-sm mt-0.5">{files.length} ملف محفوظ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => { if (confirm("حذف جميع الملفات؟")) clearFiles(); }}
              className="text-slate-400 hover:text-red-400"
            >
              <Trash className="w-4 h-4" />
              مسح الكل
            </Button>
          )}
          <label>
            <input type="file" multiple className="hidden" onChange={handleUpload}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.pptx,.xlsx,.csv" />
            <Button variant="gold" loading={uploading} className="cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? "جاري الرفع..." : "رفع ملفات"}
            </Button>
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="بحث في الملفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass pr-9 py-2 text-sm"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {filterTypes.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
              style={{
                background: filterType === id ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${filterType === id ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: filterType === id ? "#F59E0B" : "#94a3b8",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-gold-500/20 text-gold-400" : "text-slate-500"}`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${viewMode === "list" ? "bg-gold-500/20 text-gold-400" : "text-slate-500"}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "إجمالي الملفات", value: files.length.toString(), color: "#F59E0B" },
          { label: "الحجم الإجمالي", value: formatFileSize(files.reduce((s, f) => s + f.size, 0)), color: "#3B82F6" },
          { label: "ملفات PDF", value: files.filter(f => f.type === "pdf").length.toString(), color: "#EF4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-700" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Files */}
      {filtered.length === 0 ? (
        <label className="block cursor-pointer">
          <input type="file" multiple className="hidden" onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.pptx,.xlsx,.csv" />
          <div className="text-center py-16 rounded-3xl transition-all hover:bg-white/[0.02]"
            style={{ border: "2px dashed rgba(255,255,255,0.12)" }}>
            <Upload className="w-14 h-14 mx-auto mb-4 text-gold-400/60" />
            <p className="text-base font-600 mb-1 text-slate-300">اسحب ملفاتك هنا أو اضغط للرفع</p>
            <p className="text-sm text-slate-600">PDF · صور · Word · PowerPoint · Excel</p>
          </div>
        </label>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => {
            const fileInfo = FILE_ICONS[file.type] || FILE_ICONS.other;
            const isImg = file.type === "image" && file.dataUrl;
            return (
              <div key={file.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
                {isImg ? (
                  <button
                    onClick={() => setPreview(file)}
                    className="w-full h-24 rounded-xl overflow-hidden mb-3 block"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: fileInfo.bg, color: fileInfo.color }}
                  >
                    {fileInfo.icon}
                  </div>
                )}

                <p className="text-sm font-600 text-slate-200 truncate mb-1" title={file.name}>{file.name}</p>
                <p className="text-xs text-slate-600 mb-3">{formatFileSize(file.size)}</p>

                <Badge variant={file.type === "pdf" ? "red" : "gray"} className="mb-3">
                  {FILE_TYPE_LABELS[file.type] || file.type.toUpperCase()}
                </Badge>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.dataUrl && (
                    <button onClick={() => download(file)} className="flex-1 flex items-center justify-center h-7 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="flex-1 flex items-center justify-center h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((file) => {
            const fileInfo = FILE_ICONS[file.type] || FILE_ICONS.other;
            return (
              <div key={file.id} className="glass-card px-4 py-3 flex items-center gap-4 group hover:-translate-x-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: fileInfo.bg, color: fileInfo.color }}>
                  {fileInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-600">{formatDate(file.createdAt)} • {formatFileSize(file.size)}</p>
                </div>
                <Badge variant="gray">{FILE_TYPE_LABELS[file.type] || "ملف"}</Badge>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.dataUrl && (
                    <button onClick={() => download(file)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-electric-400 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteFile(file.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview lightbox */}
      {preview?.dataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(2,6,16,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setPreview(null)}
        >
          <button className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <img src={preview.dataUrl} alt={preview.name} className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
