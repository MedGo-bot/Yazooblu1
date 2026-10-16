import React, { useState } from 'react';
import { BRANDS, BrandKey } from '../types';
import { BrandLogo } from './BrandLogo';
import { BrandIdentityModal } from './BrandIdentityModal';
import {
  Palette,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BrandTabsProps {
  selectedBrandKey: BrandKey;
  onSelectBrand: (brandKey: BrandKey) => void;
  brandCounts?: Record<BrandKey, { total: number; pending: number; approved: number }>;
}

const BRAND_SHORT_NAMES: Record<BrandKey, string> = {
  bes_outkast: 'Bes Outkast Society',
  fyrrion: 'Fyrrion Cybersecurity',
  nuecofab: 'Nuecofab Clean-Tech',
  creatives: 'Consortium of Creatives',
  bhw_pr: 'BH&W PR Firm',
  porch_md: 'Porch MD',
  hilton_head: 'Hilton Head Luxury Shuttles',
};

const ORDERED_BRAND_KEYS: BrandKey[] = [
  'bes_outkast',
  'fyrrion',
  'nuecofab',
  'creatives',
  'bhw_pr',
  'porch_md',
  'hilton_head',
];

export const BrandTabs: React.FC<BrandTabsProps> = ({
  selectedBrandKey,
  onSelectBrand,
  brandCounts,
}) => {
  const brandKeys = ORDERED_BRAND_KEYS;
  const [modalBrandKey, setModalBrandKey] = useState<BrandKey | null>(null);

  return (
    <div className="w-full mb-8">
      {/* Brand Identity & Theme Focus Modal */}
      {modalBrandKey && (
        <BrandIdentityModal
          isOpen={!!modalBrandKey}
          onClose={() => setModalBrandKey(null)}
          brandKey={modalBrandKey}
        />
      )}

      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
              Sovereign Brand Portfolios & Studios
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              Official Logos & Color Themes
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Click any brand card to enter its dedicated 8-stage studio canvas, or click the theme icon to inspect its official logo & colors.
          </p>
        </div>
        <div className="text-xs text-neutral-500 font-mono hidden sm:flex items-center gap-2">
          <span>7 Distinct Visual Identities</span>
        </div>
      </div>

      {/* Large Brand Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {brandKeys.map((key) => {
          const brand = BRANDS[key];
          const isSelected = selectedBrandKey === key;
          const counts = brandCounts?.[key];

          return (
            <div
              key={key}
              className={`relative flex flex-col rounded-xl border transition-all text-neutral-200 overflow-hidden group ${
                isSelected
                  ? 'bg-neutral-900/95 shadow-xl border-neutral-600 ring-1'
                  : 'bg-neutral-950/75 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700/80'
              }`}
              style={{
                borderColor: isSelected ? brand.palette.accent : undefined,
                boxShadow: isSelected
                  ? `0 12px 28px -6px ${brand.palette.accent}25`
                  : undefined,
              }}
            >
              {/* Brand Color Top Indicator Bar */}
              <div
                className="w-full h-1.5 transition-all"
                style={{
                  backgroundColor: brand.palette.accent,
                  opacity: isSelected ? 1 : 0.45,
                }}
              />

              {/* Card Body Clickable */}
              <button
                type="button"
                onClick={() => onSelectBrand(key)}
                className="flex flex-col text-left p-3.5 flex-1 cursor-pointer w-full focus:outline-none"
              >
                {/* Header Row: Logo & Status Tag */}
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center p-0.5 border shadow-sm transition-transform group-hover:scale-105 shrink-0"
                    style={{
                      borderColor: `${brand.palette.accent}40`,
                      backgroundColor: brand.palette.bg,
                    }}
                  >
                    <BrandLogo brandKey={key} size="sm" />
                  </div>

                  {isSelected ? (
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{
                        backgroundColor: `${brand.palette.accent}25`,
                        color: brand.palette.accent,
                      }}
                    >
                      Active Studio
                    </span>
                  ) : counts && counts.total > 0 ? (
                    <span className="text-[10px] font-mono text-neutral-400">
                      {counts.total} pkg
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">
                      Studio
                    </span>
                  )}
                </div>

                {/* Brand Name & Archetype */}
                <div className="mt-0.5">
                  <div className="font-bold text-xs text-white leading-tight truncate">
                    {BRAND_SHORT_NAMES[key]}
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug line-clamp-2 mt-1">
                    {brand.archetype}
                  </div>
                </div>

                {/* Color Theme Swatches Row */}
                <div className="mt-3 pt-2 border-t border-neutral-800/70 flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: brand.palette.accent }}
                      title={`Accent: ${brand.palette.names.accent} (${brand.palette.accent})`}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: brand.palette.secondary }}
                      title={`Secondary: ${brand.palette.names.secondary} (${brand.palette.secondary})`}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: brand.palette.bg }}
                      title={`Background: ${brand.palette.names.bg} (${brand.palette.bg})`}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition flex items-center">
                    Enter <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </button>

              {/* Bottom Quick Focus Bar */}
              <div className="px-3.5 py-1.5 bg-neutral-950/60 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalBrandKey(key);
                  }}
                  className="text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer font-medium"
                  title={`Inspect ${brand.name} official logo and color theme`}
                >
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span>Logo & Theme</span>
                </button>

                <span
                  className="font-mono text-[9px] truncate max-w-[70px]"
                  style={{ color: brand.palette.accent }}
                >
                  {brand.palette.accent}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
