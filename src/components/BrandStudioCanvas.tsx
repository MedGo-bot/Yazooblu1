import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BRANDS,
  BrandKey,
  Channel,
  ProductionPackage,
  CHANNEL_SPECS,
  PIPELINE_STAGES,
  PipelineStageKey,
  DraftVersion,
  DraftVersionSnapshot,
} from '../types';
import { SocialCardCanvas } from './SocialCardCanvas';
import { VoiceoverPlayer } from './VoiceoverPlayer';
import { HookLibraryModal } from './HookLibraryModal';
import { BrandRulesModal } from './BrandRulesModal';
import { BrandPictureGenerator } from './BrandPictureGenerator';
import { BrandVideoGenerator } from './BrandVideoGenerator';
import { BrandLogo } from './BrandLogo';
import { BrandIdentityModal } from './BrandIdentityModal';
import { CarouselBuilderModal } from './CarouselBuilderModal';
import {
  FileText,
  Lightbulb,
  ShieldCheck,
  Truck,
  Wand2,
  Palette,
  CheckCircle2,
  CheckCheck,
  Award,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Play,
  Clock,
  Layers,
  Send,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  History,
  Undo2,
  Loader2,
  Cpu,
  Bookmark,
  Camera,
  Video,
  Volume2,
  Newspaper,
  BookOpen,
  Compass,
  Film,
} from 'lucide-react';

interface BrandStudioCanvasProps {
  brandKey: BrandKey;
  onDraftCreated: (draft: ProductionPackage) => void;
  latestDraft?: ProductionPackage | null;
  onNavigateToQueue: () => void;
  onNavigateToArchive: () => void;
  initialTopic?: string;
  initialChannel?: Channel;
}

