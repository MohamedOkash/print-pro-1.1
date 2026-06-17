"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Eye, EyeOff, ZoomIn, X } from "lucide-react";
import { type ScannedPage } from "./ImageUploadZone";
import { buildFilter, type EnhanceSettings } from "./ImageEnhancer";

interface Props {
  pages: ScannedPage[];
  settings: EnhanceSettings;
  selectedIdx: number;
  onSelectIdx: (idx: number) => void;
}

export default function ScannerPreview({ pages, settings, selectedIdx, onSelectIdx }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const page = pages[selectedIdx];
  if (!page) return null;

  const isImage = page.file.type.startsWith("image/");
  const total = pages.length;
  const prev = () => onSelectIdx((selectedIdx - 1 + total) % total);
  const next = () => onSelectIdx((selectedIdx + 1) % total);

  const filter = buildFilter(settings);

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-700 text-slate-200">معاينة مباشرة</span>
            <span className="text-xs text-slate-500 mr-1">
              ({selectedIdx + 1} / {total})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Before / After toggle */}
            {isImage && (
              <button
                onClick={() => setShowOriginal((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
                style={{
                  background: showOriginal ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.12)",
                  border: `1px solid ${showOriginal ? "rgba(59,130,246,0.3)" : "rgba(245,158,11,0.25)"}`,
                  color: showOriginal ? "#60A5FA" : "#F59E0B",
                }}
              >
                {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showOriginal ? "قبل التحسين" : "بعد التحسين"}
              </button>
            )}
            {/* Fullscreen */}
            {isImage && (
              <button
                onClick={() => setLightbox(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main preview */}
        <div className="relative flex items-center justify-center bg-[#0a0f1e] min-h-[360px] sm:min-h-[460px]"
          style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px" }}>

          {isImage ? (
            <img
              src={page.previewUrl}
              alt={page.name}
              className="max-h-[460px] max-w-full object-contain transition-all duration-300 select-none"
              style={{ filter: showOriginal ? "none" : filter, cursor: "zoom-in" }}
              onClick={() => setLightbox(true)}
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-16">
              <span className="text-6xl">📄</span>
              <p className="text-sm text-slate-400">ملف PDF — {page.name}</p>
              <p className="text-xs text-slate-600">المعاينة المرئية تعمل مع الصور فقط</p>
            </div>
          )}

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(6,10,20,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={next}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(6,10,20,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
            </>
          )}

          {/* Filter label badge */}
          {!showOriginal && isImage && (
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-600 text-gold-400"
              style={{ background: "rgba(6,10,20,0.8)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              فلتر مُطبَّق
            </div>
          )}
          {showOriginal && (
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-600 text-blue-400"
              style={{ background: "rgba(6,10,20,0.8)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              الصورة الأصلية
            </div>
          )}
        </div>

        {/* Thumbnails strip */}
        {total > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => onSelectIdx(idx)}
                className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all"
                style={{
                  width: 48, height: 64,
                  border: idx === selectedIdx
                    ? "2px solid #F59E0B"
                    : "2px solid rgba(255,255,255,0.08)",
                  outline: idx === selectedIdx ? "2px solid rgba(245,158,11,0.2)" : "none",
                  outlineOffset: 2,
                }}
              >
                {p.file.type.startsWith("image/") ? (
                  <img
                    src={p.previewUrl}
                    alt={`صفحة ${idx + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: buildFilter(settings) }}
                  />
                ) : (
                  <div className="w-full h-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-xs">📄</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-0.5"
                  style={{ background: "rgba(6,10,20,0.7)" }}>
                  <span className="text-[9px] text-gold-400 font-700">{idx + 1}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      {lightbox && isImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(16px)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-5 left-5 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-5xl w-full flex flex-col items-center gap-4">
            {/* Before / After inside lightbox */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowOriginal(false); }}
                className="px-4 py-1.5 rounded-lg text-xs font-600 transition-all"
                style={{
                  background: !showOriginal ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${!showOriginal ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: !showOriginal ? "#F59E0B" : "#64748b",
                }}
              >
                بعد التحسين
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowOriginal(true); }}
                className="px-4 py-1.5 rounded-lg text-xs font-600 transition-all"
                style={{
                  background: showOriginal ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${showOriginal ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: showOriginal ? "#60A5FA" : "#64748b",
                }}
              >
                الأصلية
              </button>
            </div>

            <img
              src={page.previewUrl}
              alt={page.name}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              style={{ filter: showOriginal ? "none" : filter }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            {total > 1 && (
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button onClick={prev}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-400">{selectedIdx + 1} / {total}</span>
                <button onClick={next}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
