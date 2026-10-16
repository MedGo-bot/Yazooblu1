import React, { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check, Sparkles } from 'lucide-react';
import { BRANDS, BrandKey } from '../types';

interface SocialCardCanvasProps {
  brandKey: BrandKey;
  headline: string;
  width?: number;
  height?: number;
  className?: string;
  showActions?: boolean;
}

export const SocialCardCanvas: React.FC<SocialCardCanvasProps> = ({
  brandKey,
  headline,
  width = 1080,
  height = 1080,
  className = '',
  showActions = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const brand = BRANDS[brandKey] || BRANDS.fyrrion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    canvas.width = width;
    canvas.height = height;

    // Background gradient with subtle secondary depth
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, brand.palette.bg);
    bgGrad.addColorStop(0.7, brand.palette.bg);
    bgGrad.addColorStop(1, `${brand.palette.secondary}35`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle modern geometric background texture / watermarks
    ctx.save();
    ctx.strokeStyle = `${brand.palette.accent}12`;
    ctx.lineWidth = 1;
    // Grid lines
    for (let x = 100; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 100; y < height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concentric watermark circles utilizing secondary and accent colors
    ctx.beginPath();
    ctx.arc(width - 120, 140, 260, 0, Math.PI * 2);
    ctx.strokeStyle = `${brand.palette.secondary}25`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width - 120, 140, 180, 0, Math.PI * 2);
    ctx.strokeStyle = `${brand.palette.accent}20`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Accent Left Border Bar (spec from Python blueprint: primary accent 24px + secondary accent 4px)
    ctx.fillStyle = brand.palette.accent;
    ctx.fillRect(0, 0, 24, height);

    ctx.fillStyle = brand.palette.secondary;
    ctx.fillRect(24, 0, 4, height);

    // Accent top hairline highlight
    ctx.fillStyle = brand.palette.accent;
    ctx.fillRect(28, 0, width - 28, 4);

    // Brand Label Header: [BRAND_KEY.UPPER()]
    ctx.fillStyle = brand.palette.accent;
    ctx.font = 'bold 38px monospace, ui-monospace, sans-serif';
    ctx.fillText(`[${brand.key.toUpperCase()}]`, 75, 95);

    // Brand Full Name sub-label
    ctx.fillStyle = `${brand.palette.text}90`;
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(brand.name.toUpperCase(), 75, 135);

    // Archetype pill tag with secondary border
    ctx.fillStyle = `${brand.palette.accent}18`;
    const tagText = brand.archetype.toUpperCase();
    ctx.font = '600 20px monospace';
    const tagWidth = ctx.measureText(tagText).width + 30;
    ctx.fillRect(75, 160, tagWidth, 36);
    ctx.strokeStyle = `${brand.palette.secondary}50`;
    ctx.lineWidth = 1;
    ctx.strokeRect(75, 160, tagWidth, 36);
    ctx.fillStyle = brand.palette.accent;
    ctx.fillText(tagText, 90, 185);

    // Divider line
    ctx.strokeStyle = `${brand.palette.accent}40`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 230);
    ctx.lineTo(width - 80, 230);
    ctx.stroke();

    // Word-wrap Headline calculation
    const words = (headline || `${brand.name} Directive`).split(' ');
    const lines: string[] = [];
    let currentLine: string[] = [];

    // Max chars per line around 22-26 for impactful typography
    for (const word of words) {
      currentLine.push(word);
      if (currentLine.join(' ').length > 22) {
        lines.push(currentLine.slice(0, -1).join(' '));
        currentLine = [word];
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    // Render Headline Text
    ctx.fillStyle = brand.palette.text;
    ctx.font = '800 68px "Inter", system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'top';

    const startY = Math.max(380, 520 - (lines.length * 80) / 2);
    let yPos = startY;

    lines.forEach((line) => {
      ctx.fillText(line, 75, yPos);
      yPos += 88;
    });

    // Bottom Footer Area
    ctx.strokeStyle = `${brand.palette.secondary}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(75, height - 140);
    ctx.lineTo(width - 80, height - 140);
    ctx.stroke();

    // Footer Lexicon Badges
    ctx.fillStyle = `${brand.palette.text}80`;
    ctx.font = '500 22px monospace';
    const primaryLexicon = brand.lexicon.slice(0, 2).join(' • ');
    ctx.fillText(`MANDATE: ${primaryLexicon.toUpperCase()}`, 75, height - 90);

    // YazooBlu Watermark
    ctx.fillStyle = `${brand.palette.accent}99`;
    ctx.font = '600 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('YAZOOBLU // EDITORIAL ENGINE', width - 80, height - 90);
    ctx.textAlign = 'left';

    // 4-Color Palette Signature dots in footer
    const swatches = [
      { color: brand.palette.bg, label: 'BG' },
      { color: brand.palette.accent, label: 'ACCENT' },
      { color: brand.palette.secondary, label: 'SEC' },
      { color: brand.palette.text, label: 'TEXT' },
    ];
    swatches.forEach((s, idx) => {
      ctx.beginPath();
      ctx.arc(75 + idx * 22, height - 52, 6, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = `${brand.palette.text}40`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [brandKey, headline, width, height, brand]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${brandKey}-social-card-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.warn('Direct clipboard image copy not supported, falling back');
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 w-full aspect-square max-w-[420px] bg-black/60 group"
        style={{
          boxShadow: `0 20px 40px -15px ${brand.palette.accent}25`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs p-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-200 transition shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Exporting...' : 'Export 1080p'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-black/80 text-white border border-white/30 font-medium rounded-lg text-sm flex items-center gap-2 hover:bg-black transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-between w-full max-w-[420px] mt-2.5 px-1 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1080×1080 Native Card
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download PNG
            </button>
            <span>•</span>
            <button
              onClick={handleCopy}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