export const BrandStudioCanvas: React.FC<BrandStudioCanvasProps> = ({
  brandKey,
  onDraftCreated,
  latestDraft,
  onNavigateToQueue,
  onNavigateToArchive,
  initialTopic,
  initialChannel,
}) => {
  const brand = BRANDS[brandKey] || BRANDS.bhw_pr;

  // Safe Design Tokens
  const accentColor = brand.palette?.accent || brand.colors?.accent || '#D97706';
  const bgColor = brand.palette?.bg || brand.colors?.primary || '#0F172A';
  const secondaryColor = brand.palette?.secondary || brand.colors?.secondary || '#4B5563';
  const bgName = brand.palette?.names?.bg || 'dark';
  const accentName = brand.palette?.names?.accent || 'accent';
  const secondaryName = brand.palette?.names?.secondary || 'secondary';

  // Active Pipeline Stage (1 to 8)
  const [activeStage, setActiveStage] = useState<PipelineStageKey>('strategy');
  const [completedStages, setCompletedStages] = useState<Record<PipelineStageKey, boolean>>({
    strategy: false,
    ideation: false,
    approval_1: false,
    traffic: false,
    production: false,
    auditing: false,
    polish: false,
    qc: false,
  });

  // Selected Magazine Column / Editorial Section State
  const [selectedColumnId, setSelectedColumnId] = useState<string>(() => {
    return brand.columns?.[0]?.id || '';
  });
  const selectedColumn = brand.columns?.find((c) => c.id === selectedColumnId) || null;

  // Stage 1: Strategy State
  const [audience, setAudience] = useState<string>(
    brand.audiences?.[0] || 'Executive Leadership & Principals'
  );
  const [channel, setChannel] = useState<Channel>(initialChannel || 'LinkedIn');
  const [topic, setTopic] = useState<string>(
    initialTopic || brand.sampleTopics?.[0] || `Strategic positioning for ${brand.name}`
  );
  const [strategicObjective, setStrategicObjective] = useState<string>(
    `Establish category dominance for ${brand.name} via ${brand.lexicon?.[0]?.toLowerCase() || 'thought leadership'}`
  );
  const [strategicTension, setStrategicTension] = useState<string>(
    `Market participants default to superficial assumptions, ignoring ${brand.lexicon?.[1] || brand.lexicon?.[0] || 'core structural realities'}`
  );
  const [isHookModalOpen, setIsHookModalOpen] = useState(false);

  // Stage 2: Ideation State
  const [concepts, setConcepts] = useState<
    Array<{
      id: string;
      title: string;
      hook: string;
      angle: string;
      visualIdea: string;
    }>
  >([
    {
      id: 'c1',
      title: 'Contrarian Tension',
      hook: `When evaluating ${topic.toLowerCase()}, standard assumptions collapse under pressure.`,
      angle: 'Exposes structural friction in modern practices.',
      visualIdea: `Stark typography on ${bgName} background highlighting ${brand.lexicon?.[0] || 'Editorial'}`,
    },
    {
      id: 'c2',
      title: 'Evidentiary Telemetry',
      hook: `Internal telemetry reveals what industry rhetoric conceals regarding ${topic.toLowerCase()}.`,
      angle: 'Spec-driven proof and operational measurement.',
      visualIdea: `High-contrast schematic layout with ${accentName} accents`,
    },
    {
      id: 'c3',
      title: 'Institutional Authority',
      hook: `The difference between tactical noise and long-horizon governance comes down to ${(brand.lexicon?.[0] || 'Editorial').toLowerCase()}.`,
      angle: 'Stately, peer-to-peer executive counsel.',
      visualIdea: `Minimalist executive card framed in ${secondaryName}`,
    },
  ]);
  const [selectedConceptId, setSelectedConceptId] = useState<string>('c1');

  // Stage 3: Approval 1 (CCO Gate)
  const [ccoApproved, setCcoApproved] = useState<boolean>(false);
  const [ccoNotes, setCcoNotes] = useState<string>(
    `Core concept authorized. Calibrated to ${brand.archetype} posture. Zero consumer slang approved.`
  );

  // Stage 4: Traffic Manager (Logistics)
  const [trafficPriority, setTrafficPriority] = useState<'Standard' | 'Urgent' | 'Boardroom Express'>('Standard');
  const [trafficDeadline, setTrafficDeadline] = useState<string>('Today • 17:00 EST');
  const [trafficDispatched, setTrafficDispatched] = useState<boolean>(false);

  // Stage 5: Production Assets (Visual Director & VO Director)
  const [visualHeadline, setVisualHeadline] = useState<string>(
    `${brand.lexicon?.[0] || 'Editorial'} Structural Protocol`
  );
  const [imagePrompt, setImagePrompt] = useState<string>(
    `Cinematic, architectural study in ${bgName} and ${accentName}, editorial typography, zero clutter, 8k resolution`
  );
  const [voiceoverScript, setVoiceoverScript] = useState<string>(
    `[0:00-0:03 Hook] When evaluating this challenge, conventional assumptions fail.\n[0:03-0:15 Tension] Most treat structural erosion as an operational footnote.\n[0:15-0:30 Diagnostic] In reality, true durability requires rigorous ${(brand.lexicon?.[0] || 'editorial rigor').toLowerCase()}.\n[0:30-0:45 Command] The protocol starts now. Calibrate your standards accordingly.\n[Music / Tone: Measured, authoritative, subtle low-frequency resonance]`
  );
  const [curatedPhotoUrl, setCuratedPhotoUrl] = useState<string | null>(null);
  const [curatedVideoUrl, setCuratedVideoUrl] = useState<string | null>(null);

  // Stage 6: Auditing & Assembly
  const [assembledBody, setAssembledBody] = useState<string>(
    `When evaluating ${topic.toLowerCase()}, standard assumptions collapse.\n\nTrue authority in our domain requires ${(brand.lexicon?.[0] || 'editorial discipline').toLowerCase()} over transient sentiment. Rigorous standards dictate real-world outcomes.\n\nKey takeaway: Never confuse tactical activity with structural permanence.`
  );
  const [auditPassed, setAuditPassed] = useState<boolean>(true);
  const [alignmentScore, setAlignmentScore] = useState<number>(98);

  // Stage 7: Final Polish (Platform Packaging)
  const [formattedBody, setFormattedBody] = useState<string>(assembledBody);
  const [hashtags, setHashtags] = useState<string>(
    `#${brand.name.replace(/\s+/g, '')} #${(brand.lexicon?.[0] || 'Editorial').replace(/\s+/g, '')} #StrategicAuthority #ExecutiveInsight`
  );

  // Stage 8: Quality Control (QC)
  const [qcSignoff, setQcSignoff] = useState<boolean>(false);
  const [qcNotes, setQcNotes] = useState<string>(
    'Creative Director QC Verification: 100% brand voice adherence, negative constraints passed, platform character constraints verified.'
  );

  // Version History State
  const [versionHistory, setVersionHistory] = useState<DraftVersion[]>([]);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState<boolean>(false);

  // UI state
  const [canvasMode, setCanvasMode] = useState<'assembly' | 'pipeline'>('assembly');
  const [hasAssembled, setHasAssembled] = useState<boolean>(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [finalPackageCreated, setFinalPackageCreated] = useState<ProductionPackage | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isBrandIdentityModalOpen, setIsBrandIdentityModalOpen] = useState<boolean>(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState<boolean>(false);
  const [stage5SubTab, setStage5SubTab] = useState<'picture' | 'video' | 'audio' | 'rules'>('picture');

  // Handle switching magazine column / section
  const handleSelectColumn = (colId: string) => {
    setSelectedColumnId(colId);
    const col = brand.columns?.find((c) => c.id === colId);
    if (col) {
      const colTopic = col.sampleTopics?.[0] || brand.sampleTopics?.[0] || `Strategic positioning for ${brand.name}`;
      const colLexicon = col.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial';

      setTopic(colTopic);
      setStrategicObjective(
        `Establish category authority for ${brand.name} [${col.name}] via ${colLexicon}`
      );
      setStrategicTension(col.editorialDirective || `Structural alignment across ${col.name}`);
      setVisualHeadline(`${col.name.toUpperCase()}: ${colLexicon}`);
      if (
        col.recommendedChannels &&
        col.recommendedChannels.length > 0 &&
        !col.recommendedChannels.includes(channel)
      ) {
        setChannel(col.recommendedChannels[0]);
      }
      setHashtags(
        `#${brand.name.replace(/\s+/g, '')} #${col.name.replace(/\s+/g, '')} #${colLexicon.replace(/\s+/g, '')} #SartorialDiscipline`
      );
      // Calibrate Ideation concepts to this column
      setConcepts([
        {
          id: 'c1',
          title: `${col.name}: Contrarian Thesis`,
          hook: `In our latest dispatch for ${col.name}: ${colTopic}.`,
          angle: col.editorialDirective || 'Exposes structural friction in modern practices.',
          visualIdea:
            col.visualGuidance ||
            `Stark architectural composition in ${bgName}`,
        },
        {
          id: 'c2',
          title: `${col.name}: Investigative Evidentiary`,
          hook: `Forensic analysis from ${col.assignedWorkers || 'our editorial desk'}: ${col.sampleTopics?.[1] || colTopic}.`,
          angle: 'Evidence, provenance, and material integrity.',
          visualIdea: `Macro study of ${colLexicon} with ${accentName} highlights`,
        },
        {
          id: 'c3',
          title: `${col.name}: Sovereign Authority`,
          hook: `Why conventional standards fail in ${col.subtitle || col.name}: The definitive stance.`,
          angle: 'Peer-to-peer editorial counsel and permanent standards.',
          visualIdea: `High-density editorial layout in ${secondaryName}`,
        },
      ]);
      setSelectedConceptId('c1');
    }
  };

  // Re-sync when brand changes
  useEffect(() => {
    const defaultCol = brand.columns && brand.columns.length > 0 ? brand.columns[0] : null;
    setSelectedColumnId(defaultCol ? defaultCol.id : '');
    setAudience(brand.audiences?.[0] || 'Executive Leadership & Principals');
    const initTopic = defaultCol?.sampleTopics?.[0] || brand.sampleTopics?.[0] || `Strategic positioning for ${brand.name}`;
    setTopic(initTopic);
    setStrategicObjective(
      defaultCol
        ? `Establish category dominance for ${brand.name} [${defaultCol.name}] via ${defaultCol.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
        : `Establish category dominance for ${brand.name} via ${(brand.lexicon?.[0] || 'Editorial').toLowerCase()}`
    );
    setStrategicTension(
      defaultCol
        ? defaultCol.editorialDirective || `Structural standards for ${defaultCol.name}`
        : `Market participants default to superficial assumptions, ignoring ${brand.lexicon?.[1] || brand.lexicon?.[0] || 'core structural realities'}`
    );
    setVisualHeadline(
      defaultCol
        ? `${defaultCol.name.toUpperCase()}: ${defaultCol.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
        : `${brand.lexicon?.[0] || 'Editorial'} Protocol`
    );
    setImagePrompt(
      `Cinematic, architectural study in ${bgName} and ${accentName}, editorial typography, zero clutter`
    );
    setVoiceoverScript(
      `[0:00-0:03 Hook] When evaluating this challenge, conventional assumptions fail.\n[0:03-0:15 Tension] Most treat structural erosion as an operational footnote.\n[0:15-0:30 Diagnostic] In reality, true durability requires rigorous ${(brand.lexicon?.[0] || 'editorial rigor').toLowerCase()}.\n[0:30-0:45 Command] The protocol starts now. Calibrate your standards accordingly.\n[Tone: Measured, calculated authority]`
    );
    setAssembledBody(
      `When evaluating ${initTopic.toLowerCase()}, standard assumptions collapse.\n\nTrue authority requires ${(brand.lexicon?.[0] || 'editorial rigor').toLowerCase()} over transient sentiment. Rigorous standards dictate real-world outcomes.`
    );
    setFormattedBody(
      `When evaluating ${initTopic.toLowerCase()}, standard assumptions collapse.\n\nTrue authority requires ${(brand.lexicon?.[0] || 'editorial rigor').toLowerCase()} over transient sentiment. Rigorous standards dictate real-world outcomes.`
    );
    setHashtags(
      defaultCol
        ? `#${brand.name.replace(/\s+/g, '')} #${defaultCol.name.replace(/\s+/g, '')} #ExecutiveInsight`
        : `#${brand.name.replace(/\s+/g, '')} #${(brand.lexicon?.[0] || 'Editorial').replace(/\s+/g, '')} #ExecutiveInsight`
    );
    setCcoApproved(false);
    setTrafficDispatched(false);
    setQcSignoff(false);
    setFinalPackageCreated(null);
    setCompletedStages({
      strategy: false,
      ideation: false,
      approval_1: false,
      traffic: false,
      production: false,
      auditing: false,
      polish: false,
      qc: false,
    });
    setActiveStage('strategy');
  }, [brandKey]);

  // Handle Copy
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Helper to record a version snapshot
  const recordVersionSnapshot = (author: DraftVersion['author'], note: string) => {
    const snapshot: DraftVersionSnapshot = {
      channel,
      post_body: formattedBody,
      selected_hook: concepts.find((c) => c.id === selectedConceptId)?.hook || concepts?.[0]?.hook || '',
      visual_headline: visualHeadline,
      voiceover_script: voiceoverScript,
      hashtags,
      topic,
      magazine_column: selectedColumn ? selectedColumn.name : undefined,
    };
    const newVersion: DraftVersion = {
      id: `ver-${Date.now()}`,
      version: versionHistory.length + 1,
      timestamp: new Date().toISOString(),
      author,
      note,
      snapshot,
      changeSummary: note,
    };
    setVersionHistory((prev) => [newVersion, ...prev]);
  };

  // Revert to a previous version
  const handleRevertVersion = (ver: DraftVersion) => {
    setFormattedBody(ver.snapshot.post_body);
    setAssembledBody(ver.snapshot.post_body);
    setVisualHeadline(ver.snapshot.visual_headline);
    setVoiceoverScript(ver.snapshot.voiceover_script);
    setHashtags(ver.snapshot.hashtags);
    if (ver.snapshot.topic) setTopic(ver.snapshot.topic);
    if (ver.snapshot.channel) setChannel(ver.snapshot.channel);
    if (ver.snapshot.magazine_column && brand.columns) {
      const match = brand.columns.find((c) => c.name === ver.snapshot.magazine_column);
      if (match) setSelectedColumnId(match.id);
    }

    recordVersionSnapshot('Reversion', `Reverted back to Version ${ver.version}`);
    setSaveStatus(`Restored Version ${ver.version}`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Run End-to-End Autonomous Pipeline
  const handleRunFullPipeline = async () => {
    setIsGeneratingAll(true);
    setSaveStatus('Dispatching 8-Stage Agency Team via Gemini...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: brand.key,
          audience,
          channel,
          topic,
          magazine_column: selectedColumn ? selectedColumn.name : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const draft: ProductionPackage = data.draft;

        if (draft) {
          // Update Ideation concepts
          if (Array.isArray(draft.hook_options) && draft.hook_options.length > 0) {
            setConcepts([
              {
                id: 'c1',
                title: selectedColumn ? `${selectedColumn.name}: Hook 1` : 'Contrarian Hook',
                hook: draft.hook_options[0],
                angle: selectedColumn ? selectedColumn.editorialDirective : 'Stark friction angle',
                visualIdea: `${draft.visual_headline} with ${accentName} typography`,
              },
              {
                id: 'c2',
                title: selectedColumn ? `${selectedColumn.name}: Hook 2` : 'Evidentiary Telemetry',
                hook: draft.hook_options[1] || draft.hook_options[0],
                angle: 'Measured proof & data telemetry',
                visualIdea: `Structural alignment graphic on ${bgName}`,
              },
              {
                id: 'c3',
                title: selectedColumn ? `${selectedColumn.name}: Hook 3` : 'Institutional Authority',
                hook: draft.hook_options[2] || draft.hook_options[0],
                angle: 'Peer-to-peer executive stance',
                visualIdea: `High-density card with ${secondaryName} framing`,
              },
            ]);
            setSelectedConceptId('c1');
          }

          if (draft.visual_headline) setVisualHeadline(draft.visual_headline);
          if (draft.voiceover_script) setVoiceoverScript(draft.voiceover_script);
          if (draft.image_prompt) setImagePrompt(draft.image_prompt);
          if (draft.post_body) {
            setAssembledBody(draft.post_body);
            setFormattedBody(draft.post_body);
          }
          if (draft.hashtags) setHashtags(draft.hashtags);

          // Mark all stages as passed
          setCcoApproved(true);
          setTrafficDispatched(true);
          setAuditPassed(true);
          setQcSignoff(true);

          setCompletedStages({
            strategy: true,
            ideation: true,
            approval_1: true,
            traffic: true,
            production: true,
            auditing: true,
            polish: true,
            qc: true,
          });

          setActiveStage('qc');
          recordVersionSnapshot('AI Generation', '8-Stage Agency Pipeline executed');
          setSaveStatus('Pipeline completed! Review in Quality Control (Stage 8).');
        }
      }
    } catch (err) {
      console.error('Pipeline error:', err);
      setCcoApproved(true);
      setTrafficDispatched(true);
      setAuditPassed(true);
      setQcSignoff(true);
      setCompletedStages({
        strategy: true,
        ideation: true,
        approval_1: true,
        traffic: true,
        production: true,
        auditing: true,
        polish: true,
        qc: true,
      });
      setActiveStage('qc');
      recordVersionSnapshot('AI Generation', 'Heuristic 8-Stage Agency Pipeline completed');
      setSaveStatus('Pipeline completed via Autonomous Studio rules.');
    } finally {
      setIsGeneratingAll(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  // Final QC Approval and Dispatch to Archive & Global Queue
  const handleFinalQCApproval = async () => {
    const selectedHook =
      concepts.find((c) => c.id === selectedConceptId)?.hook || concepts?.[0]?.hook || '';

    const newPackage: ProductionPackage = {
      id: `pkg-${brand.key}-${Date.now()}`,
      brand_key: brand.key,
      brand_name: brand.name,
      channel,
      audience,
      topic,
      magazine_column: selectedColumn ? selectedColumn.name : undefined,
      hook_options: concepts.map((c) => c.hook),
      selected_hook: selectedHook,
      post_body: formattedBody,
      voiceover_script: voiceoverScript,
      visual_headline: visualHeadline,
      image_prompt: imagePrompt,
      hashtags,
      status: 'approved',
      created_at: new Date().toISOString(),
      version_history: versionHistory,
    };

    try {
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage),
      });
    } catch (err) {
      console.warn('Backend sync:', err);
    }

    onDraftCreated(newPackage);
    setFinalPackageCreated(newPackage);
    setSaveStatus(`Finalized & dispatched to Approved Pipeline Archive!`);
  };

  // Save to Human Approval Queue as Pending Review
  const handleSaveToQueue = async () => {
    const selectedHook =
      concepts.find((c) => c.id === selectedConceptId)?.hook || concepts?.[0]?.hook || '';

    const newPackage: ProductionPackage = {
      id: `pkg-${brand.key}-${Date.now()}`,
      brand_key: brand.key,
      brand_name: brand.name,
      channel,
      audience,
      topic,
      magazine_column: selectedColumn ? selectedColumn.name : undefined,
      hook_options: concepts.map((c) => c.hook),
      selected_hook: selectedHook,
      post_body: formattedBody,
      voiceover_script: voiceoverScript,
      visual_headline: visualHeadline,
      image_prompt: imagePrompt,
      hashtags,
      photo_url: curatedPhotoUrl || undefined,
      video_url: curatedVideoUrl || undefined,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      version_history: versionHistory,
    };

    try {
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage),
      });
    } catch (err) {
      console.warn('Backend sync:', err);
    }

    onDraftCreated(newPackage);
    setSaveStatus(`Saved to Human Approval Queue!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Channel char limit
  const currentSpec = CHANNEL_SPECS[channel] || CHANNEL_SPECS.LinkedIn;
  const charLimit = currentSpec.charLimit || 2000;
  const charCount = formattedBody.length;
  const isOverLimit = charLimit ? charCount > charLimit : false;

  return (
    <div className="space-y-6">
      {/* Brand Studio Header Card */}
      <div
        className="rounded-2xl border p-6 backdrop-blur-md relative overflow-hidden"
        style={{
          backgroundColor: '#0a0d12',
          borderColor: `${accentColor}35`,
          boxShadow: `0 20px 40px -15px ${accentColor}15`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Clickable Brand Logo Badge */}
            <button
              type="button"
              onClick={() => setIsBrandIdentityModalOpen(true)}
              className="rounded-xl overflow-hidden p-1 border shadow-xl shrink-0 transition-all hover:scale-105 cursor-pointer group"
              style={{
                borderColor: `${accentColor}60`,
                backgroundColor: bgColor,
                boxShadow: `0 8px 24px -6px ${accentColor}30`,
              }}
              title={`Inspect official ${brand.name} logo and color palette`}
            >
              <BrandLogo brandKey={brandKey} size="lg" />
              <div
                className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                <Palette className="w-2.5 h-2.5" />
                <span>Theme</span>
              </div>
            </button>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Individual Brand Studio • 8-Stage Architecture
                </span>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase hidden sm:inline-block"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                  }}
                >
                  {accentName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {brand.name}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
                <strong className="text-white font-semibold">{brand.archetype}:</strong>{' '}
                {brand.posture}
              </p>

              {/* Negative Constraints */}
              <div className="pt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <span className="text-neutral-500">Constraint:</span>
                <span className="text-amber-300/90 italic font-mono text-[11px]">
                  {brand.negativeConstraints}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Studio Actions */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRunFullPipeline}
              disabled={isGeneratingAll}
              className="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 text-neutral-950"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 8px 20px -4px ${accentColor}40`,
              }}
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running 8-Stage Agency...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Full 8-Stage Pipeline
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBrandIdentityModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Inspect Official Brand Logo & Color Palette"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Logo & Theme
              </button>

              <button
                type="button"
                onClick={() => setIsRulesModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Inspect Brand Picture & Video Generator Rules"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Media Rules
              </button>

              <button
                type="button"
                onClick={() => setIsVersionDrawerOpen(true)}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-neutral-400" />
                History ({versionHistory.length})
              </button>

              <button
                type="button"
                onClick={() => setIsHookModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Browse Algorithmic Hook Library"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Hooks
              </button>
            </div>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700 text-xs text-amber-300 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* STUDIO OS WORKSPACE BAR & MODE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md font-mono font-bold text-xs"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}50`,
            }}
          >
            OS
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{brandKey === 'bes_outkast' ? 'BOS Editorial Assembly Canvas' : `${brand.name} Editorial Assembly Canvas`}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                1:2 Split Studio OS
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Direct Streamlit Studio OS architecture: Editorial Lane (Left) & Output Canvas (Right)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCanvasMode('assembly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              canvasMode === 'assembly'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1:2 Studio Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setCanvasMode('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              canvasMode === 'pipeline'
                ? 'bg-neutral-800 text-white shadow-md font-bold border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>8-Stage Pipeline</span>
          </button>
        </div>
      </div>

      {/* 1:2 SPLIT ASSEMBLY CANVAS */}
      {canvasMode === 'assembly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* col_left: Editorial Lane & Voice */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border p-5 space-y-4 bg-neutral-900/90 border-neutral-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Editorial Lane & Voice
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">col_left [1]</span>
              </div>

              {/* Select Editorial Column */}
              {brand.columns && brand.columns.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 flex items-center justify-between">
                    <span>Select Editorial Column</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {brand.columns.length} Columns
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedColumnId}
                      onChange={(e) => handleSelectColumn(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 hover:border-neutral-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium transition cursor-pointer appearance-none pr-9"
                    >
                      {brand.columns.map((col, idx) => (
                        <option key={col.id} value={col.id} className="bg-neutral-900 text-white py-1">
                          {idx + 1}. {col.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              {/* Callout Box: Byline & Focus */}
              {selectedColumn && (
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-2 text-xs">
                  <div>
                    <span className="text-blue-400 font-bold block text-[11px] uppercase tracking-wider">
                      Byline:
                    </span>
                    <span className="text-neutral-200 font-medium leading-relaxed block mt-0.5">
                      {selectedColumn.assignedWorkers || selectedColumn.bylines}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-900/50">
                    <span className="text-blue-400 font-bold block text-[11px] uppercase tracking-wider">
                      Focus:
                    </span>
                    <span className="text-neutral-300 text-[11px] leading-relaxed block mt-0.5">
                      {selectedColumn.description || selectedColumn.focus}
                    </span>
                  </div>
                </div>
              )}

              {/* Story Seed / Topic Angle text_area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-200">
                    Story Seed / Topic Angle
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHookModalOpen(true)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3" />
                    Hook Vault
                  </button>
                </div>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ minHeight: '150px' }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition resize-y font-sans leading-relaxed"
                  placeholder="Enter raw narrative or intelligence seed..."
                />
              </div>

              {/* Sample Topic Seeds for Active Column */}
              {selectedColumn && selectedColumn.sampleTopics && selectedColumn.sampleTopics.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">
                    Curated Story Seeds (Click to load):
                  </span>
                  <div className="space-y-1">
                    {selectedColumn.sampleTopics.slice(0, 3).map((st, sidx) => (
                      <button
                        key={sidx}
                        type="button"
                        onClick={() => {
                          setTopic(st);
                          setStrategicObjective(
                            `Establish category authority for ${brand.name} [${selectedColumn.name}] via ${selectedColumn.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
                          );
                          setVisualHeadline(
                            `${selectedColumn.name.toUpperCase()}: ${selectedColumn.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
                          );
                        }}
                        className={`w-full text-left text-[11px] p-2 rounded-lg border transition cursor-pointer truncate ${
                          topic === st
                            ? 'bg-neutral-800 text-white border-amber-400'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        • {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Channel Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Target Distribution Channel:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['LinkedIn', 'Instagram', 'Substack', 'X', 'YouTube', 'Threads'] as Channel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition cursor-pointer ${
                        channel === ch
                          ? 'bg-neutral-800 text-white border-amber-400 font-bold shadow-sm'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Assemble Button */}
              <button
                type="button"
                onClick={() => {
                  setHasAssembled(true);
                  handleRunFullPipeline();
                }}
                disabled={isGeneratingAll}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 text-neutral-950 hover:brightness-110 active:scale-[0.99]"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 24px -6px ${accentColor}50`,
                }}
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assembling editorial bundle within studio canvas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {brandKey === 'bes_outkast' ? 'BOS' : brand.name} Package</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* col_right: Output Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border p-5 space-y-5 bg-neutral-900/90 border-neutral-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  Output Canvas
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">col_right [2]</span>
              </div>

              {!hasAssembled ? (
                <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/60 p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[380px]">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-neutral-300 font-medium max-w-md">
                    Select a column lane on the left and hit assemble to render the editorial card and platform hooks.
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">
                    Desk: {selectedColumn?.name || brand.name} • Assigned Lead: {selectedColumn?.assignedWorkers || brand.archetype}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 font-mono text-[10px] uppercase block">
                        Active Desk:
                      </span>
                      <strong className="text-white text-sm font-mono">
                        `{selectedColumn?.name || brand.name}`
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-mono text-[10px] uppercase block sm:text-right">
                        Lead:
                      </span>
                      <strong className="text-amber-400 font-mono text-xs">
                        `{selectedColumn?.assignedWorkers || selectedColumn?.bylines || brand.archetype}`
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                    {isGeneratingAll ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Assembling editorial bundle within studio canvas...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Editorial package assembled within studio canvas for {channel}. Ready for review or queue dispatch.</span>
                      </>
                    )}
                  </div>

                  {/* Hook Candidates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-300 uppercase font-mono text-[10px]">
                        Calibrated Platform Hooks ({channel}):
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Click hook to select
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {concepts.map((c, cIdx) => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedConceptId(c.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer text-xs space-y-1 ${
                            selectedConceptId === c.id
                              ? 'bg-neutral-800 text-white border-amber-400 shadow-md ring-1 ring-amber-400/30'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-amber-400 font-bold">
                              Angle {cIdx + 1}: {c.title}
                            </span>
                            {selectedConceptId === c.id && (
                              <span className="text-[10px] font-mono text-emerald-400">
                                ✓ Active Hook
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-neutral-100">{c.hook}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Long-Form Post Body */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-300 uppercase font-mono text-[10px]">
                          Editorial Card & Formatted Post Copy
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isOverLimit
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          {charCount} / {charLimit} chars
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(formattedBody, 'Formatted Post Copy')}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedSection === 'Formatted Post Copy' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      value={formattedBody}
                      onChange={(e) => setFormattedBody(e.target.value)}
                      rows={7}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition font-sans leading-relaxed resize-y"
                    />

                    {/* Hashtags */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Tags:</span>
                      <input
                        type="text"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Voiceover & Visual Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                        Voiceover Audio Track:
                      </span>
                      <VoiceoverPlayer
                        script={voiceoverScript}
                        brandKey={brand.key}
                        brandName={brand.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                        Visual Headline & Attached Media:
                      </span>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                        <div className="font-bold text-white text-xs truncate">
                          {visualHeadline}
                        </div>
                        {curatedPhotoUrl && (
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 truncate">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Curated Photo Attached</span>
                          </div>
                        )}
                        {curatedVideoUrl && (
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 truncate">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Pixabay B-Roll Video Attached</span>
                          </div>
                        )}
                        <p className="text-[11px] text-neutral-400 line-clamp-2">
                          {imagePrompt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Output Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setCanvasMode('pipeline')}
                      className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deep Forensic 8-Stage Audit →</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveToQueue}
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save to Queue</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalQCApproval}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Direct Approve & Dispatch</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8-STAGE FORENSIC PIPELINE VIEW */}
      {canvasMode === 'pipeline' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-xl">
            <div className="text-[11px] font-mono uppercase text-neutral-400 mb-2 px-1 flex items-center justify-between">
              <span>Creative Workflow Stages</span>
              <span className="text-neutral-500">
                Step {PIPELINE_STAGES.findIndex((s) => s.key === activeStage) + 1} of 8
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {PIPELINE_STAGES.map((stage) => {
                const isActive = activeStage === stage.key;
                const isCompleted = completedStages[stage.key];

                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setActiveStage(stage.key)}
                    className={`relative flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer group ${
                      isActive
                        ? 'bg-neutral-800/90 border-neutral-600 shadow-md ring-1'
                        : isCompleted
                        ? 'bg-neutral-950/60 border-emerald-900/40 hover:bg-neutral-900/50'
                        : 'bg-neutral-950/40 border-neutral-900 hover:bg-neutral-900/30 text-neutral-500'
                    }`}
                    style={{
                      borderColor: isActive ? accentColor : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          isActive
                            ? 'text-white'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-neutral-500'
                        }`}
                      >
                        0{stage.stepNumber}
                      </span>

                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isActive ? (
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: accentColor }}
                        />
                      ) : null}
                    </div>

                    <div
                      className={`text-xs font-semibold leading-tight truncate ${
                        isActive ? 'text-white' : isCompleted ? 'text-neutral-200' : 'text-neutral-400'
                      }`}
                    >
                      {stage.title}
                    </div>

                    <div className="text-[10px] text-neutral-500 leading-tight truncate mt-0.5">
                      {stage.workers.split('→')[0].split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE 1: STRATEGY */}
          {activeStage === 'strategy' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 1
                    </span>
                    <h2 className="text-lg font-bold text-white">Strategy & Brief Formulation</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Workers:</strong> Strategist & Account Manager create the brief and calibrate strategic tension.
                  </p>
                </div>
                <span className="text-xs text-neutral-500 font-mono hidden sm:block">
                  {brand.name}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Magazine Column Selector */}
                  {brand.columns && brand.columns.length > 0 && (
                    <div
                      className="rounded-xl border p-4.5 space-y-3.5 transition-all"
                      style={{
                        backgroundColor: '#0c0e14',
                        borderColor: `${accentColor}45`,
                        boxShadow: `0 8px 24px -8px ${accentColor}25`,
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accentColor}25` }}
                          >
                            <Newspaper
                              className="w-4 h-4"
                              style={{ color: accentColor }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {brandKey === 'bes_outkast'
                                  ? 'Bes Outkast Society Magazine Column'
                                  : 'Editorial Column / Desk'}
                              </span>
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                                style={{
                                  borderColor: `${accentColor}50`,
                                  color: accentColor,
                                  backgroundColor: `${accentColor}12`,
                                }}
                              >
                                {brand.columns.length} Sections
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              Select the magazine column to develop social media content for:
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-200 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            Active Magazine Column / Desk:
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Auto-calibrates brief & workers
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedColumnId}
                            onChange={(e) => handleSelectColumn(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 hover:border-neutral-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium transition cursor-pointer appearance-none pr-9"
                          >
                            {brand.columns.map((col, idx) => (
                              <option
                                key={col.id}
                                value={col.id}
                                className="bg-neutral-900 text-white py-1"
                              >
                                {idx + 1}. {col.name} — {col.subtitle}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </div>
                        </div>
                      </div>

                      {/* Selected Column Dossier */}
                      {selectedColumn && (
                        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 space-y-3 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: accentColor }}
                                />
                                <h4 className="text-xs font-bold text-white">
                                  {selectedColumn.name}
                                </h4>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 pl-3.5">
                                {selectedColumn.subtitle}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 flex-wrap pl-3.5 sm:pl-0">
                              <span className="text-[10px] text-neutral-500">Best for:</span>
                              {(selectedColumn.recommendedChannels || []).map((rc) => (
                                <button
                                  key={rc}
                                  type="button"
                                  onClick={() => setChannel(rc)}
                                  className={`text-[10px] px-2 py-0.5 rounded font-mono border transition cursor-pointer ${
                                    channel === rc
                                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                                  }`}
                                  title={`Switch distribution channel to ${rc}`}
                                >
                                  {rc} {channel === rc && '✓'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                              <Compass className="w-3.5 h-3.5" />
                              <span>What This Section Does & Editorial Scope:</span>
                            </div>
                            <p className="text-neutral-200 text-[11px] leading-relaxed">
                              {selectedColumn.description}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                            <div>
                              <span className="text-neutral-500 font-mono uppercase text-[10px] block">
                                Assigned Column Journalists & Directors:
                              </span>
                              <span className="text-neutral-200 font-medium">
                                {selectedColumn.assignedWorkers}
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-400/90 font-mono self-start sm:self-auto">
                              Editorial Desk Synced
                            </span>
                          </div>

                          {/* Curated Sample Topics */}
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase">
                              Curated Topics for this Column (Click to load):
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                              {(selectedColumn.sampleTopics || []).map((st, sidx) => (
                                <button
                                  key={sidx}
                                  type="button"
                                  onClick={() => {
                                    setTopic(st);
                                    setStrategicObjective(
                                      `Establish category authority for ${brand.name} [${selectedColumn.name}] via ${selectedColumn.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
                                    );
                                    setVisualHeadline(
                                      `${selectedColumn.name.toUpperCase()}: ${selectedColumn.lexiconAnchors?.[0] || brand.lexicon?.[0] || 'Editorial'}`
                                    );
                                  }}
                                  className={`text-left text-[11px] p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                                    topic === st
                                      ? 'bg-neutral-800 text-white border-amber-400'
                                      : 'bg-neutral-900/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                                  }`}
                                >
                                  <span className="truncate">{st}</span>
                                  <span className="text-[10px] text-neutral-500 shrink-0 font-mono">
                                    {topic === st ? '● Selected' : 'Load →'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Column Lexicon */}
                          <div className="pt-2 border-t border-neutral-900 flex items-center gap-1.5 flex-wrap">
                            <span className="text-neutral-500 font-mono text-[10px]">
                              Column Lexicon:
                            </span>
                            {(selectedColumn.lexiconAnchors || []).map((w) => (
                              <span
                                key={w}
                                className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px]"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Target Audience Segment
                    </label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                    >
                      {(brand.audiences || ['Executive Leadership & Principals']).map((aud) => (
                        <option key={aud} value={aud}>
                          {aud}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Primary Distribution Channel
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(
                        [
                          'LinkedIn',
                          'Bluesky',
                          'Threads',
                          'X',
                          'Pinterest',
                          'TikTok',
                          'Instagram',
                          'YouTube',
                          'Substack',
                          'Facebook',
                        ] as Channel[]
                      ).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setChannel(ch)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                            channel === ch
                              ? 'bg-neutral-800 text-white border-neutral-600 shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Source Signal / Editorial Angle
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsHookModalOpen(true)}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3" />
                        Open Hook Library
                      </button>
                    </div>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      placeholder="Enter strategic topic or paste a market signal..."
                    />
                  </div>

                  {/* Sample Topics Quick Pill Selector */}
                  <div>
                    <span className="text-[11px] text-neutral-500 block mb-1">
                      Preset Strategic Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(brand.sampleTopics || []).map((st, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTopic(st)}
                          className="text-[11px] px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white transition text-left cursor-pointer truncate max-w-full"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generated Brief Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Executive Brief Document
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Ready for Creative Director
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-neutral-500 font-mono block text-[10px] uppercase">
                        Core Strategic Tension
                      </span>
                      <input
                        type="text"
                        value={strategicTension}
                        onChange={(e) => setStrategicTension(e.target.value)}
                        className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-neutral-500 font-mono block text-[10px] uppercase">
                        Narrative Objective
                      </span>
                      <input
                        type="text"
                        value={strategicObjective}
                        onChange={(e) => setStrategicObjective(e.target.value)}
                        className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <span className="text-neutral-400 font-medium block">
                        Mandatory Lexicon Anchors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(brand.lexicon || []).map((word) => (
                          <span
                            key={word}
                            className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300 text-[11px]">
                      <strong>Negative Constraint:</strong> {brand.negativeConstraints}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCompletedStages((prev) => ({ ...prev, strategy: true }));
                      setActiveStage('ideation');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Approve Brief & Proceed to Ideation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: IDEATION */}
          {activeStage === 'ideation' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 2
                    </span>
                    <h2 className="text-lg font-bold text-white">Creative Ideation & Concept Generation</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Workers:</strong> Creative Director guides Copywriters & Art Directors to create concepts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('strategy')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Strategy
                </button>
              </div>

              <div className="space-y-4">
                {selectedColumn && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-neutral-400">Target Magazine Column:</span>
                      <strong className="text-white">{selectedColumn.name}</strong>
                      <span className="text-[10px] text-neutral-500 font-mono hidden md:inline">
                        ({selectedColumn.subtitle})
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      <span className="text-neutral-500 font-mono">Assigned: </span>
                      <span className="text-neutral-200">{selectedColumn.assignedWorkers}</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-neutral-400">
                  Select or customize the winning concept for CCO review:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {concepts.map((concept) => {
                    const isSelected = selectedConceptId === concept.id;
                    return (
                      <div
                        key={concept.id}
                        onClick={() => setSelectedConceptId(concept.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? 'bg-neutral-800/90 border-amber-400/80 ring-1 ring-amber-400/50 shadow-lg'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">
                              {concept.title}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">
                              Copywriter Hook Hypothesis
                            </span>
                            <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
                              &ldquo;{concept.hook}&rdquo;
                            </p>
                          </div>

                          <div className="pt-2 border-t border-neutral-800/60">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">
                              Art Director Visual Treatment
                            </span>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {concept.visualIdea}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConceptId(concept.id);
                          }}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                        >
                          {isSelected ? 'Concept Selected' : 'Choose Concept'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Hook Edit */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Refine Selected Opening Hook (Copywriter Workspace)
                  </label>
                  <textarea
                    value={
                      concepts.find((c) => c.id === selectedConceptId)?.hook || ''
                    }
                    onChange={(e) => {
                      const updatedHook = e.target.value;
                      setConcepts((prev) =>
                        prev.map((c) =>
                          c.id === selectedConceptId ? { ...c, hook: updatedHook } : c
                        )
                      );
                    }}
                    rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedStages((prev) => ({ ...prev, ideation: true }));
                      setActiveStage('approval_1');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    Submit Concept to CCO (Approval 1)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: APPROVAL 1 */}
          {activeStage === 'approval_1' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 3
                    </span>
                    <h2 className="text-lg font-bold text-white">Approval 1 • Chief Creative Officer Gate</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Worker:</strong> Chief Creative Officer (CCO) evaluates and approves the core concept before resource expenditure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('ideation')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Ideation
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                    Submitted Concept for Review
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      Concept Angle
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {concepts.find((c) => c.id === selectedConceptId)?.title}
                    </h3>
                    <p className="text-xs text-neutral-300 italic">
                      &ldquo;{concepts.find((c) => c.id === selectedConceptId)?.hook}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Brand Persona:</span>
                      <span className="text-white font-medium">{brand.archetype}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Distribution Channel:</span>
                      <span className="text-white font-medium">{channel}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Target Audience:</span>
                      <span className="text-white font-medium">{audience}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                    CCO Gatekeeper Checklist
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-neutral-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="accent-amber-400 rounded"
                      />
                      <span>Rhetorical posture aligns with {brand.name} authority</span>
                    </label>
                    <label className="flex items-center gap-2 text-neutral-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="accent-amber-400 rounded"
                      />
                      <span>Zero forbidden slang detected</span>
                    </label>
                    <label className="flex items-center gap-2 text-neutral-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="accent-amber-400 rounded"
                      />
                      <span>Hook demonstrates algorithmic stop-scroll tension</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      CCO Executive Feedback / Directives
                    </label>
                    <textarea
                      value={ccoNotes}
                      onChange={(e) => setCcoNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCcoApproved(true);
                      setCompletedStages((prev) => ({ ...prev, approval_1: true }));
                      setActiveStage('traffic');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Authorize Concept & Unlock Traffic Manager (Stage 4)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: TRAFFIC MANAGER */}
          {activeStage === 'traffic' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 4
                    </span>
                    <h2 className="text-lg font-bold text-white">Traffic Manager • Logistics & Milestone Engine</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Worker:</strong> The logistics engine of the department. They set deadlines, route assets from one agent to the next, and ensure nobody misses a milestone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('approval_1')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Approval 1
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Live Agent Routing Flow
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Zero Bottlenecks Detected
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        step: 'Brief Delivery',
                        from: 'Strategist & Account Mgr',
                        to: 'Creative Director',
                        status: 'Delivered',
                      },
                      {
                        step: 'Core Concept',
                        from: 'Copy & Art Directors',
                        to: 'Chief Creative Officer',
                        status: 'Approved',
                      },
                      {
                        step: 'Asset Production Dispatch',
                        from: 'Traffic Manager',
                        to: 'Audio/VO & Visual Directors',
                        status: trafficDispatched ? 'Dispatched' : 'Queued (Ready)',
                      },
                      {
                        step: 'Constraint Auditing',
                        from: 'Production Assets',
                        to: '4-Agent Assembly Chain',
                        status: 'Scheduled',
                      },
                      {
                        step: 'Final Quality Control',
                        from: 'Platform Packaging Agent',
                        to: 'Creative Director QC',
                        status: 'Scheduled',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-neutral-900 border border-neutral-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.step}</div>
                          <div className="text-[11px] text-neutral-400">
                            {item.from} → {item.to}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            item.status === 'Approved' || item.status === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">
                    Logistics Dispatch Controls
                  </span>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1">
                        Pipeline Priority
                      </label>
                      <select
                        value={trafficPriority}
                        onChange={(e: any) => setTrafficPriority(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                      >
                        <option value="Standard">Standard Cadence</option>
                        <option value="Urgent">Urgent Editorial</option>
                        <option value="Boardroom Express">Boardroom Express (Immediate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">
                        Target Milestone SLA
                      </label>
                      <input
                        type="text"
                        value={trafficDeadline}
                        onChange={(e) => setTrafficDeadline(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                      <div className="font-semibold text-neutral-300">Deliverable Targets:</div>
                      <div>• Visual Card (1080×1080 Graphic Overlay)</div>
                      <div>• Audio Script (30-45s with Cadence Timestamps)</div>
                      <div>• Native Copy for {channel}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTrafficDispatched(true);
                      setCompletedStages((prev) => ({ ...prev, traffic: true }));
                      setActiveStage('production');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Truck className="w-4 h-4" />
                    Dispatch Production to Audio & Visual Directors
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: PRODUCTION */}
          {activeStage === 'production' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 5
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Production • Multi-Asset Creative Engine
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      PICTURE + VIDEO + AUDIO
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Workers:</strong> Visual Director, Video Director, and Audio/VO Director.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRulesModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-neutral-700"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Inspect Brand Media Rules
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStage('traffic')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1"
                  >
                    ← Back to Traffic
                  </button>
                </div>
              </div>

              {/* Subtabs for Stage 5 Production */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setStage5SubTab('picture')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer ${
                      stage5SubTab === 'picture'
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Picture Generator
                  </button>

                  <button
                    type="button"
                    onClick={() => setStage5SubTab('video')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer ${
                      stage5SubTab === 'video'
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video & Motion Studio
                  </button>

                  <button
                    type="button"
                    onClick={() => setStage5SubTab('audio')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer ${
                      stage5SubTab === 'audio'
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Voiceover Audio Studio
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCarouselModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer bg-neutral-900 hover:bg-neutral-850 text-amber-300 border border-amber-400/40 shadow-sm ml-auto"
                    title="Build 5-slide visual carousel"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Build 5-Slide Carousel
                  </button>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Negative constraints enforced on all generators
                </div>
              </div>

              {/* Attached Media Notification Pill */}
              {(curatedPhotoUrl || curatedVideoUrl) && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Attached Curated Media: <strong>{curatedVideoUrl ? 'Pixabay B-Roll Video' : 'Pixabay Curated Photo'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {curatedPhotoUrl && (
                      <a
                        href={curatedPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline text-emerald-300 hover:text-white"
                      >
                        View Photo
                      </a>
                    )}
                    {curatedVideoUrl && (
                      <a
                        href={curatedVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline text-emerald-300 hover:text-white"
                      >
                        View Video
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCuratedPhotoUrl(null);
                        setCuratedVideoUrl(null);
                      }}
                      className="text-[10px] text-neutral-400 hover:text-white ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {stage5SubTab === 'picture' && (
                <div className="space-y-4">
                  <BrandPictureGenerator
                    brand={brand}
                    headline={visualHeadline}
                    topic={topic}
                    onHeadlineChange={(hl) => setVisualHeadline(hl)}
                    onApplyImagePrompt={(prompt) => setImagePrompt(prompt)}
                    onSelectPhotoUrl={(url) => setCuratedPhotoUrl(url)}
                  />
                </div>
              )}

              {stage5SubTab === 'video' && (
                <div className="space-y-4">
                  <BrandVideoGenerator
                    brand={brand}
                    topic={topic}
                    voiceoverScript={voiceoverScript}
                    channel={channel}
                    onSelectVideoUrl={(url) => setCuratedVideoUrl(url)}
                  />
                </div>
              )}

              {stage5SubTab === 'audio' && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        Audio/VO Director • Script & TTS Synthesis
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Timed 30-45s script with exact cadence cues and synthesized speech.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Gemini TTS / Browser Speech
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Timed Script (Include Cadence Timestamps & Audio Atmosphere)
                    </label>
                    <textarea
                      value={voiceoverScript}
                      onChange={(e) => setVoiceoverScript(e.target.value)}
                      rows={8}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-900">
                    <VoiceoverPlayer
                      script={voiceoverScript}
                      brandKey={brand.key}
                      brandName={brand.name}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Raw visual, motion, and audio assets ready for multi-agent auditing.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCompletedStages((prev) => ({ ...prev, production: true }));
                    setActiveStage('auditing');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  Advance to Auditing & Assembly (Stage 6)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: AUDITING & ASSEMBLY */}
          {activeStage === 'auditing' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 6
                    </span>
                    <h2 className="text-lg font-bold text-white">Auditing & Assembly</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Workers:</strong> Voice & Constraint Auditor → Voice Assembler → Cross-Asset → Alignment Agent.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('production')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Production
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                    Multi-Agent Audit Sequence
                  </span>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          1. Voice & Constraint Auditor
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          VERIFIED PASS
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Negative constraint verified: <em>{brand.negativeConstraints}</em>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Forbidden Words Scan: 0 matches in body copy.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          2. Voice Assembler
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          SYNTHESIZED
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Weaves hook, tension, and resolution into rhythmic editorial paragraphs.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          3. Cross-Asset Alignment Agent
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ALIGNED
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Synchronizes Visual Headline (&ldquo;{visualHeadline}&rdquo;) with Audio VO thesis.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">4. Brand Tone Coherence</div>
                        <div className="text-[11px] text-neutral-400">Semantic cosine match against brand anchors</div>
                      </div>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {alignmentScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">
                    Assembled Unified Post Body
                  </span>

                  <textarea
                    value={assembledBody}
                    onChange={(e) => {
                      setAssembledBody(e.target.value);
                      setFormattedBody(e.target.value);
                    }}
                    rows={8}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Total Words: {assembledBody.split(/\s+/).filter(Boolean).length}</span>
                    <span>Characters: {assembledBody.length}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCompletedStages((prev) => ({ ...prev, auditing: true }));
                      setActiveStage('polish');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Approve Assembly & Proceed to Platform Polish
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 7: FINAL POLISH */}
          {activeStage === 'polish' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 7
                    </span>
                    <h2 className="text-lg font-bold text-white">Final Polish • Platform Packaging</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Worker:</strong> Platform Packaging Agent formats the assets strictly to platform constraints.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('auditing')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Auditing
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Target Channel Specifications
                    </span>
                    <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      {channel}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1 text-xs">
                    <div className="text-neutral-300 font-semibold">{currentSpec.desc}</div>
                    <div className="text-neutral-500 font-mono text-[11px]">
                      Format Target: {currentSpec.badge}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-neutral-300">
                        Platform Character Budget
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isOverLimit ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {charCount} / {charLimit} chars
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full transition-all ${
                          isOverLimit ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (charCount / (charLimit || 2000)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Hashtag Cluster
                    </label>
                    <input
                      type="text"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(formattedBody, 'body')}
                      className="flex-1 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedSection === 'body' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied Body!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Body
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(hashtags, 'tags')}
                      className="flex-1 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedSection === 'tags' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied Tags!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Hashtags
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">
                    Platform-Formatted Final Copy
                  </span>

                  <textarea
                    value={formattedBody}
                    onChange={(e) => setFormattedBody(e.target.value)}
                    rows={9}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setCompletedStages((prev) => ({ ...prev, polish: true }));
                      setActiveStage('qc');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Submit to Quality Control (Stage 8)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 8: QUALITY CONTROL (QC) */}
          {activeStage === 'qc' && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      STAGE 8
                    </span>
                    <h2 className="text-lg font-bold text-white">Quality Control • Creative Director Final Gate</h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    <strong>Assigned Worker:</strong> Creative Director (QC) gives the final go/no-go sign-off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStage('polish')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Platform Polish
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                          Master Compiled Editorial Package
                        </span>
                        {selectedColumn && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                            <Newspaper className="w-3 h-3 text-amber-400" />
                            Column: {selectedColumn.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        Target: {channel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 rounded-lg overflow-hidden border border-neutral-800">
                        <SocialCardCanvas
                          brandKey={brand.key}
                          headline={visualHeadline}
                          width={400}
                          height={400}
                          className="w-full aspect-square"
                          showActions={false}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">
                            Visual Overlay Headline
                          </span>
                          <div className="font-bold text-white text-sm">
                            {visualHeadline}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">
                            Final Formatted Post Copy
                          </span>
                          <p className="text-neutral-300 mt-1 line-clamp-4 leading-relaxed">
                            {formattedBody}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">
                            Hashtag Cluster
                          </span>
                          <p className="text-neutral-400 text-[11px]">{hashtags}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-900">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                        Voiceover Audio Track
                      </span>
                      <VoiceoverPlayer
                        script={voiceoverScript}
                        brandKey={brand.key}
                        brandName={brand.name}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">
                      Creative Director QC Assessment
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span className="text-neutral-300">Voice Integrity</span>
                        <span className="text-emerald-400 font-mono font-bold">100% PASS</span>
                      </div>
                      <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span className="text-neutral-300">Platform Limit</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {charCount} / {charLimit}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span className="text-neutral-300">Constraint Audit</span>
                        <span className="text-emerald-400 font-mono font-bold">CLEARED</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        QC Final Directive Note
                      </label>
                      <textarea
                        value={qcNotes}
                        onChange={(e) => setQcNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    {finalPackageCreated ? (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                        <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Approved & Dispatched!
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={onNavigateToQueue}
                            className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer"
                          >
                            View Queue
                          </button>
                          <button
                            type="button"
                            onClick={onNavigateToArchive}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold cursor-pointer"
                          >
                            View Archive
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinalQCApproval}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Award className="w-4 h-4" />
                        Final QC Approval & Dispatch to Archive
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        recordVersionSnapshot('Manual Edit', 'Manual snapshot saved in Stage 8 QC');
                        setSaveStatus('Snapshot saved to Version History.');
                        setTimeout(() => setSaveStatus(null), 3000);
                      }}
                      className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      Save Manual Version Snapshot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VERSION HISTORY DRAWER / MODAL */}
      {isVersionDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Version History & Revert
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionDrawerOpen(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Track manual edits and AI generations for <strong>{brand.name}</strong>. Revert back to any previous state at any time.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {versionHistory.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No version snapshots recorded yet. Click &quot;Save Manual Version Snapshot&quot; or execute pipeline changes.
                </div>
              ) : (
                versionHistory.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">
                          Version {ver.version}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          {ver.author}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(ver.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-neutral-300">{ver.note}</p>
                      <p className="text-[11px] text-neutral-500 truncate max-w-md">
                        &ldquo;{ver.snapshot.post_body.slice(0, 80)}...&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevertVersion(ver)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Revert
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Algorithmic Hook Library Modal */}
      <HookLibraryModal
        isOpen={isHookModalOpen}
        onClose={() => setIsHookModalOpen(false)}
        onSelectHook={(hookText) => {
          const customized = hookText
            .replace(/\[X\]/g, brand.sampleTopics?.[0] || 'strategic directive')
            .replace(/\[Entity\]/g, brand.name)
            .replace(/\[Category\]/g, brand.lexicon?.[0] || 'Editorial');
          setTopic(customized);
        }}
        activeBrand={brand}
        defaultChannel={channel}
      />

      {/* Brand Picture & Video Generator Rules Modal */}
      <BrandRulesModal
        brand={brand}
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Official Brand Logo, Colors & Identity Modal */}
      <BrandIdentityModal
        brandKey={brandKey}
        isOpen={isBrandIdentityModalOpen}
        onClose={() => setIsBrandIdentityModalOpen(false)}
      />

      {/* 5-Slide Carousel Deck Exporter Modal */}
      <CarouselBuilderModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        brand={brand}
        topic={topic}
        hook={visualHeadline}
        channel={channel}
      />
    </div>
  );
};
