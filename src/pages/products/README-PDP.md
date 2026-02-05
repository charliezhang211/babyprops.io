# Product Detail Page (PDP) - 使用文档

产品详情页 (Product Detail Page, PDP) 是 BabyProps.io 的核心页面，展示单个产品的完整信息。

---

## 📁 文件位置

```
src/pages/products/
└── [slug].astro      # 动态路由主文件
```

---

## 🎯 功能概览

### 核心功能
- ✅ **动态路由生成** - 从 Content Collection 自动生成所有产品页面
- ✅ **产品画廊** - 主图 + 多图切换 + Lightbox 放大
- ✅ **产品信息** - 标题/价格/SKU/材质/色系/尺寸
- ✅ **状态徽章** - New/Handmade/Out of Stock
- ✅ **加购功能** - 变体选择 + Add to Cart
- ✅ **详细信息** - 标签页（描述/规格/保养/配送）
- ✅ **相关产品** - 智能推荐（同色系/同分类）
- ✅ **SEO 优化** - 元数据 + Schema.org 结构化数据

---

## 📦 整合的组件

| 组件 | 文件路径 | 功能 |
|------|---------|------|
| **Gallery** | `src/components/pdp/Gallery.astro` | 产品图片画廊 |
| **ProductInfo** | `src/components/pdp/ProductInfo.astro` | 产品信息展示 |
| **Configurator** | `src/components/pdp/Configurator.tsx` | 变体选择 + 加购 |
| **ProductTabs** | `src/components/pdp/ProductTabs.tsx` | 标签页内容 |
| **RelatedProducts** | `src/components/pdp/RelatedProducts.astro` | 相关产品推荐 |

---

## 🚀 使用方式

### 1. 创建产品 Markdown 文件

在 `src/content/products/` 目录创建产品文件：

```markdown
---
title: "Wooden Moon Bed"
slug: "wooden-moon-bed"
sku_prefix: "WMB"
basePrice: 89.99
featured_image: "/images/products/wooden-moon-bed-1.webp"
gallery:
  - "/images/products/wooden-moon-bed-2.webp"
  - "/images/products/wooden-moon-bed-3.webp"
category: "posing-props"
material: "Natural Pine Wood"
color_family: "Natural Wood"
prop_size: "Newborn (0-1M)"
is_handmade: true
in_stock: true
is_new: true
is_featured: true
features:
  - "Handcrafted from premium pine wood"
  - "Smooth, baby-safe finish"
care_instructions:
  - "Wipe with soft dry cloth"
  - "Store in dry place"
dimensions:
  diameter: "45cm"
  height: "12cm"
  weight: "1.5kg"
related_products:
  - "moon-stars-backdrop"
  - "cream-mohair-wrap"
meta_title: "Wooden Moon Bed | Newborn Photography Props | Dvotinst"
meta_description: "Buy Wooden Moon Bed at Dvotinst. Perfect for newborn photoshoots."
---

Product description content here...
```

### 2. 自动生成路由

保存 Markdown 文件后，Astro 会自动生成对应的产品页面：

```
Markdown 文件: src/content/products/wooden-moon-bed.md
↓
生成路由: /products/wooden-moon-bed
```

### 3. 访问产品页面

```
http://localhost:4321/products/wooden-moon-bed
```

---

## 📊 数据流

```
┌─────────────────────────────────────┐
│  Content Collection                 │
│  src/content/products/*.md          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  getStaticPaths()                   │
│  - 读取所有产品                      │
│  - 生成路由参数                      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  [slug].astro                       │
│  - 接收 product 数据                 │
│  - 渲染页面组件                      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  PDP 组件树                         │
│  ├── Gallery                        │
│  ├── ProductInfo                    │
│  │   └── Configurator (slot)       │
│  ├── ProductTabs                    │
│  └── RelatedProducts                │
└─────────────────────────────────────┘
```

---

## 🔍 SEO 配置

