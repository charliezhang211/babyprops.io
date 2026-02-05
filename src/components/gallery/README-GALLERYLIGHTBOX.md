# GalleryLightbox 组件

> **路径:** `src/components/gallery/GalleryLightbox.tsx`
> **类型:** React Island (Client-side)
> **依赖:** GalleryGrid.astro
> **任务:** Task-5.2

---

## 功能概述

GalleryLightbox 是一个全屏图片查看器组件，用于在 Gallery 页面中放大查看买家秀图片。

### 核心功能

| 功能 | 说明 |
|------|------|
| **点击打开** | 监听 `gallery:open` 自定义事件，响应 GalleryGrid 的点击 |
| **遮罩层** | 黑色半透明背景，点击关闭 Lightbox |
| **左右切换** | 箭头按钮 + 键盘导航切换图片 |
| **关闭按钮** | 右上角 X 按钮 + ESC 键关闭 |
| **图片计数器** | 显示当前图片位置 (如 "3 / 8") |
| **图片信息** | 显示摄影师和地点信息 |
| **滚动锁定** | 打开时锁定页面滚动 |
| **循环导航** | 支持首尾循环切换 |

---

## Props 接口

```typescript
interface GalleryImage {
  image: string;          // 图片 URL (必填)
  photographer?: string;  // 摄影师名字 (可选)
  location?: string;      // 拍摄地点 (可选)
}

interface GalleryLightboxProps {
  images: GalleryImage[];  // 图片数组 (必填)
}
```

---

## 使用方法

### 1. 基础用法

在页面中引入 GalleryLightbox，通常与 GalleryGrid 配合使用：

```astro
---
// src/pages/gallery.astro
import GalleryGrid from '@/components/gallery/GalleryGrid.astro';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';

const galleryImages = [
  {
    image: '/images/gallery/photo-1.webp',
    photographer: 'Sarah Johnson',
    location: 'New York, USA',
  },
  {
    image: '/images/gallery/photo-2.webp',
    photographer: 'Emma Williams',
  },
  {
    image: '/images/gallery/photo-3.webp',
  },
];
---

<BaseLayout>
  <!-- Gallery Grid -->
  <GalleryGrid images={galleryImages} />

  <!-- Lightbox (全局单例，需要 client:load) -->
  <GalleryLightbox images={galleryImages} client:load />
</BaseLayout>
```

### 2. 事件监听机制

GalleryLightbox 通过监听 window 的 `gallery:open` 自定义事件来响应打开请求：

```typescript
// GalleryGrid 触发事件
window.dispatchEvent(new CustomEvent('gallery:open', {
  detail: { index: 2 }  // 打开第 3 张图片
}));

// GalleryLightbox 监听事件
window.addEventListener('gallery:open', (e) => {
  openLightbox(e.detail.index);
});
```

### 3. 单独使用

也可以在其他页面中单独使用（需要手动触发 `gallery:open` 事件）：

```astro
---
import GalleryLightbox from '@/components/gallery/GalleryLightbox';

const productImages = [
  { image: '/images/products/product-1.webp' },
  { image: '/images/products/product-2.webp' },
];
---

<div>
  <button
    onclick="window.dispatchEvent(new CustomEvent('gallery:open', { detail: { index: 0 } }))"
  >
    Open Gallery
  </button>

  <GalleryLightbox images={productImages} client:load />
</div>
```

---

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| **ESC** | 关闭 Lightbox |
| **←** (左箭头) | 上一张图片 |
| **→** (右箭头) | 下一张图片 |

---

## 样式特性

### 莫兰迪色系

- 黑色半透明遮罩 (`bg-black/90`)
- 白色半透明按钮 (`bg-white/10`)
- 圆角设计 (`rounded-full`, `rounded-lg`)

### 响应式设计

| 屏幕尺寸 | 适配 |
|---------|------|
| **桌面** | 显示键盘提示文字 |
| **移动端** | 隐藏键盘提示，优化按钮尺寸 |
| **全尺寸** | 图片自适应容器 (`max-h-[80vh]`) |

---

## 组件状态管理

### useState Hooks

```typescript
const [isOpen, setIsOpen] = useState(false);        // Lightbox 打开状态
const [currentIndex, setCurrentIndex] = useState(0); // 当前图片索引
```

### useEffect Hooks

| Hook | 用途 |
|------|------|
| **事件监听** | 监听 `gallery:open` 事件 |
| **键盘导航** | 监听键盘事件 (ESC/方向键) |
| **滚动锁定** | 打开时锁定 `document.body.overflow` |

---

## 无障碍访问 (ARIA)

```html
<div role="dialog" aria-modal="true" aria-label="Image viewer">
  <button aria-label="Close lightbox">...</button>
  <button aria-label="Previous image">...</button>
  <button aria-label="Next image">...</button>
</div>
```

---

## 技术实现细节

### 1. 滚动锁定

```typescript
// 打开时锁定
document.body.style.overflow = 'hidden';

// 关闭时恢复
document.body.style.overflow = '';

// 组件卸载时清理
useEffect(() => {
  return () => {
    document.body.style.overflow = '';
  };
}, []);
```

