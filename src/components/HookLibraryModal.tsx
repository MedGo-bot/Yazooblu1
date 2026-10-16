import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Search,
  ArrowRight,
  Hash,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { HOOK_LIBRARY, CHANNEL_SPECS, Channel, BrandMeta } from '../types';

interface HookLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHook: (hookText: string) => void;
  activeBrand: BrandMeta;
  defaultChannel?: Channel;
}

export const HookLibraryModal: React.FC<HookLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectHook,
  activeBrand,
  defaultChannel = 'LinkedIn',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    defaultChannel.toLowerCase().split(' ')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const platforms = Object.keys(HOOK_LIBRARY);
  const currentHooks = HOOK_LIBRARY[selectedPlatform] || [];

  const filteredHooks = currentHooks.filter((hook) =>
    searchQuery.trim()
      ? hook.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCharLimitInfo = (platformKey: string) => {
    switch (platformKey) {
      case 'bluesky':
        return { limit: 300, desc: '300 character limit • Intellectual discourse' };
      case 'threads':
        return { limit: 300, desc: '300 character limit • Conversational tension' };
      case 'pinterest':
        return { limit: 800, desc: '800 character limit • Rich SEO pin guide' };
      case 'x':
        return { limit: 260, desc: '260 character limit • Sharp punch' };
      case 'tiktok':
        return { limit: 250, desc: 'Video hook with 3-second retention cue' };
      case 'linkedin':
        return { limit: 2500, desc: '150-250 words • Executive balance sheet focus' };
      case 'instagram':
        return { limit: 2200, desc: 'Visual narrative with structured line breaks' };
      case 'youtube':
        return { limit: 5000, desc: 'Paced script cue with high-stakes retention' };
      case 'facebook':
        return { limit: 4000, desc: 'Executive community narrative' };
      default:
        return { limit: null, desc: 'Algorithmic psychology hook' };
    }
  };

  const currentInfo = getCharLimitInfo(selectedPlatform);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Algorithmic Hook Library
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Calibrated Psychology
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                80+ verified hook archetypes optimized for platform algorithms and audience retention.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="px-5 pt-3 border-b border-neutral-800 flex gap-1.5 overflow-x-auto scrollbar-none bg-neutral-950/40">
          {platforms.map((plat) => {
            const isSelected = selectedPlatform === plat;
            const info = getCharLimitInfo(plat);
            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-2 rounded-t-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-800 text-amber-400 border-t-2 border-amber-400'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <span>{plat}</span>
                {info.limit && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      info.limit <= 300
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : info.limit <= 800
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {info.limit}c
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Platform Character Constraint Info & Search */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-amber-400 uppercase font-bold">
              {selectedPlatform}:
            </span>
            <span className="text-neutral-300">{currentInfo.desc}</span>
            {currentInfo.limit && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Max {currentInfo.limit} chars
              </span>
            )}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder={`Search ${selectedPlatform} hooks...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Hook List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredHooks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No hooks found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredHooks.map((hook, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                      ARCHETYPE #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      ~{hook.length} chars template
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                    {hook}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopy(hook, idx)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Copy template"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectHook(hook);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <span>Apply to Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeBrand.palette.accent }}
            />
            <span>
              Active Brand: <strong className="text-white">{activeBrand.name}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
