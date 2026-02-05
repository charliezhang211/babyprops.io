# GalleryGrid Component

## 📍 Location
- `src/components/gallery/GalleryGrid.astro` - 主组件
- `src/components/gallery/GalleryItem.astro` - 单个图片卡片子组件

## 📝 Description

GalleryGrid 是买家秀展示组件,采用 Masonry 瀑布流布局,支持响应式列数调整、图片懒加载和悬停交互效果。

## ✨ Features

- ✅ **Masonry 瀑布流布局**: CSS columns 实现,参差不齐的美感
- ✅ **响应式列数**: 支持 2/3/4 列配置,自动适配屏幕尺寸
- ✅ **图片懒加载**: 所有图片使用 `loading="lazy"` 属性优化性能
- ✅ **悬停交互**: 渐变遮罩 + 摄影师信息 + 放大图标
- ✅ **图片缩放**: 悬停时图片轻微放大 (scale-105)
- ✅ **可选字段**: 摄影师名字和地点可选显示
- ✅ **空状态**: 无图片时显示友好提示 + CTA 按钮
- ✅ **Lightbox 事件**: 点击图片触发 `gallery:open` 自定义事件
- ✅ **莫兰迪色系**: 统一品牌配色

## 📦 Props

### GalleryGrid.astro

```ts
interface Props {
  images: GalleryImage[];     // 图片数组
  columns?: 2 | 3 | 4;        // 列数 (默认: 4)
  emptyMessage?: string;      // 空状态提示文案
}

interface GalleryImage {
  image: string;              // 图片 URL
  photographer?: string;      // 摄影师名字 (可选)
  location?: string;          // 拍摄地点 (可选)
}
```

### GalleryItem.astro

```ts
interface Props {
  image: string;              // 图片 URL
  photographer?: string;      // 摄影师名字
  location?: string;          // 拍摄地点
  index: number;              // 图片索引 (用于 Lightbox)
}
```

## 🎨 Usage

### 基础用法

```astro
---
import GalleryGrid from '@/components/gallery/GalleryGrid.astro';

const galleryImages = [
  {
    image: '/images/gallery/photo-1.webp',
    photographer: 'Sarah Johnson',
    location: 'New York, USA',
  },
  {
    image: '/images/gallery/photo-2.webp',
    photographer: 'Emily Chen',
  },
  {
    image: '/images/gallery/photo-3.webp',
  },
];
---

<GalleryGrid images={galleryImages} />
```

### 自定义列数

```astro
<!-- 3 列布局 -->
<GalleryGrid images={galleryImages} columns={3} />

<!-- 2 列布局 -->
<GalleryGrid images={galleryImages} columns={2} />
```

### 空状态自定义文案

```astro
<GalleryGrid
  images={[]}
  emptyMessage="Our gallery is empty. Share your beautiful newborn photos with us!"
/>
```

## 📱 Responsive Behavior

| 屏幕尺寸 | 4列模式 | 3列模式 | 2列模式 |
|---------|--------|--------|--------|
| **Desktop (xl)** | 4 列 | 3 列 | 2 列 |
| **Tablet (lg)** | 3 列 | 3 列 | 2 列 |
| **Small Tablet (sm)** | 2 列 | 2 列 | 2 列 |
| **Mobile (<sm)** | 1 列 | 1 列 | 1 列 |

## 🎭 States

### 1. 正常状态
- 显示图片网格
- 瀑布流自动填充
- 悬停显示摄影师信息

### 2. 空状态
- 显示相机图标
- 友好提示文案
- "Submit Your Photos" CTA 按钮

### 3. 加载状态
- 图片使用 `loading="lazy"` 懒加载
- 浏览器原生加载占位

## 🔗 Integration

### 与 Lightbox 集成 (Task 5.2)

GalleryGrid 在点击图片时会触发自定义事件 `gallery:open`,供 Lightbox 组件监听:

```js
// GalleryGrid 触发事件
window.dispatchEvent(new CustomEvent('gallery:open', {
  detail: { index: 2 } // 点击的图片索引
}));

// Lightbox 监听事件
window.addEventListener('gallery:open', (e) => {
  const index = e.detail.index;
  // 打开 Lightbox 并跳转到指定图片
});
```

## 🎨 Styling

### 颜色变量

```css
/* 莫兰迪色系 */
--color-brand: #D4A5A5         /* Dusty Rose */
--color-brand-light: #F5F0EB   /* Warm Cream */
--color-brand-dark: #9C8B7E    /* Soft Brown */
```

### 自定义样式

```astro
<GalleryGrid images={galleryImages} />

<style>
  /* 修改间距 */
  :global(.gallery-masonry) {
    column-gap: 1.5rem;
  }

  /* 修改卡片圆角 */
  :global([data-gallery-item] > div) {
    border-radius: 1rem;
  }
</style>
```

## 📊 Performance

### 懒加载策略

- 所有图片使用 `loading="lazy"` 属性
- 首屏外图片延迟加载,节省带宽
- 浏览器原生支持,无需 JS

### CSS 优化

- 使用 CSS columns 实现 Masonry (无 JS)
- GPU 加速的 transform 动画
- `break-inside: avoid` 防止图片被截断

### 最佳实践

1. **图片尺寸**: 推荐宽度 600-800px
2. **图片格式**: WebP 优先,fallback JPG
3. **图片质量**: 80-85% 压缩
4. **图片数量**: 每页 12-24 张

## 🧪 Testing

### 测试页面

```bash
# 启动开发服务器
npm run dev

# 访问测试页面
http://localhost:4338/test-gallery-grid
```

### 测试场景

- ✅ 正常状态 (12 张图片, 4 列)
- ✅ 3 列布局
- ✅ 2 列布局 (6 张图片)
- ✅ 空状态
- ✅ 响应式测试 (调整浏览器宽度)
- ✅ 悬停效果
- ✅ 点击事件 (打开浏览器控制台查看)

## 📁 File Structure

```
src/components/gallery/
├── GalleryGrid.astro          # 主组件 (瀑布流容器)
├── GalleryItem.astro          # 单个图片卡片
└── README-GALLERYGRID.md      # 本文档

src/pages/
└── test-gallery-grid.astro    # 测试页面
```

## 🔮 Future Enhancements (Task 5.2)

- [ ] GalleryLightbox 组件 (点击放大查看)
- [ ] 键盘导航 (左右箭头切换)
- [ ] 全屏模式
- [ ] 图片 EXIF 信息展示
- [ ] 社交分享按钮

## 🐛 Known Issues

1. **Safari column-count bug**: 某些 Safari 版本下图片可能被截断,已使用 `break-inside: avoid` 修复
2. **懒加载兼容性**: IE11 不支持 `loading="lazy"`,可使用 Intersection Observer polyfill

## 📚 References

- [CSS Columns - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/columns)
- [Lazy Loading - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading)
- [Masonry Layout Best Practices](https://web.dev/patterns/layout/masonry/)

---

**Author:** ULX Studio
**Task:** Task-5.1
**Last Updated:** 2026-02-03
