# CategoryGrid 组件文档

> **任务:** Task-2.2 - CategoryGrid 组件
> **创建时间:** 2026-02-03
> **状态:** ✅ 已完成

## 概述

CategoryGrid 是首页的核心组件之一，展示 BabyProps.io 的 8 大产品分类。该组件采用响应式网格布局，在不同设备上自适应显示。

## 组件结构

```
src/components/home/
├── CategoryGrid.astro   # 主组件 (网格容器)
└── CategoryCard.astro   # 子组件 (单个分类卡片)
```

## 功能特性

### ✅ 已实现功能

1. **响应式网格布局**
   - 桌面 (≥1024px): 4 列
   - 平板 (768px-1023px): 2 列
   - 移动 (<768px): 1 列

2. **分类卡片样式**
   - 产品图片展示区域 (4:3 比例)
   - 分类名称 (Playfair Display 字体)
   - 简短描述文字
   - "Explore Collection" 交互提示

3. **视觉效果**
   - 卡片悬停提升效果 (`hover:-translate-y-1`)
   - 阴影深度变化 (`shadow-md → shadow-xl`)
   - 图片蒙版渐变
   - 箭头动画 (透明度 + 位移)

4. **Badge 标签系统**
   - **Best Value** (★): Theme Sets - Sage Green 色
   - **Pro** (⚡): Training Dolls - Soft Brown 色
   - **New** (✨): 新品标识 - Dusty Rose 色

5. **莫兰迪色系**
   - 主色: Dusty Rose `#D4A5A5`
   - 辅色: Sage Green `#B4C4A4`
   - 背景: Warm Cream `#F5F0EB`

## 使用方法

### 基础用法

```astro
---
import CategoryGrid from '@/components/home/CategoryGrid.astro';
---

<CategoryGrid />
```

### 自定义标题

```astro
<CategoryGrid
  title="Explore Our Collections"
  subtitle="Find the perfect props for your newborn photography sessions"
/>
```

### Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'Shop by Category'` | 组件标题 |
| `subtitle` | `string` | `'Explore our specialized...'` | 副标题 |

## CategoryCard 组件

### Props 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | `Category` | ✅ | 分类数据对象 |

### Category 数据结构

```typescript
interface Category {
  slug: string;           // URL 友好标识
  name: string;           // 显示名称
  description: string;    // 简短描述
  image: string;          // 图片路径
  badge?: 'Best Value' | 'Pro' | 'New';  // 可选标签
}
```

## 数据源

组件从 [`src/config/categories.ts`](../../config/categories.ts) 读取 8 大分类数据:

```typescript
import { categories } from '@/config/categories';
```

## 样式规范

### Tailwind 类使用

- **容器**: `container mx-auto px-4`
- **网格**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8`
- **卡片**: `rounded-2xl bg-white shadow-md hover:shadow-xl`
- **标题**: `section-title` (定义在 global.css)

### 自定义样式

```css
/* 淡入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 链接路径

每个分类卡片链接到对应的分类页面:

```
/shop/{category-slug}

示例:
- Photo Props → /shop/photo-props
- Theme Sets → /shop/theme-sets
- Posing Props → /shop/posing-props
```

## 已集成页面

- ✅ [src/pages/index.astro](../../pages/index.astro) - 首页

## 占位图说明

⚠️ **当前状态**: 组件使用 SVG 图标作为占位符

**下一步 (Task-9.1):**
- 替换为实际产品分类图片
- 图片格式: WebP
- 尺寸: 600x400 (4:3 比例)
- 命名规范: `{category-slug}.webp`
- 存放路径: `public/images/categories/`

## 性能优化

1. **图片懒加载**: 使用 Astro Image 组件 (待实现)
2. **CSS 动画**: 使用 GPU 加速的 transform 属性
3. **静态生成**: Astro 在构建时预渲染组件

## 浏览器兼容性

- ✅ Chrome/Edge (最新)
- ✅ Firefox (最新)
- ✅ Safari (最新)
- ✅ Mobile Safari/Chrome

## 测试验证

### 开发服务器

```bash
npm run dev
```

访问: http://localhost:4327/

### 响应式测试

使用浏览器开发者工具测试以下断点:
- 📱 iPhone SE (375px): 1 列
- 📱 iPad (768px): 2 列
- 💻 Desktop (1024px): 4 列
- 🖥️ Large Desktop (1440px): 4 列

## 相关任务

- ✅ Task-0.5: categories.ts 配置
- ✅ Task-2.2: CategoryGrid 组件 (当前)
- ⏳ Task-3.7: PLP 页面整合 (分类页)
- ⏳ Task-9.1: 产品图片处理

## 维护注意事项

1. **添加新分类**
   - 修改 `src/config/categories.ts`
   - 添加对应分类图片到 `public/images/categories/`
   - 组件会自动读取并显示

2. **修改样式**
   - 优先使用 Tailwind 工具类
   - 避免创建新的 CSS 文件
   - 遵循 CLAUDE.md 样式规范

3. **Badge 管理**
   - 在 categories.ts 中配置 badge 属性
   - 支持类型: 'Best Value' | 'Pro' | 'New'
   - 可根据需求扩展新类型

## 截图预览

```
┌─────────────────────────────────────────────────────┐
│          Shop by Category                           │
│   Explore our specialized collections...            │
│                                                      │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                    │
│  │ 📷 │  │ 🎁 │  │ 👕 │  │ 🛏️ │                    │
│  └────┘  └────┘  └────┘  └────┘                    │
│  Props   Sets    Clothes Posing                     │
│                                                      │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                    │
│  │ 🧣 │  │ 🎀 │  │ 👶 │  │ ✨ │                    │
│  └────┘  └────┘  └────┘  └────┘                    │
│  Wraps   Hats    Dolls   Mini                       │
│                                                      │
│         [View All Products →]                       │
└─────────────────────────────────────────────────────┘
```

---

**创建者:** Claude Code
**最后更新:** 2026-02-03
**版本:** 1.0.0
