import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Calendar,
  Send,
  Share2,
  FileText,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import { BRANDS, BrandKey, ProductionPackage } from '../types';
import { SocialCardCanvas } from './SocialCardCanvas';
import { VoiceoverPlayer } from './VoiceoverPlayer';
import { ExportModal } from './ExportModal';

interface ApprovedArchiveProps {
  drafts: ProductionPackage[];
  onReopenDraft: (id: string) => void;
  onNavigateToStudio: () => void;
}

export const ApprovedArchive: React.FC<ApprovedArchiveProps> = ({
  drafts,
  onReopenDraft,
  onNavigateToStudio,
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [publishedStatus, setPublishedStatus] = useState<Record<string, boolean>>({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const approvedDrafts = drafts.filter((d) => d.status === 'approved');

  const filteredDrafts = approvedDrafts.filter((draft) => {
    if (selectedBrandFilter !== 'all' && draft.brand_key !== selectedBrandFilter) {
      return false;
    }
    if (selectedChannelFilter !== 'all' && draft.channel !== selectedChannelFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        draft.topic.toLowerCase().includes(q) ||
        draft.post_body.toLowerCase().includes(q) ||
        draft.visual_headline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimulatePublish = (id: string) => {
    setPublishedStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setPublishedStatus((prev) => ({ ...prev, [id]: true }));
    }, 1500);
  };

  // Full-featured RFC 4180 compliant CSV Export
  const handleExportCSV = (
    targetList: ProductionPackage[] = approvedDrafts,
    customName?: string
  ) => {
    if (targetList.length === 0) return;

    const headers = [
      'Draft ID',
      'Brand Name',
      'Brand Key',
      'Channel',
      'Target Audience',
      'Topic / Editorial Angle',
      'Visual Headline',
      'Primary Hook',
      'All Hook Options',
      'Platform Post Body',
      'Character Count',
      'Voiceover Script',
      'Image Generation Spec',
      'Hashtags',
      'Status',
      'Created Timestamp',
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = targetList.map((d) => [
      escapeCSV(d.id),
      escapeCSV(d.brand_name),
      escapeCSV(d.brand_key),
      escapeCSV(d.channel),
      escapeCSV(d.audience),
      escapeCSV(d.topic),
      escapeCSV(d.visual_headline),
      escapeCSV(d.selected_hook || d.hook_options[0] || ''),
      escapeCSV(d.hook_options.join(' | ')),
      escapeCSV(d.post_body),
      escapeCSV(d.post_body.length),
      escapeCSV(d.voiceover_script),
      escapeCSV(d.image_prompt),
      escapeCSV(d.hashtags),
      escapeCSV(d.status),
      escapeCSV(d.created_at),
    ]);

    // UTF-8 BOM (\uFEFF) ensures flawless Microsoft Excel & Apple Numbers UTF-8 compatibility
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = customName || `yazooblu-editorial-export-${Date.now()}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Structured JSON Export
  const handleExportJSON = (
    targetList: ProductionPackage[] = approvedDrafts,
    customName?: string
  ) => {
    if (targetList.length === 0) return;

    const cleanData = targetList.map((d) => ({
      id: d.id,
      brand_name: d.brand_name,
      brand_key: d.brand_key,
      channel: d.channel,
      audience: d.audience,
      topic: d.topic,
      visual_headline: d.visual_headline,
      primary_hook: d.selected_hook || d.hook_options[0] || '',
      hook_options: d.hook_options,
      post_body: d.post_body,
      character_count: d.post_body.length,
      voiceover_script: d.voiceover_script,
      image_prompt: d.image_prompt,
      hashtags: d.hashtags,
      status: d.status,
      created_at: d.created_at,
    }));

    const jsonString = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const filename = customName || `yazooblu-editorial-export-${Date.now()}.json`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Single Item CSV Download
  const handleExportSingleCSV = (draft: ProductionPackage) => {
    handleExportCSV([draft], `yazooblu-${draft.brand_key}-${draft.channel.toLowerCase()}-${Date.now()}.csv`);
  };

  // Single Item JSON Download
  const handleExportSingleJSON = (draft: ProductionPackage) => {
    handleExportJSON([draft], `yazooblu-${draft.brand_key}-${draft.channel.toLowerCase()}-${Date.now()}.json`);
  };

  // Single Item Copy JSON
  const handleCopySingleJSON = (draft: ProductionPackage) => {
    const jsonString = JSON.stringify(
      {
        id: draft.id,
        brand_name: draft.brand_name,
        brand_key: draft.brand_key,
        channel: draft.channel,
        audience: draft.audience,
        topic: draft.topic,
        visual_headline: draft.visual_headline,
        primary_hook: draft.selected_hook || draft.hook_options[0] || '',
        hook_options: draft.hook_options,
        post_body: draft.post_body,
        character_count: draft.post_body.length,
        voiceover_script: draft.voiceover_script,
        image_prompt: draft.image_prompt,
        hashtags: draft.hashtags,
        status: draft.status,
        created_at: draft.created_at,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonString);
    setCopiedCardId(draft.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const handleExportMarkdown = () => {
    let md = `# YazooBlu // Approved Multi-Brand Editorial Pipeline\n\n`;
    md += `Exported on: ${new Date().toISOString()}\n`;
    md += `Total Approved Deliverables: ${approvedDrafts.length}\n\n---\n\n`;

    approvedDrafts.forEach((d, idx) => {
      md += `## ${idx + 1}. [${d.brand_key.toUpperCase()}] ${d.topic}\n\n`;
      md += `* **Brand**: ${d.brand_name}\n`;
      md += `* **Channel**: ${d.channel}\n`;
      md += `* **Target Audience**: ${d.audience}\n`;
      md += `* **Visual Card Headline**: "${d.visual_headline}"\n\n`;
      md += `### Primary Hook\n> ${d.selected_hook || d.hook_options[0]}\n\n`;
      md += `### Platform Copy (${d.channel})\n${d.post_body}\n\n`;
      md += `### Voiceover Script (30-45s)\n\`\`\`\n${d.voiceover_script}\n\`\`\`\n\n`;
      md += `### Image Generation Spec (Midjourney / Imagen 3)\n\`${d.image_prompt}\`\n\n`;
      md += `### Hashtags\n${d.hashtags}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yazooblu-editorial-dossier-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Strip */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Approved Editorial Pipeline & Archive
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {approvedDrafts.length} Ready to Publish
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Finalized deliverables ready for spreadsheet workflows, API integrations, and multi-format download.
            </p>
          </div>

          {/* Export Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Export Center Trigger */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:brightness-105 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-neutral-950" />
              <span>Export Center (CSV / JSON / MD)</span>
            </button>

            {/* Quick 1-Click CSV Download */}
            <button
              onClick={() => handleExportCSV(filteredDrafts)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
              title="Download RFC 4180 CSV for spreadsheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Spreadsheet</span>
            </button>

            {/* Quick 1-Click JSON Download */}
            <button
              onClick={() => handleExportJSON(filteredDrafts)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
              title="Download formatted JSON array"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON Payload</span>
            </button>

            {/* Markdown Export */}
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
              title="Download formatted Markdown dossier"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Markdown</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search approved topics, headlines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="all">All Brands ({Object.keys(BRANDS).length})</option>
              {(Object.keys(BRANDS) as BrandKey[]).map((k) => (
                <option key={k} value={k}>
                  {BRANDS[k].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedChannelFilter}
              onChange={(e) => setSelectedChannelFilter(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="all">All Distribution Channels</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (260 chars)</option>
              <option value="TikTok">TikTok</option>
              <option value="Bluesky">Bluesky (300 chars)</option>
              <option value="Threads">Threads (300 chars)</option>
              <option value="Pinterest">Pinterest (800 chars)</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="Substack">Substack</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approved List */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-500">
          <Calendar className="w-12 h-12 mx-auto text-neutral-700 stroke-[1.5] mb-3" />
          <h3 className="text-sm font-semibold text-neutral-300">
            No Approved Posts Yet
          </h3>
          <p className="text-xs max-w-sm mx-auto mt-1 text-neutral-500">
            Approve generated items in the Human Approval Queue to populate this ready-to-publish production pipeline.
          </p>
          <button
            onClick={onNavigateToStudio}
            className="mt-4 px-4 py-2 bg-amber-400 text-black text-xs font-semibold rounded-xl hover:bg-amber-300 transition cursor-pointer"
          >
            Launch Production Studio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const brand = BRANDS[draft.brand_key] || BRANDS.fyrrion;
            const isExpanded = expandedId === draft.id;
            const isDispatched = publishedStatus[draft.id];

            return (
              <div
                key={draft.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl"
                style={{
                  borderLeft: `4px solid ${brand.palette.accent}`,
                }}
              >
                {/* Header summary row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/60 bg-neutral-950/40">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                      </span>
                      <span
                        className="text-xs font-mono px-2.5 py-0.5 rounded-md text-white font-bold"
                        style={{ backgroundColor: brand.palette.bg }}
                      >
                        [{draft.brand_key.toUpperCase()}]
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {draft.channel}
                      </span>
                      {draft.magazine_column && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 font-medium">
                          Column: {draft.magazine_column}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400">
                        Audience: <strong className="text-neutral-200">{draft.audience}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white">
                      {draft.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {/* Per-card CSV download */}
                    <button
                      onClick={() => handleExportSingleCSV(draft)}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 text-xs flex items-center gap-1 border border-neutral-800 hover:border-emerald-500/30 transition cursor-pointer font-mono"
                      title="Download single-post CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CSV</span>
                    </button>

                    {/* Per-card JSON download */}
                    <button
                      onClick={() => handleExportSingleJSON(draft)}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-400 text-xs flex items-center gap-1 border border-neutral-800 hover:border-cyan-500/30 transition cursor-pointer font-mono"
                      title="Download single-post JSON"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>JSON</span>
                    </button>

                    {/* Per-card copy JSON */}
                    <button
                      onClick={() => handleCopySingleJSON(draft)}
                      className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer border border-neutral-800"
                      title="Copy JSON to clipboard"
                    >
                      {copiedCardId === draft.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Publish dispatch */}
                    <button
                      onClick={() => handleSimulatePublish(draft.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isDispatched
                          ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-md'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isDispatched ? 'Dispatched' : 'Publish'}
                    </button>

                    {/* Re-open */}
                    <button
                      onClick={() => onReopenDraft(draft.id)}
                      className="px-2 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs flex items-center gap-1 border border-neutral-700 cursor-pointer"
                      title="Move back to pending review"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle expand */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : draft.id)}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details view */}
                {isExpanded && (
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-950/20">
                    <div className="lg:col-span-4 flex flex-col items-center">
                      <SocialCardCanvas
                        brandKey={draft.brand_key}
                        headline={draft.visual_headline}
                      />
                    </div>

                    <div className="lg:col-span-8 space-y-4">
                      {/* Selected Hook */}
                      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                        <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block mb-1">
                          Approved Primary Hook:
                        </span>
                        <p className="text-white font-medium">
                          {draft.selected_hook || draft.hook_options[0]}
                        </p>
                      </div>

                      {/* Post Copy */}
                      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block">
                            Platform Copy ({draft.channel}):
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {draft.post_body.length} chars
                          </span>
                        </div>
                        <p className="text-neutral-200 whitespace-pre-line leading-relaxed">
                          {draft.post_body}
                        </p>
                        <div className="mt-3 text-xs font-mono text-neutral-400">
                          {draft.hashtags}
                        </div>
                      </div>

                      {/* Voiceover Script Player */}
                      <VoiceoverPlayer
                        script={draft.voiceover_script}
                        brandKey={draft.brand_key}
                        brandName={draft.brand_name}
                      />

                      {/* Card Bottom Export Action Strip */}
                      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span>Deliverable ID: {draft.id}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportSingleCSV(draft)}
                            className="text-neutral-300 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Download CSV</span>
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => handleExportSingleJSON(draft)}
                            className="text-neutral-300 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                          >
                            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Download JSON</span>
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => handleCopySingleJSON(draft)}
                            className="text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCardId === draft.id ? 'Copied!' : 'Copy JSON'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Export Center Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allApprovedDrafts={approvedDrafts}
        filteredDrafts={filteredDrafts}
      />
    </div>
  );
};
