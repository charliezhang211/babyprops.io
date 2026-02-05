# UI Components - 使用文档

> **位置:** `src/components/ui/`
> **项目:** BabyProps.io (Dvotinst)
> **创建日期:** 2026-02-03

本目录包含 BabyProps.io 站点的通用 UI 组件,所有组件遵循莫兰迪色系设计规范。

---

## 组件清单

| 组件 | 文件 | 用途 |
|------|------|------|
| **Button** | `Button.astro` | 通用按钮 (primary/secondary/outline) |
| **Badge** | `Badge.astro` | 产品徽章 (New/Sale/Pro) |
| **WhatsAppButton** | `WhatsAppButton.astro` | WhatsApp 联系按钮 |
| **Breadcrumb** | `Breadcrumb.astro` | 面包屑导航 |

---

## 1. Button 组件

### 功能特性

- ✅ 三种变体: `primary` / `secondary` / `outline`
- ✅ 三种尺寸: `sm` / `md` / `lg`
- ✅ 支持按钮和链接两种模式
- ✅ 支持禁用状态
- ✅ 支持全宽布局
- ✅ 品牌色系样式

### Props

```ts
interface Props {
  variant?: 'primary' | 'secondary' | 'outline';  // 默认: 'primary'
  size?: 'sm' | 'md' | 'lg';                     // 默认: 'md'
  href?: string;                                  // 如果提供,渲染为 <a>
  type?: 'button' | 'submit' | 'reset';          // 默认: 'button'
  disabled?: boolean;                             // 默认: false
  fullWidth?: boolean;                            // 默认: false
  class?: string;                                 // 额外的 CSS 类
}
```

### 使用示例

```astro
---
import Button from '@/components/ui/Button.astro';
---

<!-- Primary 按钮 (默认) -->
<Button>Shop Now</Button>

<!-- Secondary 按钮 -->
<Button variant="secondary">Learn More</Button>

<!-- Outline 按钮 -->
<Button variant="outline">View Details</Button>

<!-- 小尺寸按钮 -->
<Button size="sm">Quick Add</Button>

<!-- 大尺寸按钮 -->
<Button size="lg">Get Started</Button>

<!-- 链接模式 -->
<Button href="/shop">Browse Products</Button>

<!-- 禁用状态 -->
<Button disabled>Out of Stock</Button>

<!-- 全宽按钮 -->
<Button fullWidth>Add to Cart</Button>

<!-- 提交按钮 -->
<Button type="submit" variant="primary">Submit Order</Button>
```

### 样式变体预览

| 变体 | 外观 | 用途 |
|------|------|------|
| `primary` | 白色文字 + 品牌色背景 | 主要操作 (加购/提交) |
| `secondary` | 品牌色边框 + 文字 | 次要操作 (了解更多) |
| `outline` | 灰色边框 + 文字 | 中性操作 (取消/返回) |

---

## 2. Badge 组件

### 功能特性

- ✅ 五种变体: `new` / `sale` / `pro` / `featured` / `custom`
- ✅ 两种尺寸: `sm` / `md`
- ✅ 支持自定义内容
- ✅ 大写 + 字母间距样式

### Props

```ts
interface Props {
  variant?: 'new' | 'sale' | 'pro' | 'featured' | 'custom';  // 默认: 'new'
  size?: 'sm' | 'md';                                        // 默认: 'md'
  class?: string;                                            // 额外的 CSS 类
}
```

### 使用示例

```astro
---
import Badge from '@/components/ui/Badge.astro';
---

<!-- New 徽章 (Sage Green 背景) -->
<Badge variant="new" />

<!-- Sale 徽章 (红色背景) -->
<Badge variant="sale" />

<!-- Pro 徽章 (深褐色背景) -->
<Badge variant="pro" />

<!-- Featured 徽章 (品牌色背景) -->
<Badge variant="featured" />

<!-- 自定义内容 -->
<Badge variant="custom">Limited</Badge>

<!-- 小尺寸 -->
<Badge variant="new" size="sm" />
```

