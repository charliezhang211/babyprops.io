// 📍 src/lib/product-utils.ts
// 产品筛选和排序工具函数

import type { CollectionEntry } from 'astro:content';
import type { SortOption } from '@/stores/filter';
import type { ColorFamilySlug } from '@/config/color-families';
import type { MaterialSlug } from '@/config/materials';

export type Product = CollectionEntry<'products'>;

/**
 * 筛选产品接口
 */
export interface ProductFilters {
  colors?: ColorFamilySlug[];
  materials?: MaterialSlug[];
  priceRange?: [number, number];
  category?: string;
  inStockOnly?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

/**
 * 应用筛选条件到产品列表
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  return products.filter(product => {
    const { data } = product;

    // 分类筛选
    if (filters.category && data.category !== filters.category) {
      return false;
    }

    // 库存筛选
    if (filters.inStockOnly && !data.in_stock) {
      return false;
    }

    // New 标签筛选
    if (filters.isNew && !data.is_new) {
      return false;
    }

    // Featured 标签筛选
    if (filters.isFeatured && !data.is_featured) {
      return false;
    }

    // 颜色筛选
    if (filters.colors && filters.colors.length > 0) {
      if (!data.color_family) return false;

      // 支持多个颜色 OR 逻辑
      const hasMatchingColor = filters.colors.some(color =>
        data.color_family?.toLowerCase().includes(color.toLowerCase())
      );

      if (!hasMatchingColor) return false;
    }

    // 材质筛选
    if (filters.materials && filters.materials.length > 0) {
      if (!data.material) return false;

      // 支持多个材质 OR 逻辑
      const hasMatchingMaterial = filters.materials.some(material =>
        data.material?.toLowerCase().includes(material.toLowerCase())
      );

      if (!hasMatchingMaterial) return false;
    }

    // 价格区间筛选
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (data.basePrice < min || data.basePrice > max) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 排序产品列表
 */
export function sortProducts(
  products: Product[],
  sortOption: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortOption) {
    case 'price-asc':
      sorted.sort((a, b) => a.data.basePrice - b.data.basePrice);
      break;

    case 'price-desc':
      sorted.sort((a, b) => b.data.basePrice - a.data.basePrice);
      break;

    case 'newest':
      // 优先排序 is_new 产品
      sorted.sort((a, b) => {
        if (a.data.is_new && !b.data.is_new) return -1;
        if (!a.data.is_new && b.data.is_new) return 1;
        // 如果都是 new 或都不是, 保持原顺序
        return 0;
      });
      break;

    case 'featured':
    default:
      // 优先排序 is_featured 产品
      sorted.sort((a, b) => {
        if (a.data.is_featured && !b.data.is_featured) return -1;
        if (!a.data.is_featured && b.data.is_featured) return 1;
        return 0;
      });
      break;
  }

  return sorted;
}

/**
 * 分页产品列表
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function paginateProducts<T>(
  items: T[],
  options: PaginationOptions
): PaginatedResult<T> {
  const { page, pageSize } = options;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 确保页码在有效范围内
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));

  // 计算起始和结束索引
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // 切分数据
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * 获取筛选后的产品计数
 */
export function getProductCount(
  products: Product[],
  filters: ProductFilters
): number {
  return filterProducts(products, filters).length;
}

/**
 * 获取产品价格范围
 */
export function getPriceRange(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 200];

  const prices = products.map(p => p.data.basePrice);
  const min = Math.floor(Math.min(...prices) / 10) * 10; // 向下取整到十位
  const max = Math.ceil(Math.max(...prices) / 10) * 10; // 向上取整到十位

  return [min, max];
}
