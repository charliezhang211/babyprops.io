# Gallery Component - 产品图片画廊

> **路径:** `src/components/pdp/Gallery.astro`
> **类型:** Astro 服务端渲染组件 + 客户端交互
> **样式:** 莫兰迪色系 (Morandic Palette)

---

## 📋 功能概览

产品详情页的图片画廊组件，包含：
- 主图展示
- 缩略图导航
- 左右箭头切换
- 图片计数器
- Lightbox 放大镜

---

## 🎯 使用方法

### 基础用法

```astro
---
import Gallery from "@/components/pdp/Gallery.astro";

const productImages = [
    "/images/products/product-1.webp",
    "/images/products/product-2.webp",
    "/images/products/product-3.webp",
];

const productTitle = "Wooden Moon Bed";
---

<Gallery images={productImages} productTitle={productTitle} />
```

### Props 说明

| Prop | 类型 | 必需 | 说明 |
|------|------|------|------|
| `images` | `string[]` | ✅ | 图片 URL 数组 (最多显示 5 个缩略图) |
| `productTitle` | `string` | ✅ | 产品标题 (用于图片 alt 文本) |

---

## 🎨 样式特性

### 莫兰迪色系

| 元素 | 颜色 | 说明 |
|------|------|------|
| 主图背景 | `bg-brand-light` | Warm Cream (#F5F0EB) |
| 按钮背景 | `bg-brand-dark/80` | Soft Brown 80% |
| 按钮悬停 | `hover:bg-brand` | Dusty Rose (#D4A5A5) |
| 选中缩略图 | `border-brand + ring-brand/30` | 玫瑰粉边框 + 外环 |
| 未选中缩略图 | `border-gray-200` | 浅灰边框 |

### 响应式设计

| 断点 | 主图 | 缩略图 | 按钮 |
|------|------|--------|------|
| 桌面 (md+) | 完整尺寸 | 72x72px | 悬停显示 |
| 移动 (<md) | 完整尺寸 | 56x56px | 始终显示 |

---

## ⚡ 交互功能

### 主画廊

1. **缩略图切换**
   - 点击缩略图切换主图
   - 选中态: 玫瑰粉边框 + 外环
   - 悬停态: 边框高亮

2. **箭头导航**
   - 桌面端: 悬停主图时显示
   - 移动端: 始终显示
   - 循环切换 (最后一张 → 第一张)

3. **图片计数器**
   - 显示格式: "1 / 5"
   - 位置: 右上角
   - 悬停时显示

### Lightbox 放大镜

**触发方式:**
- 点击主图
- 点击放大镜按钮 (右下角)

**功能:**
- 全屏黑色背景 (90% 透明度 + 背景模糊)
- 图片最大化显示
- 左右箭头导航
- 图片计数器 (底部居中)

**关闭方式:**
- X 按钮 (右上角)
- ESC 键
- 点击背景
- 方向键导航 (← →)

**用户体验:**
- 打开时锁定页面滚动
- 关闭时恢复滚动
- 淡入动画 (0.2s)

---

## 🔧 技术实现

### Data 属性

组件使用以下 data 属性用于 JavaScript 交互:

```html
<!-- 主容器 -->
data-pdp="gallery"          <!-- 基座必需属性 -->
data-gallery                <!-- 画廊容器标识 -->

<!-- 主图 -->
data-gallery-main           <!-- 主图容器 -->

<!-- 控制按钮 -->
data-gallery-prev           <!-- 上一张 -->
data-gallery-next           <!-- 下一张 -->
data-gallery-zoom           <!-- 打开 lightbox -->

<!-- 缩略图 -->
data-gallery-thumb={index}  <!-- 缩略图按钮 -->

<!-- 计数器 -->
data-gallery-counter        <!-- 主画廊计数器 -->

<!-- Lightbox -->
data-gallery-lightbox       <!-- lightbox 容器 -->
data-lightbox-img           <!-- lightbox 图片 -->
data-lightbox-close         <!-- 关闭按钮 -->
data-lightbox-prev          <!-- 上一张 -->
data-lightbox-next          <!-- 下一张 -->
data-lightbox-counter       <!-- lightbox 计数器 -->
```

### 自定义事件

组件监听以下自定义事件（用于 Configurator 集成）:

```javascript
window.addEventListener("variant-image-change", (e) => {
    // e.detail.image: 新的图片 URL
});
```

当用户在 Configurator 中选择不同变体时，Gallery 会自动更新主图。

---

## 📦 依赖

### 组件依赖
- `@/components/common/Icon.astro` - 图标组件

### 需要的图标
- `chevronLeft` - 左箭头
- `chevronRight` - 右箭头
- `zoomIn` - 放大镜

---

## 🎯 集成示例

### 在产品详情页中使用

```astro
---
// src/pages/products/[slug].astro
import BaseLayout from "@/components/layout/BaseLayout.astro";
import Gallery from "@/components/pdp/Gallery.astro";
import { getEntry } from "astro:content";

const { slug } = Astro.params;
const product = await getEntry("products", slug);

const { title, featured_image, gallery } = product.data;

// 合并主图和画廊图片
const allImages = [featured_image, ...(gallery || [])];
---

<BaseLayout>
    <div class="grid lg:grid-cols-2 gap-8">
        <!-- 左侧: Gallery -->
        <Gallery images={allImages} productTitle={title} />

        <!-- 右侧: 产品信息 -->
        <div>
            <h1>{title}</h1>
            <!-- ... -->
        </div>
    </div>
</BaseLayout>
```

### 与 Configurator 集成

```astro
---
// Gallery 和 Configurator 会通过事件自动同步
import Gallery from "@/components/pdp/Gallery.astro";
import Configurator from "@/components/pdp/Configurator.tsx";
---

<div class="grid lg:grid-cols-2 gap-8">
    <Gallery images={images} productTitle={title} />
    <Configurator product={product} client:load />
</div>
```

当用户在 Configurator 中选择不同颜色/尺寸时，Gallery 会自动更新对应的图片。

---

## 🐛 故障排查

### 图片不显示
- 检查图片路径是否正确
- 确保图片存在于 `public/` 目录
- 检查浏览器控制台是否有 404 错误

### 箭头不显示
- 桌面端需要悬停主图才显示
- 移动端应该始终显示
- 检查是否有 CSS 冲突

### Lightbox 无法打开
- 检查浏览器控制台是否有 JavaScript 错误
- 确保 Icon 组件正常工作
- 验证 `data-gallery-lightbox` 元素存在

### 缩略图样式不正确
- 确保 Tailwind CSS 正确加载
- 检查品牌色配置 (`tailwind.config.mjs`)
- 验证 `brand` 颜色是否定义

---

## 📝 最佳实践

### 图片优化
```markdown
建议规格:
- 格式: WebP
- 主图尺寸: 800x800px
- 缩略图: 自动生成
- 质量: 85%
```

### 图片数量
- 推荐: 3-5 张
- 最多显示: 5 个缩略图
- 超过 5 张: 只显示前 5 个缩略图

### Alt 文本
```astro
<!-- 主图 -->
alt="{productTitle}"

<!-- 缩略图 -->
alt="{productTitle} - Image {index + 1}"
```

### 加载优化
- 主图: `loading="eager"` (优先加载)
- 缩略图: `loading="lazy"` (延迟加载)

---

## 🎨 自定义样式

### 修改颜色

如需修改品牌色，编辑 `tailwind.config.mjs`:

```javascript
theme: {
    extend: {
        colors: {
            brand: {
                DEFAULT: '#D4A5A5',  // 主色
                light: '#F5F0EB',    // 背景
                dark: '#9C8B7E',     // 按钮
                accent: '#B4C4A4',   // 辅助色
            },
        },
    },
}
```

### 修改尺寸

```astro
<!-- 缩略图尺寸 -->
<button class="w-[72px] h-[72px] max-md:w-14 max-md:h-14">

<!-- 按钮尺寸 -->
<button class="w-11 h-11 md:w-9 md:h-9">
```

---

## ✅ 无障碍访问

组件已实现 ARIA 标签:

```html
<!-- 按钮 -->
aria-label="Previous image"
aria-label="Next image"
aria-label="Zoom image"
aria-label="View image 1"

<!-- Lightbox -->
role="dialog"
aria-modal="true"
aria-label="Image lightbox"
```

键盘导航:
- ← → 方向键: 切换图片
- ESC 键: 关闭 lightbox
- Tab 键: 焦点导航

---

## 📚 相关文档

- [Astro Image 文档](https://docs.astro.build/en/guides/images/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [CLAUDE.md](../../CLAUDE.md) - 项目开发规范

---

**维护者:** ULX Studio
**最后更新:** 2026-02-03
**版本:** 1.0.0 (Task-4.1)
