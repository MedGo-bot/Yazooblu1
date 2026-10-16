import React from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Bookmark,
  Calendar,
  Film,
  Newspaper,
} from 'lucide-react';
import { ProductionPackage } from '../types';

export type MainTabKey =
  | 'studio'
  | 'queue'
  | 'archive'
  | 'calendar'
  | 'vault'
  | 'magazine'
  | 'matrix'
  | 'hooks'
  | 'metrics';

interface HeaderProps {
  activeTab: MainTabKey;
  setActiveTab: (tab: MainTabKey) => void;
  drafts: ProductionPackage[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  drafts,
}) => {
  const pendingCount = drafts.filter((d) => d.status === 'pending_review').length;
  const approvedCount = drafts.filter((d) => d.status === 'approved').length;

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Executive Brand Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md">
              YB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight font-mono">
                  Yazooblu // Studio OS
                </h1>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                7 Sovereign Brand Portfolios · 8-Stage Autonomous Agency Pipeline
              </p>
            </div>
          </div>

          {/* Quiet Status Overview */}
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <div>
              <span>Engine: </span>
              <span className="text-emerald-400 font-semibold">Gemini 3.8 Flash</span>
            </div>
            <span className="text-neutral-700" aria-hidden="true">|</span>
            <div>
              <span>Queue: </span>
              <strong className={pendingCount > 0 ? 'text-amber-400' : 'text-neutral-400'}>
                {pendingCount}
              </strong>
            </div>
            <span className="text-neutral-700" aria-hidden="true">|</span>
            <div>
              <span>Pipeline: </span>
              <strong className="text-emerald-400">{approvedCount}</strong>
            </div>
          </div>
        </div>

        {/* Primary Clean Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-neutral-900 pt-1 pb-2 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Brand Studios
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Editorial Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'vault'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Media Vault
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('magazine')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'magazine'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Bes Outkast Magazine
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Approval Queue
            {pendingCount > 0 && (
              <span className="text-[10px] font-mono text-amber-400 font-bold ml-0.5">
                ({pendingCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved Archive
            {approvedCount > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold ml-0.5">
                ({approvedCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Brand Architecture
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hooks')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'hooks'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Hook Library
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Metrics
          </button>
        </nav>
      </div>
    </header>
  );
};
