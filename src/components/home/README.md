# Home Components

> 首页专用组件 - BabyProps.io

## 组件列表

### 1. HeroSection.astro ✅

**状态:** 已完成 (Task-2.1)

**功能:**
- 全屏英雄区块 (h-screen)
- 背景图 + 渐变蒙版
- 标题、副标题、描述文字
- CTA 按钮 (Shop Now)
- 信任徽章 (Worldwide Shipping, 8 Years Experience, Secure Checkout)
- 向下滚动提示动画
- 完全响应式 (Desktop, Tablet, Mobile)

**使用方法:**

```astro
---
import HeroSection from '@/components/home/HeroSection.astro';
---

<HeroSection />
```

**文案配置:**

所有文案从 `src/config/site-settings.ts` 的 `copy` 对象读取:
- `heroTitle`: "Capture the Perfect Moment"
- `heroSubtitle`: "Premium Newborn Photography Props"
- `heroDescription`: "Serving Professional Photographers Worldwide for 8 Years"
- `ctaText`: "Shop Now"

**背景图配置:**

背景图路径: `public/images/brand/hero-bg.webp`

**要求:**
- 尺寸: 1920x1080 (Full HD)
- 格式: WebP
- 质量: 80%
- 内容: 温馨的新生儿摄影场景

**样式定制:**

```css
/* 修改标题大小 */
.hero-title { font-size: 7xl; }

/* 修改蒙版透明度 */
.gradient-overlay { opacity: 0.5; }

/* 修改按钮样式 - 在 global.css 的 .btn-primary 中修改 */
```

**响应式断点:**
- Desktop (> 1024px): 完整尺寸
- Tablet (768px - 1024px): 中等尺寸
- Mobile (< 768px): 最小高度 500px, 缩小字体

---

### 2. CategoryGrid.astro

**状态:** 待开发 (Task-2.2)

**功能:**
- 8 大分类网格展示
- 分类卡片 (图片 + 名称 + 描述)
- 悬停效果
- 响应式布局 (4列 → 2列 → 1列)

---

### 3. FeaturedProducts.astro

**状态:** 待开发 (Task-2.3)

**功能:**
- 精选产品展示
- 4 列网格布局
- "View All" 链接
- 最多显示 8 个产品

---

### 4. TrustBadges.astro

**状态:** 待开发 (Task-2.4)

**功能:**
- 3 个信任徽章
- 横向排列
- 图标 + 文字

---

### 5. InstagramFeed.astro

**状态:** 待开发 (Task-2.5) - 可选

**优先级:** P2

**功能:**
- Instagram 图片展示
- "Follow @Dvotinst" CTA

---

## 组件开发规范

### 文件命名
- PascalCase.astro (如 HeroSection.astro)
- 存放在 `src/components/home/`

### Props 类型
```ts
interface Props {
  variant?: 'default' | 'featured';
  showBadges?: boolean;
}
```

### 样式规范
- 优先使用 Tailwind 工具类
- 使用 brand 配色 (brand, brand-light, brand-dark, brand-accent)
- 组件专属样式写在 `<style>` 标签中
- 响应式优先 (Mobile First)

### 数据获取
- 从 `@/config/site-settings.ts` 读取配置
- 从 `@/config/categories.ts` 读取分类
- 从 Content Collections 读取产品数据

---

## 测试清单

- [x] HeroSection 显示正常
- [x] 响应式布局正常
- [x] 文案从配置读取
- [x] CTA 按钮可点击
- [x] 信任徽章显示
- [x] 向下滚动动画正常
- [ ] 背景图正常加载 (需要添加 hero-bg.webp)

---

**Last Updated:** 2026-02-03
**Phase:** Phase 2 - 首页开发
