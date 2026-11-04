// src/types.ts
import { ALL_BRANDS } from './brands/registry';

export type BrandKey =
  | 'fyrrion'
  | 'porch_md'
  | 'nuecofab'
  | 'bhw_pr'
  | 'bes_outkast'
  | 'creatives'
  | 'hilton_head';

export type SocialPlatform =
  | 'Facebook'
  | 'LinkedIn'
  | 'Pinterest'
  | 'X'
  | 'TikTok'
  | 'Bluesky'
  | 'Instagram'
  | 'Threads'
  | 'YouTube'
  | 'Substack';

export type Channel = SocialPlatform;

export type DraftStatus = 'pending_review' | 'approved' | 'rejected';

export interface ChannelSpec {
  name: Channel;
  charLimit?: number;
  wordLimit?: number;
  desc: string;
  badge: string;
}

export const CHANNEL_SPECS: Record<Channel, ChannelSpec> = {
  Bluesky: { name: 'Bluesky', charLimit: 300, desc: '300 characters limit. Intellectual nuance.', badge: '300 chars' },
  Threads: { name: 'Threads', charLimit: 300, desc: '300 characters limit. Conversational hook & community debate.', badge: '300 chars' },
  Pinterest: { name: 'Pinterest', charLimit: 800, desc: '800 characters limit. Search-optimized Pin description.', badge: '800 chars' },
  X: { name: 'X', charLimit: 260, desc: 'Under 260 characters. Stark contrarian hook.', badge: '260 chars' },
  TikTok: { name: 'TikTok', charLimit: 250, desc: 'Punchy video caption with retention cue.', badge: 'Video Hook' },
  LinkedIn: { name: 'LinkedIn', charLimit: 2000, wordLimit: 250, desc: '150-250 words with crisp line breaks.', badge: '150-250w' },
  Instagram: { name: 'Instagram', charLimit: 2200, desc: 'Elevated visual caption with line breaks.', badge: 'Visual Post' },
  YouTube: { name: 'YouTube', charLimit: 4000, desc: 'Paced script cue with high retention hook.', badge: 'Paced Script' },
  Substack: { name: 'Substack', charLimit: 6000, desc: 'Intellectual thesis statement and analytical dossier.', badge: 'Longform' },
  Facebook: { name: 'Facebook', charLimit: 3500, desc: 'Executive narrative and community briefing.', badge: 'Narrative' },
};

export type PipelineStageKey =
  | 'strategy'
  | 'traffic'
  | 'ideation'
  | 'auditing'
  | 'approval_1'
  | 'production'
  | 'polish'
  | 'qc';

export interface PipelineStageInfo {
  key: PipelineStageKey;
  stepNumber: number;
  title: string;
  workers: string;
  roleDescription: string;
}

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    key: 'strategy',
    stepNumber: 1,
    title: 'Strategy & Ingestion',
    workers: 'Sunday Night Autonomous Engine',
    roleDescription: 'Pulls search targets and RSS feeds from Neon queue to establish topic tension.',
  },
  {
    key: 'traffic',
    stepNumber: 2,
    title: 'Traffic & Logistics Engine',
    workers: 'Traffic Manager',
    roleDescription: 'Routes brand deliverables, reserves publication windows, and assigns channels.',
  },
  {
    key: 'ideation',
    stepNumber: 3,
    title: 'Ideation & Angle Assembly',
    workers: 'Creative Director & Copywriter Agent',
    roleDescription: 'Drafts high-retention hooks and core narrative body copy.',
  },
  {
    key: 'auditing',
    stepNumber: 4,
    title: 'Constraint & Voice Audit',
    workers: 'Voice & Brand Auditor',
    roleDescription: 'Filters forbidden words and strictly aligns brand posture and lexicon.',
  },
  {
    key: 'approval_1',
    stepNumber: 5,
    title: 'Executive Review & Manual Inject',
    workers: 'Editor-in-Chief / Executive Desk',
    roleDescription: 'Monday morning review gate: inject breaking topics, revise copy, or unlock production.',
  },
  {
    key: 'production',
    stepNumber: 6,
    title: 'Media Production',
    workers: 'Visual & Audio Director Agents',
    roleDescription: 'Generates image prompts, storyboards, Pixabay media, and VO cues.',
  },
  {
    key: 'polish',
    stepNumber: 7,
    title: 'Platform Formatting',
    workers: 'Platform Packaging Agent',
    roleDescription: 'Applies channel-specific character caps, spacing, and hashtag clusters.',
  },
  {
    key: 'qc',
    stepNumber: 8,
    title: 'Final Quality Control',
    workers: 'Executive Director (QC)',
    roleDescription: 'Final sign-off; sets status to approved and commits package to database.',
  },
];

