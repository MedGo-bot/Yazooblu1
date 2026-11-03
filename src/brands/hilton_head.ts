// src/brands/hilton_head.ts
import { BrandConfig, SocialPlatform } from '../types';

const HHL_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const hiltonHeadBrand: BrandConfig = {
  key: 'hilton_head',
  name: 'Hilton Head Leadership Summit',
  tagline: 'Executive Strategy & Generational Enterprise Forums',
  description: 'Closed-door summit convening institutional leaders, founders, and policy strategists on Hilton Head Island.',
  primaryChannels: HHL_CHANNELS,
  colors: {
    primary: '#1E293B',
    secondary: '#B45309',
    accent: '#F59E0B'
  }
};
