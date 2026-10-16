import React, { useState } from 'react';
import { BRANDS, MagazineColumn } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  BookOpen,
  Newspaper,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  Printer,
  Copy,
  Check,
  Compass,
  Bookmark,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MagazineIssueAssemblerProps {
  onSelectColumnInStudio?: (columnId: string, topic: string) => void;
}

export const MagazineIssueAssembler: React.FC<MagazineIssueAssemblerProps> = ({
  onSelectColumnInStudio,
}) => {
  const brand = BRANDS.bes_outkast;
  const columns = brand.columns || [];

  const [issueNumber, setIssueNumber] = useState<string>('Issue No. 14');
  const [issueVolume, setIssueVolume] = useState<string>('Volume IV');
  const [issueTheme, setIssueTheme] = useState<string>(
    'The Architectural Silhouette: Sartorial Armor Against Disposable Fashion'
  );
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const selectedCol = columns[activeColumnIndex] || columns[0];

  // Sample curated editorial dispatches for the 10 columns
  const columnDispatches: Record<
    string,
    {
      headline: string;
      leadParagraph: string;
      bodyText: string;
      pullQuote: string;
      photoUrl: string;
    }
  > = {
    col_roped_shoulder: {
      headline: 'The Architecture of the Roped Shoulder: Defying the Slouch of the Modern Era',
      leadParagraph:
        'A natural shoulder yields to gravity; a roped shoulder commands posture. In our lead investigation, we dissect why Savile Row’s most demanding cut remains the ultimate psychological fortification.',
      bodyText:
        'When the sleevehead is cut slightly higher than the armscye and packed with wadding, the cloth rolls upward into an authoritative ridge. It is not ornamentation; it is architectural scaffolding. In boardrooms and diplomatic chambers, the silhouette frames the human body with deliberate intentionality.',
      pullQuote:
        'A soft shoulder belongs to the spectator. The roped shoulder belongs to the protagonist.',
      photoUrl:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
    },
    col_sharkskin_twill: {
      headline: 'Sharkskin Twill: The Two-Tone Armor That Optical Sensors Cannot Flatten',
      leadParagraph:
        'Woven from alternating light and dark worsted yarns in a steep twill weave, sharkskin reflects light with subtle kinetic depth that cheap synthetic blends cannot emulate.',
      bodyText:
        'Run your thumb across an authentic 340-gram English sharkskin. The textured hand reveals microscopic topography designed to shed creases during twelve-hour intercontinental flights. It projects clarity in dim lighting and commands dignity under harsh fluorescent illumination.',
      pullQuote:
        'Sharkskin does not reflect light passively; it calibrates it.',
      photoUrl:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    },
    col_cutting_room: {
      headline: 'Inside the Cutting Room: The Geometry of the First Chalk Line',
      leadParagraph:
        'A master cutter does not draft for the average human form. They draft to rectify asymmetrical posture, dropped shoulders, and skeletal imbalances with shears and chalk.',
      bodyText:
        'Before shears touch worsted wool, fifty individual biometric measurements are translated onto heavy brown craft paper. The cutter’s rock chalk leaves a temporary white trail—the blueprint for garments engineered to outlast their wearer’s lifetime.',
      pullQuote:
        'Measurement is forensic observation. The cut is restorative justice.',
      photoUrl:
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
    },
    col_guild_shears: {
      headline: 'The Guild & Shears: Why Hand-Stitched Canvassing Outlives Fused Fast-Fashion',
      leadParagraph:
        'Modern mass manufacturing bonds suiting with heat-activated glue. Within six dry-cleaning cycles, the chest bubbles and collapses. The Bespoke Guild still stitches floating horsehair canvas by hand.',
      bodyText:
        'A floating horsehair canvas breathes with body heat. Over six months of wear, the horsehair softens and molds itself irreversibly to the wearer’s chest cavity like a bespoke second skin.',
      pullQuote:
        'Glue dissolves with heat. Stitches mold with time.',
      photoUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    },
    col_savile_row_ledger: {
      headline: 'The Savile Row Ledger: The True Cost-Per-Wear of an Heirloom Garment',
      leadParagraph:
        'Spending six thousand pounds on a bespoke suit appears extravagant only to those who purchase disposable polyester garments every eighteen months.',
      bodyText:
        'Amortized over thirty years and two alterations, an authentic bespoke two-piece costs eighty-three cents per wear. It retains generational resale value and eliminates the psychological drain of seasonal planned obsolescence.',
      pullQuote:
        'Cheap clothing is the most expensive subscription model on earth.',
      photoUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    },
    col_sartorial_psychology: {
      headline: 'Sartorial Psychology: How Tailoring Alters Neural Executive Function',
      leadParagraph:
        'Enclothed cognition is not vanity. Clinical cognitive trials confirm that structured tailoring measurably elevates abstract reasoning and executive risk tolerance.',
      bodyText:
        'When posture is mechanically supported by high-armhole tailoring and canvassed wool, cortisol spikes diminish. The wearer is physically restrained from slouching, which reinforces neurochemical composure under interrogative pressure.',
      pullQuote:
        'You do not wear tailoring to be seen. You wear it to think without compromise.',
      photoUrl:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80',
    },
    col_cloth_loom: {
      headline: 'The Cloth & The Loom: Why Yorkshire Mill Water Still Holds Global Supremacy',
      leadParagraph:
        'From Huddersfield to Biella, the calcium-soft waters of northern rivers wash raw fleece to yield tensile strength that arid climates cannot duplicate.',
      bodyText:
        'We examine 13-micron Merino fleece harvested from non-mulesed Tasmanian sheep, spun at 60 turns per inch. When woven on vintage Dobcross looms, the cloth possesses natural spring and elasticity without synthetic elastane.',
      pullQuote:
        'Water chemistry dictates cloth density. Geography is destiny.',
      photoUrl:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
    },
    col_monogram_signet: {
      headline: 'Monogram & Signet: The Lost Etiquette of Discreet Personal Heraldry',
      leadParagraph:
        'Loud external logos are the domain of commercial brands selling status to the insecure. True connoisseurs conceal their monogram on the inside pocket lining.',
      bodyText:
        'A seal-engraved signet ring carved in reverse into bloodstone, paired with subtle tone-on-tone cuff monogramming, represents the sovereign boundary of authentic personal identity.',
      pullQuote:
        'External logos are advertisements. Internal monograms are signatures.',
      photoUrl:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    },
    col_tailor_archive: {
      headline: 'From the Archive: The 1934 Double-Breasted Drape Cut Revisited',
      leadParagraph:
        'Frederick Scholte’s legendary drape cut created the illusion of an athletic v-taper by adding subtle extra cloth across the chest and shoulder blades.',
      bodyText:
        'We unroll archival patterns from 1934 to analyze how Scholte’s drape cut provided full rotational arm movement without pulling the front quarters or exposing the waistband.',
      pullQuote:
        'The vintage drape did not restrict movement. It choreographed it.',
      photoUrl:
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
    },
    col_iron_steam: {
      headline: 'The Iron & The Steam: Sculpting Three-Dimensional Wool with Heavy Heat',
      leadParagraph:
        'Before a single stitch is joined, flat two-dimensional wool panels must be shrunk and stretched with an eight-pound tailor’s iron into human curvature.',
      bodyText:
        'Under moist heat, wool fibers temporarily release their hydrogen bonds. The master presser coaxes the back seam over the curve of the shoulder blades, baking permanent anatomical shape into the wool itself.',
      pullQuote:
        'The needle fastens. The iron sculpts.',
      photoUrl:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const getDispatch = (col?: MagazineColumn) => {
    if (!col) return columnDispatches.col_roped_shoulder;
    if (columnDispatches[col.id]) return columnDispatches[col.id];
    return {
      headline: col.sampleTopics?.[0] || `${col.name}: Sovereign Architectural Standards`,
      leadParagraph: col.description || `An authoritative dispatch from ${col.name}.`,
      bodyText: col.editorialDirective
        ? `${col.editorialDirective} Examining core anchors: ${col.lexiconAnchors?.join(', ') || 'permanence and craftsmanship'}. Engineered for enduring discernment over disposable trends.`
        : `Comprehensive editorial investigation conducted by ${col.assignedWorkers}.`,
      pullQuote: col.sampleTopics?.[1] || `In ${col.name}, standards are absolute.`,
      photoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
    };
  };

  const currentDispatch = getDispatch(selectedCol);

  const handleCopyIssueDigest = () => {
    let digest = `=================================================================\n`;
    digest += `BES OUTKAST SOCIETY • EDITORIAL NEWS MAGAZINE\n`;
    digest += `${issueVolume} • ${issueNumber}\n`;
    digest += `THEME: ${issueTheme}\n`;
    digest += `=================================================================\n\n`;

    columns.forEach((col, idx) => {
      const disp = getDispatch(col);
      digest += `SECTION ${idx + 1}: [${col.name.toUpperCase()}]\n`;
      digest += `COLUMNIST: ${col.assignedWorkers}\n`;
      digest += `HEADLINE: ${disp.headline}\n\n`;
      digest += `${disp.leadParagraph}\n\n`;
      digest += `${disp.bodyText}\n\n`;
      digest += `PULL-QUOTE: "${disp.pullQuote}"\n`;
      digest += `EDITORIAL DIRECTIVE: ${col.editorialDirective}\n`;
      digest += `LEXICON ANCHORS: ${col.lexiconAnchors.join(', ')}\n`;
      digest += `-----------------------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(digest);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportIssueFile = () => {
    let digest = `=================================================================\n`;
    digest += `BES OUTKAST SOCIETY • EDITORIAL NEWS MAGAZINE\n`;
    digest += `${issueVolume} • ${issueNumber}\n`;
    digest += `THEME: ${issueTheme}\n`;
    digest += `=================================================================\n\n`;

    columns.forEach((col, idx) => {
      const disp = getDispatch(col);
      digest += `SECTION ${idx + 1}: [${col.name.toUpperCase()}]\n`;
      digest += `COLUMNIST: ${col.assignedWorkers}\n`;
      digest += `HEADLINE: ${disp.headline}\n\n`;
      digest += `${disp.leadParagraph}\n\n`;
      digest += `${disp.bodyText}\n\n`;
      digest += `PULL-QUOTE: "${disp.pullQuote}"\n\n`;
    });

    const blob = new Blob([digest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bes-outkast-society-${issueNumber.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Magazine Issue Masthead */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle Burgundy/Gold Ambient Glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle, ${brand.palette.accent}, transparent 70%)`,
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-start gap-4">
            <BrandLogo brandKey="bes_outkast" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                  {issueVolume} • {issueNumber}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  AUTUMN/WINTER EDITORIAL DIGEST
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                Bes Outkast Society • Magazine Issue Assembler
              </h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed italic">
                &ldquo;{issueTheme}&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyIssueDigest}
              className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer border border-neutral-700"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Digest Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Complete Digest</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportIssueFile}
              className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Issue Dossier</span>
            </button>
          </div>
        </div>

        {/* Issue Progress Bar across all Columns */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono text-[11px]">
              Issue Assembly Status:
            </span>
            <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {columns.length} of {columns.length} Column Dispatches Vetted
            </span>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            Publisher: <strong className="text-neutral-300">Bes Outkast Editorial Guild</strong> • Frequency: <strong className="text-neutral-300">Bi-Weekly</strong>
          </div>
        </div>
      </div>

      {/* Main Magazine Layout: Table of Contents (Left) vs Editorial Column Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Table of Contents (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Issue Table of Contents
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">{columns.length} Columns</span>
          </div>

          <div className="space-y-1.5">
            {columns.map((col, idx) => {
              const isSelected = idx === activeColumnIndex;
              return (
                <div
                  key={col.id}
                  onClick={() => setActiveColumnIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1 text-left ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-mono font-bold ${
                        isSelected ? 'text-amber-400' : 'text-neutral-500'
                      }`}
                    >
                      COL {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">
                      {col.recommendedChannels[0]}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {col.name}
                  </h4>

                  <p className="text-[11px] text-neutral-400 line-clamp-1 font-mono">
                    Byline: {col.assignedWorkers}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Editorial Column Reader & Spread (8 cols) */}
        <div className="lg:col-span-8 space-y-5 bg-neutral-950 border border-neutral-850 rounded-2xl p-6 shadow-xl">
          {/* Article Header & Byline */}
          <div className="border-b border-neutral-850 pb-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                SECTION {activeColumnIndex + 1} • {selectedCol.name}
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">
                Recommended Channels: {selectedCol.recommendedChannels.join(', ')}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
              {currentDispatch.headline}
            </h3>

            {/* Columnist Byline */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold flex items-center justify-center text-xs font-mono">
                BOS
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">
                  By {selectedCol.assignedWorkers}
                </span>
                <span className="text-[11px] text-neutral-400 italic">
                  Editorial Directive: &ldquo;{selectedCol.editorialDirective}&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Curated Editorial Photo Banner */}
          <div className="relative rounded-xl overflow-hidden aspect-[21/9] border border-neutral-800 bg-black shadow-lg group">
            <img
              src={currentDispatch.photoUrl}
              alt={selectedCol.name}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-[10px] font-mono text-neutral-300">
                Visual Directive: {selectedCol.visualGuidance || 'Editorial worsted cloth macro study'}
              </span>
            </div>
          </div>

          {/* Lead Paragraph & Editorial Body Spread */}
          <div className="space-y-4 text-xs text-neutral-200 leading-relaxed">
            <p className="text-sm font-semibold text-neutral-100 leading-relaxed border-l-2 border-amber-400 pl-3">
              {currentDispatch.leadParagraph}
            </p>

            <p className="text-xs leading-relaxed text-neutral-300">
              {currentDispatch.bodyText}
            </p>

            {/* Luxurious Pull-Quote */}
            <div className="my-6 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center space-y-1">
              <span className="text-amber-400 font-serif text-2xl leading-none">&ldquo;</span>
              <p className="text-sm font-bold text-white italic font-serif tracking-wide px-4">
                {currentDispatch.pullQuote}
              </p>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block pt-1">
                — {selectedCol.name.toUpperCase()} ARCHIVE
              </span>
            </div>

            {/* Sartorial Lexicon Anchors */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-850 space-y-1.5">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                Column Lexicon Anchors & Keywords:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedCol.lexiconAnchors.map((lex, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-neutral-800 text-amber-300"
                  >
                    #{lex}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions for this Column */}
          <div className="pt-4 border-t border-neutral-850 flex items-center justify-between">
            <div className="text-[11px] text-neutral-400 font-mono">
              Sample Topic: <strong className="text-white">{selectedCol.sampleTopics[0]}</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectColumnInStudio) {
                  onSelectColumnInStudio(selectedCol.id, selectedCol.sampleTopics[0]);
                }
              }}
              className="py-1.5 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Work on this Column in Brand Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