### 样式变体预览

| 变体 | 颜色 | 默认文字 | 用途 |
|------|------|----------|------|
| `new` | Sage Green (#B4C4A4) | NEW | 新品标识 |
| `sale` | Red (#EF4444) | SALE | 促销标识 |
| `pro` | Soft Brown (#9C8B7E) | PRO | 专业级产品 |
| `featured` | Dusty Rose (#D4A5A5) | FEATURED | 精选推荐 |
| `custom` | Gray (#6B7280) | (自定义) | 其他用途 |

---

## 3. WhatsAppButton 组件

### 功能特性

- ✅ 自动读取 WhatsApp 号码 (从 `site-settings.ts`)
- ✅ 支持浮动和内联两种模式
- ✅ 支持自定义预填消息
- ✅ 包含悬停提示 (仅浮动模式)
- ✅ 新窗口打开 + 安全属性

### Props

```ts
interface Props {
  message?: string;                     // 默认: "Hi, I'm interested in your products"
  floating?: boolean;                   // 默认: false
  variant?: 'default' | 'text';        // 默认: 'default'
  class?: string;                       // 额外的 CSS 类
}
```

### 使用示例

```astro
---
import WhatsAppButton from '@/components/ui/WhatsAppButton.astro';
---

<!-- 内联按钮 (默认) -->
<WhatsAppButton />

<!-- 自定义消息 -->
<WhatsAppButton message="I want to order the Wooden Moon Bed" />

<!-- 浮动按钮 (固定在右下角) -->
<WhatsAppButton floating />

<!-- 文字链接样式 -->
<WhatsAppButton variant="text">Contact us on WhatsApp</WhatsAppButton>

<!-- 自定义样式 -->
<WhatsAppButton class="mt-4">
  Ask a Question
</WhatsAppButton>
```

### 使用场景

| 模式 | 位置 | 适用场景 |
|------|------|----------|
| **内联模式** | 页面内容中 | Contact 页面、产品详情页 |
| **浮动模式** | 右下角固定 | 全站浮动按钮 (BaseLayout) |
| **文字模式** | 文本段落中 | Footer 联系信息 |

---

## 4. Breadcrumb 组件

### 功能特性

- ✅ 自动添加 "Home" 首项
- ✅ Schema.org 结构化数据 (SEO 优化)
- ✅ 最后一项自动标记为当前页
- ✅ 响应式布局 (自动换行)
- ✅ 品牌色悬停效果

### Props

```ts
interface Props {
  items: BreadcrumbItem[];  // 面包屑项数组
  class?: string;           // 额外的 CSS 类
}

interface BreadcrumbItem {
  label: string;            // 显示文字
  href: string;             // 链接地址
}
```

### 使用示例

```astro
---
import Breadcrumb from '@/components/ui/Breadcrumb.astro';

const breadcrumbs = [
  { label: 'Shop', href: '/shop' },
  { label: 'Posing Props', href: '/shop/posing-props' },
  { label: 'Wooden Moon Bed', href: '/products/wooden-moon-bed' },
];
---

<!-- 基础用法 -->
<Breadcrumb items={breadcrumbs} />

<!-- 带自定义样式 -->
<Breadcrumb items={breadcrumbs} class="mb-6" />
```

### 渲染结果

```
Home / Shop / Posing Props / Wooden Moon Bed
                                 ↑ 当前页 (不可点击)
```

### Schema.org 输出

组件会自动生成 BreadcrumbList 结构化数据:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://babyprops.io/"
    },
    ...
  ]
}
```

---

## 组件组合示例

### 产品卡片

```astro
---
import Badge from '@/components/ui/Badge.astro';
import Button from '@/components/ui/Button.astro';
---

<div class="product-card">
  <!-- 徽章 -->
  {product.is_new && <Badge variant="new" size="sm" />}

  <!-- 产品图片 -->
  <img src={product.image} alt={product.title} />

  <!-- 产品信息 -->
  <h3>{product.title}</h3>
  <p>${product.price}</p>

  <!-- 操作按钮 -->
  <Button href={`/products/${product.slug}`} fullWidth>
    View Details
  </Button>
</div>
```

### 产品详情页

```astro
---
import Breadcrumb from '@/components/ui/Breadcrumb.astro';
import Badge from '@/components/ui/Badge.astro';
import Button from '@/components/ui/Button.astro';
import WhatsAppButton from '@/components/ui/WhatsAppButton.astro';

const breadcrumbs = [
  { label: 'Shop', href: '/shop' },
  { label: product.category, href: `/shop/${product.category}` },
  { label: product.title, href: `/products/${product.slug}` },
];
---

<!-- 面包屑导航 -->
<Breadcrumb items={breadcrumbs} class="mb-6" />

<!-- 产品信息 -->
<div class="product-info">
  <h1>{product.title}</h1>
  {product.is_new && <Badge variant="new" />}

  <!-- 操作按钮 -->
  <Button type="submit" fullWidth>Add to Cart</Button>
  <Button variant="secondary" fullWidth>Add to Wishlist</Button>

  <!-- WhatsApp 询价 -->
  <WhatsAppButton
    message={`I'm interested in ${product.title}`}
    variant="text"
  />
</div>
```

### Contact 页面

```astro
---
import Button from '@/components/ui/Button.astro';
import WhatsAppButton from '@/components/ui/WhatsAppButton.astro';
---

<div class="contact-section">
  <h2>Get in Touch</h2>

  <!-- WhatsApp 按钮 -->
  <WhatsAppButton>
    Chat on WhatsApp
  </WhatsAppButton>

  <!-- 邮件按钮 -->
  <Button href="mailto:support@babyprops.io" variant="secondary">
    Send Email
  </Button>
</div>
```

---

## 样式定制

所有组件都支持通过 `class` prop 传入自定义样式:

```astro
<!-- 添加边距 -->
<Button class="mt-4 mb-2">Click Me</Button>

<!-- 覆盖宽度 -->
<Badge class="w-20">Custom</Badge>

<!-- 调整间距 -->
<Breadcrumb class="mb-8" items={breadcrumbs} />
```

---

## 品牌色参考

所有组件使用的品牌色 (已在 `tailwind.config.mjs` 配置):

| CSS 类 | 颜色值 | 名称 | 用途 |
|--------|--------|------|------|
| `bg-brand` | #D4A5A5 | Dusty Rose | 主按钮背景 |
| `bg-brand-light` | #F5F0EB | Warm Cream | 背景色 |
| `bg-brand-dark` | #9C8B7E | Soft Brown | 悬停状态 |
| `bg-brand-accent` | #B4C4A4 | Sage Green | New 徽章 |

---

## 无障碍支持

所有组件都遵循 WCAG 2.1 标准:

- ✅ 按钮包含 `aria-label` (如需)
- ✅ 禁用状态正确标记
- ✅ 面包屑包含 `aria-current="page"`
- ✅ 链接包含 `rel="noopener noreferrer"`
- ✅ 键盘导航支持

---

## 注意事项

### 图标依赖

目前 WhatsAppButton 使用内联 SVG,未来可考虑:
- Heroicons
- Lucide Icons
- Astro Icon

### 浮动按钮定位

如需全站使用浮动 WhatsApp 按钮,建议在 `BaseLayout.astro` 中添加:

```astro
<!-- BaseLayout.astro -->
<WhatsAppButton floating />
```

注意: BaseLayout.astro 中已包含浮动 WhatsApp 按钮,无需重复添加。

### 响应式测试

所有组件已针对以下断点测试:
- 📱 Mobile: 320px ~ 640px
- 📱 Tablet: 641px ~ 1024px
- 🖥️ Desktop: 1025px+

---

**维护者:** ULX Studio
**最后更新:** 2026-02-03
**相关文档:** [CLAUDE.md](../../../CLAUDE.md)
