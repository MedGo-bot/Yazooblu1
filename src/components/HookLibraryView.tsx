import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Search,
  ExternalLink,
  Send,
  Sliders,
  Filter,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';
import {
  HOOK_LIBRARY,
  CHANNEL_SPECS,
  BRANDS,
  BrandKey,
  Channel,
} from '../types';

interface HookLibraryViewProps {
  onUseHookInStudio: (hookText: string, channel: Channel) => void;
}

export const HookLibraryView: React.FC<HookLibraryViewProps> = ({
  onUseHookInStudio,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('bluesky');
  const [selectedBrandKey, setSelectedBrandKey] = useState<BrandKey>('fyrrion');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeBrand = BRANDS[selectedBrandKey];
  const platforms = Object.keys(HOOK_LIBRARY);
  const hooks = HOOK_LIBRARY[selectedPlatform] || [];

  const filteredHooks = hooks.filter((h) =>
    searchQuery.trim() ? h.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getPlatformChannel = (key: string): Channel => {
    switch (key) {
      case 'bluesky':
        return 'Bluesky';
      case 'threads':
        return 'Threads';
      case 'pinterest':
        return 'Pinterest';
      case 'tiktok':
        return 'TikTok';
      case 'x':
        return 'X';
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
      default:
        return 'LinkedIn';
    }
  };

  const currentChannel = getPlatformChannel(selectedPlatform);
  const channelSpec = CHANNEL_SPECS[currentChannel];

  // Helper to contextualize hook for active brand
  const contextualizeHook = (template: string) => {
    return template
      .replace(/\[X\]/g, activeBrand.sampleTopics[0] || 'strategic directive')
      .replace(/\[Entity\]/g, activeBrand.name)
      .replace(/\[Common Belief\]/g, 'standard marketing sentiment')
      .replace(/\[Common Scapegoat\]/g, 'macro turbulence')
      .replace(/\[Industry\]/g, 'this sector')
      .replace(/\[Method A\]/g, 'conventional practices')
      .replace(/\[Method B\]/g, activeBrand.lexicon[0])
      .replace(/\[Standard Practice\]/g, 'cosmetic shortcuts')
      .replace(/\[System\/Organization\]/g, 'the enterprise')
      .replace(/\[System\]/g, 'the architecture')
      .replace(/\[Subject\]/g, activeBrand.sampleTopics[0] || 'core governance')
      .replace(/\[State A\]/g, 'operational friction')
      .replace(/\[State B\]/g, 'definitive clarity')
      .replace(/\[Industry Gatekeeper\]/g, 'the gatekeepers')
      .replace(/\[Specific Role\]/g, activeBrand.audiences[0].split('&')[0].trim())
      .replace(/\[Specific Environment\]/g, 'high-stakes environments')
      .replace(/\[Habit\/Method\]/g, 'unverified tactics')
      .replace(/\[Specific Negative Consequence\]/g, 'catastrophic failure')
      .replace(/\[Category\]/g, 'solutions')
      .replace(/\[Effort\/Asset\]/g, 'initiatives')
      .replace(/\[Common Excuse\]/g, 'resource limits')
      .replace(/\[Metric A\]/g, 'surface metrics')
      .replace(/\[Metric B\]/g, activeBrand.lexicon[0])
      .replace(/\[Activity\]/g, 'reactive posturing')
      .replace(/\[Outcome\]/g, 'operational resilience')
      .replace(/\[Domain\/Strategy\]/g, activeBrand.lexicon[0])
      .replace(/\[Task\]/g, 'this discipline')
      .replace(/\[Niche\]/g, 'our discipline')
      .replace(/\[Craft\]/g, 'our discipline')
      .replace(/\[Popular Trend\/Tool\]/g, 'the prevailing trend')
      .replace(/\[Domain\/Field\]/g, 'this field')
      .replace(/\[Accomplishment\]/g, 'sustainable authority')
      .replace(/\[Complicated Setup\]/g, 'convoluted setups')
      .replace(/\[Conventional Practice\]/g, 'conventional practice');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Algorithmic Hook Library & Platform Constraints
                </h2>
                <p className="text-xs text-neutral-400">
                  Calibrated to algorithmic psychology across TikTok, Bluesky, Pinterest, Threads, X, LinkedIn & more.
                </p>
              </div>
            </div>
          </div>

          {/* Active Brand Contextualizer Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Brand Context:</span>
            <select
              value={selectedBrandKey}
              onChange={(e) => setSelectedBrandKey(e.target.value as BrandKey)}
              className="py-1.5 px-3 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {(Object.keys(BRANDS) as BrandKey[]).map((k) => (
                <option key={k} value={k}>
                  {BRANDS[k].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="pt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {platforms.map((plat) => {
            const isSelected = selectedPlatform === plat;
            const chan = getPlatformChannel(plat);
            const spec = CHANNEL_SPECS[chan];

            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-neutral-800 text-amber-400 border border-neutral-700 shadow-md'
                    : 'bg-neutral-950/60 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800/80'
                }`}
              >
                <span>{plat}</span>
                {spec?.charLimit && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      spec.charLimit <= 300
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : spec.charLimit <= 800
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {spec.charLimit}c
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Platform Character Count & Rules Detail Strip */}
        <div className="mt-4 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-white uppercase font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              {currentChannel} Specification
            </span>
            <span className="text-neutral-300">{channelSpec?.desc}</span>
          </div>

          <div className="flex items-center gap-3">
            {channelSpec?.charLimit && (
              <span className="font-mono text-[11px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Maximum Limit: <strong>{channelSpec.charLimit} Characters</strong>
              </span>
            )}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder={`Filter ${selectedPlatform} hooks...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hook Archetypes Grid */}
      <div className="space-y-3">
        {filteredHooks.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 text-xs">
            No hooks match your query &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredHooks.map((template, idx) => {
            const previewText = contextualizeHook(template);

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl transition-all space-y-3"
                style={{
                  borderLeft: `4px solid ${activeBrand.palette.accent}`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                      {selectedPlatform.toUpperCase()} ARCHETYPE #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      ~{previewText.length} chars generated
                    </span>
                    {channelSpec?.charLimit && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          previewText.length <= channelSpec.charLimit
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {previewText.length <= channelSpec.charLimit
                          ? `✓ Fits ${currentChannel}`
                          : `⚠ Exceeds limit`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(previewText, idx)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => onUseHookInStudio(previewText, currentChannel)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <span>Dispatch with this Hook</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Template vs Brand Customized */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80 space-y-1">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase block">
                      Universal Algorithmic Template:
                    </span>
                    <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                      {template}
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                    <span className="font-mono text-[10px] text-amber-400 uppercase block flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: activeBrand.palette.accent }}
                      />
                      Customized for {activeBrand.name}:
                    </span>
                    <p className="text-white font-sans font-medium text-xs leading-relaxed">
                      &quot;{previewText}&quot;
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
