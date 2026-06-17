"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScannedPage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

interface Props {
  pages: ScannedPage[];
  onPagesChange: (pages: ScannedPage[]) => void;
}

export default function ImageUploadZone({ pages, onPagesChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragPageRef = useRef<number | null>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const accepted = Array.from(files).filter(
        (f) =>
          f.type.startsWith("image/") ||
          f.type === "application/pdf"
      );
      const newPages: ScannedPage[] = accepted.map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
      }));
      onPagesChange([...pages, ...newPages]);
    },
    [pages, onPagesChange]
  );

  const removePage = (id: string) => {
    const page = pages.find((p) => p.id === id);
    if (page) URL.revokeObjectURL(page.previewUrl);
    onPagesChange(pages.filter((p) => p.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // Page reorder via drag
  const handlePageDragStart = (idx: number) => {
    dragPageRef.current = idx;
  };

  const handlePageDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragPageRef.current;
    if (from === null || from === idx) return;
    const updated = [...pages];
    const [moved] = updated.splice(from, 1);
    updated.splice(idx, 0, moved);
    dragPageRef.current = idx;
    onPagesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn("upload-zone p-10 text-center", dragging && "drag-over")}
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
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Upload className="w-7 h-7 text-gold-400" />
          </div>
          <div>
            <p className="text-base font-600 text-slate-200 mb-1">
              اسحب الصور أو اضغط للاختيار
            </p>
            <p className="text-sm text-slate-500">
              يدعم: JPG، PNG، WebP، PDF • يمكنك تحديد عدة ملفات دفعة واحدة
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-sm font-600 text-gold-400"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            اختر الملفات
          </div>
        </div>
      </div>

      {/* Pages grid */}
      {pages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-600 text-slate-300">
              {pages.length} {pages.length === 1 ? "صفحة" : "صفحات"}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة المزيد
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => handlePageDragStart(idx)}
                onDragOver={(e) => handlePageDragOver(e, idx)}
                className="relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Thumbnail */}
                {page.file.type.startsWith("image/") ? (
                  <img
                    src={page.previewUrl}
                    alt={page.name}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] flex items-center justify-center bg-red-500/10">
                    <span className="text-3xl">📄</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <GripVertical className="w-5 h-5 text-white/60" />
                </div>

                {/* Page number */}
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-navy-900/80 flex items-center justify-center">
                  <span className="text-xs text-gold-400 font-700">{idx + 1}</span>
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2">اسحب الصفحات لإعادة ترتيبها</p>
        </div>
      )}
    </div>
  );
}
