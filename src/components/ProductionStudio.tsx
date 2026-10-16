import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Layers,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Compass,
  Save,
  RotateCcw,
  Clock,
  Wand2,
  ShieldCheck,
  Loader2,
  Bot,
} from 'lucide-react';
import { BRANDS, BrandKey, Channel, ProductionPackage, CHANNEL_SPECS } from '../types';
import { SocialCardCanvas } from './SocialCardCanvas';
import { VoiceoverPlayer } from './VoiceoverPlayer';
import { HookLibraryModal } from './HookLibraryModal';

const DRAFT_STORAGE_KEY = 'yazooblu_studio_draft_v1';

interface SavedStudioDraft {
  selectedBrandKey: BrandKey;
  selectedAudience: string;
  selectedChannel: Channel;
  topic: string;
  timestamp: number;
}

const loadSavedDraft = (): Partial<SavedStudioDraft> | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load saved studio draft:', e);
  }
  return null;
};

interface ProductionStudioProps {
  onDraftCreated: (draft: ProductionPackage) => void;
  latestDraft?: ProductionPackage | null;
  onNavigateToQueue: () => void;
  initialTopic?: string;
  initialChannel?: Channel;
}

export const ProductionStudio: React.FC<ProductionStudioProps> = ({
  onDraftCreated,
  latestDraft,
  onNavigateToQueue,
  initialTopic,
  initialChannel,
}) => {
  // Lazy initial state retrieval from localStorage
  const [initialSaved] = useState<Partial<SavedStudioDraft> | null>(() => loadSavedDraft());

  const [selectedBrandKey, setSelectedBrandKey] = useState<BrandKey>(() => {
    if (initialSaved?.selectedBrandKey && initialSaved.selectedBrandKey in BRANDS) {
      return initialSaved.selectedBrandKey as BrandKey;
    }
    return 'fyrrion';
  });
  const brand = BRANDS[selectedBrandKey];

  const [selectedAudience, setSelectedAudience] = useState<string>(() => {
    if (
      initialSaved?.selectedAudience &&
      brand.audiences.includes(initialSaved.selectedAudience)
    ) {
      return initialSaved.selectedAudience;
    }
    return brand.audiences[0];
  });

  const [selectedChannel, setSelectedChannel] = useState<Channel>(() => {
    if (initialChannel) return initialChannel;
    if (initialSaved?.selectedChannel) return initialSaved.selectedChannel;
    return 'LinkedIn';
  });

  const [topic, setTopic] = useState<string>(() => {
    if (initialTopic) return initialTopic;
    if (typeof initialSaved?.topic === 'string' && initialSaved.topic.trim().length > 0) {
      return initialSaved.topic;
    }
    return brand.sampleTopics[0];
  });

  const [isHookModalOpen, setIsHookModalOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    if (initialSaved?.timestamp) {
      return new Date(initialSaved.timestamp);
    }
    return null;
  });
  const [autoSaveState, setAutoSaveState] = useState<'saved' | 'saving' | 'idle'>(() => {
    return initialSaved?.timestamp ? 'saved' : 'idle';
  });
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => {
    return !!(initialSaved && initialSaved.topic && initialSaved.topic !== brand.sampleTopics[0]);
  });

  // Sync when initialTopic or initialChannel change from external props
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setShowRestoredNotice(false);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (initialChannel) setSelectedChannel(initialChannel);
  }, [initialChannel]);

  // Keep ref up to date for timer and unmount cleanup
  const stateRef = useRef({
    selectedBrandKey,
    selectedAudience,
    selectedChannel,
    topic,
  });

  useEffect(() => {
    stateRef.current = {
      selectedBrandKey,
      selectedAudience,
      selectedChannel,
      topic,
    };
  }, [selectedBrandKey, selectedAudience, selectedChannel, topic]);

  // Auto-save logic
  const saveDraftToStorage = useCallback(() => {
    try {
      const current = stateRef.current;
      if (!current.topic.trim()) return;

      setAutoSaveState('saving');
      const now = Date.now();
      const payload: SavedStudioDraft = {
        selectedBrandKey: current.selectedBrandKey,
        selectedAudience: current.selectedAudience,
        selectedChannel: current.selectedChannel,
        topic: current.topic,
        timestamp: now,
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedTime(new Date(now));
      setTimeout(() => {
        setAutoSaveState('saved');
      }, 350);
    } catch (err) {
      console.error('Failed to auto-save draft to local storage:', err);
      setAutoSaveState('idle');
    }
  }, []);

  // Periodic auto-save every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraftToStorage();
    }, 4000);

    return () => {
      clearInterval(timer);
      // Ensure latest progress is saved immediately on navigation / unmount
      saveDraftToStorage();
    };
  }, [saveDraftToStorage]);

  // Ensure progress is preserved if user closes tab or refreshes window
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraftToStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraftToStorage]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    const defaultBrand = BRANDS['fyrrion'];
    setSelectedBrandKey('fyrrion');
    setSelectedAudience(defaultBrand.audiences[0]);
    setSelectedChannel('LinkedIn');
    setTopic(defaultBrand.sampleTopics[0]);
    setLastSavedTime(null);
    setAutoSaveState('idle');
    setShowRestoredNotice(false);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // When brand changes, update default audience and topic
  const handleBrandChange = (newKey: BrandKey) => {
    setSelectedBrandKey(newKey);
    const newBrand = BRANDS[newKey];
    setSelectedAudience(newBrand.audiences[0]);
    setTopic(newBrand.sampleTopics[0]);
    setShowRestoredNotice(false);
    setAiSuggestions([]);
    setAuditResult(null);
  };

  // AI Brainstorm and Voice Audit state
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    compliance_score: number;
    verdict: string;
    identified_violations: string[];
    critique: string;
    surgical_rewrite?: string;
  } | null>(null);

  const handleBrainstormAngles = async () => {
    setIsBrainstorming(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/ai/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: selectedBrandKey,
          audience: selectedAudience,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.topics)) {
          setAiSuggestions(data.topics);
        }
      }
    } catch (e) {
      console.error('Failed to brainstorm angles:', e);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleRunAudit = async () => {
    if (!topic.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: selectedBrandKey,
          channel: selectedChannel,
          text: topic,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.result);
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDispatch = async () => {
    setIsGenerating(true);
    setError(null);
    setPipelineStep(1);
    setStatusMessage('1/3 Social Copywriter drafting native hooks & constraints...');

    const timer1 = setTimeout(() => {
      setPipelineStep(2);
      setStatusMessage('2/3 Voiceover Director pacing 30-45s timed script & audio tone...');
    }, 700);

    const timer2 = setTimeout(() => {
      setPipelineStep(3);
      setStatusMessage('3/3 Visual Director crafting card overlay & cinematic prompt...');
    }, 1400);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: selectedBrandKey,
          audience: selectedAudience,
          channel: selectedChannel,
          topic,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!response.ok) {
        throw new Error(`Generation error: ${response.statusText}`);
      }

      const data = await response.json();
      setPipelineStep(4);
      setStatusMessage('Production Package complete and routed to Human Approval Queue!');

      if (data.draft) {
        onDraftCreated(data.draft);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setPipelineStep(0);
      }, 1200);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Directive Setup */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  1. Directive Setup & Agent Dispatch
                </h3>
                <p className="text-xs text-neutral-400">
                  Target a sovereign brand persona and execute the 3-agent pipeline
                </p>
              </div>
            </div>
            
            {/* Auto-save status indicator & reset action */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-[11px] font-mono transition"
                title="Draft inputs auto-save periodically to local storage to protect against unexpected navigation"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    autoSaveState === 'saving'
                      ? 'bg-amber-400 animate-ping'
                      : lastSavedTime
                      ? 'bg-emerald-400'
                      : 'bg-neutral-600'
                  }`}
                />
                <span className="text-neutral-300">
                  {autoSaveState === 'saving' ? (
                    <span className="text-amber-300 font-semibold">Auto-saving...</span>
                  ) : lastSavedTime ? (
                    <>
                      <span className="text-neutral-400">Auto-saved:</span>{' '}
                      <span className="text-neutral-200">
                        {lastSavedTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-400">Auto-save ready</span>
                  )}
                </span>
              </div>

              {lastSavedTime && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  title="Clear saved draft from local storage and reset fields"
                  className="px-2 py-1 rounded-md bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-300 border border-neutral-800 hover:border-rose-900/40 text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Restored from Local Storage Notice */}
          {showRestoredNotice && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Draft Restored:</strong> Recovered your previous uncommitted editorial inputs from local storage.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoredNotice(false)}
                className="text-[10px] font-mono text-amber-400/80 hover:text-white px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Brand Selector Cards */}
          <div className="space-y-2 mb-5">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Sovereign Brand Persona
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(Object.keys(BRANDS) as BrandKey[]).map((key) => {
                const b = BRANDS[key];
                const isSelected = selectedBrandKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleBrandChange(key)}
                    className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                      isSelected
                        ? 'border-white bg-neutral-800 shadow-md ring-1 ring-white/20'
                        : 'border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: b.palette.accent }}
                      />
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-neutral-300'
                        }`}
                      >
                        {b.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate font-mono">
                      {b.archetype.split('/')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Brand Voice Banner */}
          <div
            className="p-3.5 rounded-xl border mb-5 text-xs transition"
            style={{
              backgroundColor: `${brand.palette.bg}dd`,
              borderColor: `${brand.palette.accent}40`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: brand.palette.accent }}
                  />
                  {brand.name}
                  <span className="text-[10px] font-normal text-neutral-300/80 px-2 py-0.5 rounded bg-black/40">
                    {brand.archetype}
                  </span>
                </span>
                <p className="mt-1.5 text-neutral-300 leading-relaxed text-[11px]">
                  <strong className="text-white">Posture:</strong> {brand.posture}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {brand.lexicon.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-neutral-200 border border-white/10"
                    >
                      +{term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] text-rose-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>Negative constraint: {brand.negativeConstraints}</span>
            </div>
          </div>

          {/* Form Fields: Audience & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                Target Audience Lane
              </label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
              >
                {brand.audiences.map((aud, idx) => (
                  <option key={idx} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Distribution Platform
                </label>
                {CHANNEL_SPECS[selectedChannel]?.charLimit && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Limit: {CHANNEL_SPECS[selectedChannel].charLimit} chars
                  </span>
                )}
              </div>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as Channel)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
              >
                <option value="LinkedIn">LinkedIn (150-250w Longform & Line Breaks)</option>
                <option value="X">X (Under 260 chars Sharp Hook)</option>
                <option value="TikTok">TikTok (Punchy Video Caption & Hook Cue)</option>
                <option value="Bluesky">Bluesky (300 chars max • Intellectual Discourse)</option>
                <option value="Threads">Threads (300 chars max • Provocative Debate)</option>
                <option value="Pinterest">Pinterest (800 chars max • Visual SEO Guide)</option>
                <option value="Instagram">Instagram (Visual Headline & Structured Caption)</option>
                <option value="YouTube">YouTube (Paced Script & Retention Hook)</option>
                <option value="Substack">Substack (Intellectual Editorial Thesis)</option>
                <option value="Facebook">Facebook (Executive Community Briefing)</option>
              </select>
              <p className="text-[11px] text-neutral-400 mt-1.5 font-mono">
                {CHANNEL_SPECS[selectedChannel]?.desc}
              </p>
            </div>
          </div>

          {/* Editorial Angle / Source Signal */}
          <div className="space-y-2 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Editorial Angle / Source Signal
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBrainstormAngles}
                  disabled={isBrainstorming}
                  title="Generate fresh, high-impact editorial angles tailored to this persona and audience using Gemini 3.8 Flash"
                  className="text-xs font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isBrainstorming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  AI Brainstorm Angles
                </button>
                <button
                  type="button"
                  onClick={handleRunAudit}
                  disabled={isAuditing || !topic.trim()}
                  title="Run real-time Gemini voice and negative constraint compliance audit"
                  className="text-xs font-mono text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  AI Voice Audit
                </button>
                <button
                  type="button"
                  onClick={saveDraftToStorage}
                  title="Save current editorial angle and parameters to local storage"
                  className="text-xs font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-neutral-400" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => setIsHookModalOpen(true)}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Browse Hook Library ({selectedChannel})
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (auditResult) setAuditResult(null);
              }}
              placeholder="Enter editorial angle, incident signal, or strategic insight..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/50 resize-y leading-relaxed font-sans"
            />

            {/* AI Brainstormed Angles Display */}
            {aiSuggestions.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Gemini 3.8 Flash Proposed Angles:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiSuggestions([])}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {aiSuggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopic(sugg);
                        setAiSuggestions([]);
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-neutral-950/80 hover:bg-purple-900/30 border border-purple-900/40 hover:border-purple-500/60 text-neutral-200 transition flex items-start justify-between gap-2 cursor-pointer group"
                    >
                      <span className="leading-snug">{sugg}</span>
                      <span className="text-[10px] font-mono text-purple-400 group-hover:text-purple-300 shrink-0">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Pre-flight Audit Result */}
            {auditResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                auditResult.verdict === 'COMPLIANT'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Audit Verdict: {auditResult.verdict} • Score: {auditResult.compliance_score}/100
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuditResult(null)}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] opacity-90">{auditResult.critique}</p>
                {auditResult.identified_violations.length > 0 && (
                  <div className="text-[10px] font-mono text-rose-300">
                    Flagged: {auditResult.identified_violations.join('; ')}
                  </div>
                )}
                {auditResult.surgical_rewrite && auditResult.surgical_rewrite !== topic && (
                  <div className="pt-1.5 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-300 italic truncate">
                      Suggestion: &quot;{auditResult.surgical_rewrite}&quot;
                    </span>
                    <button
                      type="button"
                      onClick={() => setTopic(auditResult.surgical_rewrite!)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-500/40 shrink-0 cursor-pointer"
                    >
                      Apply Rewrite
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Angle Prompts for this Brand */}
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block mb-1.5">
                Brand Core Archetype Anchors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {brand.sampleTopics.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sample)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer"
                  >
                    {sample.slice(0, 52)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Pipeline Progress Indicator (when generating) */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/30 mb-5 animate-pulse">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-amber-400 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> {statusMessage}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Step {pipelineStep} of 3
                </span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 transition-all duration-300"
                  style={{ width: `${(pipelineStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs mb-5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Dispatch Button */}
          <button
            type="button"
            disabled={isGenerating || !topic.trim()}
            onClick={handleDispatch}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-neutral-950" />
                Executing Multi-Agent Editorial Pipeline...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-neutral-950" />
                Dispatch Agent Team (Copywriter + Voiceover + Visual)
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Latest Generation Snapshot */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Latest Generation Snapshot
              </h3>
            </div>
            {latestDraft && (
              <button
                onClick={onNavigateToQueue}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                Go to Approval Queue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {latestDraft ? (
            <div className="space-y-4">
              {/* Brand and platform header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        BRANDS[latestDraft.brand_key]?.palette.accent || '#fff',
                    }}
                  />
                  {latestDraft.brand_name.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Channel: <strong className="text-white">{latestDraft.channel}</strong>
                </span>
              </div>

              {/* Social Card Graphic Canvas */}
              <div className="flex justify-center py-2">
                <SocialCardCanvas
                  brandKey={latestDraft.brand_key}
                  headline={latestDraft.visual_headline}
                />
              </div>

              {/* Hooks Options */}
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2 font-mono">
                  Hook Options ({latestDraft.hook_options.length})
                </span>
                <div className="space-y-2 text-xs">
                  {latestDraft.hook_options.map((hook, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-200 font-sans leading-snug flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-mono text-[10px] shrink-0 mt-0.5">
                        #{i + 1}
                      </span>
                      <span>{hook}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post Body Preview */}
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                    Platform Body ({latestDraft.channel})
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-neutral-400">
                      {latestDraft.post_body.length} chars
                    </span>
                    {CHANNEL_SPECS[latestDraft.channel]?.charLimit && (
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          latestDraft.post_body.length <=
                          (CHANNEL_SPECS[latestDraft.channel]?.charLimit || 0)
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {latestDraft.post_body.length <=
                        (CHANNEL_SPECS[latestDraft.channel]?.charLimit || 0)
                          ? `✓ Compliant (≤${CHANNEL_SPECS[latestDraft.channel]?.charLimit})`
                          : `⚠ Over limit (max ${CHANNEL_SPECS[latestDraft.channel]?.charLimit})`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
                  {latestDraft.post_body}
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-800/80 text-xs font-mono text-neutral-400 truncate">
                  {latestDraft.hashtags}
                </div>
              </div>

              {/* Voiceover Script Player */}
              <VoiceoverPlayer
                script={latestDraft.voiceover_script}
                brandKey={latestDraft.brand_key}
                brandName={latestDraft.brand_name}
              />

              {/* Queue CTA */}
              <button
                type="button"
                onClick={onNavigateToQueue}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Review in Human Approval Queue ({latestDraft.status})
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-16 text-center text-neutral-500 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-neutral-700 stroke-[1.5]" />
              <p className="text-xs max-w-xs mx-auto">
                No draft generated yet in this session. Configure directives on the left
                and click &quot;Dispatch Agent Team&quot;.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Algorithmic Hook Library Modal */}
      <HookLibraryModal
        isOpen={isHookModalOpen}
        onClose={() => setIsHookModalOpen(false)}
        onSelectHook={(hookText) => {
          // Fill template placeholders with brand context if possible
          const customized = hookText
            .replace(/\[X\]/g, brand.sampleTopics[0] || 'strategic directive')
            .replace(/\[Entity\]/g, brand.name)
            .replace(/\[Category\]/g, brand.lexicon[0]);
          setTopic(customized);
        }}
        activeBrand={brand}
        defaultChannel={selectedChannel}
      />
    </div>
  );
};
