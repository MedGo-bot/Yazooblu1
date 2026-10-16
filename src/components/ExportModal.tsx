import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  FileText,
  Filter,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  Eye,
} from 'lucide-react';
import { ProductionPackage } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allApprovedDrafts: ProductionPackage[];
  filteredDrafts: ProductionPackage[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  allApprovedDrafts,
  filteredDrafts,
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'markdown'>('csv');
  const [scope, setScope] = useState<'filtered' | 'all'>(
    filteredDrafts.length < allApprovedDrafts.length ? 'filtered' : 'all'
  );
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Field toggles
  const [includeHooks, setIncludeHooks] = useState(true);
  const [includeVoiceover, setIncludeVoiceover] = useState(true);
  const [includeImagePrompt, setIncludeImagePrompt] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const targetDrafts = scope === 'filtered' ? filteredDrafts : allApprovedDrafts;

  // RFC 4180 Compliant CSV Formatter
  const csvContent = useMemo(() => {
    if (targetDrafts.length === 0) return '';

    const headers: string[] = [
      'Draft ID',
      'Brand Name',
      'Brand Key',
      'Channel',
      'Target Audience',
      'Topic / Editorial Angle',
      'Visual Headline',
      'Primary Hook',
    ];

    if (includeHooks) headers.push('All Hook Options');
    headers.push('Platform Post Body', 'Character Count');
    if (includeVoiceover) headers.push('Voiceover Script (30-45s)');
    if (includeImagePrompt) headers.push('Image Generation Prompt');
    if (includeHashtags) headers.push('Hashtags');
    if (includeMetadata) headers.push('Status', 'Created Timestamp');

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      // Replace all double quotes with double-double quotes and wrap in quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = targetDrafts.map((d) => {
      const row: string[] = [
        escapeCSV(d.id),
        escapeCSV(d.brand_name),
        escapeCSV(d.brand_key),
        escapeCSV(d.channel),
        escapeCSV(d.audience),
        escapeCSV(d.topic),
        escapeCSV(d.visual_headline),
        escapeCSV(d.selected_hook || d.hook_options[0] || ''),
      ];

      if (includeHooks) {
        row.push(escapeCSV(d.hook_options.join(' | ')));
      }
      row.push(escapeCSV(d.post_body));
      row.push(escapeCSV(d.post_body.length));

      if (includeVoiceover) {
        row.push(escapeCSV(d.voiceover_script));
      }
      if (includeImagePrompt) {
        row.push(escapeCSV(d.image_prompt));
      }
      if (includeHashtags) {
        row.push(escapeCSV(d.hashtags));
      }
      if (includeMetadata) {
        row.push(escapeCSV(d.status));
        row.push(escapeCSV(d.created_at));
      }

      return row.join(',');
    });

    // Add UTF-8 BOM so Excel opens with flawless character encoding
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }, [
    targetDrafts,
    includeHooks,
    includeVoiceover,
    includeImagePrompt,
    includeHashtags,
    includeMetadata,
  ]);

  // Clean JSON export payload
  const jsonContent = useMemo(() => {
    if (targetDrafts.length === 0) return '[]';

    const cleanData = targetDrafts.map((d) => {
      const item: Record<string, any> = {
        id: d.id,
        brand_name: d.brand_name,
        brand_key: d.brand_key,
        channel: d.channel,
        audience: d.audience,
        topic: d.topic,
        visual_headline: d.visual_headline,
        primary_hook: d.selected_hook || d.hook_options[0] || '',
      };

      if (includeHooks) {
        item.hook_options = d.hook_options;
      }
      item.post_body = d.post_body;
      item.char_count = d.post_body.length;

      if (includeVoiceover) {
        item.voiceover_script = d.voiceover_script;
      }
      if (includeImagePrompt) {
        item.image_prompt = d.image_prompt;
      }
      if (includeHashtags) {
        item.hashtags = d.hashtags;
      }
      if (includeMetadata) {
        item.status = d.status;
        item.created_at = d.created_at;
      }

      return item;
    });

    return JSON.stringify(cleanData, null, 2);
  }, [
    targetDrafts,
    includeHooks,
    includeVoiceover,
    includeImagePrompt,
    includeHashtags,
    includeMetadata,
  ]);

  // Markdown Dossier
  const markdownContent = useMemo(() => {
    if (targetDrafts.length === 0) return '';
    let md = `# YazooBlu // Finalized Editorial Pipeline\n\n`;
    md += `Exported on: ${new Date().toISOString()}\n`;
    md += `Deliverables count: ${targetDrafts.length}\n\n---\n\n`;

    targetDrafts.forEach((d, idx) => {
      md += `## ${idx + 1}. [${d.brand_key.toUpperCase()}] ${d.topic}\n\n`;
      md += `* **Brand**: ${d.brand_name}\n`;
      md += `* **Channel**: ${d.channel}\n`;
      md += `* **Target Audience**: ${d.audience}\n`;
      md += `* **Visual Headline**: "${d.visual_headline}"\n\n`;
      md += `### Primary Hook\n> ${d.selected_hook || d.hook_options[0]}\n\n`;
      md += `### Platform Copy (${d.channel} • ${d.post_body.length} chars)\n${d.post_body}\n\n`;
      if (includeVoiceover) {
        md += `### Voiceover Script (30-45s)\n\`\`\`\n${d.voiceover_script}\n\`\`\`\n\n`;
      }
      if (includeImagePrompt) {
        md += `### Image Generation Spec (Midjourney / Imagen 3)\n\`${d.image_prompt}\`\n\n`;
      }
      if (includeHashtags) {
        md += `### Hashtags\n${d.hashtags}\n\n`;
      }
      md += `---\n\n`;
    });
    return md;
  }, [targetDrafts, includeVoiceover, includeImagePrompt, includeHashtags]);

  if (!isOpen) return null;

  const currentPayload =
    format === 'csv'
      ? csvContent
      : format === 'json'
      ? jsonContent
      : markdownContent;

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let filename = `yazooblu-editorial-export-${timestamp}`;
    let mimeType = 'text/plain';

    if (format === 'csv') {
      filename += '.csv';
      mimeType = 'text/csv;charset=utf-8;';
    } else if (format === 'json') {
      filename += '.json';
      mimeType = 'application/json;charset=utf-8;';
    } else {
      filename += '.md';
      mimeType = 'text/markdown;charset=utf-8;';
    }

    const blob = new Blob([currentPayload], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Export Finalized Editorial Content
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  CSV / JSON / Markdown
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Download verified, signed-off editorial packages for spreadsheets, automation pipelines, or CMS publishing.
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

        {/* Configuration Controls Bar */}
        <div className="p-5 bg-neutral-950/70 border-b border-neutral-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5 font-bold">
                1. Select Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    format === 'csv'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  CSV (Excel)
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    format === 'json'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  JSON (API)
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('markdown')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    format === 'markdown'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  Markdown
                </button>
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5 font-bold">
                2. Target Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    scope === 'filtered'
                      ? 'bg-neutral-800 border-amber-400 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  Current View ({filteredDrafts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    scope === 'all'
                      ? 'bg-neutral-800 border-amber-400 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  All Approved ({allApprovedDrafts.length})
                </button>
              </div>
            </div>
          </div>

          {/* Field Selection Checkboxes */}
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2 font-bold">
              3. Columns &amp; Content Modules to Include
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer hover:bg-neutral-850">
                <input
                  type="checkbox"
                  checked={includeHooks}
                  onChange={(e) => setIncludeHooks(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                All Hook Variations
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer hover:bg-neutral-850">
                <input
                  type="checkbox"
                  checked={includeVoiceover}
                  onChange={(e) => setIncludeVoiceover(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                Voiceover Scripts
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer hover:bg-neutral-850">
                <input
                  type="checkbox"
                  checked={includeImagePrompt}
                  onChange={(e) => setIncludeImagePrompt(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                Midjourney / Image Prompts
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer hover:bg-neutral-850">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                Hashtags
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer hover:bg-neutral-850">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                Timestamps &amp; Status
              </label>
            </div>
          </div>
        </div>

        {/* Live Export Preview */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col space-y-2 bg-neutral-950">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Live Preview: <strong>{targetDrafts.length} deliverables</strong> ready
            </span>
            <span>
              Format: <strong className="text-white uppercase">{format}</strong>
            </span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 font-mono text-[11px] text-neutral-300 leading-relaxed max-h-[300px]">
            {targetDrafts.length === 0 ? (
              <div className="text-neutral-500 py-10 text-center">
                No approved drafts available in this scope to export.
              </div>
            ) : (
              <pre className="whitespace-pre-wrap select-all font-mono">
                {currentPayload.slice(0, 3500)}
                {currentPayload.length > 3500 && (
                  <span className="text-amber-400">
                    {'\n'}... [Truncated for preview — full {currentPayload.length} bytes will be downloaded]
                  </span>
                )}
              </pre>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-neutral-400">
            Exporting {targetDrafts.length} items as <strong className="text-white uppercase">.{format}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={targetDrafts.length === 0}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied {format.toUpperCase()}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy to Clipboard
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={targetDrafts.length === 0}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              Download .{format.toUpperCase()} File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
