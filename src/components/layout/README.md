# Layout Components

## BaseLayout.astro

站点基础布局组件,提供全局 HTML 结构和 SEO 配置。

### 功能特性

✅ **SEO 优化**
- 完整的 Open Graph 标签
- Twitter Card 支持
- 自动 Canonical URL
- 自定义 meta 标签

✅ **Schema.org 结构化数据**
- Organization Schema (公司信息)
- WebSite Schema (网站信息)
- 自动注入 JSON-LD

✅ **全局资源**
- Google Fonts (Playfair Display + Inter)
- 全局 CSS 样式
- 品牌色配置
- Favicon 支持

✅ **WhatsApp 集成**
- 固定浮动按钮 (右下角)
- 悬停提示
- 品牌色适配

### 使用方法

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';

const meta = {
  title: 'Page Title | Dvotinst',
  description: 'Page description for SEO',
  image: '/images/og-image.jpg',
  url: 'https://babyprops.io/page',
  type: 'website', // or 'product', 'article'
  noindex: false, // 可选,设为 true 阻止搜索引擎索引
};
---

<BaseLayout {meta} bodyClass="custom-body-class">
  <!-- 页面内容 -->
  <main>
    <h1>Your Content</h1>
  </main>
</BaseLayout>
```

### Props 接口

```typescript
interface Meta {
  title?: string;         // 页面标题
  description?: string;   // 页面描述
  image?: string;         // OG 图片 URL
  url?: string;           // Canonical URL
  type?: 'website' | 'product' | 'article'; // 页面类型
  noindex?: boolean;      // 是否禁止索引
}

interface Props {
  meta?: Meta;            // SEO 元数据
  bodyClass?: string;     // 自定义 body class
}
```

### 默认值

如果未提供 meta 参数,将使用以下默认值:

- **title**: `Dvotinst | Premium Newborn Photography Props`
- **description**: Shop professional newborn photography props...
- **image**: `/images/brand/og-image.jpg`
- **url**: `https://babyprops.io`
- **type**: `website`

### 示例

#### 1. 首页

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import { siteSettings } from '@/config/site-settings';

const meta = {
  title: `${siteSettings.siteName} | ${siteSettings.tagline}`,
  url: siteSettings.siteUrl,
};
---

<BaseLayout {meta}>
  <main>
    <!-- 首页内容 -->
  </main>
</BaseLayout>
```

#### 2. 产品页

```astro
---
const product = await getEntry('products', slug);

const meta = {
  title: `${product.data.title} | Dvotinst`,
  description: product.data.meta_description,
  image: product.data.featured_image,
  url: `https://babyprops.io/products/${product.slug}`,
  type: 'product',
};
---

<BaseLayout {meta}>
  <!-- 产品详情 -->
</BaseLayout>
```

#### 3. 禁止索引的页面

```astro
---
const meta = {
  title: 'Test Page',
  noindex: true, // 不会被搜索引擎索引
};
---

<BaseLayout {meta}>
  <!-- 测试内容 -->
</BaseLayout>
```

### 相关文件

- [site-settings.ts](../../config/site-settings.ts) - 站点配置
- [global.css](../../styles/global.css) - 全局样式
- [tailwind.config.mjs](../../../tailwind.config.mjs) - Tailwind 配置

### 注意事项

1. **必须引入**: 所有页面都应使用 BaseLayout 作为根布局
2. **路径别名**: 使用 `@/` 别名引用文件 (配置在 tsconfig.json 和 astro.config.mjs)
3. **WhatsApp**: 浮动按钮会自动显示,无需额外配置
4. **字体加载**: Google Fonts 通过 CDN 加载,已配置 preconnect 优化
5. **Schema.org**: Organization 和 WebSite Schema 会自动注入,产品页需单独添加 Product Schema

### 开发服务器测试

```bash
npm run dev
# 访问 http://localhost:4321
```

测试页面已创建在 [src/pages/index.astro](../../pages/index.astro)