### 2. 循环导航

```typescript
// 上一张（首尾循环）
const goPrev = () => {
  setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
};

// 下一张（首尾循环）
const goNext = () => {
  setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
};
```

### 3. 遮罩关闭

```jsx
<div
  className="absolute inset-0"
  onClick={closeLightbox}
  aria-hidden="true"
/>
```

点击遮罩层会关闭 Lightbox，但点击图片本身不会关闭（因为内容容器是 `relative z-10`）。

---

## 测试页面

**路径:** `src/pages/test-gallery-lightbox.astro`

### 功能测试清单

- [x] 点击图片打开 Lightbox
- [x] 关闭按钮功能
- [x] 遮罩点击关闭
- [x] 左右箭头按钮切换
- [x] ESC 键关闭
- [x] 方向键切换
- [x] 图片计数器显示
- [x] 图片信息显示
- [x] 循环导航
- [x] 滚动锁定
- [x] 响应式布局

### 测试命令

```bash
npm run dev
# 访问 http://localhost:4321/test-gallery-lightbox
```

---

## 与 GalleryGrid 集成

### 完整 Gallery 页面示例

```astro
---
// src/pages/gallery.astro
import BaseLayout from '@/components/layout/BaseLayout.astro';
import GalleryGrid from '@/components/gallery/GalleryGrid.astro';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import { siteSettings } from '@/config/site-settings';

// 买家秀图片数据
const galleryImages = [
  {
    image: '/images/gallery/work-001.webp',
    photographer: 'Sarah Johnson',
    location: 'New York Studio',
  },
  // ... 更多图片
];

const meta = {
  title: `Customer Gallery | ${siteSettings.siteName}`,
  description: 'Beautiful newborn photography captured by professional photographers using Dvotinst props.',
};
---

<BaseLayout {meta}>
  <main class="container mx-auto px-4 py-12">
    <!-- 页面标题 -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-serif text-brand-dark mb-4">
        Customer Gallery
      </h1>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Beautiful work from photographers around the world
      </p>
    </div>

    <!-- Gallery Grid -->
    <GalleryGrid images={galleryImages} columns={4} />

    <!-- Submit CTA -->
    <div class="text-center mt-12">
      <a href="/contact" class="btn-primary">
        Submit Your Photos
      </a>
    </div>
  </main>

  <!-- Lightbox (全局单例) -->
  <GalleryLightbox images={galleryImages} client:load />
</BaseLayout>
```

---

## 性能优化

### 1. 懒加载策略

- GalleryGrid 中的缩略图使用 `loading="lazy"`
- Lightbox 中的大图动态加载（仅打开时加载）

### 2. Client Directive

```astro
<GalleryLightbox images={galleryImages} client:load />
```

使用 `client:load` 确保 Lightbox 在页面加载后立即可用（监听 `gallery:open` 事件）。

### 3. 条件渲染

```typescript
if (!isOpen) return null;
```

Lightbox 未打开时不渲染 DOM，减少内存占用。

---

## 注意事项

### 1. 必须使用 client:load

```astro
<!-- ✅ 正确 -->
<GalleryLightbox images={galleryImages} client:load />

<!-- ❌ 错误 (不会监听事件) -->
<GalleryLightbox images={galleryImages} />
```

### 2. images 数组必须与 GalleryGrid 一致

```astro
<!-- ✅ 正确 -->
<GalleryGrid images={galleryImages} />
<GalleryLightbox images={galleryImages} client:load />

<!-- ❌ 错误 (索引不匹配) -->
<GalleryGrid images={galleryImages} />
<GalleryLightbox images={differentImages} client:load />
```

### 3. 避免多个实例

每个页面只应有一个 GalleryLightbox 实例（全局单例模式）：

```astro
<!-- ✅ 正确 -->
<GalleryLightbox images={allImages} client:load />

<!-- ❌ 错误 (多个实例会冲突) -->
<GalleryLightbox images={images1} client:load />
<GalleryLightbox images={images2} client:load />
```

---

## 扩展建议

### 1. 添加缩放功能

```typescript
const [scale, setScale] = useState(1);

const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 1));
```

### 2. 添加图片下载按钮

```jsx
<a
  href={currentImage.image}
  download
  className="download-button"
>
  Download
</a>
```

### 3. 添加分享功能

```typescript
const shareImage = () => {
  navigator.share({
    title: 'Customer Gallery',
    url: currentImage.image,
  });
};
```

---

## 相关文档

| 文档 | 路径 |
|------|------|
| **GalleryGrid 文档** | `src/components/gallery/README-GALLERYGRID.md` |
| **GalleryItem 组件** | `src/components/gallery/GalleryItem.astro` |
| **测试页面** | `src/pages/test-gallery-lightbox.astro` |
| **Task 文档** | `TASKS.md` (Task-5.2) |

---

**Created:** Task-5.2
**Last Updated:** 2026-02-03
**Maintainer:** ULX Studio
