// 📍 src/config/color-families.ts
// 新生儿摄影道具色系配置

export interface ColorFamily {
  slug: string;
  name: string;
  displayColor: string;  // Hex color for color swatch
  description: string;
}

/**
 * 摄影道具色系定义
 * 基于莫兰迪色系，温馨柔和专业
 */
export const colorFamilies: ColorFamily[] = [
  {
    slug: 'pastel',
    name: 'Pastel',
    displayColor: '#E8D5E0',  // Soft lavender pink
    description: 'Soft pastel tones perfect for dreamy shots',
  },
  {
    slug: 'vintage-brown',
    name: 'Vintage Brown',
    displayColor: '#9C8B7E',  // Soft Brown (brand-dark)
    description: 'Warm vintage brown for timeless photos',
  },
  {
    slug: 'cream',
    name: 'Cream',
    displayColor: '#F5F0EB',  // Warm Cream (brand-light)
    description: 'Classic cream tones for elegant portraits',
  },
  {
    slug: 'natural-wood',
    name: 'Natural Wood',
    displayColor: '#C8B4A0',  // Natural wood tone
    description: 'Natural wood tones for organic feel',
  },
  {
    slug: 'sage',
    name: 'Sage',
    displayColor: '#B4C4A4',  // Sage Green (brand-accent)
    description: 'Calming sage green for peaceful scenes',
  },
  {
    slug: 'dusty-rose',
    name: 'Dusty Rose',
    displayColor: '#D4A5A5',  // Dusty Rose (brand-default)
    description: 'Romantic dusty rose for sweet moments',
  },
] as const;

export type ColorFamilySlug = typeof colorFamilies[number]['slug'];

/**
 * 根据 slug 获取色系信息
 */
export function getColorFamilyBySlug(slug: string): ColorFamily | undefined {
  return colorFamilies.find(cf => cf.slug === slug);
}

/**
 * 获取所有色系的 slugs
 */
export function getAllColorFamilySlugs(): string[] {
  return colorFamilies.map(cf => cf.slug);
}

/**
 * 验证是否为有效的色系 slug
 */
export function isValidColorFamilySlug(slug: string): slug is ColorFamilySlug {
  return colorFamilies.some(cf => cf.slug === slug);
}
