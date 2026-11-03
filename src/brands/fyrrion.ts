// src/brands/fyrrion.ts
import { BrandConfig, SocialPlatform } from '../types';

const FYRRION_CHANNELS: SocialPlatform[] = [
  'LinkedIn',
  'Pinterest',
  'Facebook',
  'Instagram',
  'Threads'
];

export const fyrrionBrand: BrandConfig = {
  key: 'fyrrion',
  name: 'Fyrrion Cybersecurity',
  tagline: 'Zero-Trust Telemetry & Retail/Medical Encryption',
  description: 'Cybersecurity defense tailored for healthcare and retail, enforcing zero-trust transit encryption and TLS 1.3 telemetry monitoring.',
  primaryChannels: FYRRION_CHANNELS,
  colors: {
    primary: '#18181B',
    secondary: '#7F1D1D',
    accent: '#EF4444'
  }
};
