# TrustBadges 组件文档

## 组件概述

`TrustBadges.astro` 是信任徽章组件,用于在首页展示品牌的核心可信度指标,增强用户信心。

## 文件位置

```
src/components/home/TrustBadges.astro
```

## 功能特性

- ✅ 展示 3 个信任徽章横向排列
- ✅ 图标 + 文字组合
- ✅ 莫兰迪色系背景 (brand-light)
- ✅ 响应式设计 (移动端垂直堆叠,桌面端横向排列)
- ✅ 轻微悬停效果
- ✅ 可访问性支持 (aria-label)

## 使用方法

### 基础用法

```astro
---
import TrustBadges from '@/components/home/TrustBadges.astro';
---

<TrustBadges />
```

### 在首页中使用

```astro
---
// src/pages/index.astro
import BaseLayout from '@/components/layout/BaseLayout.astro';
import HeroSection from '@/components/home/HeroSection.astro';
import CategoryGrid from '@/components/home/CategoryGrid.astro';
import TrustBadges from '@/components/home/TrustBadges.astro';

const meta = {
  title: 'Dvotinst | Premium Newborn Photography Props',
  description: 'Shop professional newborn photography props...',
};
---

<BaseLayout {meta}>
  <HeroSection />
  <CategoryGrid />
  <TrustBadges />
</BaseLayout>
```

## 数据配置

徽章数据从 `site-settings.ts` 中读取:

```ts
// src/config/site-settings.ts
export const siteSettings = {
  copy: {
    trustBadges: [
      { icon: '🌍', text: 'Worldwide Shipping' },
      { icon: '⭐', text: '8 Years Experience' },
      { icon: '🔒', text: 'Secure Checkout' },
    ],
  },
};
```

## 自定义徽章

如需修改徽章内容,编辑 `site-settings.ts`:

```ts
trustBadges: [
  { icon: '📦', text: 'Free Shipping Over $99' },
  { icon: '🎨', text: 'Handmade Props' },
  { icon: '💳', text: 'PayPal Secure Payment' },
],
```

## 样式说明

### 颜色

- 背景色: `bg-brand-light` (#F5F0EB - Warm Cream)
- 文字颜色: `text-brand-dark` (#9C8B7E - Soft Brown)

### 响应式布局

- **移动端 (< 768px)**: 垂直堆叠,居中对齐
- **桌面端 (≥ 768px)**: 横向排列,间距 12

### 图标大小

- **移动端**: 3xl (1.875rem)
- **桌面端**: 4xl (2.25rem)

## 可访问性

- 使用 `aria-label="Trust badges"` 标记区域
- 图标使用 `aria-hidden="true"` 避免屏幕阅读器读取 emoji

## 设计规范

符合 CLAUDE.md 规定的莫兰迪色系设计调性:

- 温馨、柔和、专业
- 使用预定义的 brand 颜色变量
- 不使用硬编码颜色值

## 效果预览

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🌍 Worldwide Shipping   ⭐ 8 Years Experience       │
│                           🔒 Secure Checkout           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 维护说明

1. 徽章内容统一在 `site-settings.ts` 管理
2. 保持 3 个徽章数量不变(视觉平衡)
3. 图标选择简洁易懂的 emoji
4. 文字控制在 2-4 个单词

## 相关组件

- [BaseLayout](../layout/README.md)
- [HeroSection](README-HEROSECTION.md)
- [CategoryGrid](README-CATEGORYGRID.md)

---

**Component Version:** 1.0.0
**Last Updated:** 2026-02-03
**Part of:** BabyProps.io (Dvotinst)
