import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Check,
  Edit3,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  Wand2,
  Loader2,
  Scissors,
  ShieldAlert,
  Share2,
  Calendar,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { BRANDS, BrandKey, ProductionPackage, Channel, CHANNEL_SPECS } from '../types';
import { SocialCardCanvas } from './SocialCardCanvas';
import { VoiceoverPlayer } from './VoiceoverPlayer';

interface ApprovalQueueProps {
  drafts: ProductionPackage[];
  onUpdateStatus: (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) => void;
  onUpdateDraft: (id: string, updated: Partial<ProductionPackage>) => void;
  onDeleteDraft: (id: string) => void;
  onNavigateToArchive: () => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  drafts,
  onUpdateStatus,
  onUpdateDraft,
  onDeleteDraft,
  onNavigateToArchive,
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProductionPackage>>({});

  // Scheduling Modal State
  const [schedulingDraft, setSchedulingDraft] = useState<ProductionPackage | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // AI Refinement & Channel Adaptation State
  const [aiRefiningId, setAiRefiningId] = useState<string | null>(null);
  const [aiRefiningAction, setAiRefiningAction] = useState<string | null>(null);
  const [aiRefineFeedback, setAiRefineFeedback] = useState<{ id: string; message: string } | null>(null);

  const handleAiRefine = async (
    draft: ProductionPackage,
    action: string,
    targetChannel?: Channel
  ) => {
    setAiRefiningId(draft.id);
    setAiRefiningAction(action);
    setAiRefineFeedback(null);

    try {
      if (action === 'adapt_channel' && targetChannel) {
        const res = await fetch('/api/ai/adapt-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_key: draft.brand_key,
            target_channel: targetChannel,
            post_body: draft.post_body,
            topic: draft.topic,
            original_hook: draft.selected_hook,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            onUpdateDraft(draft.id, {
              channel: targetChannel,
              post_body: data.result.adapted_body,
              selected_hook: data.result.adapted_hook,
              visual_headline: data.result.adapted_headline || draft.visual_headline,
              hashtags: data.result.hashtags || draft.hashtags,
            });
            setAiRefineFeedback({
              id: draft.id,
              message: `Native adaptation for ${targetChannel} generated via Gemini 3.8 Flash!`,
            });
          }
        }
      } else {
        const res = await fetch('/api/ai/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_key: draft.brand_key,
            channel: draft.channel,
            action,
            current_body: draft.post_body,
            current_hook: draft.selected_hook,
            current_headline: draft.visual_headline,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            const updates: Partial<ProductionPackage> = {
              post_body: data.result.refined_body || draft.post_body,
              visual_headline: data.result.refined_headline || draft.visual_headline,
            };
            if (Array.isArray(data.result.hook_options) && data.result.hook_options.length > 0) {
              updates.hook_options = data.result.hook_options;
              updates.selected_hook = data.result.selected_hook || data.result.hook_options[0];
            }
            onUpdateDraft(draft.id, updates);
            setAiRefineFeedback({
              id: draft.id,
              message: data.result.refinement_notes || 'Gemini 3.8 Flash refinement applied.',
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Refine failed:', err);
    } finally {
      setAiRefiningId(null);
      setAiRefiningAction(null);
    }
  };

  // Tolerant filter: catches both pending_review and pending_approval states, as well as stage 'review'
  const pendingDrafts = drafts.filter((d: any) => {
    return (
      d.status === 'pending_review' ||
      d.status === 'pending_approval' ||
      d.stage === 'review' ||
      !d.status
    );
  });

  const filteredDrafts = pendingDrafts.filter((draft) => {
    if (selectedBrandFilter !== 'all' && draft.brand_key !== selectedBrandFilter) {
      return false;
    }
    if (selectedChannelFilter !== 'all' && draft.channel !== selectedChannelFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = (draft.topic || '').toLowerCase().includes(q);
      const matchBody = (draft.post_body || '').toLowerCase().includes(q);
      const matchHeadline = (draft.visual_headline || '').toLowerCase().includes(q);
      return matchTopic || matchBody || matchHeadline;
    }
    return true;
  });

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleStartEdit = (draft: ProductionPackage) => {
    setEditingId(draft.id);
    setEditFormData({
      selected_hook: draft.selected_hook || (draft.hook_options ? draft.hook_options[0] : ''),
      post_body: draft.post_body,
      visual_headline: draft.visual_headline,
      voiceover_script: draft.voiceover_script,
      hashtags: draft.hashtags,
    });
  };

  const handleSaveEdit = async (id: string) => {
    onUpdateDraft(id, editFormData);
    try {
      await fetch('/api/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'EDIT_DRAFT',
          headline: editFormData.visual_headline,
          content: editFormData.post_body,
        }),
      });
    } catch (err) {
      console.warn('Backend sync deferred:', err);
    }
    setEditingId(null);
  };

