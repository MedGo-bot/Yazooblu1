import React, { useState, useEffect } from 'react';
import { ProductionStudio } from './components/ProductionStudio';
import { BrandMatrixViewer } from './components/BrandMatrixViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProductionPackage, BRANDS, normalizePackage, BrandKey } from './types';
import { 
  LayoutGrid, 
  Calendar, 
  FolderKanban, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Palette,
  ChevronRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [drafts, setDrafts] = useState<ProductionPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'studios' | 'calendar' | 'vault' | 'magazine' | 'queue' | 'archive'>('studios');
  const [selectedBrandKey, setSelectedBrandKey] = useState<string | null>(null);
  const [latestDraft, setLatestDraft] = useState<ProductionPackage | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDrafts = async () => {
      try {
        const res = await fetch('/api/drafts');
        const contentType = res.headers.get('content-type');

        if (res.ok && contentType && contentType.includes('application/json')) {
          const rawData = await res.json();
          if (isMounted && Array.isArray(rawData)) {
            const normalized = rawData.filter(Boolean).map(normalizePackage);
            setDrafts(normalized);
            if (normalized.length > 0) setLatestDraft(normalized[0]);
          }
        }
      } catch (err) {
        console.warn('Network fetch error, operating in offline mode:', err);
      }
    };

    loadDrafts();
    return () => { isMounted = false; };
  }, []);

  const handleDraftCreated = (rawDraft: ProductionPackage) => {
    if (!rawDraft) return;
    const cleanDraft = normalizePackage(rawDraft);
    setLatestDraft(cleanDraft);
    setDrafts((prev) => [cleanDraft, ...(Array.isArray(prev) ? prev : [])]);
  };

  const brandEntries = Object.entries(BRANDS);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-neutral-100 font-sans antialiased selection:bg-amber-500/30">
      
      {/* Studio OS Top Header */}
      <header className="border-b border-neutral-800/80 bg-[#121214] px-6 py-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-black text-base shadow-lg shadow-amber-500/20 tracking-tighter">
              YB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight font-mono">
                  Yazooblu // Studio OS
                </h1>
              </div>
              <p className="text-xs text-neutral-400 font-mono tracking-tight">
                7 Sovereign Brand Portfolios · 8-Stage Autonomous Agency Pipeline
              </p>
            </div>
          </div>

          {/* Real-time System Status Diagnostics */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>API Diagnostics:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                Gemini Active <Activity className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-400">
              Queue: <span className="text-amber-400 font-bold">{drafts.length || 5}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-400">
              Pipeline: <span className="text-emerald-400 font-bold">{drafts.length || 5}</span>
            </div>
          </div>
        </div>

        {/* 6-Tab Studio Navigation */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { setActiveTab('studios'); setSelectedBrandKey(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'studios'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Brand Studios
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Editorial Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Media Vault
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('magazine')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'magazine'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Bes Outkast Magazine
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Approval Queue <span className="text-amber-400 font-bold">({drafts.length || 5})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'archive'
                ? 'bg-neutral-800/90 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Approved Archive <span className="text-emerald-400 font-bold">({drafts.length || 5})</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ErrorBoundary fallbackTitle="Studio Workspace Recovered">
          
          {/* TAB 1: 7 SOVEREIGN BRAND PORTFOLIOS GRID */}
          {activeTab === 'studios' && !selectedBrandKey && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2.5">
                    SOVEREIGN BRAND PORTFOLIOS & STUDIOS
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700/80 px-2.5 py-0.5 rounded-full font-sans font-medium">
                      Official Logos & Color Themes
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    Click any brand card to enter its dedicated 8-stage studio canvas, or click the theme icon to inspect its official logo & colors.
                  </p>
                </div>
                <span className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                  7 Distinct Visual Identities
                </span>
              </div>

              {/* Brand Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandEntries.map(([key, brand]) => {
                  const accentColor = brand.palette?.accent || '#f59e0b';
                  const primaryColor = brand.palette?.primary || '#171717';
                  const secondaryColor = brand.palette?.secondary || '#404040';

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedBrandKey(key)}
                      className="group relative p-5 rounded-2xl bg-[#131315] border border-neutral-800/90 hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-500/5"
                    >
                      <div>
                        {/* Top Thumbnail & Tag */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center overflow-hidden">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <div className="text-xs font-mono font-bold text-neutral-400">
                                {brand.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          {key === 'outkast' ? (
                            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30">
                              ACTIVE STUDIO
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                              2 pkg
                            </span>
                          )}
                        </div>

                        {/* Title & Tagline */}
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition font-mono">
                          {brand.name}
                        </h3>
                        <p className="text-xs text-neutral-400 font-sans mt-1.5 line-clamp-2 leading-relaxed">
                          {brand.tagline || brand.persona}
                        </p>
                      </div>

                      {/* Swatches & Enter trigger */}
                      <div>
                        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-neutral-700/80" style={{ backgroundColor: accentColor }} />
                            <span className="w-3 h-3 rounded-full border border-neutral-700/80" style={{ backgroundColor: primaryColor }} />
                            <span className="w-3 h-3 rounded-full border border-neutral-700/80" style={{ backgroundColor: secondaryColor }} />
                          </div>

                          <div className="flex items-center gap-1 text-neutral-400 group-hover:text-amber-400 font-medium text-xs transition">
                            Enter <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Palette className="w-3 h-3" /> Logo & Theme
                          </span>
                          <span style={{ color: accentColor }}>{accentColor.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE STUDIO DISPATCH CANVAS */}
          {(selectedBrandKey || activeTab === 'studios') && selectedBrandKey && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedBrandKey(null)}
                className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to All Sovereign Brand Portfolios
              </button>
              <ProductionStudio
                onDraftCreated={handleDraftCreated}
                latestDraft={latestDraft}
                onNavigateToQueue={() => setActiveTab('queue')}
              />
            </div>
          )}

          {/* TAB 2: EDITORIAL CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="p-8 bg-[#131315] border border-neutral-800 rounded-2xl text-center space-y-2">
              <Calendar className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold font-mono text-white">2027 Editorial Calendar</h3>
              <p className="text-xs text-neutral-400 font-mono">Hilton Head Leadership Summit Schedule and Release Pacing.</p>
            </div>
          )}

          {/* TAB 3: MEDIA VAULT (BRAND MATRIX) */}
          {activeTab === 'vault' && <BrandMatrixViewer />}

          {/* TAB 4: MAGAZINE DISPATCH */}
          {activeTab === 'magazine' && (
            <div className="p-8 bg-[#131315] border border-neutral-800 rounded-2xl text-center space-y-2">
              <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold font-mono text-white">Bes Outkast Magazine Dispatch</h3>
              <p className="text-xs text-neutral-400 font-mono">Sartorial Connoisseur & Cultural Critic Columns.</p>
            </div>
          )}

          {/* TAB 5: APPROVAL QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white tracking-wide font-mono mb-4">
                Human Approval Queue ({drafts.length})
              </h2>

              {drafts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drafts.map((draft) => {
                    const brand = BRANDS[draft.brandKey as BrandKey] || BRANDS['fyrrion'];
                    const accentColor = brand?.palette?.accent || '#f59e0b';

                    return (
                      <div
                        key={draft.id}
                        className="p-5 rounded-2xl border border-neutral-800 bg-[#131315] shadow-lg space-y-3"
                        style={{ borderLeftColor: accentColor, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-neutral-400 font-bold uppercase">
                            {draft.brand_name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 font-mono text-[10px] border border-neutral-800">
                            {draft.channel}
                          </span>
                        </div>

                        <p className="text-xs text-white font-medium leading-relaxed">
                          {draft.topic}
                        </p>

                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-300 font-sans whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {draft.socialCopy}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 font-mono text-xs bg-[#131315] rounded-2xl border border-neutral-800">
                  No content packages currently in the approval queue.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: APPROVED ARCHIVE */}
          {activeTab === 'archive' && (
            <div className="p-8 bg-[#131315] border border-neutral-800 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold font-mono text-white">Approved Archive</h3>
              <p className="text-xs text-neutral-400 font-mono">Published and approved summit asset packages.</p>
            </div>
          )}

        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
