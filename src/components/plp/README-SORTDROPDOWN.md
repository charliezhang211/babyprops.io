# SortDropdown 组件文档

> **组件路径:** `src/components/plp/SortDropdown.tsx`
> **类型:** React Island Component
> **功能:** 产品列表页排序下拉选择组件

---

## 概述

SortDropdown 是产品列表页（PLP）的排序选择组件，提供 4 种排序方式，支持 URL 参数同步和状态持久化。

---

## 功能特性

### ✅ 核心功能

- **4 种排序选项**
  - Featured（推荐）- 默认排序
  - Price: Low to High（价格低→高）
  - Price: High to Low（价格高→低）
  - Newest（最新）

- **状态管理**
  - 使用 Nano Stores `$currentSort` 读取当前排序
  - 使用 `setSortOption()` 更新排序
  - URL 参数自动同步（`?sort=price-asc`）

- **交互体验**
  - 点击按钮展开/收起下拉菜单
  - 点击外部自动关闭
  - 支持 ESC 键关闭
  - 选中项高亮显示
  - 下拉箭头旋转动画

- **可访问性**
  - ARIA 标签支持（`aria-haspopup`, `aria-expanded`, `role="listbox"`）
  - 键盘导航支持（ESC 关闭）
  - 语义化 HTML 结构

---

## 使用方法

### 基础用法

```astro
---
// src/pages/shop/index.astro
import SortDropdown from '@/components/plp/SortDropdown';
---

<div class="flex items-center justify-between mb-6">
  <h2>All Products</h2>
  <SortDropdown client:load />
</div>
```

### 配合产品网格使用

```astro
---
import SortDropdown from '@/components/plp/SortDropdown';
import ProductGrid from '@/components/plp/ProductGrid.astro';
import { getCollection } from 'astro:content';

// 获取产品
const products = await getCollection('products');
---

<div class="container mx-auto px-4 py-8">
  {/* 排序控件 */}
  <div class="flex items-center justify-end mb-6">
    <SortDropdown client:load />
  </div>

  {/* 产品网格 */}
  <ProductGrid products={products} />
</div>

<script>
  import { $currentSort } from '@/stores/filter';
  import { initFiltersFromURL } from '@/stores/filter';

  // 初始化从 URL 读取排序
  initFiltersFromURL();

  // 监听排序变化，重新排序产品
  $currentSort.subscribe(sort => {
    console.log('Current sort:', sort);
    // 在这里实现排序逻辑
  });
</script>
```

---

## 排序选项详情

### Featured (featured)

- **描述:** 推荐排序，优先展示精选产品
- **URL 参数:** 无（默认值不添加到 URL）
- **排序逻辑:**
  - `is_featured = true` 的产品优先
  - 其次按创建时间排序

### Price: Low to High (price-asc)

- **描述:** 价格从低到高排序
- **URL 参数:** `?sort=price-asc`
- **排序逻辑:** 按 `basePrice` 升序

### Price: High to Low (price-desc)

- **描述:** 价格从高到低排序
- **URL 参数:** `?sort=price-desc`
- **排序逻辑:** 按 `basePrice` 降序

### Newest (newest)

- **描述:** 最新上架优先
- **URL 参数:** `?sort=newest`
- **排序逻辑:**
  - `is_new = true` 的产品优先
  - 其次按创建时间降序

---

## 状态管理

### Nano Stores 集成

```ts
// src/stores/filter.ts

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface FilterState {
  // ... 其他筛选状态
  sort: SortOption;
}

// 读取当前排序
export const $currentSort = computed($filterState, state => state.sort);

// 设置排序
export function setSortOption(sort: SortOption) {
  const state = $filterState.get();
  $filterState.set({ ...state, sort });
  syncFiltersToURL();
}
```

### URL 同步规则

```
默认值 (featured):
  URL: /shop
  说明: 不添加 sort 参数

非默认值:
  URL: /shop?sort=price-asc
  说明: 添加 sort 参数
```

### 页面刷新保持状态

```ts
// 初始化时从 URL 读取排序
import { initFiltersFromURL } from '@/stores/filter';

// 在页面加载时调用
initFiltersFromURL();
```

---

## 样式定制

### Tailwind 类名

```tsx
// 按钮样式
className="inline-flex items-center justify-between w-full min-w-[200px] px-4 py-2.5 text-sm font-medium text-brand-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"

// 选中项样式
className="bg-brand-light text-brand-dark font-medium"

// 未选中项样式
className="text-gray-700 hover:bg-gray-100"
```

### 自定义颜色

如需修改颜色，编辑 `tailwind.config.mjs`:

