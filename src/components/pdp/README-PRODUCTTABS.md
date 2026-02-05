# ProductTabs Component

React 组件，用于在产品详情页展示详细的产品信息，采用标签页界面。

## 功能特性

### 四个标签页

1. **Description (详细描述)**
   - 产品完整描述
   - 支持 HTML 格式
   - 默认提供通用产品介绍

2. **Specifications (尺寸规格)**
   - 产品技术规格列表
   - 键值对格式展示
   - 默认显示标准功能特性

3. **Care Instructions (洗涤/保养说明)**
   - 清洁和维护指南
   - 存储建议
   - 安全注意事项
   - 默认提供通用保养说明

4. **Shipping (配送信息)**
   - 配送费用和时效
   - 处理时间
   - 国际配送说明
   - 默认显示全球配送政策

### 技术特性

- ✅ React Hooks (useState)
- ✅ 完全响应式设计
- ✅ 移动端优化（图标模式）
- ✅ 莫兰迪色系样式
- ✅ 支持自定义 HTML 内容
- ✅ 默认内容 fallback
- ✅ ARIA 标签支持
- ✅ 流畅过渡动画
- ✅ 保留 `data-pdp` 属性（基座兼容）

## Props 接口

```typescript
interface Specification {
  label: string;
  value: string;
}

interface ProductTabsProps {
  description?: string;              // HTML 字符串
  specifications?: Specification[];  // 规格列表
  careInstructions?: string;         // HTML 字符串
  customShipping?: string;           // HTML 字符串
}
```

## 使用示例

### 基础使用（默认内容）

```astro
---
import ProductTabs from '@/components/pdp/ProductTabs';
---

<ProductTabs client:load />
```

### 完整自定义内容

```astro
---
import ProductTabs from '@/components/pdp/ProductTabs';

const description = `
  <h3>Premium Wooden Moon Bed</h3>
  <p>Handcrafted wooden moon bed for newborn photography...</p>
  <ul>
    <li>Handcrafted from natural pine</li>
    <li>Baby-safe finish</li>
  </ul>
`;

const specifications = [
  { label: 'Dimensions', value: '45cm diameter × 10cm depth' },
  { label: 'Material', value: 'Natural Pine Wood' },
  { label: 'Weight', value: '2.5kg' },
  { label: 'Weight Capacity', value: 'Up to 8kg' },
];

const careInstructions = `
  <h3>Care Instructions</h3>
  <p>Wipe with soft, dry cloth...</p>
`;

const customShipping = `
  <h3>Shipping Information</h3>
  <p>Standard: $12.99 (10-15 days)</p>
`;
---

<ProductTabs
  client:load
  description={description}
  specifications={specifications}
  careInstructions={careInstructions}
  customShipping={customShipping}
/>
```

### 部分自定义

```astro
---
// 只自定义 specifications，其他使用默认内容
const specs = [
  { label: 'Size', value: '45cm diameter' },
  { label: 'Material', value: 'Pine Wood' },
];
---

<ProductTabs
  client:load
  specifications={specs}
/>
```

## 在 PDP 页面中集成

```astro
---
// src/pages/products/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '@/components/layout/BaseLayout.astro';
import Gallery from '@/components/pdp/Gallery.astro';
import ProductInfo from '@/components/pdp/ProductInfo.astro';
import ProductTabs from '@/components/pdp/ProductTabs';

const { slug } = Astro.params;
const products = await getCollection('products');
const product = products.find((p) => p.slug === slug);

// 从 Markdown frontmatter 或 body 中获取数据
const specifications = [
  { label: 'Material', value: product.data.material || 'N/A' },
  { label: 'Color Family', value: product.data.color_family || 'N/A' },
  { label: 'Size', value: product.data.prop_size || 'N/A' },
];
---

<BaseLayout>
  <div class="container mx-auto px-4 py-8">
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Left: Gallery -->
      <Gallery images={product.data.gallery} />

      <!-- Right: Info -->
      <ProductInfo
        title={product.data.title}
        price={product.data.basePrice}
        {...product.data}
      />
    </div>

    <!-- Tabs (Full Width Below) -->
    <div class="mt-12">
      <ProductTabs
        client:load
        description={product.body}
        specifications={specifications}
      />
    </div>
  </div>
</BaseLayout>
```

## 样式定制

组件使用 Tailwind CSS 类，主要配色：

- **brand-light** (#F5F0EB) - 激活标签背景
- **brand** (#D4A5A5) - 激活标签边框、链接
- **brand-dark** (#9C8B7E) - 标题文本
- **gray-600/700** - 正文文本

### 覆盖样式（如需要）

```css
/* global.css */
[data-pdp="tabs"] .tab-content {
  /* 自定义内容区域样式 */
}

[data-pdp="tabs"] button[aria-selected="true"] {
  /* 自定义激活标签样式 */
}
```

## 响应式行为

- **桌面 (≥640px)**: 显示完整标签文字（图标 + 文字）
- **移动端 (<640px)**: 仅显示图标，隐藏文字标签

## 默认内容说明

如果不提供 props，组件将显示以下默认内容：

### Description Tab
- 通用产品介绍文案
- 适用于大多数摄影道具

### Specifications Tab
- 标准功能列表
- 包含：新生儿适用、优质材料、安全认证等

### Care Instructions Tab
- 清洁建议（软布擦拭）
- 存储建议（干燥阴凉处）
- 安全提示（监督使用）
- 维护建议（小心处理）

### Shipping Tab
- 全球配送说明
- 费率表格（标准/快速）
- 免运费政策（$99+）
- 处理时间
- 海关提示
- 联系方式（WhatsApp、Email）

## 可访问性

- 使用 `role="tab"` 和 `role="tabpanel"`
- `aria-selected` 属性标记激活标签
- `aria-hidden` 隐藏装饰性图标
- 键盘导航支持

## 测试页面

访问测试页面查看组件实际效果：

```
http://localhost:4321/test-product-tabs
```

## 文件位置

```
src/
├── components/
│   └── pdp/
│       ├── ProductTabs.tsx         # 主组件
│       └── README-PRODUCTTABS.md   # 本文档
└── pages/
    └── test-product-tabs.astro     # 测试页面
```

## 常见问题

### Q: 如何添加更多标签页？

修改 `tabs` 数组，添加新的 tab 对象，并在 Tab Content 部分添加对应的渲染逻辑。

### Q: 可以使用 Markdown 内容吗？

可以！在 Astro 页面中使用 `markdown-it` 或类似库将 Markdown 转换为 HTML，然后传入 props。

```astro
---
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const htmlContent = md.render(product.body);
---

<ProductTabs client:load description={htmlContent} />
```

### Q: 如何在 Markdown 产品文件中定义内容？

在 frontmatter 中添加字段：

```yaml
---
title: "Wooden Moon Bed"
care_instructions: |
  Wipe with soft cloth.
  Store in dry place.
---
```

然后在 PDP 页面中使用：

```astro
<ProductTabs
  client:load
  careInstructions={product.data.care_instructions}
/>
```

## 相关组件

- [Gallery.astro](./README-GALLERY.md) - 产品图库
- [ProductInfo.astro](./README-PRODUCTINFO.md) - 产品信息卡
- [TrustBadges.astro](./TrustBadges.astro) - 信任徽章

## 更新日志

- **2026-02-03**: 初始版本创建
  - 4 个标签页界面
  - 默认内容 fallback
  - 莫兰迪色系样式
  - 响应式设计

---

**维护者**: ULX Studio
**组件版本**: 1.0.0
**最后更新**: 2026-02-03
