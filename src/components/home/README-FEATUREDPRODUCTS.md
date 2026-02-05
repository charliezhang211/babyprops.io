# FeaturedProducts Component

> 首页精选产品展示组件

## 文件位置

- [src/components/home/FeaturedProducts.astro](./FeaturedProducts.astro)

## 组件功能

自动从 Content Collections 中读取标记为 `is_featured: true` 的产品，在首页以网格形式展示。

### 核心特性

1. **自动筛选**: 读取所有产品并筛选 `is_featured && in_stock` 的产品
2. **限制数量**: 最多显示 8 个精选产品
3. **响应式网格**: 4 列（桌面）→ 3 列（平板）→ 2 列（大手机）→ 1 列（小手机）
4. **性能优化**: 前 4 个产品 eager loading，其余 lazy loading
5. **空状态处理**: 如果没有精选产品，组件不渲染

## 使用方法

### 基础用法

在首页中直接导入使用:

```astro
---
import FeaturedProducts from '@/components/home/FeaturedProducts.astro';
---

<FeaturedProducts />
```

### 集成到首页

```astro
---
// src/pages/index.astro
import BaseLayout from '@/components/layout/BaseLayout.astro';
import HeroSection from '@/components/home/HeroSection.astro';
import CategoryGrid from '@/components/home/CategoryGrid.astro';
import FeaturedProducts from '@/components/home/FeaturedProducts.astro';
import TrustBadges from '@/components/home/TrustBadges.astro';
---

<BaseLayout>
  <HeroSection />
  <CategoryGrid />
  <FeaturedProducts />
  <TrustBadges />
</BaseLayout>
```

## 数据源

组件从 Content Collections 读取产品数据:

```typescript
// 产品需要在 frontmatter 中设置
is_featured: true
in_stock: true
```

### 示例产品 Markdown

```markdown
---
title: "Wooden Moon Bed"
slug: "wooden-moon-bed"
basePrice: 89.99
featured_image: "/images/products/wooden-moon-bed-1.webp"
is_featured: true  # ← 标记为精选
is_new: true
in_stock: true
---

产品描述...
```

## 组件结构

```
FeaturedProducts
├── Section 容器
│   ├── 顶部区域
│   │   ├── 标题 "Featured Products"
│   │   ├── 副标题描述
│   │   └── "View All Products" 按钮 → /shop
│   │
│   ├── 产品网格 (4 列响应式)
│   │   └── ProductCard × N (最多 8 个)
│   │
│   ├── 底部提示 (如产品少于 8 个)
│   │
│   └── 信任标识栏
│       ├── 🌍 Worldwide Shipping
│       ├── ⭐ 8 Years Experience
│       ├── ✨ Handmade Quality
│       └── 🔒 Secure Checkout
```

## 响应式布局

| 屏幕宽度 | 网格列数 | Tailwind Class |
|---------|---------|----------------|
| < 640px | 1 列 | `grid-cols-1` |
| 640px - 1023px | 2 列 | `sm:grid-cols-2` |
| 1024px - 1279px | 3 列 | `lg:grid-cols-3` |
| ≥ 1280px | 4 列 | `xl:grid-cols-4` |

## 样式规范

### 颜色方案

- 背景: 白色渐变到 `brand-light/20`
- 标题: `brand-dark` (Soft Brown)
- 副标题: `gray-600`
- 按钮: `secondary` 变体 (品牌色边框)

### 间距

- Section 上下内边距: `py-16`
- 标题到网格: `mb-12`
- 网格间隙: `gap-6`
- 信任标识上边距: `mt-12`

## 性能优化

```astro
{featuredProducts.map((product, index) => (
  <ProductCard
    product={product}
    showQuickAdd={false}
    loading={index < 4 ? 'eager' : 'lazy'}  // 前 4 个立即加载
    class="h-full"
  />
))}
```

### 优化措施

1. **图片懒加载**: 前 4 个产品立即加载，其余懒加载
2. **空状态优化**: 无精选产品时不渲染组件（减少 DOM）
3. **高度一致**: 使用 Flexbox 确保卡片高度统一

## 依赖组件

- [ProductCard](../plp/ProductCard.astro) - 产品卡片
- [Button](../ui/Button.astro) - 按钮组件

## 自定义修改

### 修改显示数量

```astro
// 修改限制数量（默认 8）
const featuredProducts = allProducts
  .filter((product) => product.data.is_featured && product.data.in_stock)
  .slice(0, 12);  // 改为 12 个
```

### 修改排序逻辑

```astro
// 按价格排序
const featuredProducts = allProducts
  .filter((product) => product.data.is_featured && product.data.in_stock)
  .sort((a, b) => a.data.basePrice - b.data.basePrice)
  .slice(0, 8);
```

### 修改网格列数

```astro
<!-- 改为 3 列布局 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  ...
</div>
```

## 测试验证

### 功能测试

- [ ] 自动读取并显示 `is_featured` 的产品
- [ ] 最多显示 8 个产品
- [ ] "View All Products" 按钮链接到 `/shop`
- [ ] 响应式布局在不同屏幕正常
- [ ] 没有精选产品时组件不显示

### 数据测试

```bash
# 查看当前有多少精选产品
grep -r "is_featured: true" src/content/products/
```

### 视觉测试

- [ ] 网格间距一致
- [ ] 卡片高度对齐
- [ ] 信任标识居中显示
- [ ] 莫兰迪色系配色正确

## 维护注意事项

### 添加精选产品

在产品 Markdown 文件中设置:

```yaml
is_featured: true
```

### 移除精选产品

```yaml
is_featured: false
# 或直接删除该字段（默认 false）
```

### 调整信任标识

修改底部信任标识栏的内容:

```astro
<div class="flex items-center gap-2">
  <span class="text-brand text-lg">🎨</span>
  <span>Custom Message</span>
</div>
```

## 相关文档

- [CLAUDE.md](../../../CLAUDE.md) - 项目开发规范
- [TASKS.md](../../../TASKS.md#task-23-featuredproducts-组件) - Task-2.3
- [Content Collection 配置](../../content/config.ts)
- [ProductCard 组件](../plp/ProductCard.astro)

---

**Created:** Task-2.3
**Last Updated:** 2026-02-03
