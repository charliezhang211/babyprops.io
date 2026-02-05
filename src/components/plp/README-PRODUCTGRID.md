# ProductGrid 组件

## 📍 位置
- **主组件:** `src/components/plp/ProductGrid.astro`
- **骨架屏:** `src/components/plp/ProductGridSkeleton.astro`
- **依赖:** `ProductCard.astro`

---

## ✨ 功能特性

### 1. 响应式网格布局
- **4 列模式 (默认):** 桌面 4 列 / 平板 3 列 / 手机 2 列 / 小屏 1 列
- **3 列模式:** 桌面 3 列 / 平板 2 列 / 手机 1 列
- **2 列模式:** 桌面 2 列 / 手机 1 列

### 2. 三种状态
- **Loading 状态:** 显示 8 个骨架屏卡片 + 闪光动画
- **空状态:** 无产品时显示友好的提示信息 + CTA 按钮
- **正常状态:** 显示产品网格 + 逐个淡入动画

### 3. 性能优化
- **渐进式加载:** 前 4 个产品 `loading="eager"`, 其余 `loading="lazy"`
- **动画延迟:** 网格项逐个淡入,增强视觉效果
- **无障碍访问:** 骨架屏包含 `aria-label` 和 `sr-only` 提示

---

## 🎯 使用示例

### 基础用法 (Product List Page)

```astro
---
// src/pages/shop/index.astro
import { getCollection } from 'astro:content';
import ProductGrid from '@/components/plp/ProductGrid.astro';
import BaseLayout from '@/components/layout/BaseLayout.astro';

const products = await getCollection('products', ({ data }) => data.in_stock);
---

<BaseLayout>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-serif text-brand-dark mb-8">All Products</h1>

    <ProductGrid products={products} />
  </main>
</BaseLayout>
```

### 带快速加购按钮

```astro
<ProductGrid
  products={products}
  showQuickAdd={true}
/>
```

### 自定义列数

```astro
<!-- 3 列模式 -->
<ProductGrid
  products={products}
  columns="3"
/>

<!-- 2 列模式 (适合侧边栏布局) -->
<ProductGrid
  products={products}
  columns="2"
/>
```

### Loading 状态

```astro
---
const isLoading = Astro.url.searchParams.has('loading');
---

<ProductGrid
  products={products}
  loading={isLoading}
/>
```

### 自定义样式

```astro
<ProductGrid
  products={products}
  class="my-custom-class"
/>
```

---

## 🧩 独立使用骨架屏

```astro
---
import ProductGridSkeleton from '@/components/plp/ProductGridSkeleton.astro';
---

<!-- 默认 8 个骨架 + 4 列 -->
<ProductGridSkeleton />

<!-- 自定义数量 -->
<ProductGridSkeleton count={12} />

<!-- 自定义列数 -->
<ProductGridSkeleton columns="3" count={9} />
```

---

## 📋 Props 参数

### ProductGrid.astro

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `products` | `CollectionEntry<'products'>[]` | `[]` | 产品数组 |
| `showQuickAdd` | `boolean` | `false` | 是否显示快速加购按钮 |
| `loading` | `boolean` | `false` | 是否显示 Loading 状态 |
| `columns` | `'2' \| '3' \| '4'` | `'4'` | 网格列数 |
| `class` | `string` | `''` | 自定义 CSS 类 |

### ProductGridSkeleton.astro

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | `number` | `8` | 骨架屏数量 |
| `columns` | `'2' \| '3' \| '4'` | `'4'` | 网格列数 |
| `class` | `string` | `''` | 自定义 CSS 类 |

---

## 🎨 空状态设计

当 `products` 数组为空时,组件会显示:

```
┌─────────────────────────────────────┐
│                                     │
│         [盒子图标 SVG]              │
│                                     │
│       No Products Found             │
│                                     │
│  We couldn't find any products...   │
│                                     │
│  [Browse All]  [Go Back]            │
│                                     │
└─────────────────────────────────────┘
```

**自定义空状态文案:**
直接编辑 `ProductGrid.astro` 的空状态部分。

---

## 🧪 测试场景

### 1. 有产品 (正常状态)
```astro
---
const products = await getCollection('products');
---
<ProductGrid products={products} />
```

### 2. 无产品 (空状态)
```astro
<ProductGrid products={[]} />
```

### 3. Loading 状态
```astro
<ProductGrid products={[]} loading={true} />
```

### 4. 不同列数
```astro
<ProductGrid products={products} columns="2" />
<ProductGrid products={products} columns="3" />
<ProductGrid products={products} columns="4" />
```

---

## 🎬 动画说明

### 淡入动画
网格中的产品卡片会逐个淡入 (`fadeInUp`):
- 每个卡片延迟 0.05s
- 前 8 个卡片有动画,后续卡片立即显示
- 动画时长 0.4s

### 骨架屏动画
1. **脉冲动画:** 整体透明度变化 (1 → 0.7 → 1)
2. **闪光扫描:** 从左到右的白色高光扫过

---

## 🔗 相关组件

- **[ProductCard](./ProductCard.astro)** - 产品卡片
- **[ProductGridSkeleton](./ProductGridSkeleton.astro)** - 骨架屏
- **[FilterSidebar](./FilterSidebar.tsx)** - 筛选侧边栏 (待实现)
- **[SortDropdown](./SortDropdown.tsx)** - 排序下拉 (待实现)

---

## 📐 响应式断点

```css
/* Tailwind 默认断点 */
sm:  640px   /* 手机横屏 / 小平板 */
md:  768px   /* 平板 */
lg:  1024px  /* 小桌面 */
xl:  1280px  /* 桌面 */
2xl: 1536px  /* 大桌面 */

/* 本组件断点 */
- 移动端:   < 640px   → 1 列
- 手机横屏:  640-1023px → 2 列
- 平板:      1024-1279px → 3 列 (仅 4 列模式)
- 桌面:      ≥ 1280px → 4 列 (仅 4 列模式)
```

---

## ⚡ 性能优化建议

### 1. 图片懒加载
前 4 个产品使用 `eager` 加载,其余使用 `lazy`:
```ts
loading={index < 4 ? 'eager' : 'lazy'}
```

### 2. 分页加载
建议每页显示 12-24 个产品:
```astro
---
const page = Number(Astro.url.searchParams.get('page') || '1');
const perPage = 12;
const start = (page - 1) * perPage;
const paginatedProducts = products.slice(start, start + perPage);
---
<ProductGrid products={paginatedProducts} />
```

### 3. SSR 预渲染
使用 Astro 的 SSR 模式在服务端渲染产品网格,提升首屏速度。

---

## 🐛 常见问题

### Q: 为什么动画只在前 8 个产品上生效?
**A:** 为了避免长列表动画延迟过长,影响用户体验。可以修改 CSS 增加更多动画延迟。

### Q: 如何自定义空状态文案?
**A:** 编辑 `ProductGrid.astro` 的 `empty-state` 部分。

### Q: 如何实现 Masonry 瀑布流布局?
**A:** 可以使用 CSS `grid-template-rows: masonry` (实验性特性) 或集成 Masonry.js 库。

### Q: 骨架屏数量固定为 8 个,可以自定义吗?
**A:** 可以。将 `ProductGrid.astro` 中的骨架屏替换为:
```astro
{loading && <ProductGridSkeleton count={12} columns={columns} />}
```

---

**Maintainer:** ULX Studio
**Version:** 1.0.0
**Last Updated:** 2026-02-03
