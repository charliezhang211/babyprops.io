# RelatedProducts 组件文档

## 概述

`RelatedProducts.astro` 是产品详情页 (PDP) 的相关产品推荐组件，展示"Complete the Look"推荐区块。

**组件类型:** Astro Component
**路径:** `src/components/pdp/RelatedProducts.astro`
**依赖:** `ProductCard.astro`, Astro Content Collections
**数据源:** Products Content Collection

---

## 功能特性

### ✅ 核心功能

- **智能推荐算法**: 多级推荐策略，确保高质量推荐
- **手动配置支持**: 通过 `related_products` 字段手动指定相关产品
- **自动筛选**: 排除当前产品，只显示有库存产品
- **响应式网格**: 2列(移动) → 3列(平板) → 4列(桌面)
- **可配置数量**: 默认8个，可通过 props 自定义
- **优雅降级**: 无推荐产品时返回 null (不渲染)

### 📊 推荐优先级

推荐算法按以下优先级依次选择产品：

```
1️⃣ 手动指定的相关产品 (related_products 字段)
   └─ 最高优先级，适合策划性推荐

2️⃣ 同色系产品 (相同 color_family)
   └─ 视觉协调，适合搭配拍摄

3️⃣ 同分类产品 (相同 category)
   └─ 功能相似，适合横向对比

4️⃣ 精选/新品产品 (is_featured / is_new)
   └─ 填充推荐，引导发现

5️⃣ 其他任意产品
   └─ 保底推荐，确保有内容
```

---

## Props API

```typescript
interface Props {
  currentProduct: CollectionEntry<'products'>;  // 当前产品对象 (必填)
  limit?: number;                               // 推荐数量 (默认: 8)
  title?: string;                               // 标题文案 (默认: "Complete the Look")
  class?: string;                               // 自定义容器类名
}
```

### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `currentProduct` | `CollectionEntry<'products'>` | - | **必填**，当前产品对象 |
| `limit` | `number` | `8` | 推荐产品最大数量 |
| `title` | `string` | `"Complete the Look"` | 区块标题文案 |
| `class` | `string` | `''` | 追加到容器的类名 |

---

## 使用示例

### 基础用法

```astro
---
import RelatedProducts from '@/components/pdp/RelatedProducts.astro';
import { getEntry } from 'astro:content';

const product = await getEntry('products', 'wooden-moon-bed');
---

<RelatedProducts currentProduct={product} />
```

### 自定义数量

```astro
<!-- 只显示 4 个推荐产品 -->
<RelatedProducts
  currentProduct={product}
  limit={4}
/>
```

### 自定义标题

```astro
<!-- 修改标题文案 -->
<RelatedProducts
  currentProduct={product}
  title="You May Also Like"
/>
```

### 产品详情页完整示例

```astro
---
// src/pages/products/[slug].astro
import BaseLayout from '@/components/layout/BaseLayout.astro';
import ProductGallery from '@/components/pdp/Gallery.astro';
import ProductInfo from '@/components/pdp/ProductInfo.astro';
import ProductTabs from '@/components/pdp/ProductTabs.tsx';
import RelatedProducts from '@/components/pdp/RelatedProducts.astro';
import { getEntry } from 'astro:content';

export async function getStaticPaths() {
  const products = await getCollection('products');
  return products.map((product) => ({
    params: { slug: product.data.slug },
  }));
}

const { slug } = Astro.params;
const product = await getEntry('products', slug);

if (!product) {
  return Astro.redirect('/404');
}
---

<BaseLayout>
  {/* 产品主要内容 */}
  <div class="grid md:grid-cols-2 gap-8">
    <ProductGallery images={product.data.gallery} />
    <ProductInfo product={product} />
  </div>

  {/* 产品详情标签页 */}
  <ProductTabs product={product} />

  {/* 相关产品推荐 */}
  <RelatedProducts currentProduct={product} />
</BaseLayout>
```

---

## 手动指定相关产品

在产品 Markdown 文件中使用 `related_products` 字段：

```markdown
---
title: "Wooden Moon Bed"
slug: "wooden-moon-bed"
category: "posing-props"
color_family: "Natural Wood"

# 手动指定相关产品 (优先级最高)
related_products:
  - "mohair-wrap-cream"
  - "vintage-lace-romper"
  - "mini-floral-crown-set"
---
```

**优势:**
- 策划性推荐，完全可控
- 适合主题套装、搭配销售
- 覆盖自动推荐的不足

