// src/types.ts

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
}

export interface PictureGeneratorRules {
  aspectRatios: ('1:1' | '16:9' | '9:16' | '4:5')[];
  aestheticStyle: string;
  lightingAndCamera: string;
  colorGradingDirective: string;
  permittedSubjects: string[];
  forbiddenVisualTropes: string[];
  promptTemplate: string;
}

export interface VideoStoryboardScene {
  timestamp: string;
  phase: 'Hook' | 'Tension' | 'Diagnostic' | 'Command';
  visualDescription: string;
  cameraMovement: string;
  kineticTextOverlay: string;
  audioVoiceoverCue: string;
}

export interface VideoGeneratorRules {
  aspectRatios: ('9:16' | '16:9' | '1:1' | '4:5')[];
  defaultDurationSec: number;
  pacingDirective: string;
  motionAndCameraStyle: string;
  kineticTypographyRules: string;
  audioBedAtmosphere: string;
  forbiddenMotionTropes: string[];
  aiModelDirectives: string;
}

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
  video_storyboard?: VideoStoryboardScene[];
  video_prompt?: string;
  hashtags: string;
  status: DraftStatus;
  rejection_reason?: string;
  created_at: string;
  scheduled_at?: string;
}

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
