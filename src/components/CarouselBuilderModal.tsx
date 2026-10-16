import React, { useState, useRef } from 'react';
import { BrandMeta, Channel } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Edit3,
  Share2,
  FileText,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export interface CarouselSlide {
  slideNumber: number;
  tag: string;
  headline: string;
  body: string;
  bulletPoints?: string[];
  footerNote: string;
}

interface CarouselBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandMeta;
  topic: string;
  hook: string;
  channel: Channel;
}

export const CarouselBuilderModal: React.FC<CarouselBuilderModalProps> = ({
  isOpen,
  onClose,
  brand,
  topic,
  hook,
  channel,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Generate 5 brand-governed slides
  const [slides, setSlides] = useState<CarouselSlide[]>([
    {
      slideNumber: 1,
      tag: `${brand.name.toUpperCase()} • DISPATCH`,
      headline: hook || `When evaluating ${topic.toLowerCase()}, standard assumptions fail.`,
      body: `A deep-dive analysis by ${brand.name} into structural permanence, rejecting cosmetic shortcuts.`,
      footerNote: 'SWIPE TO INSPECT PROTOCOL ➔',
    },
    {
      slideNumber: 2,
      tag: '01 / THE STRUCTURAL FRICTION',
      headline: 'The Conventional Blindspot',
      body: `Most participants treat ${topic.toLowerCase()} as a transient cosmetic issue. In high-stakes environments, this error creates compounding structural risk.`,
      bulletPoints: [
        `Ignoring fundamental ${brand.lexicon[0].toLowerCase()}`,
        'Sacrificing long-term durability for rapid optics',
        'Confusing marketing rhetoric with evidentiary reality',
      ],
      footerNote: 'CONTINUE TO DIAGNOSTIC ➔',
    },
    {
      slideNumber: 3,
      tag: '02 / EVIDENTIARY TELEMETRY',
      headline: 'The Telemetry Standard',
      body: `When we evaluate outcomes through the lens of ${brand.lexicon[1] || brand.lexicon[0]}, ambiguity disappears. True authority requires verifiable baseline benchmarks.`,
      bulletPoints: [
        'Objective telemetry over emotional sentiment',
        'Zero tolerance for unverified assumptions',
        'Measure the cost of failure before committing capital',
      ],
      footerNote: 'CONTINUE TO EXECUTION PROTOCOL ➔',
    },
    {
      slideNumber: 4,
      tag: '03 / THE GOVERNING PROTOCOL',
      headline: 'Three Non-Negotiable Directives',
      body: `To establish enduring standards and insulate operations against systemic compromise:`,
      bulletPoints: [
        `1. Calibrate to ${brand.lexicon[0]}: Establish baseline purity.`,
        '2. Eliminate cosmetic expedients: Treat the root cause.',
        '3. Demand repeatable evidence: Validate every milestone.',
      ],
      footerNote: 'CONTINUE TO CONCLUSION ➔',
    },
    {
      slideNumber: 5,
      tag: '04 / CONCLUSION & ARCHIVE',
      headline: 'Measure What Endures.',
      body: `True mastery is recognized not in the volume of claims made, but in the measurable permanence of execution. Ground your decisions in evidentiary reality.`,
      bulletPoints: [
        `Official dossier by ${brand.name}`,
        'Save this carousel to your resource board for reference',
        'Share with senior leadership facing this decision',
      ],
      footerNote: `${brand.archetype.toUpperCase()} ARCHIVE`,
    },
  ]);

  if (!isOpen) return null;

  const currentSlide = slides[activeSlideIndex];

  const handleUpdateCurrentSlide = (field: keyof CarouselSlide, val: any) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: val } : s))
    );
  };

  const handleCopyAllCopy = () => {
    const fullText = slides
      .map(
        (s) =>
          `[SLIDE ${s.slideNumber}: ${s.tag}]\nHEADLINE: ${s.headline}\nBODY: ${s.body}\n${
            s.bulletPoints ? s.bulletPoints.map((b) => `• ${b}`).join('\n') + '\n' : ''
          }FOOTER: ${s.footerNote}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportTextPackage = () => {
    const fullText = slides
      .map(
        (s) =>
          `[SLIDE ${s.slideNumber}: ${s.tag}]\n${s.headline}\n\n${s.body}\n\n${
            s.bulletPoints ? s.bulletPoints.map((b) => `• ${b}`).join('\n') + '\n' : ''
          }\n${s.footerNote}`
      )
      .join('\n\n========================================\n\n');

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.key}-carousel-5-slides.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo brandKey={brand.key} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {brand.name} • 5-Slide Carousel Deck Exporter
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                  LINKEDIN & INSTAGRAM READY
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generates high-engagement multi-panel swipe decks formatted for LinkedIn PDF carousels and Instagram multi-post grids.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Workspace Grid: Preview (Left) vs Live Editor (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Visual Slide Preview (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-mono text-neutral-400">
                <span>Slide Aspect:</span>
                <button
                  type="button"
                  onClick={() => setAspectRatio('4:5')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    aspectRatio === '4:5'
                      ? 'bg-amber-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  4:5 (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    aspectRatio === '1:1'
                      ? 'bg-amber-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  1:1 (Square)
                </button>
              </div>

              <span className="font-mono text-neutral-400 text-[11px]">
                Slide <strong>{activeSlideIndex + 1}</strong> of 5
              </span>
            </div>

            {/* Interactive Rendered Slide Preview */}
            <div className="w-full flex justify-center bg-black/60 p-4 rounded-2xl border border-neutral-800 shadow-2xl">
              <div
                className={`relative rounded-xl border flex flex-col justify-between p-6 transition-all duration-300 shadow-2xl select-none ${
                  aspectRatio === '4:5'
                    ? 'w-[320px] h-[400px]'
                    : 'w-[340px] h-[340px]'
                }`}
                style={{
                  backgroundColor: brand.palette.bg,
                  borderColor: `${brand.palette.accent}66`,
                  color: brand.palette.text,
                }}
              >
                {/* Subtle Radial Gradient Accent */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none rounded-xl"
                  style={{
                    background: `radial-gradient(circle at 80% 20%, ${brand.palette.accent}, transparent 60%)`,
                  }}
                />

                {/* Slide Header */}
                <div className="relative z-10 flex items-center justify-between border-b pb-2.5" style={{ borderColor: `${brand.palette.accent}33` }}>
                  <div className="flex items-center gap-2">
                    <BrandLogo brandKey={brand.key} size="xs" />
                    <span className="text-[10px] font-mono tracking-widest font-bold uppercase" style={{ color: brand.palette.accent }}>
                      {currentSlide.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">
                    {activeSlideIndex + 1}/5
                  </span>
                </div>

                {/* Slide Body / Content */}
                <div className="relative z-10 my-auto space-y-3 py-2">
                  <h4 className="text-base font-extrabold tracking-tight leading-snug drop-shadow-sm">
                    {currentSlide.headline}
                  </h4>
                  <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                    {currentSlide.body}
                  </p>

                  {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {currentSlide.bulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] leading-tight">
                          <span className="font-bold" style={{ color: brand.palette.accent }}>
                            •
                          </span>
                          <span className="opacity-85">{bp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slide Footer */}
                <div className="relative z-10 flex items-center justify-between pt-2.5 border-t text-[9px] font-mono tracking-wider font-semibold" style={{ borderColor: `${brand.palette.accent}33` }}>
                  <span className="opacity-70">{brand.name}</span>
                  <span style={{ color: brand.palette.accent }}>
                    {currentSlide.footerNote}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons & Filmstrip */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSlideIndex((p) => Math.max(0, p - 1))}
                disabled={activeSlideIndex === 0}
                className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* 5 Slide Indicator Dots */}
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center border ${
                      activeSlideIndex === idx
                        ? 'bg-amber-400 text-neutral-950 border-amber-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlideIndex((p) => Math.min(slides.length - 1, p + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Slide Editor & Export Controls (5 cols) */}
          <div className="md:col-span-5 space-y-4 bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                Editing Slide {activeSlideIndex + 1} Content
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Live Sync</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-mono text-[11px]">
                  Category Tag:
                </label>
                <input
                  type="text"
                  value={currentSlide.tag}
                  onChange={(e) => handleUpdateCurrentSlide('tag', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-mono text-[11px]">
                  Slide Headline:
                </label>
                <textarea
                  rows={2}
                  value={currentSlide.headline}
                  onChange={(e) => handleUpdateCurrentSlide('headline', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-mono text-[11px]">
                  Body Narrative:
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.body}
                  onChange={(e) => handleUpdateCurrentSlide('body', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-mono text-[11px]">
                  Call to Action Footer:
                </label>
                <input
                  type="text"
                  value={currentSlide.footerNote}
                  onChange={(e) => handleUpdateCurrentSlide('footerNote', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>
            </div>

            {/* Export Actions */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <button
                type="button"
                onClick={handleCopyAllCopy}
                className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied All 5 Slides to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Slides Copywriting</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportTextPackage}
                className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export 5-Slide Package (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
