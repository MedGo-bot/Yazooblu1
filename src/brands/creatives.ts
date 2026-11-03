// src/brands/creatives.ts
import { BrandConfig, SocialPlatform } from '../types';

const CREATIVES_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const creativesBrand: BrandConfig = {
  key: 'creatives',
  name: 'The International Consortium of Creatives',
  tagline: 'Global Creative Leadership & Editorial Syndication',
  description: 'International collaborative guild uniting cross-disciplinary artists, visual directors, writers, and technical creators.',
  primaryChannels: CREATIVES_CHANNELS,
  colors: {
    primary: '#312E81',
    secondary: '#4338CA',
    accent: '#8B5CF6'
  }
};
