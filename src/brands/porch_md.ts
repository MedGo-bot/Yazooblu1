// src/brands/porch_md.ts
import { BrandConfig, SocialPlatform } from '../types';

const PORCH_MD_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const porchMdBrand: BrandConfig = {
  key: 'porch_md',
  name: 'PorchMD',
  tagline: 'Two-Way Patient & Physician EPR Infrastructure',
  description: 'Secure, clinical electronic patient record system hosted in AWS GovCloud for direct two-way patient and physician communication.',
  primaryChannels: PORCH_MD_CHANNELS,
  colors: {
    primary: '#1E3A8A',
    secondary: '#0284C7',
    accent: '#0EA5E9'
  }
};