  // Direct transition: Approve, assign publishing date, and push directly to Calendar
  const handleConfirmScheduleAndApprove = async () => {
    if (!schedulingDraft) return;
    setIsSubmittingSchedule(true);
    const scheduledIso = new Date(scheduleDateTime).toISOString();

    try {
      const res = await fetch('/api/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schedulingDraft.id,
          action: 'APPROVE_AND_SCHEDULE',
          scheduled_date: scheduledIso,
          headline: schedulingDraft.visual_headline,
          content: schedulingDraft.post_body,
        }),
      });

      if (res.ok) {
        onUpdateDraft(schedulingDraft.id, {
          scheduled_date: scheduledIso,
          status: 'approved' as any,
          stage: 'scheduled' as any,
        });
        onUpdateStatus(schedulingDraft.id, 'approved');
      }
    } catch (err) {
      console.error('Schedule failed:', err);
      onUpdateStatus(schedulingDraft.id, 'approved');
    } finally {
      setIsSubmittingSchedule(false);
      setSchedulingDraft(null);
    }
  };

  // Direct transition: Move directly to Media Vault (stage: 'vault')
  const handleDirectMoveToVault = async (draft: ProductionPackage) => {
    try {
      const res = await fetch('/api/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          action: 'MOVE_TO_VAULT',
          live_url: `https://production.besheawe.com/vault/${draft.id}`,
        }),
      });
      if (res.ok) {
        onUpdateDraft(draft.id, {
          status: 'published' as any,
          stage: 'vault' as any,
        });
      }
    } catch (err) {
      console.error('Vault move failed:', err);
    }
  };

  const handleConfirmReject = (id: string) => {
    onUpdateStatus(id, 'rejected', rejectionReason || 'Standard editorial review rejection');
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Human Approval & Staging Queue
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingDrafts.length} Staged for Review
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Audit AI-generated drafts, fine-tune voice and hooks, schedule onto the posting calendar, or archive to vault.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToArchive}
            className="text-xs text-neutral-300 hover:text-white px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Archive className="w-3.5 h-3.5 text-neutral-400" />
            Media Vault & Archive
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search topic, copy, or headline..."
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
                  {BRANDS[k]?.name || k}
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

      {/* List of Drafts */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-500">
          <CheckCircle className="w-12 h-12 mx-auto text-neutral-700 stroke-[1.5] mb-3" />
          <h3 className="text-sm font-semibold text-neutral-300">
            Approval Queue Clear
          </h3>
          <p className="text-xs max-w-sm mx-auto mt-1 text-neutral-500">
            {pendingDrafts.length === 0
              ? 'All generated packages have been approved or rejected. Use the Production Studio to dispatch new agent directives.'
              : 'No pending items match your current filter parameters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const brand = BRANDS[draft.brand_key] || {
              name: draft.brand_key,
              palette: { accent: '#D97706', bg: '#111827' },
            };
            const isExpanded = expandedId === draft.id || expandedId === null;
            const isEditing = editingId === draft.id;
            const accent = brand?.palette?.accent || '#D97706';
            const bg = brand?.palette?.bg || '#111827';

            return (
              <div
                key={draft.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-all"
                style={{
                  borderLeft: `4px solid ${accent}`,
                }}
              >
                {/* Draft Summary Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/60 bg-neutral-950/40">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md text-white flex items-center gap-1.5"
                        style={{ backgroundColor: bg }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        [{draft.brand_key.toUpperCase()}] {brand.name}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {draft.channel}
                      </span>
                      {draft.magazine_column && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 font-medium">
                          Column: {draft.magazine_column}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Audience: <strong className="text-neutral-200">{draft.audience || 'Executive'}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                      {draft.topic}
                    </h3>
                  </div>

                  {/* Top Action Bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(draft)}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedulingDraft(draft)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-400/10 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" /> Approve & Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingId(draft.id)}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/80 hover:text-rose-300 text-neutral-300 font-medium text-xs flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? '' : draft.id)}
                      className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                      title={isExpanded ? 'Collapse card' : 'Expand full details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Visual Card Column */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                      <SocialCardCanvas
                        brandKey={draft.brand_key}
                        headline={
                          isEditing
                            ? editFormData.visual_headline || draft.visual_headline
                            : draft.visual_headline
                        }
                      />

                      {/* Generative Prompt Spec */}
                      <div className="w-full mt-3 p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                          Midjourney / Imagen 3 Spec:
                        </span>
                        <p className="text-[11px] text-neutral-300 font-mono leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                          {draft.image_prompt}
                        </p>
                      </div>
                    </div>

                    {/* Editorial & Voiceover Column */}
                    <div className="lg:col-span-8 space-y-4">
                      {isEditing ? (
                        /* EDIT MODE FORM */
                        <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                            <h4 className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-2">
                              <Edit3 className="w-3.5 h-3.5" /> Editorial Line Editor
                            </h4>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Editing Draft #{draft.id.slice(0, 8)}
                            </span>
                          </div>

                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">
                              Card Visual Headline (under 8 words)
                            </label>
                            <input
                              type="text"
                              value={editFormData.visual_headline || ''}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  visual_headline: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">
                              Primary Hook
                            </label>
                            <textarea
                              rows={2}
                              value={editFormData.selected_hook || ''}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  selected_hook: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">
                              Platform Body Copy
                            </label>
                            <textarea
                              rows={8}
                              value={editFormData.post_body || ''}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  post_body: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(draft.id)}
                              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs cursor-pointer shadow-md"
                            >
                              Save Draft Edits
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* VIEW MODE */
                        <>
                          {/* 3 Hook Options Selector */}
                          <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                3 Hook Variations (Select Primary)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(draft)}
                                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Copy
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(draft.hook_options || []).map((h, i) => {
                                const isCurrentSelected =
                                  (draft.selected_hook || draft.hook_options[0]) === h;
                                return (
                                  <label
                                    key={i}
                                    className={`p-3 rounded-lg border text-xs flex items-start gap-3 cursor-pointer transition ${
                                      isCurrentSelected
                                        ? 'border-amber-400/50 bg-amber-950/20 text-white'
                                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`hook-${draft.id}`}
                                      checked={isCurrentSelected}
                                      onChange={() =>
                                        onUpdateDraft(draft.id, { selected_hook: h })
                                      }
                                      className="mt-0.5 accent-amber-400"
                                    />
                                    <div className="flex-1 font-sans leading-snug">
                                      <span className="font-mono text-[10px] text-amber-400 mr-2">
                                        ANGLE #{i + 1}
                                      </span>
                                      {h}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyText(h, `hook-${draft.id}-${i}`);
                                      }}
                                      className="text-neutral-500 hover:text-white p-1"
                                      title="Copy this hook"
                                    >
                                      {copiedSection === `hook-${draft.id}-${i}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Post Body */}
                          <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                Native Platform Body ({draft.channel})
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                  <span className="text-neutral-400">
                                    {(draft.post_body || '').length} chars
                                  </span>
                                  {CHANNEL_SPECS[draft.channel]?.charLimit && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded font-bold ${
                                        (draft.post_body || '').length <=
                                        (CHANNEL_SPECS[draft.channel]?.charLimit || 0)
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      }`}
                                    >
                                      {(draft.post_body || '').length <=
                                      (CHANNEL_SPECS[draft.channel]?.charLimit || 0)
                                        ? `≤${CHANNEL_SPECS[draft.channel]?.charLimit}c`
                                        : `+${
                                            (draft.post_body || '').length -
                                            (CHANNEL_SPECS[draft.channel]?.charLimit || 0)
                                          }c over max`}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyText(draft.post_body, `body-${draft.id}`)
                                  }
                                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  {copiedSection === `body-${draft.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" /> Copy Post
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-neutral-900 text-xs text-neutral-200 whitespace-pre-line leading-relaxed font-sans max-h-56 overflow-y-auto">
                              {draft.post_body}
                            </div>

                            {/* AI Polish Suite */}
                            <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-mono font-semibold text-purple-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                  Gemini 3.8 Flash Polish Suite
                                </span>
                                {aiRefiningId === draft.id && (
                                  <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5 animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Refining with {aiRefiningAction}...
                                  </span>
                                )}
                              </div>

                              {aiRefineFeedback && aiRefineFeedback.id === draft.id && (
                                <div className="p-2 rounded bg-purple-950/40 border border-purple-800/50 text-[11px] font-mono text-purple-200 flex items-center justify-between">
                                  <span>✓ {aiRefineFeedback.message}</span>
                                  <button
                                    type="button"
                                    onClick={() => setAiRefineFeedback(null)}
                                    className="text-neutral-400 hover:text-white text-xs ml-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                {CHANNEL_SPECS[draft.channel]?.charLimit &&
                                  (draft.post_body || '').length > (CHANNEL_SPECS[draft.channel]?.charLimit || 0) && (
                                    <button
                                      type="button"
                                      disabled={aiRefiningId === draft.id}
                                      onClick={() => handleAiRefine(draft, 'tighten_chars')}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Scissors className="w-3 h-3 text-rose-400" />
                                      AI Auto-Tighten
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  disabled={aiRefiningId === draft.id}
                                  onClick={() => handleAiRefine(draft, 'more_contrarian')}
                                  className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Wand2 className="w-3 h-3 text-amber-400" />
                                  Elevate Posture
                                </button>

                                <button
                                  type="button"
                                  disabled={aiRefiningId === draft.id}
                                  onClick={() => handleAiRefine(draft, 'new_hooks')}
                                  className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  Fresh Hooks
                                </button>

                                <button
                                  type="button"
                                  disabled={aiRefiningId === draft.id}
                                  onClick={() => handleAiRefine(draft, 'eliminate_fluff')}
                                  className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldAlert className="w-3 h-3 text-emerald-400" />
                                  Purge Fluff
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
                              <span className="truncate">{draft.hashtags}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(draft.hashtags, `tags-${draft.id}`)
                                }
                                className="text-neutral-500 hover:text-white ml-2 shrink-0 cursor-pointer"
                              >
                                {copiedSection === `tags-${draft.id}` ? 'Copied' : 'Copy Tags'}
                              </button>
                            </div>
                          </div>

                          {/* Voiceover Script Player */}
                          <VoiceoverPlayer
                            script={draft.voiceover_script}
                            brandKey={draft.brand_key}
                            brandName={draft.brand_name}
                          />
                        </>
                      )}

                      {/* Bottom Control Strip */}
                      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-neutral-500">
                          ID: {draft.id.slice(0, 8)} • Created{' '}
                          {new Date(draft.created_at || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onDeleteDraft(draft.id)}
                            className="p-2 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                            title="Delete draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDirectMoveToVault(draft)}
                            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-neutral-700"
                            title="Bypass calendar and send directly to media vault"
                          >
                            <Archive className="w-3.5 h-3.5 text-neutral-400" /> Move to Vault
                          </button>
                          <button
                            type="button"
                            onClick={() => setSchedulingDraft(draft)}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Calendar className="w-4 h-4" /> Schedule to Calendar
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

      {/* SCHEDULE MODAL */}
      {schedulingDraft && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <Calendar className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Confirm & Schedule to Calendar</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Sign off on <strong>{schedulingDraft.topic}</strong> for{' '}
              <strong className="text-amber-300">{schedulingDraft.channel}</strong>. Once approved, this entry populates your interactive posting calendar.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 uppercase block">
                Target Publication Slot
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSchedulingDraft(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingSchedule}
                onClick={handleConfirmScheduleAndApprove}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isSubmittingSchedule ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Push to Calendar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Reject Content Package</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Document editorial critique or brand constraint infraction before archiving.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Tone too generic; violation of negative constraint; refine hook..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400/50"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReject(rejectingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

