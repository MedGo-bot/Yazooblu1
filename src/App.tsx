import React, { useState, useEffect } from 'react';
import { ProductionPackage, Channel, BrandKey, BRANDS } from './types';
import { INITIAL_DRAFTS } from './mockData';
import { Header, MainTabKey } from './components/Header';
import { BrandTabs } from './components/BrandTabs';
import { BrandStudioCanvas } from './components/BrandStudioCanvas';
import { ApprovalQueue } from './components/ApprovalQueue';
import { ApprovedArchive } from './components/ApprovedArchive';
import { BrandMatrixViewer } from './components/BrandMatrixViewer';
import { HookLibraryView } from './components/HookLibraryView';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { EditorialCalendar } from './components/EditorialCalendar';
import { MediaVault, VaultAsset } from './components/MediaVault';
import { MagazineIssueAssembler } from './components/MagazineIssueAssembler';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabKey>('studio');
  const [selectedBrandKey, setSelectedBrandKey] = useState<BrandKey>('bes_outkast');
  const [drafts, setDrafts] = useState<ProductionPackage[]>(INITIAL_DRAFTS);
  const [latestDraft, setLatestDraft] = useState<ProductionPackage | null>(INITIAL_DRAFTS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [prefilledTopic, setPrefilledTopic] = useState<string | undefined>(undefined);
  const [prefilledChannel, setPrefilledChannel] = useState<Channel | undefined>(undefined);

  // Fetch from server on load
  useEffect(() => {
    fetch('/api/drafts')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load drafts');
      })
      .then((data: ProductionPackage[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setDrafts(data);
          setLatestDraft(data[0]);
        }
      })
      .catch((err) => {
        console.warn('API fetch fallback to initial drafts:', err.message);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDraftCreated = (newDraft: ProductionPackage) => {
    setDrafts((prev) => [newDraft, ...prev]);
    setLatestDraft(newDraft);
    showToast(`Package successfully added to ${newDraft.brand_name} queue!`);
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    try {
      await fetch(`/api/drafts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejection_reason: rejectionReason }),
      });
    } catch (err) {
      console.warn('Server status update error:', err);
    }

    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status, rejection_reason: rejectionReason } : d
      )
    );

    if (status === 'approved') {
      showToast('Package approved and added to Editorial Pipeline!');
    } else {
      showToast('Package rejected and archived.');
    }
  };

  const handleUpdateDraft = async (id: string, updated: Partial<ProductionPackage>) => {
    try {
      await fetch(`/api/drafts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated }),
      });
    } catch (err) {
      console.warn('Server draft edit error:', err);
    }

    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );

    if (latestDraft && latestDraft.id === id) {
      setLatestDraft((prev) => (prev ? { ...prev, ...updated } : null));
    }
    showToast('Modifications saved successfully.');
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server delete error:', err);
    }

    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (latestDraft && latestDraft.id === id) {
      setLatestDraft(null);
    }
    showToast('Draft removed.');
  };

  const handleReopenDraft = async (id: string) => {
    handleUpdateStatus(id, 'pending_review' as any);
    showToast('Package moved back to Human Approval Queue.');
  };

  // Compute portfolio draft counts per brand
  const brandCounts = (Object.keys(BRANDS) as BrandKey[]).reduce((acc, key) => {
    const brandDrafts = drafts.filter((d) => d.brand_key === key);
    acc[key] = {
      total: brandDrafts.length,
      pending: brandDrafts.filter((d) => d.status === 'pending_review').length,
      approved: brandDrafts.filter((d) => d.status === 'approved').length,
    };
    return acc;
  }, {} as Record<BrandKey, { total: number; pending: number; approved: number }>);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black antialiased">
      {/* Top Executive Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        drafts={drafts}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Prominent Large Brand Tabs */}
            <BrandTabs
              selectedBrandKey={selectedBrandKey}
              onSelectBrand={(key) => setSelectedBrandKey(key)}
              brandCounts={brandCounts}
            />

            {/* Individual Brand Canvas with the 8-Stage Agency Pipeline */}
            <BrandStudioCanvas
              key={selectedBrandKey}
              brandKey={selectedBrandKey}
              onDraftCreated={handleDraftCreated}
              latestDraft={latestDraft}
              onNavigateToQueue={() => setActiveTab('queue')}
              onNavigateToArchive={() => setActiveTab('archive')}
              initialTopic={prefilledTopic}
              initialChannel={prefilledChannel}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <EditorialCalendar
            drafts={drafts}
            onNavigateToStudio={(brandKey) => {
              if (brandKey) setSelectedBrandKey(brandKey);
              setActiveTab('studio');
            }}
          />
        )}

        {activeTab === 'vault' && (
          <MediaVault
            onUseAssetInStudio={(asset: VaultAsset) => {
              setSelectedBrandKey(asset.brandKey);
              setPrefilledTopic(asset.title);
              setActiveTab('studio');
              showToast(`Applied "${asset.title}" to ${BRANDS[asset.brandKey].name} Studio!`);
            }}
          />
        )}

        {activeTab === 'magazine' && (
          <MagazineIssueAssembler
            onSelectColumnInStudio={(colId: string, colTopic: string) => {
              setSelectedBrandKey('bes_outkast');
              setPrefilledTopic(colTopic);
              setActiveTab('studio');
              showToast(`Loaded column "${colId}" into Bes Outkast Studio!`);
            }}
          />
        )}

        {activeTab === 'queue' && (
          <ApprovalQueue
            drafts={drafts}
            onUpdateStatus={handleUpdateStatus}
            onUpdateDraft={handleUpdateDraft}
            onDeleteDraft={handleDeleteDraft}
            onNavigateToArchive={() => setActiveTab('archive')}
          />
        )}

        {activeTab === 'archive' && (
          <ApprovedArchive
            drafts={drafts}
            onReopenDraft={handleReopenDraft}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'matrix' && <BrandMatrixViewer />}

        {activeTab === 'hooks' && (
          <HookLibraryView
            onUseHookInStudio={(hookText, channel) => {
              setPrefilledTopic(hookText);
              setPrefilledChannel(channel);
              setActiveTab('studio');
              showToast(`Hook applied for ${channel} in Brand Studio!`);
            }}
          />
        )}

        {activeTab === 'metrics' && <PerformanceMetrics drafts={drafts} />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-900/80 bg-neutral-950 py-5 text-center text-xs text-neutral-500 font-mono">
        YazooBlu · Sovereign Brand Editorial Studios · 8-Stage Autonomous Agency
      </footer>
    </div>
  );
}
