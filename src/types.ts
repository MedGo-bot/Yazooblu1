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
  | 'ideation'
  | 'approval_1'
  | 'traffic'
  | 'production'
  | 'auditing'
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
  { key: 'strategy', stepNumber: 1, title: 'Strategy', workers: 'Strategist & Account Manager', roleDescription: 'Create the brief and define strategic tension.' },
  { key: 'ideation', stepNumber: 2, title: 'Ideation', workers: 'Creative Director & Copywriters', roleDescription: 'Guide copywriters and art directors to create concepts.' },
  { key: 'approval_1', stepNumber: 3, title: 'Approval 1', workers: 'Chief Creative Officer', roleDescription: 'Approves core concept and unlocks asset logistics.' },
  { key: 'traffic', stepNumber: 4, title: 'Traffic Manager', workers: 'Traffic Manager', roleDescription: 'The logistics engine. Sets deadlines, routes assets.' },
  { key: 'production', stepNumber: 5, title: 'Production', workers: 'Audio/VO & Visual Director', roleDescription: 'Create raw visual overlay and voiceover script assets.' },
  { key: 'auditing', stepNumber: 6, title: 'Auditing & Assembly', workers: 'Voice & Constraint Auditor', roleDescription: 'Audit constraints, assemble copy cadence.' },
  { key: 'polish', stepNumber: 7, title: 'Final Polish', workers: 'Platform Packaging Agent', roleDescription: 'Format assets strictly to platform character limits.' },
  { key: 'qc', stepNumber: 8, title: 'Quality Control', workers: 'Creative Director (QC)', roleDescription: 'Final verification and executive go/no-go sign-off.' },
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
}

export interface BrandConfig {
  key: string;
  name: string;
  tagline: string;
  description: string;
  primaryChannels: SocialPlatform[];
  columns?: ColumnDesk[];
  colors: BrandColors;
  archetype?: string;
  posture?: string;
  lexicon?: string[];
  negativeConstraints?: string;
  forbiddenWords?: string[];
  audiences?: string[];
  palette?: any;
  pictureRules?: any;
  videoRules?: any;
  logoDescription?: string;
  sampleTopics?: string[];
}

// Convert modular brands array to the Record structure the React UI expects
export const BRANDS: Record<string, BrandConfig> = ALL_BRANDS.reduce((acc, brand) => {
  acc[brand.key] = brand;
  return acc;
}, {} as Record<string, BrandConfig>);

export interface ProductionPackage {
  id: string;
  brand_key: BrandKey;
  brand_name: string;
  channel: Channel;
  audience: string;
  topic: string;
  magazine_column?: string;
  hook_options: string[];
  selected_hook?: string;
  post_body: string;
  voiceover_script: string;
  visual_headline: string;
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
