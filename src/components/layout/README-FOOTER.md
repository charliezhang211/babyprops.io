# Footer 组件文档

## 概述

Footer 组件是 BabyProps.io 的全局页脚，采用 4 列响应式布局，展示品牌信息、快速链接、产品分类和联系方式。

## 文件位置

```
src/components/layout/Footer.astro
```

## 功能特性

### 1. 四列布局

| 列 | 内容 | 说明 |
|---|------|------|
| **品牌信息** | Logo + Tagline + 简介 + 社交媒体 | 展示品牌身份和社交链接 |
| **快速链接** | Home, Shop All, New In, Gallery, About, Contact | 导航到主要页面 |
| **产品分类** | 前 6 个产品分类链接 | 快速访问产品分类 |
| **联系方式** | Email, WhatsApp, 地址 | 多渠道联系方式 |

### 2. 社交媒体图标

支持的平台：
- Instagram
- Facebook
- Pinterest

图标使用 SVG，带悬停效果。

### 3. 信任徽章

显示三个信任要素：
- 🌍 Worldwide Shipping
- ⏰ 8 Years Experience
- 🛡️ Secure Checkout

### 4. 底部栏

包含：
- 版权信息（动态年份）
- 政策链接（Privacy, Terms, Shipping, Return）
- PayPal 安全支付标识

## 响应式设计

```
Desktop (lg+):  4 列网格
Tablet (md):    2 列网格
Mobile:         1 列堆叠
```

## 集成方式

Footer 已自动集成到 `BaseLayout.astro` 中，所有使用 BaseLayout 的页面都会显示 Footer。

```astro
<BaseLayout meta={meta}>
  <!-- 页面内容 -->
</BaseLayout>
<!-- Footer 会自动显示 -->
```

## 配置依赖

Footer 组件依赖以下配置文件：

### 1. site-settings.ts
```ts
- siteSettings.siteName
- siteSettings.tagline
- siteSettings.contact (email, phone, whatsapp, whatsappUrl, address)
- siteSettings.social (instagram, facebook, pinterest)
- siteSettings.copy.trustBadges
```

### 2. categories.ts
```ts
- categories (前 6 个用于分类列表)
```

## 样式规范

### 颜色方案
- 背景色: `bg-brand-light` (#F5F0EB - Warm Cream)
- 文字颜色: `text-brand-dark` (#9C8B7E - Soft Brown)
- 链接悬停: `hover:text-brand` (#D4A5A5 - Dusty Rose)
- 边框: `border-brand/20` (20% 透明度)

### 间距
- 容器内边距: `py-12` (顶部/底部)
- 列间距: `gap-8`
- 分隔线边距: `pt-6 mb-6`

### 动画效果
- 链接悬停平移: `hover:translate-x-1`
- 颜色过渡: `transition-colors`

## 可访问性

- 所有链接包含有效的 `href`
- 外部链接使用 `target="_blank"` 和 `rel="noopener noreferrer"`
- 社交媒体链接包含 `aria-label`
- SVG 图标使用语义化路径

## 修改指南

### 添加新的快速链接

编辑 Footer.astro 第 11-18 行：

```ts
const quickLinks = [
  // 添加新链接
  { label: '新页面', href: '/new-page' },
];
```

### 修改社交媒体

在 `site-settings.ts` 中修改：

```ts
social: {
  instagram: 'https://instagram.com/your-handle',
  // ...
}
```

### 调整分类显示数量

修改第 21 行：

```ts
// 显示前 8 个分类
const categoryLinks = categories.slice(0, 8).map(cat => ({
```

### 添加政策链接

编辑第 25-30 行：

```ts
const policyLinks = [
  // 添加新政策页面
  { label: 'Cookie Policy', href: '/cookie-policy' },
];
```

## 维护注意事项

1. **不要硬编码联系方式** - 始终从 `site-settings.ts` 读取
2. **保持响应式** - 测试所有断点 (mobile, tablet, desktop)
3. **版权年份自动更新** - 使用 `new Date().getFullYear()`
4. **SVG 优化** - 保持 SVG 路径简洁，避免过大文件

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器全面支持

## 性能

- 无外部依赖
- 纯 Astro 组件（无 JS 运行时）
- SVG 图标内联（无额外请求）
- 轻量级：< 5KB HTML

## 相关文件

- [BaseLayout.astro](./BaseLayout.astro) - 布局容器
- [Header.astro](./Header.astro) - 页头组件
- [site-settings.ts](../../config/site-settings.ts) - 站点配置
- [categories.ts](../../config/categories.ts) - 分类配置

---

**创建日期:** 2026-02-03
**负责人:** ULX Studio
**状态:** ✅ 已完成
