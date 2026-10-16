import React from 'react';
import { BrandMeta } from '../types';
import {
  X,
  Camera,
  Video,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  Film,
  Layers,
} from 'lucide-react';

interface BrandRulesModalProps {
  brand: BrandMeta;
  isOpen: boolean;
  onClose: () => void;
}

export const BrandRulesModal: React.FC<BrandRulesModalProps> = ({
  brand,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'picture' | 'video'>('picture');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pRules = brand.pictureRules;
  const vRules = brand.videoRules;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-md"
              style={{
                backgroundColor: brand.palette.bg,
                color: brand.palette.accent,
                border: `1px solid ${brand.palette.accent}40`,
              }}
            >
              {brand.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{brand.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                  GENERATOR GOVERNANCE RULES
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Rhetorical posture: <span className="text-neutral-200">{brand.posture}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/30 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('picture')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'picture'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            Picture Generator Rules & Anti-Slop Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'video'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video className="w-4 h-4 text-amber-400" />
            Video Generator & Motion Storyboard Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {activeTab === 'picture' && (
            <div className="space-y-6">
              {/* Aspect Ratios & Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Permitted Aspect Ratios
                  </span>
                  <div className="flex gap-2 pt-1">
                    {pRules.aspectRatios.map((ar) => (
                      <span
                        key={ar}
                        className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-700 font-mono text-white text-xs font-bold"
                      >
                        {ar} {ar === '1:1' ? '(Square Feed)' : ar === '16:9' ? '(Widescreen)' : ar === '9:16' ? '(Story/Reel)' : '(Portrait)'}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 pt-1">
                    Strict ratio compliance prevents awkward mobile cropping or platform scaling artifacts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Lighting & Camera Specification
                  </span>
                  <p className="text-white font-medium leading-relaxed">
                    {pRules.lightingAndCamera}
                  </p>
                </div>
              </div>

              {/* Aesthetic Style */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Aesthetic Style & Photographic Grammar
                </span>
                <p className="text-white text-xs leading-relaxed">
                  {pRules.aestheticStyle}
                </p>
                <div className="pt-2 text-[11px] text-neutral-400">
                  <strong>Color Grading Directive:</strong> {pRules.colorGradingDirective}
                </div>
              </div>

              {/* Permitted vs Forbidden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Permitted */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Permitted Photographic Subjects</span>
                  </div>
                  <ul className="space-y-1.5">
                    {pRules.permittedSubjects.map((sub, i) => (
                      <li key={i} className="flex items-start gap-2 text-neutral-300">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Forbidden Anti-AI Slop */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Strictly Forbidden Visual Tropes (Anti-AI Slop)</span>
                  </div>
                  <ul className="space-y-1.5">
                    {pRules.forbiddenVisualTropes.map((trop, i) => (
                      <li key={i} className="flex items-start gap-2 text-neutral-300">
                        <span className="text-red-400 mt-0.5">✕</span>
                        <span>{trop}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Master Prompt Template */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    Master Midjourney / Imagen 3 Prompt Template
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(pRules.promptTemplate, 'master-prompt')}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'master-prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-neutral-300 select-all leading-relaxed">
                  {pRules.promptTemplate}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Video Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Target Duration
                  </span>
                  <div className="text-lg font-bold text-white font-mono">
                    {vRules.defaultDurationSec}s Standard
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Optimized for executive retention & 4-scene cadence.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Aspect Ratios
                  </span>
                  <div className="flex gap-2">
                    {vRules.aspectRatios.map((ar) => (
                      <span
                        key={ar}
                        className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-700 font-mono text-white text-xs font-bold"
                      >
                        {ar}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    9:16 vertical reels & 16:9 widescreen dossiers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Audio Bed Atmosphere
                  </span>
                  <p className="text-xs text-white line-clamp-2">
                    {vRules.audioBedAtmosphere}
                  </p>
                </div>
              </div>

              {/* Pacing & Motion Style */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Pacing Directive & Cut Speed
                </span>
                <p className="text-white leading-relaxed">
                  {vRules.pacingDirective}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Camera Movement & Cinematography
                </span>
                <p className="text-white leading-relaxed">
                  {vRules.motionAndCameraStyle}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Kinetic Typography Overlay Rules
                </span>
                <p className="text-white leading-relaxed">
                  {vRules.kineticTypographyRules}
                </p>
              </div>

              {/* Forbidden Motion Tropes */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Strictly Forbidden Motion Tropes</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vRules.forbiddenMotionTropes.map((trop, i) => (
                    <div key={i} className="flex items-center gap-2 text-neutral-300">
                      <span className="text-red-400">✕</span>
                      <span>{trop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Veo 2 / Runway Gen-3 Directives */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    Google Veo 2 / Runway Gen-3 Model Directives
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(vRules.aiModelDirectives, 'veo-directives')}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'veo-directives' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Directives</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-neutral-300 select-all leading-relaxed">
                  {vRules.aiModelDirectives}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/60 text-xs">
          <span className="text-neutral-400">
            Enforced by Stage 5 Production & Stage 6 Constraint Auditor
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
          >
            Close Rule Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
