// src/config/categories.ts
// BabyProps.io - 产品分类配置

/**
 * 分类数据接口
 */
export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  badge?: 'Best Value' | 'Pro' | 'New';
}

/**
 * 8 大产品分类
 * 用于导航菜单、首页分类网格、产品筛选等
 */
export const categories: Category[] = [
  {
    slug: 'photo-props',
    name: 'Photo Props',
    description: 'General photography props for all themes',
    image: '/images/categories/photo-props.webp',
  },
  {
    slug: 'theme-sets',
    name: 'Theme Sets',
    description: 'Curated sets for specific themes',
    image: '/images/categories/theme-sets.webp',
    badge: 'Best Value',
  },
  {
    slug: 'photo-clothes',
    name: 'Photo Clothes',
    description: 'Outfits, rompers, and dresses',
    image: '/images/categories/photo-clothes.webp',
  },
  {
    slug: 'posing-props',
    name: 'Posing Props',
    description: 'Beds, buckets, bowls and posing aids',
    image: '/images/categories/posing-props.webp',
  },
  {
    slug: 'wraps-blankets',
    name: 'Wraps & Blankets',
    description: 'High quality textures for wrapping',
    image: '/images/categories/wraps-blankets.webp',
  },
  {
    slug: 'hats-headbands',
    name: 'Hats & Headbands',
    description: 'Delicate accessories for headshots',
    image: '/images/categories/hats-headbands.webp',
  },
  {
    slug: 'training-dolls',
    name: 'Training Dolls',
    description: 'Professional posing practice dolls',
    image: '/images/categories/training-dolls.webp',
    badge: 'Pro',
  },
  {
    slug: 'mini-creative-props',
    name: 'Mini Creative Props',
    description: 'Small props for detailed shots',
    image: '/images/categories/mini-creative-props.webp',
  },
];

/**
 * 分类 Slug 类型 (用于 TypeScript 类型检查)
 */
export type CategorySlug = 'photo-props' | 'theme-sets' | 'photo-clothes' | 'posing-props' | 'wraps-blankets' | 'hats-headbands' | 'training-dolls' | 'mini-creative-props';

/**
 * 根据 slug 查找分类
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

/**
 * 获取所有分类 slug 列表
 */
export function getAllCategorySlugs(): CategorySlug[] {
  return categories.map((cat) => cat.slug) as CategorySlug[];
}

/**
 * 验证 slug 是否有效
 */
export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((cat) => cat.slug === slug);
}