### 页面标题规则
```typescript
// 优先使用自定义 meta_title
meta_title || `${title} | Newborn Photography Props | Dvotinst`

// 示例输出
"Wooden Moon Bed | Newborn Photography Props | Dvotinst"
```

### 页面描述规则
```typescript
// 优先使用自定义 meta_description
meta_description ||
`Buy ${title} at Dvotinst. Perfect for newborn photoshoots.
High quality ${material}, available in ${color_family}. Worldwide shipping.`

// 示例输出
"Buy Wooden Moon Bed at Dvotinst. Perfect for newborn photoshoots.
High quality Natural Pine Wood, available in Natural Wood. Worldwide shipping."
```

### Schema.org 结构化数据

页面自动注入两种结构化数据：

#### 1. Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wooden Moon Bed",
  "image": ["..."],
  "description": "...",
  "sku": "WMB",
  "brand": {
    "@type": "Brand",
    "name": "Dvotinst"
  },
  "offers": {
    "@type": "Offer",
    "price": "89.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "category": "Posing Props",
  "material": "Natural Pine Wood",
  "color": "Natural Wood"
}
```

#### 2. Breadcrumb Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://babyprops.io/" },
    { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://babyprops.io/shop" },
    { "@type": "ListItem", "position": 3, "name": "Posing Props", "item": "https://babyprops.io/shop/posing-props" }
  ]
}
```

---

## 🎨 页面布局

### 桌面布局 (lg+)
```
┌────────────────────────────────────────────┐
│ Breadcrumb: Home > Shop > Category > Product │
├──────────────────┬─────────────────────────┤
│                  │                         │
│   Gallery        │   ProductInfo           │
│   (主图+缩略图)   │   - 标题/价格           │
│                  │   - 规格/徽章           │
│                  │   - 加购按钮            │
│                  │                         │
└──────────────────┴─────────────────────────┘
┌────────────────────────────────────────────┐
│ ProductTabs                                │
│ - 描述 | 规格 | 保养 | 配送                │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ RelatedProducts                            │
│ - Complete the Look (4列网格)              │
└────────────────────────────────────────────┘
```

### 移动布局 (<lg)
```
┌────────────────────┐
│ Breadcrumb         │
├────────────────────┤
│ Gallery            │
│ (主图+缩略图)       │
├────────────────────┤
│ ProductInfo        │
│ - 标题/价格         │
│ - 规格/徽章         │
│ - 加购按钮          │
├────────────────────┤
│ ProductTabs        │
│ (标签页)           │
├────────────────────┤
│ RelatedProducts    │
│ (2列网格)          │
└────────────────────┘
```

---

## 🛠️ 技术实现

### 动态路由生成
```typescript
export async function getStaticPaths() {
  const products = await getCollection('products');

  return products.map((product) => ({
    params: { slug: product.data.slug },
    props: { product },
  }));
}
```

### 产品数据处理
```typescript
// 获取产品数据
const { product } = Astro.props;
const { data, render } = product;

// 构建图片数组
const galleryImages = [
  data.featured_image,
  ...(data.gallery || []),
];

// 构建规格数组
const specifications = [];
if (data.material) {
  specifications.push({ label: 'Material', value: data.material });
}
// ...

// 渲染 Markdown 内容
const { Content } = await render();
```

### 组件整合
```astro
<!-- 画廊 -->
<Gallery images={galleryImages} productName={data.title} />

<!-- 产品信息 + 加购 -->
<ProductInfo {...props}>
  <div slot="actions">
    <Configurator client:load {...configuratorProps} />
  </div>
</ProductInfo>

<!-- 标签页 -->
<ProductTabs
  client:load
  description={descriptionHTML}
  specifications={specifications}
  careInstructions={careInstructionsHTML}
/>

<!-- 相关产品 -->
<RelatedProducts
  currentProductSlug={data.slug}
  relatedProductSlugs={data.related_products}
  colorFamily={data.color_family}
  category={data.category}
/>
```

---

## 📋 必填字段清单

