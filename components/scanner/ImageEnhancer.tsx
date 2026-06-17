"use client";

import { Sun, Contrast, Palette, RotateCcw, Droplet } from "lucide-react";

export interface EnhanceSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: boolean;
  sharpen: boolean;
  invert: boolean;
  sepia: boolean;
}

const defaultSettings: EnhanceSettings = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: false,
  sharpen: false,
  invert: false,
  sepia: false,
};

/* Shared CSS filter string — used by both the live preview and the PDF export
   so what you see is exactly what you get. */
function buildFilter(s: EnhanceSettings): string {
  return [
    `brightness(${s.brightness}%)`,
    `contrast(${s.contrast}%)`,
    `saturate(${s.sharpen ? s.saturate + 20 : s.saturate}%)`,
    s.grayscale ? "grayscale(100%)" : "",
    s.sepia ? "sepia(70%)" : "",
    s.invert ? "invert(100%)" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type Preset = { id: string; label: string; emoji: string; patch: Partial<EnhanceSettings> };
const PRESETS: Preset[] = [
  { id: "original", label: "أصلي",    emoji: "🖼️", patch: { ...defaultSettings } },
  { id: "document", label: "مستند",   emoji: "📄", patch: { grayscale: true, contrast: 150, brightness: 110, sepia: false, invert: false, saturate: 100 } },
  { id: "bw",       label: "أبيض وأسود", emoji: "⚫", patch: { grayscale: true, contrast: 200, brightness: 105, sepia: false, invert: false, saturate: 100 } },
  { id: "warm",     label: "دافئ",    emoji: "🟤", patch: { sepia: true, grayscale: false, invert: false, contrast: 110, brightness: 105, saturate: 100 } },
  { id: "vivid",    label: "زاهي",    emoji: "🌈", patch: { saturate: 160, contrast: 120, brightness: 105, grayscale: false, sepia: false, invert: false } },
  { id: "invert",   label: "عكس الألوان", emoji: "🔄", patch: { invert: true } },
];

interface Props {
  settings: EnhanceSettings;
  onSettingsChange: (s: EnhanceSettings) => void;
  disabled?: boolean;
}

export default function ImageEnhancer({ settings, onSettingsChange, disabled }: Props) {
  const update = (key: keyof EnhanceSettings, value: number | boolean) =>
    onSettingsChange({ ...settings, [key]: value });

  const applyPreset = (p: Preset) =>
    onSettingsChange({ ...settings, ...p.patch });

  const reset = () => onSettingsChange(defaultSettings);

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-700 text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-gold-400" />
          تحسين الصورة
        </h3>
        <button
          onClick={reset}
          disabled={disabled}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          إعادة تعيين
        </button>
      </div>

      {/* Filter presets */}
      <div>
        <p className="text-xs text-slate-500 mb-2">فلاتر جاهزة</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-600 text-slate-300 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-lg leading-none">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brightness */}
      <Slider
        icon={<Sun className="w-3.5 h-3.5 text-yellow-400" />}
        label="السطوع" value={settings.brightness} min={50} max={200} accent="#F59E0B"
        onChange={(v) => update("brightness", v)} disabled={disabled}
      />

      {/* Contrast */}
      <Slider
        icon={<Contrast className="w-3.5 h-3.5 text-blue-400" />}
        label="التباين" value={settings.contrast} min={50} max={200} accent="#3B82F6"
        onChange={(v) => update("contrast", v)} disabled={disabled}
      />

      {/* Saturation */}
      <Slider
        icon={<Droplet className="w-3.5 h-3.5 text-emerald-400" />}
        label="التشبع" value={settings.saturate} min={0} max={200} accent="#10B981"
        onChange={(v) => update("saturate", v)} disabled={disabled}
      />

      {/* Toggles */}
      <div className="flex gap-2 flex-wrap">
        <ToggleChip active={settings.grayscale} onClick={() => update("grayscale", !settings.grayscale)} label="رمادي" disabled={disabled} />
        <ToggleChip active={settings.sepia} onClick={() => update("sepia", !settings.sepia)} label="بُني" disabled={disabled} />
        <ToggleChip active={settings.invert} onClick={() => update("invert", !settings.invert)} label="عكس الألوان" disabled={disabled} />
        <ToggleChip active={settings.sharpen} onClick={() => update("sharpen", !settings.sharpen)} label="حدة" disabled={disabled} />
      </div>
    </div>
  );
}

function Slider({
  icon, label, value, min, max, accent, onChange, disabled,
}: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number;
  accent: string; onChange: (v: number) => void; disabled?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400 flex items-center gap-1.5">{icon}{label}</label>
        <span className="text-xs text-gold-400 font-600">{value}%</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(+e.target.value)} disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${accent} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
      />
    </div>
  );
}

function ToggleChip({
  active, onClick, label, disabled,
}: {
  active: boolean; onClick: () => void; label: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-200"
      style={{
        background: active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#F59E0B" : "#94a3b8",
      }}
    >
      {active ? "✓ " : ""}{label}
    </button>
  );
}

export { defaultSettings, buildFilter };