export interface ColumnDesk {
  id: string;
  name: string;
  author: string;
  subtitle: string;
  description: string;
  recommendedChannels: SocialPlatform[];
  researchQueries: string[];
  archetypeTopics: string[];
  lexiconAnchors: string[];
}

export interface BrandColors {
  primary: string;
  secondary?: string;
  accent: string;
  bg?: string;
}

export interface BrandPalette {
  bg: string;
  cardBg: string;
  text: string;
  accent: string;
}

export interface BrandConfig {
  key: string;
  name: string;
  tagline: string;
  description: string;
  primaryChannels: SocialPlatform[];
  columns?: ColumnDesk[];
  colors: BrandColors;
  palette?: BrandPalette;
  archetype: string;
  posture: string;
  lexicon: string[];
  negativeConstraints: string;
  forbiddenWords?: string[];
  audiences: string[];
  pictureRules?: any;
  videoRules?: any;
  logoDescription?: string;
  sampleTopics: string[];
}

// Safely map ALL_BRANDS into BRANDS dictionary while normalizing colors/palette
export const BRANDS: Record<string, BrandConfig> = (ALL_BRANDS || []).reduce((acc, brand) => {
  if (!brand || !brand.key) return acc;

  // Ensure both colors and palette exist to prevent UI rendering crashes
  const colors = brand.colors || { primary: '#171717', accent: '#f59e0b', bg: '#0a0a0a' };
  const palette = brand.palette || {
    bg: colors.bg || '#0a0a0a',
    cardBg: '#171717',
    text: '#ffffff',
    accent: colors.accent || '#f59e0b',
  };

  acc[brand.key] = {
    ...brand,
    colors,
    palette,
    archetype: brand.archetype || 'Sovereign Leader',
    posture: brand.posture || 'Authoritative & Strategic',
    lexicon: Array.isArray(brand.lexicon) ? brand.lexicon : ['Leadership', 'Disruption'],
    negativeConstraints: brand.negativeConstraints || 'Avoid hype and empty buzzwords.',
    audiences: Array.isArray(brand.audiences) && brand.audiences.length > 0 ? brand.audiences : ['Executive Leadership'],
    sampleTopics: Array.isArray(brand.sampleTopics) && brand.sampleTopics.length > 0 ? brand.sampleTopics : ['Strategic Leadership'],
  };
  return acc;
}, {} as Record<string, BrandConfig>);

export interface ProductionPackage {
  id: string;
  brand_key: BrandKey;
  brandKey?: BrandKey; // Alias for camelCase lookups in UI
  brand_name: string;
  channel: Channel;
  audience: string;
  topic: string;
  magazine_column?: string;
  hook_options: string[];
  selected_hook?: string;
  post_body: string;
  socialCopy?: string; // Alias for UI components
  voiceover_script: string;
  voiceoverScript?: string; // Alias for UI components
  visual_headline: string;
  cardText?: string; // Alias for UI components
  image_prompt: string;
  image_card_data?: string;
  photo_url?: string;
  video_url?: string;
  video_storyboard?: any[];
  video_prompt?: string;
  hashtags: string;
  status: DraftStatus;
  rejection_reason?: string;
  created_at: string;
  scheduled_at?: string;
}

// Hook Library Definitions
export interface HookTemplate {
  id?: number;
  channel_key: string;
  hook_text: string;
  channel_name?: string;
  badge?: string;
}

export const HOOK_LIBRARY: HookTemplate[] = [];

// Editorial Constraint Fallbacks
export const FORBIDDEN_UNIVERSAL_WORDS: string[] = ['synergy', 'game-changer', 'unprecedented', 'paradigm shift'];