### 基础信息 (必填)
- ✅ `title` - 产品名称
- ✅ `slug` - URL slug
- ✅ `sku_prefix` - SKU 前缀
- ✅ `basePrice` - 基础价格
- ✅ `featured_image` - 主图
- ✅ `category` - 分类

### 摄影道具字段 (推荐)
- ⚠️ `material` - 材质（显示在产品信息区）
- ⚠️ `color_family` - 色系（用于推荐相关产品）
- ⚠️ `prop_size` - 尺寸（显示在产品信息区）
- ⚠️ `is_handmade` - 是否手工制作（显示徽章）

### 状态字段 (推荐)
- ⚠️ `in_stock` - 库存状态（影响加购按钮）
- ⚠️ `is_new` - 是否新品（显示 New 徽章）
- ⚠️ `is_featured` - 是否精选（影响推荐算法）

### SEO 字段 (推荐)
- ⚠️ `meta_title` - 自定义页面标题
- ⚠️ `meta_description` - 自定义页面描述

### 内容字段 (可选)
- 📝 `gallery` - 产品图片数组
- 📝 `features` - 产品特点列表
- 📝 `care_instructions` - 保养说明列表
- 📝 `dimensions` - 尺寸规格对象
- 📝 `related_products` - 手动指定相关产品

---

## 🧪 测试清单

### 功能测试
- [ ] 访问产品页面 `/products/[slug]`
- [ ] 点击缩略图切换主图
- [ ] 点击主图打开 Lightbox
- [ ] 检查产品信息展示完整
- [ ] 检查状态徽章显示正确
- [ ] 点击 Add to Cart 按钮
- [ ] 切换产品变体（如有）
- [ ] 切换标签页（描述/规格/保养/配送）
- [ ] 检查相关产品推荐
- [ ] 点击面包屑导航

### SEO 测试
- [ ] 查看页面标题（浏览器标签）
- [ ] 查看页面源代码的 meta 标签
- [ ] 验证 Schema.org 结构化数据
- [ ] 检查 Open Graph 标签
- [ ] 测试社交分享预览

### 响应式测试
- [ ] 桌面布局（1920px）
- [ ] 平板布局（768px）
- [ ] 移动布局（375px）
- [ ] 横屏模式

---

## 🐛 常见问题

### Q: 产品页面 404 错误
**A:** 检查以下项：
1. Markdown 文件是否保存在 `src/content/products/` 目录
2. `slug` 字段是否与 URL 匹配
3. 开发服务器是否重启（修改 content 后需重启）

### Q: 图片无法显示
**A:** 检查：
1. 图片路径是否以 `/images/` 开头
2. 图片文件是否存在于 `public/images/products/` 目录
3. 图片文件名是否正确（区分大小写）

### Q: Schema.org 数据不显示
**A:**
1. 打开浏览器开发者工具
2. 查看页面源代码搜索 `application/ld+json`
3. 使用 Google Rich Results Test 验证

### Q: 相关产品不显示
**A:** 检查：
1. `related_products` 数组中的 slug 是否正确
2. 相关产品是否存在且 `in_stock: true`
3. 是否至少有 1 个相关产品

---

## 📚 相关文档

- **CLAUDE.md** - Section 6.3 (PDP 组件结构)
- **TASKS.md** - Task-4.1 ~ 4.5 (PDP 相关任务)
- **Gallery README** - `src/components/pdp/README-GALLERY.md`
- **ProductInfo README** - `src/components/pdp/README-PRODUCTINFO.md`
- **ProductTabs README** - `src/components/pdp/README-PRODUCTTABS.md`
- **RelatedProducts README** - `src/components/pdp/README-RELATEDPRODUCTS.md`

---

## 🎯 下一步

1. **添加更多产品** - 创建更多 Markdown 文件
2. **测试购物流程** - 完整测试加购到结账
3. **优化图片** - 压缩图片，使用 WebP 格式
4. **性能优化** - Lighthouse 评分，首屏加载优化

---

**最后更新:** 2026-02-03
**维护者:** ULX Studio
