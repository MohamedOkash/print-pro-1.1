"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, X, ZoomIn, Wand2, Eye } from "lucide-react";
import { type ScannedPage } from "./ImageUploadZone";
import { buildFilter, type EnhanceSettings } from "./ImageEnhancer";

interface Props {
  pages: ScannedPage[];
  settings: EnhanceSettings;
  selectedIdx: number;
  onSelectIdx: (idx: number) => void;
}

export default function ScannerPreview({ pages, settings, selectedIdx, onSelectIdx }: Props) {
  const [compareMode, setCompareMode] = useState(false); // hold to compare original
  const [lightbox,    setLightbox]    = useState(false);

  const page  = pages[selectedIdx];
  const total = pages.length;
  if (!page) return null;

  const filter = buildFilter(settings);
  const prev = () => onSelectIdx((selectedIdx - 1 + total) % total);
  const next = () => onSelectIdx((selectedIdx + 1) % total);

  const isFiltered = !compareMode;

  return (
    <>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-700 text-slate-200">معاينة مباشرة</span>
            <span className="text-xs text-slate-500">({selectedIdx + 1} / {total})</span>
            {settings.smartWhiten && (
              <span className="flex items-center gap-1 text-[10px] font-700 px-2 py-0.5 rounded-full text-gold-400"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <Wand2 className="w-2.5 h-2.5" />تبييض ذكي
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Compare hold button */}
            <button
              onMouseDown={() => setCompareMode(true)}
              onMouseUp={() => setCompareMode(false)}
              onMouseLeave={() => setCompareMode(false)}
              onTouchStart={() => setCompareMode(true)}
              onTouchEnd={() => setCompareMode(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 select-none transition-all"
              style={{
                background: compareMode ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${compareMode ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: compareMode ? "#60A5FA" : "#64748b",
              }}
            >
              <Eye className="w-3 h-3" />
              {compareMode ? "الأصلية" : "اضغط للمقارنة"}
            </button>
            {/* Fullscreen */}
            <button onClick={() => setLightbox(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main image area */}
        <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[500px]"
          style={{
            background: "repeating-conic-gradient(rgba(255,255,255,0.025) 0% 25%, transparent 0% 50%) 0 0 / 18px 18px, #060A14",
          }}>
          <img
            src={page.previewUrl}
            alt={page.name}
            draggable={false}
            onClick={() => setLightbox(true)}
            className="max-h-[500px] max-w-full object-contain select-none transition-all duration-200"
            style={{
              filter: isFiltered ? filter : "none",
              cursor: "zoom-in",
            }}
          />

          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button onClick={prev}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(6,10,20,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronRight className="w-5 h-5 text-slate-200" />
              </button>
              <button onClick={next}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(6,10,20,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronLeft className="w-5 h-5 text-slate-200" />
              </button>
            </>
          )}

          {/* Status badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-700 transition-all"
            style={{
              background: "rgba(6,10,20,0.85)",
              border: `1px solid ${isFiltered ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.3)"}`,
              color: isFiltered ? "#F59E0B" : "#60A5FA",
            }}>
            {isFiltered ? (settings.smartWhiten ? "✦ تبييض ذكي مُطبَّق" : "✦ فلتر مُطبَّق") : "الصورة الأصلية"}
          </div>
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {pages.map((p, idx) => (
              <button key={p.id} onClick={() => onSelectIdx(idx)}
                className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all hover:scale-105"
                style={{
                  width: 44, height: 60,
                  border:   idx === selectedIdx ? "2px solid #F59E0B" : "2px solid rgba(255,255,255,0.08)",
                  outline:  idx === selectedIdx ? "2px solid rgba(245,158,11,0.2)" : "none",
                  outlineOffset: 2,
                }}>
                <img
                  src={p.previewUrl}
                  alt={`${idx + 1}`}
                  className="w-full h-full object-cover"
                  style={{ filter }}   // thumbnails also reflect current filter live
                />
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-center"
                  style={{ background: "rgba(6,10,20,0.7)" }}>
                  <span className="text-[8px] text-gold-400 font-700 py-0.5">{idx + 1}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
          onClick={() => setLightbox(false)}
        >
          <button onClick={() => setLightbox(false)}
            className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all z-10">
            <X className="w-5 h-5" />
          </button>

          {/* Before / After toggle in lightbox */}
          <div className="flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCompareMode(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-600 transition-all"
              style={{
                background: !compareMode ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${!compareMode ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: !compareMode ? "#F59E0B" : "#64748b",
              }}>
              {settings.smartWhiten ? "✦ تبييض ذكي" : "✦ بعد التحسين"}
            </button>
            <button onClick={() => setCompareMode(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-600 transition-all"
              style={{
                background: compareMode ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${compareMode ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: compareMode ? "#60A5FA" : "#64748b",
              }}>
              الأصلية
            </button>
          </div>

          <img
            src={page.previewUrl}
            alt={page.name}
            draggable={false}
            className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            style={{ filter: compareMode ? "none" : filter }}
            onClick={(e) => e.stopPropagation()}
          />

          {total > 1 && (
            <div className="flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
              <button onClick={prev}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-400 font-600">{selectedIdx + 1} / {total}</span>
              <button onClick={next}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
