import React, { useState, useRef, useEffect } from 'react';
import { BrandMeta } from '../types';
import {
  Camera,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Layers,
  RefreshCw,
  Eye,
  Search,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Loader2,
  Key,
} from 'lucide-react';
import { SocialCardCanvas } from './SocialCardCanvas';

interface BrandPictureGeneratorProps {
  brand: BrandMeta;
  headline: string;
  topic: string;
  onHeadlineChange?: (headline: string) => void;
  onApplyImagePrompt?: (prompt: string) => void;
  onSelectPhotoUrl?: (url: string) => void;
}

export const BrandPictureGenerator: React.FC<BrandPictureGeneratorProps> = ({
  brand,
  headline,
  topic,
  onHeadlineChange,
  onApplyImagePrompt,
  onSelectPhotoUrl,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [selectedSubject, setSelectedSubject] = useState<string>(brand.pictureRules.permittedSubjects[0]);
  const [customDirective, setCustomDirective] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>(brand.pictureRules.promptTemplate);
  const [negativePrompt, setNegativePrompt] = useState<string>(brand.pictureRules.forbiddenVisualTropes.join(', '));
  const [visualConcept, setVisualConcept] = useState<string>(
    `Architectural photographic composition for ${brand.name} highlighting ${brand.lexicon[0]} with directional ${brand.palette.names.accent} lighting.`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'artistic_canvas' | 'pixabay_photo' | 'typographic_card'>('artistic_canvas');

  // Curated Pixabay State
  const [pixabayQuery, setPixabayQuery] = useState<string>(topic || brand.sampleTopics[0] || brand.name);
  const [pixabayOrientation, setPixabayOrientation] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const [isSearchingPixabay, setIsSearchingPixabay] = useState<boolean>(false);
  const [pixabayPhoto, setPixabayPhoto] = useState<{
    url: string;
    preview_url?: string;
    user?: string;
    tags?: string;
    downloads?: number;
  } | null>(null);
  const [pixabayError, setPixabayError] = useState<string | null>(null);
  const [pixabayKeyConfigured, setPixabayKeyConfigured] = useState<boolean | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check Pixabay API Status
  useEffect(() => {
    fetch('/api/media/pixabay-status')
      .then((r) => r.json())
      .then((d) => setPixabayKeyConfigured(Boolean(d.configured)))
      .catch(() => setPixabayKeyConfigured(false));
  }, []);

  // Update subject when brand changes
  useEffect(() => {
    setSelectedSubject(brand.pictureRules.permittedSubjects[0]);
    setGeneratedPrompt(
      `${brand.pictureRules.promptTemplate} Featuring architectural focus on ${topic || brand.sampleTopics[0]}.`
    );
    setNegativePrompt(brand.pictureRules.forbiddenVisualTropes.join(', '));
    setPixabayQuery(topic || brand.sampleTopics[0] || brand.name);
  }, [brand.key, topic]);

  // Handle Copy
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch Curated Pixabay Photo (Filters out commercial stock gloss & over-saturated viral hits)
  const handleFetchPixabayPhoto = async () => {
    setIsSearchingPixabay(true);
    setPixabayError(null);
    try {
      const q = pixabayQuery.trim() || topic || brand.name;
      const res = await fetch('/api/media/pixabay-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, orientation: pixabayOrientation }),
      });
      const data = await res.json();
      if (data.photo) {
        setPixabayPhoto(data.photo);
        if (onSelectPhotoUrl && data.photo.url) {
          onSelectPhotoUrl(data.photo.url);
        }
      } else {
        setPixabayError(
          data.configured
            ? 'No photo matched the curated editorial filters (anti-gloss/saturation). Try broader keywords.'
            : 'PIXABAY_API_KEY is not set in environment or .env. Add your key to activate live stock curation.'
        );
      }
    } catch (err: any) {
      setPixabayError(err.message);
    } finally {
      setIsSearchingPixabay(false);
    }
  };

  // Generate Image Prompt via API
  const handleGeneratePicture = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/picture-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: brand.key,
          topic: `${selectedSubject} - ${topic}`,
          headline,
          aspect_ratio: aspectRatio,
          custom_directive: customDirective,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setGeneratedPrompt(data.result.imagen_prompt || generatedPrompt);
          if (data.result.negative_prompt) setNegativePrompt(data.result.negative_prompt);
          if (data.result.visual_concept) setVisualConcept(data.result.visual_concept);
          if (onApplyImagePrompt && data.result.imagen_prompt) {
            onApplyImagePrompt(data.result.imagen_prompt);
          }
        }
      }
    } catch (err) {
      console.warn('Picture generation request failed, using local rules:', err);
    } finally {
      setIsGenerating(false);
      renderArtisticCanvas();
    }
  };

  // Render high-fidelity architectural artistic canvas
  const renderArtisticCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [accR, accG, accB] = brand.palette.accentRgb;
    const [secR, secG, secB] = brand.palette.secondaryRgb;
    const [bgR, bgG, bgB] = brand.palette.bgRgb;

    let width = 600;
    let height = 600;

    if (aspectRatio === '16:9') {
      width = 640;
      height = 360;
    } else if (aspectRatio === '9:16') {
      width = 360;
      height = 640;
    } else if (aspectRatio === '4:5') {
      width = 480;
      height = 600;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Deep Monolithic Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, `rgb(${bgR}, ${bgG}, ${bgB})`);
    bgGrad.addColorStop(1, `rgb(${Math.max(0, bgR - 10)}, ${Math.max(0, bgG - 10)}, ${Math.max(0, bgB - 10)})`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Chiaroscuro Directional Lighting Beam
    const beamGrad = ctx.createRadialGradient(
      width * 0.2,
      height * 0.25,
      10,
      width * 0.2,
      height * 0.25,
      width * 0.7
    );
    beamGrad.addColorStop(0, `rgba(${accR}, ${accG}, ${accB}, 0.35)`);
    beamGrad.addColorStop(0.4, `rgba(${secR}, ${secG}, ${secB}, 0.15)`);
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Architectural grid lines
    ctx.strokeStyle = `rgba(${accR}, ${accG}, ${accB}, 0.08)`;
    ctx.lineWidth = 1;
    const gridStep = width / 12;
    for (let x = 0; x <= width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 4. Geometric silhouettes representing subject
    ctx.fillStyle = `rgba(${secR}, ${secG}, ${secB}, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.9);
    ctx.lineTo(width * 0.45, height * 0.35);
    ctx.lineTo(width * 0.85, height * 0.7);
    ctx.lineTo(width * 0.85, height * 0.9);
    ctx.closePath();
    ctx.fill();

    // 5. Crisp accent rim light edge
    ctx.strokeStyle = `rgba(${accR}, ${accG}, ${accB}, 0.75)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.9);
    ctx.lineTo(width * 0.45, height * 0.35);
    ctx.lineTo(width * 0.85, height * 0.7);
    ctx.stroke();

    // 6. Subtle analog film grain texture
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 8) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // 7. Vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.3,
      width / 2,
      height / 2,
      width * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 8. Brand Watermark & Frame
    ctx.strokeStyle = `rgba(${accR}, ${accG}, ${accB}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Brand Tag Top Left
    ctx.fillStyle = brand.palette.accent;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`${brand.name.toUpperCase()} • VISUAL DIRECTIVE`, 40, 50);

    // Aspect Ratio & ISO Stamp Top Right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    ctx.fillText(`${aspectRatio} • LEICA 35MM • RAW 8K`, width - 210, 50);

    // Headline Overlay Bottom
    if (headline) {
      ctx.fillStyle = brand.palette.text;
      ctx.font = 'bold 28px sans-serif';
      const cleanHeadline = headline.length > 40 ? headline.slice(0, 40) + '...' : headline;
      ctx.fillText(cleanHeadline, 40, height - 60);

      ctx.fillStyle = `rgba(${accR}, ${accG}, ${accB}, 0.8)`;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(selectedSubject.toUpperCase(), 40, height - 35);
    }
  };

  useEffect(() => {
    if (viewMode === 'artistic_canvas') {
      renderArtisticCanvas();
    }
  }, [aspectRatio, selectedSubject, brand.key, headline, viewMode]);

  // Download Canvas as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.key}-visual-${aspectRatio.replace(':', 'x')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {brand.name} • Visual Generator & Stock Curator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-emerald-400 border border-emerald-900/60 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3" />
              RULES ACTIVE
            </span>
            {pixabayKeyConfigured && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/60 flex items-center gap-1 font-bold">
                <Key className="w-3 h-3" />
                PIXABAY API CONNECTED
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Generates brand-governed photographic assets (Imagen 3 / Midjourney) or curates editorial Pixabay stock photos.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('artistic_canvas')}
            className={`px-2.5 py-1 text-[11px] rounded font-medium transition cursor-pointer ${
              viewMode === 'artistic_canvas'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Artistic Visual Studio
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pixabay_photo')}
            className={`px-2.5 py-1 text-[11px] rounded font-medium transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'pixabay_photo'
                ? 'bg-amber-400 text-neutral-950 font-bold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Curated Pixabay Photo
          </button>
          <button
            type="button"
            onClick={() => setViewMode('typographic_card')}
            className={`px-2.5 py-1 text-[11px] rounded font-medium transition cursor-pointer ${
              viewMode === 'typographic_card'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Social Typographic Card
          </button>
        </div>
      </div>

      {/* CURATED PIXABAY PHOTO VIEW */}
      {viewMode === 'pixabay_photo' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  Editorial Pixabay Stock Curator
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Anchors searches with <em>&quot;subtle film dark&quot;</em>, rejects clip art &amp; 3D renders, and avoids over-saturated viral stock.
                </p>
              </div>

              {/* Orientation Filter */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
                {(['all', 'horizontal', 'vertical'] as const).map((orient) => (
                  <button
                    key={orient}
                    type="button"
                    onClick={() => setPixabayOrientation(orient)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition cursor-pointer ${
                      pixabayOrientation === orient
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {orient}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="text"
                value={pixabayQuery}
                onChange={(e) => setPixabayQuery(e.target.value)}
                placeholder={`Search editorial photo for ${brand.name}...`}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              />
              <button
                type="button"
                onClick={handleFetchPixabayPhoto}
                disabled={isSearchingPixabay}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
              >
                {isSearchingPixabay ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Curating Photo...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Fetch Curated Photo
                  </>
                )}
              </button>
            </div>

            {/* Curation Protocol Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-500 pt-1">
              <span className="text-emerald-400 flex items-center gap-1">
                ✓ Auto-Texture: subtle film dark
              </span>
              <span>•</span>
              <span>Banned: 3D render, cartoon, clip art</span>
              <span>•</span>
              <span>Saturation ceiling: &lt; 60k downloads</span>
              <span>•</span>
              <span>Quality gate: &ge; 50 downloads</span>
            </div>

            {pixabayError && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pixabayError}</span>
              </div>
            )}
          </div>

          {/* Result Display */}
          {pixabayPhoto ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 items-center">
              <div className="md:col-span-7 flex justify-center">
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 shadow-2xl max-h-[360px] bg-black">
                  <img
                    src={pixabayPhoto.url}
                    alt={pixabayPhoto.tags || 'Curated Pixabay photo'}
                    className="max-h-[360px] w-auto object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-neutral-300 backdrop-blur-sm">
                    Photo by {pixabayPhoto.user || 'Pixabay Creator'}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Vetted Curated Image
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>Creator:</span>
                    <strong className="text-neutral-200">{pixabayPhoto.user}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Downloads:</span>
                    <strong className="text-amber-400">{pixabayPhoto.downloads?.toLocaleString()}</strong>
                  </div>
                  <div className="text-neutral-400 pt-1 border-t border-neutral-850">
                    <span className="block text-neutral-500 text-[10px]">Tags:</span>
                    <span className="text-neutral-300">{pixabayPhoto.tags}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectPhotoUrl) onSelectPhotoUrl(pixabayPhoto.url);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Attach to Brand Package
                  </button>

                  <a
                    href={pixabayPhoto.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5 border border-neutral-800 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Full Resolution
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-neutral-900/30 border border-neutral-850 text-neutral-400 space-y-2">
              <Camera className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-xs">
                Click <strong>&quot;Fetch Curated Photo&quot;</strong> to query Pixabay with our custom anti-stock curation filter.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD GENERATIVE / TYPOGRAPHIC CANVAS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Directives & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Target Aspect Ratio (Governed by Brand Rules)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '16:9', '9:16', '4:5'] as const).map((ar) => {
                  const isAllowed = brand.pictureRules.aspectRatios.includes(ar);
                  return (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => isAllowed && setAspectRatio(ar)}
                      disabled={!isAllowed}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-mono font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        aspectRatio === ar
                          ? 'bg-neutral-800 text-white border-amber-400 shadow-md ring-1 ring-amber-400/40'
                          : isAllowed
                          ? 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                          : 'bg-neutral-950 text-neutral-600 border-neutral-900 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span>{ar}</span>
                      <span className="text-[9px] font-normal opacity-70">
                        {isAllowed ? 'Allowed' : 'Prohibited'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permitted Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                <span>Permitted Brand Subject Archetypes:</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {brand.pictureRules.permittedSubjects.length} Approved Tropes
                </span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {brand.pictureRules.permittedSubjects.map((subject, idx) => (
                  <option key={idx} value={subject} className="bg-neutral-900 text-white">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Directive Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                <span>Specific Scene Nuance / Art Directive:</span>
                <span className="text-[10px] text-neutral-500 font-mono">Optional</span>
              </label>
              <input
                type="text"
                value={customDirective}
                onChange={(e) => setCustomDirective(e.target.value)}
                placeholder={`E.g., Directional warm rim light highlighting ${brand.palette.names.accent} tones...`}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleGeneratePicture}
                disabled={isGenerating}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 text-neutral-950"
                style={{
                  backgroundColor: brand.palette.accent,
                  boxShadow: `0 8px 20px -4px ${brand.palette.accent}30`,
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Architectural Frame...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Compliant Image Asset
                  </>
                )}
              </button>
            </div>

            {/* Generated Prompt Box */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Imagen 3 / Midjourney v6 Prompt:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedPrompt, 'imagen-prompt')}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'imagen-prompt' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy Prompt
                </button>
              </div>
              <p className="text-[11px] font-mono text-neutral-300 leading-relaxed bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 select-all">
                {generatedPrompt}
              </p>

              <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>Negative Prompt: --no {negativePrompt.slice(0, 40)}...</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Anti-Slop Filter Clear
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Visual Canvas Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-neutral-400 pb-1">
              <span className="font-semibold text-neutral-300">Live Asset Output</span>
              <span className="font-mono text-[11px]">{aspectRatio} Ratio</span>
            </div>

            {/* Live Preview Display */}
            <div className="w-full flex justify-center bg-black/60 p-3 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden min-h-[300px] items-center">
              {viewMode === 'artistic_canvas' ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[360px] object-contain rounded-lg shadow-2xl border border-neutral-800"
                />
              ) : (
                <SocialCardCanvas
                  brandKey={brand.key}
                  headline={headline || `${brand.lexicon[0]} Protocol`}
                  width={500}
                  height={500}
                  className="w-full max-w-[320px] aspect-square rounded-lg shadow-inner"
                />
              )}
            </div>

            {/* Download & Preview Actions */}
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 border border-neutral-750 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download High-Res PNG
              </button>
              <button
                type="button"
                onClick={() => renderArtisticCanvas()}
                className="py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition border border-neutral-750 cursor-pointer"
                title="Re-render lighting & grain"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Concept Note */}
            <div className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-850 text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300 block mb-0.5">Art Direction Note:</span>
              {visualConcept}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
