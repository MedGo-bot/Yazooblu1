// src/brands/bes_outkast/brand.ts
import { BrandConfig } from '../../types';
import { BOS_COLUMNS_DATA, ALL_BOS_CHANNELS } from './columns';

export const besOutkastBrand: BrandConfig = {
  id: 'bes_outkast',
  name: 'Bes Outkast Society',
  tagline: 'The Voice of Modern Executive Sophistication and Independent Perspective',
  description:
    'An editorial publication and executive media brand exploring bespoke lifestyle, luxury tailoring, global finance, culture, and sovereign leadership.',
  colors: {
    primary: '#111827',
    secondary: '#4B5563',
    accent: '#D97706',
    background: '#0F172A',
    text: '#F8FAFC'
  },
  voice: {
    tone: 'Authoritative, diagnostic, sartorial, incisive, and culturally grounded',
    perspective: 'Executive thought leadership, bespoke craftsmanship, and sovereign autonomy'
  },
  channels: ALL_BOS_CHANNELS,
  categories: BOS_COLUMNS_DATA.map((col) => col.name)
};

export default besOutkastBrand;
