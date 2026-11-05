// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ProductionStudio } from './components/ProductionStudio';
import { BrandMatrixViewer } from './components/BrandMatrixViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProductionPackage, BRANDS, normalizePackage } from './types';
import { Bot, Layers, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [drafts, setDrafts] = useState<ProductionPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'studio' | 'matrix' | 'queue'>('studio');
  const [latestDraft, setLatestDraft] = useState<ProductionPackage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Safe API loader with content-type check and normalizer
  useEffect(() => {
    let isMounted = true;
    const loadDrafts = async () => {
      try {
        const res = await fetch('/api/drafts');
        const contentType = res.headers.get('content-type');

        if (res.ok && contentType && contentType.includes('application/json')) {
          const rawData = await res.json();
          if (isMounted && Array.isArray(rawData)) {
            // Clean and normalize every package
            const normalized = rawData.filter(Boolean).map(normalizePackage);
            setDrafts(normalized);
            if (normalized.length > 0) {
              setLatestDraft(normalized[0]);
            }
          }
        } else {
          console.warn('API returned non-JSON response or 404. Operating in local mode.');
          if (isMounted) setDrafts([]);
        }
      } catch (err) {
        console.warn('Network fetch error, operating in offline mode:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDrafts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDraftCreated = (rawDraft: ProductionPackage) => {
    if (!rawDraft) return;
    const cleanDraft = normalizePackage(rawDraft);
    setLatestDraft(cleanDraft);
    setDrafts((prev) => [cleanDraft, ...(Array.isArray(prev) ? prev : [])]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* Top Bar Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                YazooBlu Studio
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">
                2027 Autonomous Multi-Agent Pipeline
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Studio Dispatch
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Brand Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Approval Queue ({drafts.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area with Protective Error Boundary */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary fallbackTitle="Studio Section Recovered">
          {activeTab === 'studio' && (
            <ProductionStudio
              onDraftCreated={handleDraftCreated}
              latestDraft={latestDraft}
              onNavigateToQueue={() => setActiveTab('queue')}
            />
          )}

          {activeTab === 'matrix' && <BrandMatrixViewer />}

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white tracking-wide font-mono mb-4">
                Human Approval Queue
              </h2>

              {drafts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drafts.map((draft) => {
                    const brand = BRANDS[draft.brandKey] || BRANDS['fyrrion'];
                    const accentColor = brand.palette.accent;

                    return (
                      <div
                        key={draft.id}
                        className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-lg space-y-3"
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
                <div className="p-8 text-center text-neutral-500 font-mono text-xs bg-neutral-900/40 rounded-2xl border border-neutral-800">
                  No packages currently in the queue.
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
};

// Append this line to the bottom of src/App.tsx:
export default App;
