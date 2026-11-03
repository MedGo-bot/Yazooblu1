// src/brands/bhw_pr.ts
import { BrandConfig, SocialPlatform } from '../types';

const BHW_PR_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const bhwPrBrand: BrandConfig = {
  key: 'bhw_pr',
  name: 'BH&W Public Relations Firm',
  tagline: 'Strategic Communications, Policy & Public Affairs',
  description: 'Full-service strategic PR, public affairs advocacy, crisis navigation, and institutional media relations headquartered at 500 Capitol Mall in Sacramento.',
  primaryChannels: BHW_PR_CHANNELS,
  colors: {
    primary: '#0F172A',
    secondary: '#334155',
    accent: '#2563EB'
  }
};
