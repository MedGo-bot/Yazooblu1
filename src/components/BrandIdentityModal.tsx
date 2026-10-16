import React, { useState } from 'react';
import { BrandMeta, BRANDS, BrandKey } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  X,
  Copy,
  Check,
  Download,
  Palette,
  Camera,
  Film,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKey: BrandKey;
}

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({
  isOpen,
  onClose,
  brandKey,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const brand: BrandMeta = BRANDS[brandKey];

  if (!isOpen) return null;

  const handleCopy = (colorName: string, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const paletteEntries = [
    {
      name: brand.palette.names.accent,
      role: 'Primary Accent & Emblems',
      hex: brand.palette.accent,
      rgb: `rgb(${brand.palette.accentRgb.join(', ')})`,
    },
    {
      name: brand.palette.names.secondary,
      role: 'Secondary Depth & Monogram',
      hex: brand.palette.secondary,
      rgb: `rgb(${brand.palette.secondaryRgb.join(', ')})`,
    },
    {
      name: brand.palette.names.bg,
      role: 'Base Mat & Monolith Void',
      hex: brand.palette.bg,
      rgb: `rgb(${brand.palette.bgRgb.join(', ')})`,
    },
    {
      name: brand.palette.names.text,
      role: 'Newsprint & Typography',
      hex: brand.palette.text,
      rgb: `rgb(${brand.palette.textRgb.join(', ')})`,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-identity-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-950 border rounded-2xl shadow-2xl overflow-hidden"
        style={{ borderColor: `${brand.palette.accent}50` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60"
          style={{ borderBottomColor: `${brand.palette.accent}30` }}
        >
          <div className="flex items-center gap-3">
            <BrandLogo brandKey={brandKey} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${brand.palette.accent}25`,
                    color: brand.palette.accent,
                  }}
                >
                  Official Brand Identity
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Autonomous Persona Matrix
                </span>
              </div>
              <h2 id="brand-identity-title" className="text-lg font-bold text-white mt-0.5">
                {brand.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Close brand identity modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Section: Hero Logo & Identity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800/80">
            {/* Hero Logo Display */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 shadow-inner">
              <BrandLogo brandKey={brandKey} size="hero" />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Official Vector Emblem
                </span>
                <span className="text-xs text-neutral-300 font-medium">
                  {brandKey === 'bhw_pr'
                    ? 'BH&W Public Relations Firm Sovereign Crest'
                    : `${brand.name} Monogram Mark`}
                </span>
              </div>
            </div>

            {/* Brand Essence & Rules */}
            <div className="md:col-span-7 space-y-3.5">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Brand Archetype & Stature
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {brand.archetype}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {brand.posture}
                </p>
              </div>

              {brand.logoDescription && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block mb-1">
                    Visual Crest Architecture:
                  </span>
                  {brand.logoDescription}
                </div>
              )}

              {/* Negative Constraint */}
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-xs">
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold block mb-0.5">
                  Absolute Negative Constraint:
                </span>
                <p className="text-red-200/90 leading-snug">
                  {brand.negativeConstraints}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="text-[10px] text-neutral-500 font-mono">Forbidden words:</span>
                  {brand.forbiddenWords.map((word) => (
                    <span
                      key={word}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-red-300 line-through"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette Focus */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Brand Color Architecture & Theme Swatches
                </h3>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Click any swatch to copy HEX code
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {paletteEntries.map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => handleCopy(swatch.name, swatch.hex)}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 transition cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-10 h-10 rounded-lg shadow-md border border-white/10 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="p-1.5 rounded-lg bg-neutral-950/80 text-neutral-400 group-hover:text-white transition">
                      {copiedColor === swatch.name ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    {swatch.role}
                  </span>
                  <span className="text-xs font-bold text-white mt-0.5 truncate">
                    {swatch.name}
                  </span>
                  <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-200 font-semibold">{swatch.hex}</span>
                    <span className="text-neutral-500 text-[10px]">{swatch.rgb}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Picture & Video Generator Rules for this Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Picture Generator Rules */}
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Picture Generator Rules
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Aesthetic Directive:
                  </span>
                  <p className="text-neutral-300 leading-snug">
                    {brand.pictureRules.aestheticStyle}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Lighting & Prime Camera:
                  </span>
                  <p className="text-neutral-300 leading-snug">
                    {brand.pictureRules.lightingAndCamera}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Supported Aspect Ratios:
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    {brand.pictureRules.aspectRatios.map((ar) => (
                      <span
                        key={ar}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300"
                      >
                        {ar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Generator Rules */}
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                <Film className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Video Generator Rules
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Pacing & Motion:
                  </span>
                  <p className="text-neutral-300 leading-snug">
                    {brand.videoRules.pacingDirective}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Audio Bed Atmosphere:
                  </span>
                  <p className="text-neutral-300 leading-snug">
                    {brand.videoRules.audioBedAtmosphere}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Duration & Format:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                      {brand.videoRules.defaultDurationSec}s target
                    </span>
                    {brand.videoRules.aspectRatios.map((ar) => (
                      <span
                        key={ar}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300"
                      >
                        {ar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lexicon Vocabulary Anchors */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
              Mandatory Brand Lexicon Anchors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {brand.lexicon.map((term) => (
                <span
                  key={term}
                  className="text-xs px-2.5 py-1 rounded-lg border font-mono font-medium"
                  style={{
                    backgroundColor: `${brand.palette.accent}12`,
                    borderColor: `${brand.palette.accent}30`,
                    color: brand.palette.accent,
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px]">
            Brand colors & typography calibrated to official logo assets
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-200 transition cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
