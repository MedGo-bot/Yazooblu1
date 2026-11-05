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

export interface BrandPalette {
  bg: string;
  cardBg: string;
  text: string;
  accent: string;
  secondary?: string;
  names?: {
    bg?: string;
    accent?: string;
    secondary?: string;
    text?: string;
  };
  bgRgb?: [number, number, number];
  accentRgb?: [number, number, number];
  secondaryRgb?: [number, number, number];
  textRgb?: [number, number, number];
}

export interface BrandConfig {
  key: string;
  name: string;
  tagline?: string;
  description?: string;
  primaryChannels?: SocialPlatform[];
  colors?: { primary: string; accent: string; bg?: string };
  palette: BrandPalette;
  archetype: string;
  posture: string;
  lexicon: string[];
  negativeConstraints: string;
  forbiddenWords?: string[];
  audiences: string[];
  sampleTopics: string[];
  pictureRules?: any;
  videoRules?: any;
}

// Default Fallback Palette to eliminate undefined color lookups
const DEFAULT_PALETTE: BrandPalette = {
  bg: '#0a0a0a',
  cardBg: '#171717',
  text: '#ffffff',
  accent: '#f59e0b',
  secondary: '#3b82f6',
  names: { bg: 'Dark Obsidian', accent: 'Amber Gold', secondary: 'Cobalt Blue', text: 'Pure White' },
  bgRgb: [10, 10, 10],
  accentRgb: [245, 158, 11],
  secondaryRgb: [59, 130, 246],
  textRgb: [255, 255, 255],
};

// Normalize every brand in the registry on module load
export const BRANDS: Record<string, BrandConfig> = ((ALL_BRANDS as any[]) || []).reduce((acc, rawBrand) => {
  if (!rawBrand || !rawBrand.key) return acc;

  const accentColor = rawBrand.palette?.accent || rawBrand.colors?.accent || '#f59e0b';
  const bgColor = rawBrand.palette?.bg || rawBrand.colors?.bg || '#0a0a0a';

  acc[rawBrand.key] = {
    ...rawBrand,
    palette: {
      ...DEFAULT_PALETTE,
      ...(rawBrand.palette || {}),
      accent: accentColor,
      bg: bgColor,
    },
    archetype: rawBrand.archetype || 'Sovereign Leader',
    posture: rawBrand.posture || 'Authoritative & Strategic',
    lexicon: Array.isArray(rawBrand.lexicon) ? rawBrand.lexicon : ['Strategy', 'Leadership'],
    negativeConstraints: rawBrand.negativeConstraints || 'Avoid ungrounded marketing buzzwords.',
    audiences: Array.isArray(rawBrand.audiences) && rawBrand.audiences.length > 0 ? rawBrand.audiences : ['Executive Leadership'],
    sampleTopics: Array.isArray(rawBrand.sampleTopics) && rawBrand.sampleTopics.length > 0 ? rawBrand.sampleTopics : ['Strategic Leadership'],
  };
  return acc;
}, {} as Record<string, BrandConfig>);

export interface ProductionPackage {
  id: string;
  brand_key: BrandKey;
  brandKey: BrandKey; // Guaranteed alias
  brand_name: string;
  channel: Channel;
  audience: string;
  topic: string;
  magazine_column?: string;
  hook_options: string[];
  selected_hook?: string;
  post_body: string;
  socialCopy: string; // Guaranteed alias
  voiceover_script: string;
  voiceoverScript: string; // Guaranteed alias
  visual_headline: string;
  cardText: string; // Guaranteed alias
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

/**
 * Helper function to normalize raw production packages coming from backend API
 */
export function normalizePackage(raw: any): ProductionPackage {
  const bKey = raw.brand_key || raw.brandKey || 'fyrrion';
  const bodyText = raw.post_body || raw.socialCopy || '';
  const voScript = raw.voiceover_script || raw.voiceoverScript || '';
  const headlineText = raw.visual_headline || raw.cardText || 'Executive Protocol';

  return {
    id: raw.id || `draft-${Date.now()}`,
    brand_key: bKey,
    brandKey: bKey,
    brand_name: raw.brand_name || BRANDS[bKey]?.name || 'Brand Package',
    channel: raw.channel || 'LinkedIn',
    audience: raw.audience || 'Executive Leadership',
    topic: raw.topic || 'Strategic Alignment',
    magazine_column: raw.magazine_column,
    hook_options: Array.isArray(raw.hook_options) ? raw.hook_options : ['Strategic Directive'],
    selected_hook: raw.selected_hook || raw.hook_options?.[0] || '',
    post_body: bodyText,
    socialCopy: bodyText,
    voiceover_script: voScript,
    voiceoverScript: voScript,
    visual_headline: headlineText,
    cardText: headlineText,
    image_prompt: raw.image_prompt || '',
    image_card_data: raw.image_card_data,
    photo_url: raw.photo_url,
    video_url: raw.video_url,
    video_storyboard: raw.video_storyboard,
    video_prompt: raw.video_prompt,
    hashtags: raw.hashtags || '',
    status: raw.status || 'pending_review',
    rejection_reason: raw.rejection_reason,
    created_at: raw.created_at || new Date().toISOString(),
    scheduled_at: raw.scheduled_at,
  };
}

export function getPlatformHooks(channel: Channel): string[] {
  return [
    "When evaluating [X], standard assumptions collapse.",
    "Unpopular truth: The conversation around [X] treats a structural crisis with cosmetic rhetoric.",
    "The conventional approach to [X] ignores fundamental operational reality.",
  ];
}
