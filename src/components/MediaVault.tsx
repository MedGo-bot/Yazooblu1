import React, { useState, useEffect } from 'react';
import { BrandKey, BRANDS } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Film,
  Camera,
  Search,
  Plus,
  Play,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  Eye,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export interface VaultAsset {
  id: string;
  type: 'photo' | 'video';
  url: string;
  previewUrl?: string;
  title: string;
  brandKey: BrandKey;
  tags: string[];
  downloads?: number;
  duration?: number;
  user?: string;
  dateAdded: string;
}

interface MediaVaultProps {
  onUseAssetInStudio?: (asset: VaultAsset) => void;
}

export const MediaVault: React.FC<MediaVaultProps> = ({ onUseAssetInStudio }) => {
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedBrand, setSelectedBrand] = useState<BrandKey | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreviewAsset, setActivePreviewAsset] = useState<VaultAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Curation state inside Vault
  const [isCuratingNew, setIsCuratingNew] = useState<boolean>(false);
  const [curateBrandKey, setCurateBrandKey] = useState<BrandKey>('bes_outkast');
  const [curateType, setCurateType] = useState<'photo' | 'video'>('video');
  const [curateQuery, setCurateQuery] = useState<string>('bespoke tailoring fabric');
  const [isSubmittingCurate, setIsSubmittingCurate] = useState<boolean>(false);
  const [curateFeedback, setCurateFeedback] = useState<string | null>(null);

  // Seeded high-fidelity curated media vault items
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>([
    {
      id: 'v-1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      title: 'Worsted Wool Micro-Twill & Tailoring Shears',
      brandKey: 'bes_outkast',
      tags: ['worsted wool', 'savile row', 'shears', 'sartorial'],
      downloads: 1420,
      user: 'Editorial Atelier',
      dateAdded: '2026-10-12',
    },
    {
      id: 'v-2',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2020/05/25/40149-425178351_medium.mp4',
      title: 'Savile Row Artisan Hand-Stitching Roped Shoulder',
      brandKey: 'bes_outkast',
      tags: ['hand stitch', 'canvassing', 'bespoke', 'tailor'],
      duration: 18,
      downloads: 4890,
      user: 'CraftFilmmaker',
      dateAdded: '2026-10-12',
    },
    {
      id: 'v-3',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      title: 'Monolithic Architectural Perimeter & Discreet Boardroom',
      brandKey: 'bhw_pr',
      tags: ['crisis perimeter', 'sovereign', 'corporate', 'architecture'],
      downloads: 3200,
      user: 'ArchLens',
      dateAdded: '2026-10-11',
    },
    {
      id: 'v-4',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2019/04/16/22894-331298492_medium.mp4',
      title: 'Heavy Industry Duty-Cycle Kinetic Assembly',
      brandKey: 'nuecofab',
      tags: ['duty cycle', 'robotics', 'clean tech', 'tensile'],
      duration: 14,
      downloads: 8200,
      user: 'IndustrialEye',
      dateAdded: '2026-10-10',
    },
    {
      id: 'v-5',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      title: 'Zero-Trust Server Rack Telemetry Corridor',
      brandKey: 'fyrrion',
      tags: ['telemetry', 'zero trust', 'servers', 'command line'],
      downloads: 2150,
      user: 'CyberOps',
      dateAdded: '2026-10-09',
    },
    {
      id: 'v-6',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      title: 'Sharkskin Twill Two-Tone Weave Detail',
      brandKey: 'bes_outkast',
      tags: ['sharkskin', 'twill', 'drape', 'fabric texture'],
      downloads: 940,
      user: 'LoomMaster',
      dateAdded: '2026-10-09',
    },
    {
      id: 'v-7',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      title: 'Structural Premises Timber & Air Pathway Forensics',
      brandKey: 'porch_md',
      tags: ['forensics', 'premises', 'air pathway', 'timber'],
      downloads: 1100,
      user: 'RestorationPro',
      dateAdded: '2026-10-08',
    },
    {
      id: 'v-8',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      title: 'Kinetic Cross-Disciplinary Visual Space',
      brandKey: 'creatives',
      tags: ['spatial rhythm', 'abstract', 'geometry', 'resonance'],
      downloads: 3800,
      user: 'AvantGarde',
      dateAdded: '2026-10-08',
    },
  ]);

  // Filtered Assets
  const filteredAssets = vaultAssets.filter((asset) => {
    if (filterType !== 'all' && asset.type !== filterType) return false;
    if (selectedBrand !== 'ALL' && asset.brandKey !== selectedBrand) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = asset.title.toLowerCase().includes(q);
      const matchTag = asset.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTag) return false;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setVaultAssets((prev) => prev.filter((a) => a.id !== id));
    if (activePreviewAsset && activePreviewAsset.id === id) {
      setActivePreviewAsset(null);
    }
  };

  // Perform Live Pixabay Curation and Add to Vault
  const handleCurateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCurate(true);
    setCurateFeedback(null);

    try {
      const endpoint = curateType === 'video' ? '/api/media/pixabay-video' : '/api/media/pixabay-photo';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: curateQuery }),
      });
      const data = await res.json();

      if (curateType === 'video' && data.video && data.video.url) {
        const newAsset: VaultAsset = {
          id: `v-${Date.now()}`,
          type: 'video',
          url: data.video.url,
          title: `${BRANDS[curateBrandKey].name} • Curated B-Roll (${curateQuery})`,
          brandKey: curateBrandKey,
          tags: (data.video.tags || curateQuery).split(',').map((t: string) => t.trim()),
          duration: data.video.duration,
          downloads: data.video.downloads,
          user: data.video.user,
          dateAdded: new Date().toISOString().split('T')[0],
        };
        setVaultAssets((prev) => [newAsset, ...prev]);
        setCurateFeedback('B-Roll video stream curated and saved to Vault!');
        setIsCuratingNew(false);
      } else if (curateType === 'photo' && data.photo && data.photo.url) {
        const newAsset: VaultAsset = {
          id: `v-${Date.now()}`,
          type: 'photo',
          url: data.photo.url,
          previewUrl: data.photo.preview_url || data.photo.url,
          title: `${BRANDS[curateBrandKey].name} • Curated Photo (${curateQuery})`,
          brandKey: curateBrandKey,
          tags: (data.photo.tags || curateQuery).split(',').map((t: string) => t.trim()),
          downloads: data.photo.downloads,
          user: data.photo.user,
          dateAdded: new Date().toISOString().split('T')[0],
        };
        setVaultAssets((prev) => [newAsset, ...prev]);
        setCurateFeedback('Vetted editorial photo curated and saved to Vault!');
        setIsCuratingNew(false);
      } else {
        setCurateFeedback(
          data.configured
            ? 'No media met the strict anti-gloss curation thresholds. Try broader keywords.'
            : 'Live Pixabay API returned fallback. Add PIXABAY_API_KEY to .env for live searches.'
        );
      }
    } catch (err: any) {
      setCurateFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmittingCurate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vault Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Curated Media Vault & B-Roll Asset Bin
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold">
                ANTI-GLOSS STOCK REPOSITORY
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Persistent archive of vetted Pixabay photography and motion b-roll clips filtered by download ceilings and editorial texture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCuratingNew(true)}
              className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Curate & Save New Asset</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          {/* Media Type Tabs */}
          <div className="flex p-0.5 rounded-xl bg-neutral-950 border border-neutral-800">
            {(['all', 'photo', 'video'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition capitalize cursor-pointer flex items-center gap-1.5 ${
                  filterType === t
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t === 'all' && <Layers className="w-3.5 h-3.5" />}
                {t === 'photo' && <Camera className="w-3.5 h-3.5" />}
                {t === 'video' && <Film className="w-3.5 h-3.5" />}
                {t === 'all' ? 'All Assets' : t === 'photo' ? 'Photos' : 'B-Roll Videos'}
              </button>
            ))}
          </div>

          {/* Brand Filter & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-mono">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Brands</option>
                {Object.values(BRANDS).map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags or titles..."
                className="pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 w-44"
              />
            </div>
          </div>
        </div>
      </div>

      {curateFeedback && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center justify-between">
          <span>{curateFeedback}</span>
          <button
            type="button"
            onClick={() => setCurateFeedback(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => {
          const brand = BRANDS[asset.brandKey];
          return (
            <div
              key={asset.id}
              className="bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition shadow-lg group"
            >
              {/* Media Preview Box */}
              <div
                onClick={() => setActivePreviewAsset(asset)}
                className="relative aspect-video bg-black overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-95 transition"
              >
                {asset.type === 'video' ? (
                  <>
                    <video
                      src={asset.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="p-2.5 rounded-full bg-amber-400 text-neutral-950 shadow-xl">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur text-[9px] font-mono text-amber-300 flex items-center gap-1 font-bold">
                      <Film className="w-2.5 h-2.5" />
                      {asset.duration ? `${asset.duration}s` : 'B-ROLL'}
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={asset.previewUrl || asset.url}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Camera className="w-2.5 h-2.5" />
                      PHOTO
                    </div>
                  </>
                )}

                {/* Brand Badge in Top Right */}
                <div className="absolute top-2 right-2">
                  <BrandLogo brandKey={asset.brandKey} size="xs" />
                </div>
              </div>

              {/* Card Meta & Details */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <span className="text-white font-bold">{brand.name}</span>
                    <span>•</span>
                    <span>{asset.user || 'Curated'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-1 leading-snug">
                    {asset.title}
                  </h4>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  {asset.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUseAssetInStudio) onUseAssetInStudio(asset);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Use in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.url, asset.id)}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition cursor-pointer"
                      title="Copy Media URL"
                    >
                      {copiedId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
                      title="Open full resolution"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition cursor-pointer"
                      title="Remove from vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl space-y-3">
          <Bookmark className="w-8 h-8 text-neutral-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Vault Assets Match Filter</h4>
          <p className="text-xs text-neutral-400">
            Try adjusting your search query or curate new media from Pixabay.
          </p>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {activePreviewAsset && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BrandLogo brandKey={activePreviewAsset.brandKey} size="xs" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {activePreviewAsset.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewAsset(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Image */}
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-neutral-800">
              {activePreviewAsset.type === 'video' ? (
                <video
                  src={activePreviewAsset.url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activePreviewAsset.url}
                  alt={activePreviewAsset.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Info and Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
              <div className="text-neutral-400 font-mono text-[11px]">
                Type: <strong className="text-white uppercase">{activePreviewAsset.type}</strong> • Added:{' '}
                {activePreviewAsset.dateAdded}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUseAssetInStudio) onUseAssetInStudio(activePreviewAsset);
                    setActivePreviewAsset(null);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Apply to Active Studio Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curate & Save Modal */}
      {isCuratingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCurateAndSave}
            className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Curate & Save to Media Vault
              </h3>
              <button
                type="button"
                onClick={() => setIsCuratingNew(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Queries Pixabay through your custom editorial curation filters (subtle film texture, banned commercial tags, and &lt;30k video / &lt;60k photo limits) and saves the winner directly to your media vault.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Target Brand:</label>
                  <select
                    value={curateBrandKey}
                    onChange={(e) => setCurateBrandKey(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {Object.values(BRANDS).map((b) => (
                      <option key={b.key} value={b.key}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Media Type:</label>
                  <select
                    value={curateType}
                    onChange={(e) => setCurateType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="video">B-Roll Video (MP4)</option>
                    <option value="photo">Editorial Photograph</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Curation Search Query:</label>
                <input
                  type="text"
                  value={curateQuery}
                  onChange={(e) => setCurateQuery(e.target.value)}
                  placeholder="e.g. bespoke tailoring worsted wool, architectural concrete, industrial battery"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsCuratingNew(false)}
                className="py-1.5 px-3.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingCurate}
                className="py-1.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingCurate ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Curating from Pixabay...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Curate & Add to Vault
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
