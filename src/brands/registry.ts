// src/brands/registry.ts
import type { BrandConfig } from '../types';
import { besOutkastBrand } from './bes_outkast';
import { bhwPrBrand } from './bhw_pr';
import { nuecofabBrand } from './nuecofab';
import { porchMdBrand } from './porch_md';
import { fyrrionBrand } from './fyrrion';
import { creativesBrand } from './creatives';
import { hiltonHeadBrand } from './hilton_head';

export const ALL_BRANDS: BrandConfig[] = [
  besOutkastBrand,
  bhwPrBrand,
  nuecofabBrand,
  porchMdBrand,
  fyrrionBrand,
  creativesBrand,
  hiltonHeadBrand,
];

export function getBrandByKey(key: string): BrandConfig | undefined {
  return ALL_BRANDS.find((b) => b.key === key);
}

export * from './bes_outkast';
export * from './bhw_pr';
export * from './nuecofab';
export * from './porch_md';
export * from './fyrrion';
export * from './creatives';
export * from './hilton_head';

