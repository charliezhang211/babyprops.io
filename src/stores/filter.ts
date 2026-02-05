// 📍 src/stores/filter.ts
// 产品筛选状态管理 (Nano Stores)

import { atom, computed } from 'nanostores';
import type { ColorFamilySlug } from '@/config/color-families';
import type { MaterialSlug } from '@/config/materials';

/**
 * 排序选项
 */
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface FilterState {
  colors: Set<ColorFamilySlug>;
  materials: Set<string>;
  priceRange: [number, number] | null;
  sort: SortOption;
}

/**
 * 筛选状态 Store
 */
export const $filterState = atom<FilterState>({
  colors: new Set(),
  materials: new Set(),
  priceRange: null,
  sort: 'featured',
});

/**
 * 从 URL 参数初始化筛选状态
 */
export function initFiltersFromURL() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);

  const state: FilterState = {
    colors: new Set(),
    materials: new Set(),
    priceRange: null,
    sort: 'featured',
  };

  // 解析颜色参数 (?colors=pastel,cream)
  const colorsParam = params.get('colors');
  if (colorsParam) {
    colorsParam.split(',').forEach(color => {
      state.colors.add(color as ColorFamilySlug);
    });
  }

  // 解析材质参数 (?materials=wood,mohair)
  const materialsParam = params.get('materials');
  if (materialsParam) {
    materialsParam.split(',').forEach(material => {
      state.materials.add(material);
    });
  }

  // 解析价格范围 (?price=0-100)
  const priceParam = params.get('price');
  if (priceParam) {
    const [min, max] = priceParam.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      state.priceRange = [min, max];
    }
  }

  // 解析排序参数 (?sort=price-asc)
  const sortParam = params.get('sort');
  if (sortParam && ['featured', 'price-asc', 'price-desc', 'newest'].includes(sortParam)) {
    state.sort = sortParam as SortOption;
  }

  $filterState.set(state);
}

/**
 * 同步筛选状态到 URL
 */
export function syncFiltersToURL() {
  if (typeof window === 'undefined') return;

  const state = $filterState.get();
  const params = new URLSearchParams(window.location.search);

  // 同步颜色
  if (state.colors.size > 0) {
    params.set('colors', Array.from(state.colors).join(','));
  } else {
    params.delete('colors');
  }

  // 同步材质
  if (state.materials.size > 0) {
    params.set('materials', Array.from(state.materials).join(','));
  } else {
    params.delete('materials');
  }

  // 同步价格
  if (state.priceRange) {
    params.set('price', `${state.priceRange[0]}-${state.priceRange[1]}`);
  } else {
    params.delete('price');
  }

  // 同步排序 (只有非默认值时才添加到 URL)
  if (state.sort !== 'featured') {
    params.set('sort', state.sort);
  } else {
    params.delete('sort');
  }

  // 更新 URL (不刷新页面)
  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newURL);
}

/**
 * 添加颜色筛选
 */
export function addColorFilter(color: ColorFamilySlug) {
  const state = $filterState.get();
  const newColors = new Set(state.colors);
  newColors.add(color);

  $filterState.set({
    ...state,
    colors: newColors,
  });

  syncFiltersToURL();
}

/**
 * 移除颜色筛选
 */
export function removeColorFilter(color: ColorFamilySlug) {
  const state = $filterState.get();
  const newColors = new Set(state.colors);
  newColors.delete(color);

  $filterState.set({
    ...state,
    colors: newColors,
  });

  syncFiltersToURL();
}

/**
 * 切换颜色筛选 (添加或移除)
 */
export function toggleColorFilter(color: ColorFamilySlug) {
  const state = $filterState.get();

  if (state.colors.has(color)) {
    removeColorFilter(color);
  } else {
    addColorFilter(color);
  }
}

/**
 * 清空所有筛选
 */
export function clearAllFilters() {
  $filterState.set({
    colors: new Set(),
    materials: new Set(),
    priceRange: null,
    sort: 'featured',
  });

  syncFiltersToURL();
}

/**
 * 清空颜色筛选
 */
export function clearColorFilters() {
  const state = $filterState.get();
  $filterState.set({
    ...state,
    colors: new Set(),
  });

  syncFiltersToURL();
}

/**
 * Computed: 获取选中的颜色数组
 */
export const $selectedColors = computed($filterState, state => {
  return Array.from(state.colors);
});

/**
 * Computed: 是否有任何激活的筛选
 */
export const $hasActiveFilters = computed($filterState, state => {
  return state.colors.size > 0 || state.materials.size > 0 || state.priceRange !== null;
});

/**
 * Computed: 激活的筛选数量
 */
export const $activeFilterCount = computed($filterState, state => {
  return state.colors.size + state.materials.size + (state.priceRange ? 1 : 0);
});

/**
 * 添加材质筛选
 */
export function addMaterialFilter(material: MaterialSlug) {
  const state = $filterState.get();
  const newMaterials = new Set(state.materials);
  newMaterials.add(material);

  $filterState.set({
    ...state,
    materials: newMaterials,
  });

  syncFiltersToURL();
}

/**
 * 移除材质筛选
 */
export function removeMaterialFilter(material: MaterialSlug) {
  const state = $filterState.get();
  const newMaterials = new Set(state.materials);
  newMaterials.delete(material);

  $filterState.set({
    ...state,
    materials: newMaterials,
  });

  syncFiltersToURL();
}

/**
 * 切换材质筛选 (添加或移除)
 */
export function toggleMaterialFilter(material: MaterialSlug) {
  const state = $filterState.get();

  if (state.materials.has(material)) {
    removeMaterialFilter(material);
  } else {
    addMaterialFilter(material);
  }
}

/**
 * 清空材质筛选
 */
export function clearMaterialFilters() {
  const state = $filterState.get();
  $filterState.set({
    ...state,
    materials: new Set(),
  });

  syncFiltersToURL();
}

/**
 * 设置价格区间
 */
export function setPriceRange(min: number, max: number) {
  const state = $filterState.get();
  $filterState.set({
    ...state,
    priceRange: [min, max],
  });

  syncFiltersToURL();
}

/**
 * 清空价格筛选
 */
export function clearPriceRange() {
  const state = $filterState.get();
  $filterState.set({
    ...state,
    priceRange: null,
  });

  syncFiltersToURL();
}

/**
 * Computed: 获取选中的材质数组
 */
export const $selectedMaterials = computed($filterState, state => {
  return Array.from(state.materials);
});

/**
 * 设置排序方式
 */
export function setSortOption(sort: SortOption) {
  const state = $filterState.get();
  $filterState.set({
    ...state,
    sort,
  });

  syncFiltersToURL();
}

/**
 * Computed: 获取当前排序选项
 */
export const $currentSort = computed($filterState, state => {
  return state.sort;
});