```js
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#D4A5A5',  // 主色
        light: '#F5F0EB',    // 浅色背景
        dark: '#9C8B7E',     // 深色文字
      },
    },
  },
}
```

---

## 实现排序逻辑

### Astro 服务端排序

```astro
---
import { getCollection } from 'astro:content';

const allProducts = await getCollection('products');
const sortParam = Astro.url.searchParams.get('sort') || 'featured';

// 排序函数
function sortProducts(products, sortOption) {
  switch (sortOption) {
    case 'price-asc':
      return products.sort((a, b) => a.data.basePrice - b.data.basePrice);

    case 'price-desc':
      return products.sort((a, b) => b.data.basePrice - a.data.basePrice);

    case 'newest':
      return products.sort((a, b) => {
        if (a.data.is_new !== b.data.is_new) {
          return a.data.is_new ? -1 : 1;
        }
        // 假设有 createdAt 字段
        return new Date(b.data.createdAt) - new Date(a.data.createdAt);
      });

    case 'featured':
    default:
      return products.sort((a, b) => {
        if (a.data.is_featured !== b.data.is_featured) {
          return a.data.is_featured ? -1 : 1;
        }
        return 0;
      });
  }
}

const sortedProducts = sortProducts(allProducts, sortParam);
---

<ProductGrid products={sortedProducts} />
```

### 客户端实时排序 (可选)

```tsx
// 如果需要客户端实时排序（不推荐，影响性能）
import { useStore } from '@nanostores/react';
import { $currentSort } from '@/stores/filter';
import { useState, useEffect } from 'react';

function ProductList({ initialProducts }) {
  const currentSort = useStore($currentSort);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const sorted = sortProducts(initialProducts, currentSort);
    setProducts(sorted);
  }, [currentSort]);

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 组件结构

```
SortDropdown
├── 按钮 (Toggle)
│   ├── 排序图标
│   ├── "Sort: {当前选项}"
│   └── 下拉箭头（带旋转动画）
│
└── 下拉菜单 (Dropdown)
    ├── Featured
    ├── Price: Low to High
    ├── Price: High to Low
    └── Newest
        └── 选中标记 ✓
```

---

## 测试

### 测试页面

访问测试页面查看组件效果:

```bash
npm run dev
# 访问: http://localhost:4321/test-sort-dropdown
```

### 功能测试清单

- [ ] 点击按钮展开下拉菜单
- [ ] 选择不同排序选项
- [ ] 验证 URL 参数同步（`?sort=price-asc`）
- [ ] 刷新页面，验证排序保持
- [ ] 点击外部，下拉菜单关闭
- [ ] 按 ESC 键，下拉菜单关闭
- [ ] 选中项高亮显示
- [ ] 下拉箭头旋转动画

---

## 无障碍访问

### ARIA 标签

```tsx
<button
  aria-haspopup="listbox"
  aria-expanded={isOpen}
>
  Sort: Featured
</button>

<div role="listbox">
  <button
    role="option"
    aria-selected={isSelected}
  >
    Price: Low to High
  </button>
</div>
```

### 键盘支持

| 键 | 操作 |
|----|------|
| `Enter` / `Space` | 展开/收起下拉菜单 |
| `Escape` | 关闭下拉菜单 |
| `Tab` | 聚焦下一个元素 |

---

## 常见问题

### Q: 如何更改默认排序?

A: 修改 `src/stores/filter.ts` 的初始值:

```ts
export const $filterState = atom<FilterState>({
  // ...
  sort: 'newest', // 改为你想要的默认值
});
```

### Q: 如何添加新的排序选项?

A: 1. 在 `src/stores/filter.ts` 添加类型:

```ts
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'popular';
```

2. 在 `SortDropdown.tsx` 添加选项:

```ts
const SORT_OPTIONS = [
  // ...
  { value: 'popular', label: 'Most Popular' },
];
```

3. 实现排序逻辑。

### Q: 排序后如何保持筛选条件?

A: 排序和筛选状态都在 `$filterState` 中，自动保持。URL 示例:

```
/shop?colors=pastel,cream&materials=wood&sort=price-asc
```

### Q: 如何在移动端优化显示?

A: 组件已经是响应式的（`min-w-[200px]`），如需进一步优化:

```tsx
<div className="w-full md:w-auto"> {/* 移动端全宽 */}
  <SortDropdown client:load />
</div>
```

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/components/plp/SortDropdown.tsx` | 主组件 |
| `src/stores/filter.ts` | 状态管理 |
| `src/pages/test-sort-dropdown.astro` | 测试页面 |
| `src/components/plp/README-SORTDROPDOWN.md` | 本文档 |

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-02-03 | 初始版本，支持 4 种排序选项 |

---

**维护者:** ULX Studio
**最后更新:** 2026-02-03
