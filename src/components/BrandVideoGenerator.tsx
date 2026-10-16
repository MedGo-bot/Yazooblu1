import React, { useState, useEffect, useRef } from 'react';
import { BrandMeta, VideoStoryboardScene } from '../types';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Film,
  Camera,
  Layers,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  Search,
  ExternalLink,
  Sliders,
  AlertCircle,
  HelpCircle,
  X,
  Clapperboard,
  Compass,
} from 'lucide-react';

interface BrandVideoGeneratorProps {
  brand: BrandMeta;
  topic: string;
  voiceoverScript: string;
  channel: string;
  onApplyStoryboard?: (scenes: VideoStoryboardScene[]) => void;
  onSelectVideoUrl?: (url: string) => void;
}

interface CuratedVideoData {
  url: string;
  duration?: number;
  user?: string;
  tags?: string;
  downloads?: number;
  picture_id?: number;
}

export const BrandVideoGenerator: React.FC<BrandVideoGeneratorProps> = ({
  brand,
  topic,
  voiceoverScript,
  channel,
  onApplyStoryboard,
  onSelectVideoUrl,
}) => {
  const [viewMode, setViewMode] = useState<'storyboard_simulator' | 'pixabay_broll'>('storyboard_simulator');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [scenes, setScenes] = useState<VideoStoryboardScene[]>([
    {
      timestamp: '0:00 - 0:05',
      phase: 'Hook',
      visualDescription: `Macro focus on ${brand.palette.names.bg} architecture with subtle ${brand.palette.names.accent} rim light.`,
      cameraMovement: 'Slow forward dolly tracking, locking onto focal symmetry.',
      kineticTextOverlay: `${brand.lexicon[0]} Protocol`,
      audioVoiceoverCue: `When evaluating ${topic || brand.sampleTopics[0]}, conventional assumptions fail.`,
    },
    {
      timestamp: '0:05 - 0:18',
      phase: 'Tension',
      visualDescription: `Architectural cross-section revealing systemic friction in ${brand.palette.names.bg}.`,
      cameraMovement: 'Smooth lateral tracking slider, 24fps motion cadence.',
      kineticTextOverlay: 'The Structural Blindspot',
      audioVoiceoverCue: 'Too many leaders treat this as a cosmetic detail rather than a structural risk.',
    },
    {
      timestamp: '0:18 - 0:32',
      phase: 'Diagnostic',
      visualDescription: `High-fidelity telemetry and evidentiary proof aligned with ${brand.lexicon[1] || brand.lexicon[0]}.`,
      cameraMovement: 'Subtle rack focus from foreground metric to background architectural depth.',
      kineticTextOverlay: 'Evidentiary Proof',
      audioVoiceoverCue: 'When we analyze the underlying architecture, ambiguity disappears.',
    },
    {
      timestamp: '0:32 - 0:45',
      phase: 'Command',
      visualDescription: `Definitive resolution framed with ${brand.name} signature sovereign seal.`,
      cameraMovement: 'Slow steady pull-back revealing complete structural symmetry.',
      kineticTextOverlay: 'Measure What Endures',
      audioVoiceoverCue: 'Ground your decisions in measurable reality. Calibrate your standards accordingly.',
    },
  ]);

  // Motion Player State (Storyboard Simulator)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const totalDurationSec = brand.videoRules.defaultDurationSec || 45;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Curated Pixabay Video State
  const [pixabayQuery, setPixabayQuery] = useState<string>(topic || brand.sampleTopics[0] || brand.name);
  const [isSearchingPixabay, setIsSearchingPixabay] = useState<boolean>(false);
  const [pixabayVideo, setPixabayVideo] = useState<CuratedVideoData | null>(null);
  const [candidateVideos, setCandidateVideos] = useState<CuratedVideoData[]>([]);
  const [pixabayError, setPixabayError] = useState<string | null>(null);
  const [pixabayKeyConfigured, setPixabayKeyConfigured] = useState<boolean | null>(null);
  const [attachedVideoUrl, setAttachedVideoUrl] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [showCodeGuideModal, setShowCodeGuideModal] = useState<boolean>(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Check Pixabay API Status
  useEffect(() => {
    fetch('/api/media/pixabay-status')
      .then((r) => r.json())
      .then((d) => setPixabayKeyConfigured(Boolean(d.configured)))
      .catch(() => setPixabayKeyConfigured(false));
  }, []);

  // Sync scenes and query when brand changes
  useEffect(() => {
    setScenes([
      {
        timestamp: '0:00 - 0:05',
        phase: 'Hook',
        visualDescription: `Macro focus on ${brand.palette.names.bg} architecture with subtle ${brand.palette.names.accent} rim light.`,
        cameraMovement: 'Slow forward dolly tracking, locking onto focal symmetry.',
        kineticTextOverlay: `${brand.lexicon[0]} Protocol`,
        audioVoiceoverCue: `When evaluating ${topic || brand.sampleTopics[0]}, conventional assumptions fail.`,
      },
      {
        timestamp: '0:05 - 0:18',
        phase: 'Tension',
        visualDescription: `Architectural cross-section revealing systemic friction in ${brand.palette.names.bg}.`,
        cameraMovement: 'Smooth lateral tracking slider, 24fps motion cadence.',
        kineticTextOverlay: 'The Structural Blindspot',
        audioVoiceoverCue: 'Too many leaders treat this as a cosmetic detail rather than a structural risk.',
      },
      {
        timestamp: '0:18 - 0:32',
        phase: 'Diagnostic',
        visualDescription: `High-fidelity telemetry and evidentiary proof aligned with ${brand.lexicon[1] || brand.lexicon[0]}.`,
        cameraMovement: 'Subtle rack focus from foreground metric to background architectural depth.',
        kineticTextOverlay: 'Evidentiary Proof',
        audioVoiceoverCue: 'When we analyze the underlying architecture, ambiguity disappears.',
      },
      {
        timestamp: '0:32 - 0:45',
        phase: 'Command',
        visualDescription: `Definitive resolution framed with ${brand.name} signature sovereign seal.`,
        cameraMovement: 'Slow steady pull-back revealing complete structural symmetry.',
        kineticTextOverlay: 'Measure What Endures',
        audioVoiceoverCue: 'Ground your decisions in measurable reality. Calibrate your standards accordingly.',
      },
    ]);
    setCurrentTimeSec(0);
    setIsPlaying(false);
    setPixabayQuery(topic || brand.sampleTopics[0] || brand.name);
  }, [brand.key, topic]);

  // Playback timer loop for Storyboard simulator
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = (now - lastTimeRef.current) / 1000;
          setCurrentTimeSec((prev) => {
            const next = prev + delta;
            if (next >= totalDurationSec) {
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }
        lastTimeRef.current = now;
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimeRef.current = null;
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, totalDurationSec]);

  // Determine current active scene based on currentTimeSec
  const currentSceneIndex = currentTimeSec < 5 ? 0 : currentTimeSec < 18 ? 1 : currentTimeSec < 32 ? 2 : 3;
  const activeScene = scenes[currentSceneIndex] || scenes[0];

  // Handle Copy
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Storyboard via API
  const handleGenerateStoryboard = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/video-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: brand.key,
          topic,
          voiceover_script: voiceoverScript,
          channel,
          aspect_ratio: aspectRatio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result && Array.isArray(data.result.scenes) && data.result.scenes.length > 0) {
          setScenes(data.result.scenes);
          if (onApplyStoryboard) onApplyStoryboard(data.result.scenes);
        }
      }
    } catch (err) {
      console.warn('Video storyboard generation failed, using local rules:', err);
    } finally {
      setIsGenerating(false);
      setCurrentTimeSec(0);
    }
  };

  // Fetch Curated Pixabay Video (Anti-Generic B-Roll algorithm: downloads < 30k)
  const handleFetchPixabayVideo = async (overrideQuery?: string) => {
    setIsSearchingPixabay(true);
    setPixabayError(null);
    try {
      const q = (overrideQuery || pixabayQuery).trim() || topic || brand.name;
      const res = await fetch('/api/media/pixabay-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.video && data.video.url) {
        setPixabayVideo(data.video);
        if (Array.isArray(data.candidates) && data.candidates.length > 0) {
          setCandidateVideos(data.candidates);
        }
      } else {
        setPixabayError(
          data.configured
            ? 'No b-roll video met the strict anti-generic threshold (< 30k downloads). Try broader keywords.'
            : 'PIXABAY_API_KEY is not configured yet in .env. Click the guide button to see setup steps.'
        );
      }
    } catch (err: any) {
      setPixabayError(err.message || 'Pixabay video search failed');
    } finally {
      setIsSearchingPixabay(false);
    }
  };

  // Attach Video URL to Production Package
  const handleAttachVideo = (url: string) => {
    setAttachedVideoUrl(url);
    if (onSelectVideoUrl) {
      onSelectVideoUrl(url);
    }
  };

  // Export Storyboard as JSON
  const handleExportJson = () => {
    const payload = {
      brand: brand.name,
      archetype: brand.archetype,
      aspectRatio,
      duration: `${totalDurationSec}s`,
      pacing: brand.videoRules.pacingDirective,
      modelDirectives: brand.videoRules.aiModelDirectives,
      storyboard: scenes,
      curatedPixabayVideo: pixabayVideo,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.key}-video-storyboard-${aspectRatio.replace(':', 'x')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Curated keywords suggestions based on brand
  const suggestedQueries = [
    topic,
    brand.name,
    brand.lexicon[0],
    brand.sampleTopics[0],
    brand.key === 'bes_outkast' ? 'bespoke tailoring' : undefined,
    brand.key === 'nuecofab' ? 'industrial machinery' : undefined,
    brand.key === 'fyrrion' ? 'cyber security telemetry' : undefined,
    brand.key === 'bhw_pr' ? 'executive boardroom' : undefined,
    brand.key === 'hilton_head' ? 'coastal estate' : undefined,
  ].filter(Boolean) as string[];

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-850">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Video className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {brand.name} • AI Video & Motion Generator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-850 text-emerald-400 border border-emerald-900/60 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3" />
              MOTION RULES ENFORCED
            </span>
            {pixabayKeyConfigured !== null && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${
                  pixabayKeyConfigured
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                }`}
              >
                <Film className="w-3 h-3" />
                {pixabayKeyConfigured ? 'PIXABAY API LIVE' : 'PIXABAY SETUP MODE'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Synthesizes 4-scene video storyboards, kinetic typography cues, and curates anti-gloss Pixabay b-roll video streams.
          </p>
        </div>

        {/* View Mode Toggle & API Info Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCodeGuideModal(true)}
            className="py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            title="Where is the Pixabay code & API key placed?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Pixabay Code & Key Info</span>
          </button>

          <div className="flex p-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('storyboard_simulator')}
              className={`py-1.5 px-3 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'storyboard_simulator'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              Storyboard Simulator
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pixabay_broll')}
              className={`py-1.5 px-3 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pixabay_broll'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Curated Pixabay Video & B-Roll
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: STORYBOARD SIMULATOR & MOTION BLUEPRINT */}
      {/* ========================================================================= */}
      {viewMode === 'storyboard_simulator' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-300">
                Aspect Ratio:
              </span>
              <div className="flex gap-1.5">
                {(['9:16', '16:9', '1:1'] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`px-2.5 py-1 text-[11px] rounded font-mono font-bold transition cursor-pointer border ${
                      aspectRatio === ar
                        ? 'bg-amber-400 text-neutral-950 border-amber-400'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {ar} {ar === '9:16' ? '(Reel/Story)' : ar === '16:9' ? '(Landscape)' : '(Square)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
              className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Storyboard via Gemini 3.8 Flash...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate 4-Scene Storyboard
                </>
              )}
            </button>
          </div>

          {/* Main Grid: Controls & Simulator (6 cols) vs 4-Scene Storyboard Cards (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Motion Simulator (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Interactive Motion Player / Simulator */}
              <div className="w-full flex justify-center bg-black/80 p-4 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden relative">
                <div
                  className={`relative overflow-hidden rounded-lg shadow-2xl border border-neutral-800 flex flex-col justify-between p-4 transition-all duration-700 ${
                    aspectRatio === '9:16'
                      ? 'w-[230px] h-[408px]'
                      : aspectRatio === '16:9'
                      ? 'w-[420px] h-[236px]'
                      : 'w-[280px] h-[280px]'
                  }`}
                  style={{
                    backgroundColor: brand.palette.bg,
                    borderColor: `${brand.palette.accent}55`,
                  }}
                >
                  {/* Subtle Background Ambience / Film Grain Texture */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${brand.palette.accent}33, transparent 70%)`,
                    }}
                  />

                  {/* Header Overlay: Brand Monogram / Watermark */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur border border-white/10 uppercase tracking-widest text-[9px] text-amber-300 font-bold">
                      {brand.name.slice(0, 14)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur border border-white/10 text-white font-mono">
                      {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
                    </span>
                  </div>

                  {/* Central Visual Directive & Kinetic Typography */}
                  <div className="relative z-10 text-center space-y-2 my-auto px-2">
                    <div
                      className="text-[9px] font-mono tracking-widest uppercase transition-all duration-300"
                      style={{ color: brand.palette.accent }}
                    >
                      [{activeScene.phase.toUpperCase()}] • SCENE {currentSceneIndex + 1}/4
                    </div>
                    <h4
                      className="text-base font-extrabold tracking-tight leading-tight transition-all duration-300 drop-shadow-md"
                      style={{ color: brand.palette.text }}
                    >
                      &ldquo;{activeScene.kineticTextOverlay}&rdquo;
                    </h4>
                    <p className="text-[10px] text-neutral-300 line-clamp-3 italic opacity-90">
                      {activeScene.cameraMovement}
                    </p>
                  </div>

                  {/* Bottom: Voiceover Subtitle Bar */}
                  <div className="relative z-10 p-2 rounded bg-black/75 backdrop-blur border border-white/10 text-[10px] text-neutral-200 text-center leading-snug">
                    <span className="font-semibold text-amber-300">VO: </span>
                    {activeScene.audioVoiceoverCue}
                  </div>
                </div>
              </div>

              {/* Player Timeline & Controls */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>TIMELINE: {formatTime(currentTimeSec)}</span>
                  </div>
                  <span className="text-[11px] text-neutral-300">
                    Active Scene: <strong className="text-amber-400">{activeScene.phase}</strong> ({activeScene.timestamp})
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 rounded-full bg-neutral-800 overflow-hidden cursor-pointer">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-100"
                    style={{ width: `${(currentTimeSec / totalDurationSec) * 100}%` }}
                  />
                  {/* Scene dividers */}
                  <div className="absolute top-0 bottom-0 left-[11%] w-0.5 bg-neutral-950" />
                  <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-neutral-950" />
                  <div className="absolute top-0 bottom-0 left-[71%] w-0.5 bg-neutral-950" />
                </div>

                {/* Play/Pause & Reset Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-neutral-700"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentTimeSec(0);
                      }}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white cursor-pointer border border-neutral-700"
                      title="Reset Timeline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-neutral-400 font-mono">
                    Pacing: <strong className="text-neutral-200">{brand.videoRules.pacingDirective}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4-Scene Storyboard Breakdown Cards (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  4-Scene Veo 2 / Runway Gen-3 Directives
                </span>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON Package
                </button>
              </div>

              {scenes.map((scene, idx) => {
                const isCurrent = idx === currentSceneIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const startSec = idx === 0 ? 0 : idx === 1 ? 5 : idx === 2 ? 18 : 32;
                      setCurrentTimeSec(startSec);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isCurrent
                        ? 'bg-neutral-900 border-amber-400 shadow-lg'
                        : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750'
                    }`}
                  >
                    {/* Scene Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isCurrent
                              ? 'bg-amber-400 text-neutral-950'
                              : 'bg-neutral-900 text-amber-400 border border-neutral-800'
                          }`}
                        >
                          SCENE {idx + 1} • {scene.phase.toUpperCase()}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">{scene.timestamp}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prompt = `${scene.visualDescription} Camera: ${scene.cameraMovement}. 24fps cinematic film.`;
                          handleCopy(prompt, `scene-${idx}`);
                        }}
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `scene-${idx}` ? (
                          <span className="text-emerald-400 font-bold">Copied Veo</span>
                        ) : (
                          <span>Copy Veo Prompt</span>
                        )}
                      </button>
                    </div>

                    {/* Visual Description */}
                    <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                      {scene.visualDescription}
                    </p>

                    {/* Camera & Kinetic Typography Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-neutral-900/80 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          Camera Direction:
                        </span>
                        <span className="text-neutral-200">{scene.cameraMovement}</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-900/80 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          Kinetic Overlay:
                        </span>
                        <span className="text-amber-300 font-semibold">
                          &ldquo;{scene.kineticTextOverlay}&rdquo;
                        </span>
                      </div>
                    </div>

                    {/* Audio VO Cue */}
                    <div className="text-[11px] text-neutral-400 italic pt-0.5">
                      &ldquo;{scene.audioVoiceoverCue}&rdquo;
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CURATED PIXABAY B-ROLL VIDEO (LIVE STOCK ENGINE) */}
      {/* ========================================================================= */}
      {viewMode === 'pixabay_broll' && (
        <div className="space-y-5">
          {/* Filter Algorithm Banner */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pixabay Editorial B-Roll Curator Engine
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-bold">
                  RULE: DOWNLOADS &lt; 30,000 (ANTI-GENERIC)
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                  SAFESEARCH: TRUE
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Queries the Pixabay Videos API and applies the bespoke curation filter: rejects viral stock b-roll with over 30,000 downloads to avoid cheesy, ubiquitous video clips, selecting from authentic, cinematic camera footage.
            </p>

            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={pixabayQuery}
                  onChange={(e) => setPixabayQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchPixabayVideo();
                  }}
                  placeholder="Enter editorial b-roll video query (e.g. bespoke tailoring, industrial fabrication, boardroom)..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchPixabayVideo()}
                disabled={isSearchingPixabay}
                className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSearchingPixabay ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Curating B-Roll...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Fetch Curated Video
                  </>
                )}
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-neutral-500">Suggested:</span>
              {suggestedQueries.slice(0, 6).map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPixabayQuery(sq);
                    handleFetchPixabayVideo(sq);
                  }}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-white transition border border-neutral-750 cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Status Alert */}
          {pixabayError && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">{pixabayError}</span>
                {!pixabayKeyConfigured && (
                  <p className="text-[11px] text-amber-300/80">
                    To connect your Pixabay key, set <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-amber-200">PIXABAY_API_KEY</code> in your environment or <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-amber-200">.env</code> file. Click the &ldquo;Pixabay Code & Key Info&rdquo; button above for detailed architecture instructions.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Active Curated Video Display & Candidates */}
          {pixabayVideo ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Video Player (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video flex items-center justify-center shadow-2xl group">
                  <video
                    ref={videoPlayerRef}
                    src={pixabayVideo.url}
                    controls
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Top Status Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur border border-white/10 text-[10px] font-mono text-amber-300 font-bold">
                      CURATED PIXABAY B-ROLL
                    </span>
                    {pixabayVideo.duration && (
                      <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur border border-white/10 text-[10px] font-mono text-white">
                        {pixabayVideo.duration}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Controls & Metadata Bar */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-neutral-300 font-semibold">
                      <span>Creator: <strong className="text-white">{pixabayVideo.user || 'Pixabay Filmmaker'}</strong></span>
                      {pixabayVideo.downloads !== undefined && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          • {pixabayVideo.downloads.toLocaleString()} downloads
                        </span>
                      )}
                    </div>
                    {pixabayVideo.tags && (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 font-mono">
                        Tags: {pixabayVideo.tags}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAttachVideo(pixabayVideo.url)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        attachedVideoUrl === pixabayVideo.url
                          ? 'bg-emerald-500 text-neutral-950 shadow-md'
                          : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                      }`}
                    >
                      {attachedVideoUrl === pixabayVideo.url ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Attached to Package
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Attach Video to Package
                        </>
                      )}
                    </button>

                    <a
                      href={pixabayVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 transition"
                      title="Open full video stream in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(pixabayVideo.url, 'video-url')}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
                      title="Copy video stream URL"
                    >
                      {copiedKey === 'video-url' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Candidates Gallery from this Batch (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Vetted Candidates From Batch ({candidateVideos.length || 1})
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Click to switch preview
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {(candidateVideos.length > 0 ? candidateVideos : [pixabayVideo]).map((cand, idx) => {
                    const isSelected = pixabayVideo.url === cand.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setPixabayVideo(cand);
                          if (videoPlayerRef.current) {
                            videoPlayerRef.current.load();
                            videoPlayerRef.current.play().catch(() => {});
                          }
                        }}
                        className={`p-2 rounded-lg border transition cursor-pointer space-y-1.5 relative overflow-hidden ${
                          isSelected
                            ? 'bg-neutral-900 border-amber-400 ring-1 ring-amber-400'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="relative aspect-video rounded bg-black overflow-hidden">
                          <video
                            src={cand.url}
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition"
                          />
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                            {cand.duration ? `${cand.duration}s` : 'MP4'}
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-300 flex items-center justify-between">
                          <span className="truncate max-w-[120px]">{cand.user || `Clip ${idx + 1}`}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {cand.downloads ? `${cand.downloads} dl` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 text-center space-y-4">
              <Film className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h5 className="text-sm font-bold text-white">Ready to Curate Editorial Stock B-Roll</h5>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Click <strong>&ldquo;Fetch Curated Video&rdquo;</strong> to query Pixabay using your custom anti-saturation algorithm. It evaluates up to 10 video streams, enforces SafeSearch, and rejects clips with over 30k downloads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFetchPixabayVideo()}
                disabled={isSearchingPixabay}
                className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSearchingPixabay ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Searching Pixabay...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Fetch Curated Video For &ldquo;{topic || brand.sampleTopics[0]}&rdquo;
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PIXABAY CODE & KEY PLACEMENT GUIDE MODAL */}
      {/* ========================================================================= */}
      {showCodeGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Pixabay Integration Architecture & Key Placement Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeGuideModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <p>
                Your Pixabay curation code has been integrated into two complementary locations so you can run it both in the full-stack web application and standalone via Python:
              </p>

              {/* Location 1: pixabay_curator.py */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    1. Standalone Python Script: <code className="font-mono text-amber-300">pixabay_curator.py</code>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Zero-Dependency Python</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Contains your exact <code className="font-mono text-neutral-200">fetch_curated_pixabay_photo()</code> and <code className="font-mono text-neutral-200">fetch_curated_pixabay_video()</code> functions with custom rule filtering (film texture anchor, banned tags, download count ceilings/floors). Runs from terminal via:
                </p>
                <pre className="p-2 rounded bg-black/60 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  python3 pixabay_curator.py &quot;bespoke tailoring&quot;
                </pre>
              </div>

              {/* Location 2: server.ts backend proxy */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    2. Web App Server-Side API Proxy: <code className="font-mono text-amber-300">server.ts</code>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Express / Node.js</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Implements the exact same curation algorithms in the Node server and exposes secure proxy endpoints for the web app without exposing your API key to client browsers:
                </p>
                <div className="space-y-1 font-mono text-[11px] text-neutral-300">
                  <div>• <code className="text-amber-300">POST /api/media/pixabay-photo</code>: Photos with anti-gloss texture</div>
                  <div>• <code className="text-amber-300">POST /api/media/pixabay-video</code>: Videos with &lt;30k download filter</div>
                  <div>• <code className="text-amber-300">GET /api/media/pixabay-status</code>: API status verification</div>
                </div>
              </div>

              {/* Where to put your API Key */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Where to place your Pixabay API Key:
                </span>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Add your key to the <code className="font-mono bg-black/60 px-1 py-0.5 rounded text-white">.env</code> file in the app root:
                </p>
                <pre className="p-2.5 rounded bg-black/80 font-mono text-[11px] text-amber-300 overflow-x-auto">
                  PIXABAY_API_KEY=&quot;your_actual_pixabay_api_key_here&quot;
                </pre>
                <p className="text-[10px] text-neutral-400">
                  Both <code className="text-neutral-300">pixabay_curator.py</code> and <code className="text-neutral-300">server.ts</code> automatically read this environment variable upon execution.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowCodeGuideModal(false)}
                className="py-1.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
