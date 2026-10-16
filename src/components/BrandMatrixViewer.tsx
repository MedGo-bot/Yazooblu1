import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Layers,
  Palette,
  ExternalLink,
  Copy,
  Check,
  X,
  Wand2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  BRANDS,
  BrandKey,
  FORBIDDEN_UNIVERSAL_WORDS,
} from '../types';
import { BrandLogo } from './BrandLogo';

export const BrandMatrixViewer: React.FC = () => {
  const [testText, setTestText] = useState<string>(
    'We must delve into this game-changer solution to unlock maximum viral growth and curb appeal for our 10x team.'
  );
  const [testBrandKey, setTestBrandKey] = useState<BrandKey>('bhw_pr');
  const [selectedBrandModal, setSelectedBrandModal] = useState<BrandKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gemini AI Deep Audit State
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<{
    compliance_score: number;
    verdict: string;
    identified_violations: string[];
    matched_lexicon: string[];
    missing_lexicon: string[];
    critique: string;
    surgical_rewrite: string;
  } | null>(null);

  const activeTestBrand = BRANDS[testBrandKey];

  // Heuristic linter
  const lowerText = testText.toLowerCase();

  const detectedUniversal = FORBIDDEN_UNIVERSAL_WORDS.filter((word) =>
    lowerText.includes(word.toLowerCase())
  );

  const detectedBrandForbidden = activeTestBrand.forbiddenWords.filter((word) =>
    lowerText.includes(word.toLowerCase())
  );

  const detectedLexicon = activeTestBrand.lexicon.filter((term) =>
    lowerText.includes(term.toLowerCase())
  );

  const hasViolations = detectedUniversal.length > 0 || detectedBrandForbidden.length > 0;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunAiAudit = async () => {
    if (!testText.trim()) return;
    setIsAiAuditing(true);
    setAiAuditResult(null);

    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: testBrandKey,
          text: testText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAiAuditResult(data.result);
        }
      }
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAiAuditing(false);
    }
  };

  const modalBrand = selectedBrandModal ? BRANDS[selectedBrandModal] : null;

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Brand Voice & Palette Architecture Matrix
              </h2>
              <p className="text-xs text-neutral-400">
                The 7 sovereign editorial personas, linguistic anchors, strict negative constraints, and updated creative palettes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
              graphics.py synchronized
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
                <th className="py-3 px-3">Brand & Key</th>
                <th className="py-3 px-3">Voice Archetype</th>
                <th className="py-3 px-3">Rhetorical Posture</th>
                <th className="py-3 px-3">Lexicon Anchors</th>
                <th className="py-3 px-3 text-rose-300">Negative Constraints</th>
                <th className="py-3 px-3">Palette Architecture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {(Object.keys(BRANDS) as BrandKey[]).map((key) => {
                const b = BRANDS[key];
                return (
                  <tr
                    key={key}
                    className="hover:bg-neutral-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedBrandModal(key)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border shadow-sm p-0.5 flex items-center justify-center"
                          style={{
                            borderColor: `${b.palette.accent}40`,
                            backgroundColor: b.palette.bg,
                          }}
                        >
                          <BrandLogo brandKey={key} size="xs" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition">
                            {b.name}
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">
                            `{b.key}`
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-neutral-200">
                      {b.archetype}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 leading-relaxed max-w-xs">
                      {b.posture}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {b.lexicon.slice(0, 3).map((term, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-rose-300/90 text-[11px] leading-relaxed max-w-xs">
                      {b.negativeConstraints}
                    </td>
                    <td className="py-3 px-3">
                      {/* 4-Color Palette Swatches with Tooltips */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded border border-white/20 shadow-sm"
                          style={{ backgroundColor: b.palette.bg }}
                          title={`BG: ${b.palette.names.bg} (${b.palette.bg})`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-white/20 shadow-sm"
                          style={{ backgroundColor: b.palette.accent }}
                          title={`Accent: ${b.palette.names.accent} (${b.palette.accent})`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-white/20 shadow-sm"
                          style={{ backgroundColor: b.palette.secondary }}
                          title={`Secondary: ${b.palette.names.secondary} (${b.palette.secondary})`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-white/20 shadow-sm"
                          style={{ backgroundColor: b.palette.text }}
                          title={`Text: ${b.palette.names.text} (${b.palette.text})`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 block mt-1">
                        {b.palette.names.accent}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Negative Constraint & AI Deep Linter */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Live Brand Voice & Constraint Linter
              </h3>
              <p className="text-xs text-neutral-400">
                Audit copy against forbidden negative slang, universal AI fluff, and run deep Gemini 3.8 Flash analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Validate against:</span>
            <select
              value={testBrandKey}
              onChange={(e) => {
                setTestBrandKey(e.target.value as BrandKey);
                setAiAuditResult(null);
              }}
              className="py-1.5 px-3 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {(Object.keys(BRANDS) as BrandKey[]).map((k) => (
                <option key={k} value={k}>
                  {BRANDS[k].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-3">
            <label className="text-xs font-semibold text-neutral-300 block">
              Input Copy to Audit:
            </label>
            <textarea
              rows={5}
              value={testText}
              onChange={(e) => {
                setTestText(e.target.value);
                if (aiAuditResult) setAiAuditResult(null);
              }}
              placeholder="Paste draft copy to scan for brand voice integrity..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTestText(
                      `In evaluating the crisis perimeter, strategic silence maintains narrative architecture without succumbing to external pressure.`
                    )
                  }
                  className="text-[11px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  Load Compliant Sample
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestText(
                      `We need to delve into this game-changer hack to create viral buzz and drip for our 10x hustle.`
                    )
                  }
                  className="text-[11px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  Load Violation Sample
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunAiAudit}
                disabled={isAiAuditing || !testText.trim()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isAiAuditing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Run Gemini Deep Audit
              </button>
            </div>

            {/* AI Deep Audit Output */}
            {aiAuditResult && (
              <div className="mt-4 p-4 rounded-xl bg-purple-950/25 border border-purple-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    Gemini 3.8 Flash Audit Verdict: {aiAuditResult.verdict}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    Score: {aiAuditResult.compliance_score}/100
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {aiAuditResult.critique}
                </p>
                {aiAuditResult.surgical_rewrite && (
                  <div className="pt-2 border-t border-purple-900/50 space-y-1.5">
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block">
                      Recommended Surgical Rewrite:
                    </span>
                    <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 font-sans text-xs text-neutral-200 leading-relaxed">
                      {aiAuditResult.surgical_rewrite}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestText(aiAuditResult.surgical_rewrite)}
                      className="text-[11px] font-mono text-purple-300 hover:text-purple-200 px-2 py-1 rounded bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 cursor-pointer"
                    >
                      Adopt Surgical Rewrite →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-Time Rule Scanner Output */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                Rule Scanner Status:
              </span>
              {hasViolations ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> VIOLATIONS DETECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BRAND COMPLIANT
                </span>
              )}
            </div>

            {/* Universal Fluff Violations */}
            {detectedUniversal.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs">
                <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block mb-1">
                  Universal AI Fluff Detected:
                </span>
                <div className="flex flex-wrap gap-1">
                  {detectedUniversal.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-200 font-mono text-[11px]"
                    >
                      &quot;{w}&quot;
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-rose-300/80 mt-1">
                  Must be eliminated: Quality constraints prohibit low-effort filler tokens.
                </p>
              </div>
            )}

            {/* Brand-Specific Forbidden Slang */}
            {detectedBrandForbidden.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs">
                <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block mb-1">
                  {activeTestBrand.name} Slang Violations:
                </span>
                <div className="flex flex-wrap gap-1">
                  {detectedBrandForbidden.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-200 font-mono text-[11px]"
                    >
                      &quot;{w}&quot;
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-rose-300/80 mt-1">
                  {activeTestBrand.negativeConstraints}
                </p>
              </div>
            )}

            {/* Matched Positive Lexicon */}
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
              <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                Positive Lexicon Anchors Found ({detectedLexicon.length}/{activeTestBrand.lexicon.length}):
              </span>
              {detectedLexicon.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {detectedLexicon.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-mono text-[10px] border border-emerald-800/60"
                    >
                      ✓ {term}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500">
                  No core lexicon anchors detected. Try incorporating terms like &quot;{activeTestBrand.lexicon[0]}&quot; or &quot;{activeTestBrand.lexicon[1]}&quot;.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Inspection Modal */}
      {modalBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border shadow-md p-0.5 flex items-center justify-center"
                  style={{
                    borderColor: `${modalBrand.palette.accent}50`,
                    backgroundColor: modalBrand.palette.bg,
                  }}
                >
                  <BrandLogo brandKey={modalBrand.key} size="sm" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {modalBrand.name}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    `{modalBrand.key}` · {modalBrand.archetype}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBrandModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Color Palette Architecture Card */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Updated Creative Palette Architecture (graphics.py)
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `"${modalBrand.key}": {\n  "bg": (${modalBrand.palette.bgRgb.join(', ')}),\n  "accent": (${modalBrand.palette.accentRgb.join(', ')}),\n  "secondary": (${modalBrand.palette.secondaryRgb.join(', ')}),\n  "text": (${modalBrand.palette.textRgb.join(', ')})\n}`,
                      'py-snippet'
                    )
                  }
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'py-snippet' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copy Python Snippet
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* 1. Background */}
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-center space-y-1.5">
                  <div
                    className="w-full h-10 rounded-md border border-white/10"
                    style={{ backgroundColor: modalBrand.palette.bg }}
                  />
                  <div className="text-[11px] font-bold text-white truncate">
                    {modalBrand.palette.names.bg}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {modalBrand.palette.bg}
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    rgb({modalBrand.palette.bgRgb.join(', ')})
                  </div>
                </div>

                {/* 2. Accent */}
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-center space-y-1.5">
                  <div
                    className="w-full h-10 rounded-md border border-white/10"
                    style={{ backgroundColor: modalBrand.palette.accent }}
                  />
                  <div className="text-[11px] font-bold text-white truncate">
                    {modalBrand.palette.names.accent}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {modalBrand.palette.accent}
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    rgb({modalBrand.palette.accentRgb.join(', ')})
                  </div>
                </div>

                {/* 3. Secondary */}
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-center space-y-1.5">
                  <div
                    className="w-full h-10 rounded-md border border-white/10"
                    style={{ backgroundColor: modalBrand.palette.secondary }}
                  />
                  <div className="text-[11px] font-bold text-white truncate">
                    {modalBrand.palette.names.secondary}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {modalBrand.palette.secondary}
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    rgb({modalBrand.palette.secondaryRgb.join(', ')})
                  </div>
                </div>

                {/* 4. Text */}
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-center space-y-1.5">
                  <div
                    className="w-full h-10 rounded-md border border-white/10"
                    style={{ backgroundColor: modalBrand.palette.text }}
                  />
                  <div className="text-[11px] font-bold text-white truncate">
                    {modalBrand.palette.names.text}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {modalBrand.palette.text}
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    rgb({modalBrand.palette.textRgb.join(', ')})
                  </div>
                </div>
              </div>
            </div>

            {/* Persona Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                  Archetype & Posture
                </span>
                <p className="font-semibold text-white">{modalBrand.archetype}</p>
                <p className="text-neutral-400 mt-1 leading-relaxed">{modalBrand.posture}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                  Mandatory Lexicon
                </span>
                <div className="flex flex-wrap gap-1">
                  {modalBrand.lexicon.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 leading-relaxed">
              <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block mb-1">
                Negative Constraint:
              </span>
              {modalBrand.negativeConstraints}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
