// src/brands/bes_outkast/brand.ts
import type { BrandConfig } from '../../types';
import { BOS_COLUMNS_DATA, ALL_BOS_CHANNELS } from './columns';

export const besOutkastBrand: BrandConfig = {
  key: 'bes_outkast',
  id: 'bes_outkast',
  name: 'Bes Outkast Society',
  motto: 'For the love of the Dare',
  tagline: 'An Extreme Lifestyle News Magazine — For the love of the Dare',
  description:
    'An extreme lifestyle news magazine and sovereign media brand covering high-stakes pursuits, bespoke tailoring, underworld chronicles, global finance, and fearless cultural journalism.',
  archetype: 'The Sovereign Diagnostic & Extreme Lifestyle Chronicler',
  posture:
    'Authoritative, diagnostic, daring, and culturally grounded. Operates with Chatham House discipline, high intellectual rigor, and an uncompromising appetite for high-stakes truth.',
  primaryChannels: ALL_BOS_CHANNELS,
  columns: BOS_COLUMNS_DATA,
  colors: {
    primary: '#111827',
    secondary: '#4B5563',
    accent: '#D97706',
  },
  palette: {
    bg: '#0F172A',
    accent: '#D97706',
    secondary: '#4B5563',
    text: '#F8FAFC',
    bgRgb: [15, 23, 42],
    accentRgb: [217, 119, 6],
    secondaryRgb: [75, 85, 99],
    textRgb: [248, 250, 252],
    names: {
      bg: 'Monolith Void',
      accent: 'Raw Amber',
      secondary: 'Worsted Slate',
      text: 'Archival White',
    },
  },
  audiences: [
    'C-Suite Executives, Presidents & Board Directors',
    'Founders, Startups & Venture Capitalists',
    'Market Money Managers & Vulture Capitalists',
    'Policy Makers, Public Officials & Solution Providers',
    'Entrepreneurs, Business Developers & Sales Leaders',
    'Cybersecurity Practitioners & Enterprise Technologists',
    'Small Business Owners & Commercial Operators',
    'PhD Holders, Researchers & Sovereign Thinkers',
  ],
  demographics: {
    education: '98% College Degree or Higher (Advanced Degrees & PhDs)',
    householdIncome: '$100,000+ Baseline (Accredited & High-Net-Worth)',
    genderAndAge: {
      male: 'Ages 24–68',
      female: 'Ages 35–55',
    },
    composition:
      'High-discretionary executive readership spanning institutional finance, corporate governance, venture capital, clean-tech, cybersecurity, and public policy.',
  },
  lexicon: [
    'For the love of the Dare',
    'Extreme lifestyle',
    'Worsted wool',
    'Roped shoulder',
    'Floating canvas',
    'Statutory friction',
    'Sovereign balance sheets',
    'Counterparty risk',
    'Chatham House',
    'Boardroom proxy',
  ],
  negativeConstraints:
    'Strict prohibition of generic corporate fluff, low-effort startup slang (10x, hack, hustle, guru), sanitized PR clichés, and unearned informalities.',
  forbiddenWords: [
    'hustle',
    'hack',
    '10x',
    'guru',
    'synergy',
    'delve',
    'game-changer',
    'crushing it',
  ],
  pictureRules: {
    aestheticStyle:
      'High-contrast chiaroscuro, cinematic high-stakes realism, textured worsted grain, architectural geometry, and moody executive lighting.',
    lightingAndCamera: 'Low-key studio strobe, 85mm prime lens at f/2.8, restrained cinematic grading.',
    aspectRatios: ['16:9', '1:1', '4:5'],
  },
  videoRules: {
    pacingDirective: 'Measured, dynamic editorial pacing with 3-second tension hooks and disciplined visual cuts.',
    audioBedAtmosphere: 'Deep analog bass drone with subtle low-frequency jazz and noir undertones.',
    defaultDurationSec: 45,
    aspectRatios: ['9:16', '16:9'],
  },
  logoDescription:
    'Minimalist architectural monogram in burnished amber set against deep navy obsidian.',
  sampleTopics: [
    'For the love of the Dare: High-stakes autonomy in an era of algorithmic conformity',
    'Floating full-canvas architecture: Anatomy of bespoke tailoring that outlives the decade',
    'Statutory friction and capital flight: The quiet exodus from over-regulated jurisdictions',
    'Counterparty risk in private multi-jurisdictional reserves',
  ],
};

export default besOutkastBrand;
  
 
