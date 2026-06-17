"use client";

import { useState } from "react";
import {
  FolderOpen, Upload, Search, Grid3X3, List,
  Download, Trash2, FileEdit, RefreshCw, Share2,
  Filter, File, Image, FileText, Presentation, Table
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatDate } from "@/lib/utils";

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  public_url?: string;
};

const DEMO_FILES: FileItem[] = [
  { id: "1", name: "تقرير المبيعات 2024.pdf", type: "pdf", size: 2400000, created_at: new Date().toISOString() },
  { id: "2", name: "صورة المستند.png", type: "image", size: 850000, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", name: "عرض الشركة.pptx", type: "pptx", size: 5200000, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "4", name: "جدول البيانات.xlsx", type: "xlsx", size: 180000, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "5", name: "عقد العمل.docx", type: "docx", size: 450000, created_at: new Date(Date.now() - 345600000).toISOString() },
];

const FILE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pdf: { icon: <File className="w-6 h-6" />, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  image: { icon: <Image className="w-6 h-6" />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  docx: { icon: <FileText className="w-6 h-6" />, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  pptx: { icon: <Presentation className="w-6 h-6" />, color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  xlsx: { icon: <Table className="w-6 h-6" />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  other: { icon: <File className="w-6 h-6" />, color: "#64748B", bg: "rgba(100,116,139,0.1)" },
};

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  image: "صورة",
  docx: "Word",
  pptx: "PowerPoint",
  xlsx: "Excel",
  other: "ملف",
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>(DEMO_FILES);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploading, setUploading] = useState(false);

  const filtered = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const deleteFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length) return;

    setUploading(true);
    setTimeout(() => {
      const newItems: FileItem[] = uploadedFiles.map((f) => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        type: f.type.startsWith("image/")
          ? "image"
          : f.name.endsWith(".pdf")
          ? "pdf"
          : f.name.endsWith(".docx")
          ? "docx"
          : f.name.endsWith(".pptx")
          ? "pptx"
          : f.name.endsWith(".xlsx")
          ? "xlsx"
          : "other",
        size: f.size,
        created_at: new Date().toISOString(),
      }));
      setFiles((prev) => [...newItems, ...prev]);
      setUploading(false);
    }, 1000);
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
    <div className="space-y-6">
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
        <label>
          <input type="file" multiple className="hidden" onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png,.docx,.pptx,.xlsx" />
          <Button variant="gold" loading={uploading} className="cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? "جاري الرفع..." : "رفع ملفات"}
          </Button>
        </label>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
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

        {/* Type filter */}
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

        {/* View toggle */}
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
        <div className="text-center py-20 text-slate-600">
          <FolderOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-base font-600 mb-1">لا توجد ملفات</p>
          <p className="text-sm">ارفع ملفاتك أو ابحث بكلمة مختلفة</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => {
            const fileInfo = FILE_ICONS[file.type] || FILE_ICONS.other;
            return (
              <div
                key={file.id}
                className="glass-card p-4 group transition-all hover:-translate-y-0.5"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: fileInfo.bg, color: fileInfo.color }}
                >
                  {fileInfo.icon}
                </div>

                {/* Name */}
                <p className="text-sm font-600 text-slate-200 truncate mb-1" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-600 mb-3">{formatFileSize(file.size)}</p>

                {/* Badge */}
                <Badge variant={file.type === "pdf" ? "red" : "gray"} className="mb-3">
                  {FILE_TYPE_LABELS[file.type] || file.type.toUpperCase()}
                </Badge>

                {/* Actions */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.public_url && (
                    <a href={file.public_url} download className="flex-1 flex items-center justify-center h-7 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </a>
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
        /* List view */
        <div className="space-y-2">
          {filtered.map((file) => {
            const fileInfo = FILE_ICONS[file.type] || FILE_ICONS.other;
            return (
              <div
                key={file.id}
                className="glass-card px-4 py-3 flex items-center gap-4 group hover:-translate-x-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: fileInfo.bg, color: fileInfo.color }}
                >
                  {fileInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-600">{formatDate(file.created_at)} • {formatFileSize(file.size)}</p>
                </div>
                <Badge variant="gray">{FILE_TYPE_LABELS[file.type] || "ملف"}</Badge>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.public_url && (
                    <a href={file.public_url} download className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-electric-400 transition-all">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
