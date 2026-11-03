// src/brands/nuecofab.ts
import { BrandConfig, SocialPlatform } from '../types';

const NUECOFAB_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const nuecofabBrand: BrandConfig = {
  key: 'nuecofab',
  name: 'Nuecofab',
  tagline: 'Clean-Tech Material Conversion & Fleet Energy Storage',
  description: 'Anaerobic bio-conversion of degraded textiles into bio-feedstock, combined with behind-the-meter commercial EV battery storage.',
  primaryChannels: NUECOFAB_CHANNELS,
  colors: {
    primary: '#064E3B',
    secondary: '#047857',
    accent: '#10B981'
  }
};
