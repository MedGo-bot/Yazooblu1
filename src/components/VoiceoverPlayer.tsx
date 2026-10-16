import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  Clock,
  Sparkles,
  Download,
  Loader2,
  Check,
} from 'lucide-react';

interface VoiceoverPlayerProps {
  script: string;
  brandKey: string;
  brandName: string;
}

const GEMINI_VOICES = [
  { id: 'Kore', label: 'Kore (Clear & Balanced)', desc: 'Executive neutrality, crisp inflection' },
  { id: 'Fenrir', label: 'Fenrir (Deep & Resonant)', desc: 'Authoritative, low-frequency command' },
  { id: 'Zephyr', label: 'Zephyr (Smooth & Stately)', desc: 'Boardroom diplomacy, measured cadence' },
  { id: 'Puck', label: 'Puck (Dynamic & Sharp)', desc: 'High-urgency, kinetic delivery' },
  { id: 'Charon', label: 'Charon (Grave & Deliberate)', desc: 'Crisis counsel, sober restraint' },
];

export const VoiceoverPlayer: React.FC<VoiceoverPlayerProps> = ({
  script,
  brandKey,
  brandName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [cleanText, setCleanText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<'gemini' | 'browser'>('browser');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Strip timestamps and music instructions for clean reading
    const textOnly = script
      .replace(/\[\d+:\d+-\d+:\d+[^\]]*\]/g, '')
      .replace(/\[Music[^\]]*\]/gi, '')
      .replace(/\[Tone[^\]]*\]/gi, '')
      .replace(/"/g, '')
      .trim();
    setCleanText(textOnly);

    // Stop speaking when script changes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl(null);
  }, [script]);

  // Generate Audio via Gemini 3.8 Flash-Lite TTS
  const handleGenerateGeminiTTS = async () => {
    if (!cleanText) return;
    setIsSynthesizing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: cleanText,
          voice_name: selectedVoice,
          style_prompt: `Voiceover direction for ${brandName}. Authoritative, disciplined, measured, non-dramatic pacing.`,
        }),
      });

      if (!res.ok) {
        throw new Error('Gemini TTS server returned an error');
      }

      const data = await res.json();
      if (data.audioBase64) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setAudioUrl(url);
        setAudioSource('gemini');

        // Play newly generated audio
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        throw new Error('No audio payload received');
      }
    } catch (err: any) {
      console.warn('Gemini TTS error, falling back to browser synthesis:', err);
      setErrorMsg('Gemini Studio TTS currently utilizing browser fallback synthesis.');
      handleBrowserSpeak();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleBrowserSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser window.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter((v) => v.lang.startsWith('en'));
    if (enVoices.length > 0) {
      utterance.voice = enVoices[0];
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setAudioSource('browser');
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    handleBrowserSpeak();
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Parse script sections
  const sections = script.split(/(?=\[\d+:\d+-\d+:\d+)/g).filter(Boolean);

  return (
    <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-4 text-neutral-200 space-y-3.5">
      {/* Hidden audio element for Gemini WAV playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
                Voiceover Director • 30-45s Audio
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Gemini 3.8 Flash-Lite TTS
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Cadenced vocal direction with timestamp cueing and AI neural audio synthesis
            </span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGenerateGeminiTTS}
            disabled={isSynthesizing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer disabled:opacity-50"
            title="Synthesize studio-quality voiceover audio using Gemini 3.8 Flash-Lite TTS"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> AI Studio Voice
              </>
            )}
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> {audioUrl ? 'Play Audio' : 'Audition'}
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
              title="Stop Audio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {audioUrl && (
            <a
              href={audioUrl}
              download={`${brandKey}-voiceover-${Date.now()}.wav`}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-purple-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
              title="Download Synthesized WAV Audio"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Gemini Voice Persona Selector */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mr-1">
          Neural Voice:
        </span>
        {GEMINI_VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedVoice(v.id)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono transition cursor-pointer ${
              selectedVoice === v.id
                ? 'bg-purple-950/80 border border-purple-500/50 text-purple-200'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title={v.desc}
          >
            {v.id}
          </button>
        ))}
        {audioUrl && (
          <span className="ml-auto text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> WAV Ready ({selectedVoice})
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Script Blocks */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
        {sections.length > 0 ? (
          sections.map((sec, idx) => {
            const isMusicNote =
              sec.toLowerCase().includes('[music') || sec.toLowerCase().includes('[tone');
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border font-mono ${
                  isMusicNote
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200/90'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{sec.trim()}</p>
              </div>
            );
          })
        ) : (
          <div className="p-3 bg-neutral-950 rounded-lg font-mono text-neutral-300 whitespace-pre-line">
            {script}
          </div>
        )}
      </div>

      {/* Audio Wave Visualizer when playing */}
      {isPlaying && (
        <div className="mt-3 flex items-center gap-1.5 justify-center py-1.5 bg-black/40 rounded-lg border border-purple-900/30">
          <span className="text-[10px] font-mono text-purple-400 mr-2 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            {audioSource === 'gemini'
              ? `GEMINI 3.8 NEURAL (${selectedVoice.toUpperCase()}) ACTIVE`
              : 'NARRATING LIVE'}
          </span>
          {[40, 75, 90, 60, 100, 45, 80, 65, 95, 30, 85, 50, 70, 85, 45].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                height: `${h * 0.18}px`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
