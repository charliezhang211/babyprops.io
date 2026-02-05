// 📍 src/config/materials.ts
// 新生儿摄影道具材质配置

export interface Material {
  slug: string;
  name: string;
  description: string;
  icon: string;  // Emoji icon
}

/**
 * 摄影道具材质定义
 * 常见的新生儿摄影道具材质
 */
export const materials: Material[] = [
  {
    slug: 'mohair',
    name: 'Mohair',
    description: 'Soft and fluffy mohair yarn, perfect for wraps',
    icon: '🧶',
  },
  {
    slug: 'wood',
    name: 'Wood',
    description: 'Natural wood for beds, buckets and props',
    icon: '🪵',
  },
  {
    slug: 'iron',
    name: 'Iron',
    description: 'Durable iron frames for sturdy props',
    icon: '⚙️',
  },
  {
    slug: 'fabric',
    name: 'Fabric',
    description: 'Soft fabrics for blankets and backdrops',
    icon: '🧵',
  },
  {
    slug: 'cotton',
    name: 'Cotton',
    description: 'Natural cotton for comfortable wraps',
    icon: '☁️',
  },
  {
    slug: 'felt',
    name: 'Felt',
    description: 'High quality felt for hats and accessories',
    icon: '🎩',
  },
  {
    slug: 'knit',
    name: 'Knit',
    description: 'Hand-knitted pieces with unique texture',
    icon: '🧣',
  },
  {
    slug: 'wicker',
    name: 'Wicker',
    description: 'Natural wicker baskets for classic looks',
    icon: '🧺',
  },
] as const;

export type MaterialSlug = typeof materials[number]['slug'];

/**
 * 根据 slug 获取材质信息
 */
export function getMaterialBySlug(slug: string): Material | undefined {
  return materials.find(m => m.slug === slug);
}

/**
 * 获取所有材质的 slugs
 */
export function getAllMaterialSlugs(): string[] {
  return materials.map(m => m.slug);
}

/**
 * 验证是否为有效的材质 slug
 */
export function isValidMaterialSlug(slug: string): slug is MaterialSlug {
  return materials.some(m => m.slug === slug);
}