---

## 响应式布局

### 网格断点

```
┌─────────────────────────────────────────────────────────┐
│  < 768px (Mobile)     │  2 列网格                       │
│  768px - 1024px (Tablet)  │  3 列网格                   │
│  > 1024px (Desktop)   │  4 列网格                       │
└─────────────────────────────────────────────────────────┘
```

### 图片加载优化

- 前 4 个产品: `loading="eager"` (优先加载)
- 后续产品: `loading="lazy"` (懒加载)

---

## 样式规范

### 莫兰迪色系

```css
背景色: bg-brand-light/30  /* #F5F0EB 30% 透明度 */
标题色: text-brand-dark     /* #9C8B7E */
按钮色: border-brand        /* #D4A5A5 */
```

### 容器结构

```html
<section data-component="related-products">
  <div class="container mx-auto px-4">
    <div class="text-center mb-8">
      <h2>{title}</h2>
      <p>副标题</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <!-- ProductCard 网格 -->
    </div>
    <div class="text-center mt-8">
      <!-- "View All" 按钮 -->
    </div>
  </div>
</section>
```

---

## SEO & 可访问性

### ARIA 标签

```html
<section aria-labelledby="related-products-title">
  <h2 id="related-products-title">Complete the Look</h2>
</section>
```

### Schema.org 建议

在 PDP 页面添加 `ItemList` 结构化数据 (可选):

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Related Products",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Product Name",
        "url": "https://babyprops.io/products/product-slug"
      }
    }
  ]
}
```

---

## 性能优化

### 自动优化

- ✅ 懒加载后续产品图片
- ✅ 预渲染静态内容 (SSG)
- ✅ 最小化推荐算法复杂度 (O(n))
- ✅ 空状态返回 null (不渲染 DOM)

### 推荐实践

```astro
<!-- ✅ 推荐: 在 PDP 末尾使用 -->
<RelatedProducts currentProduct={product} limit={8} />

<!-- ⚠️ 避免: 在循环中使用 (会重复计算) -->
{products.map(p => <RelatedProducts currentProduct={p} />)}
```

---

## 测试

### 测试页面

```bash
npm run dev
# 访问: http://localhost:4321/test-related-products
```

### 测试清单

- [ ] 基础渲染 (默认 limit=8)
- [ ] 自定义数量 (limit=4)
- [ ] 自定义标题
- [ ] 手动指定相关产品 (related_products 字段)
- [ ] 同色系推荐
- [ ] 同分类推荐
- [ ] 空状态 (无推荐产品时不渲染)
- [ ] 响应式布局 (移动/平板/桌面)
- [ ] "View All" 按钮链接正确
- [ ] 图片懒加载生效

---

## 常见问题

### Q1: 如何确保某个产品被推荐？

**A:** 在产品 Markdown 中使用 `related_products` 字段手动指定：

```markdown
---
related_products:
  - "product-slug-1"
  - "product-slug-2"
---
```

### Q2: 推荐数量不足 limit 怎么办？

**A:** 组件会自动降级到更低优先级的推荐策略，确保尽可能填满推荐位。如果所有产品都不满足条件（比如全部缺货），会显示少于 limit 的产品。

### Q3: 如何只显示同色系产品？

**A:** 修改组件代码，移除分类推荐逻辑。或者在每个产品中手动指定 `related_products`。

### Q4: "View All" 按钮如何自定义？

**A:** 当前按钮链接到当前产品的分类页 (`/shop/{category}`)。可以通过 props 传入自定义链接，或直接修改组件代码。

### Q5: 如何禁用"View All"按钮？

**A:** 在组件中添加 `showViewAll` prop：

```astro
{showViewAll && currentData.category && (
  <div class="text-center mt-8">
    <!-- "View All" 按钮 -->
  </div>
)}
```

---

## 扩展建议

### 未来增强

1. **A/B 测试支持**: 通过 props 切换不同推荐策略
2. **用户行为推荐**: 集成浏览历史、加购记录
3. **实时库存同步**: 自动排除缺货产品
4. **个性化推荐**: 根据用户偏好调整权重
5. **点击追踪**: 记录推荐效果数据

---

## 变更日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-02-03 | 初始版本，支持多级推荐算法 |

---

**Maintainer:** ULX Studio
**Component Status:** ✅ Production Ready
**Last Updated:** 2026-02-03
