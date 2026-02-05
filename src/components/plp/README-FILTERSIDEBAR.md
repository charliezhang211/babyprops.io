# FilterSidebar Component

产品筛选侧边栏组件 - 整合颜色、材质、价格筛选功能,支持桌面侧边栏和移动抽屉两种模式。

## 📁 文件结构

```
src/components/plp/
├── FilterSidebar.tsx        # 主组件 (整合所有筛选器)
├── ColorFilter.tsx          # 颜色筛选器 (色卡)
├── MaterialFilter.tsx       # 材质筛选器 (列表)
├── PriceRange.tsx           # 价格区间筛选器 (双滑块)
└── README-FILTERSIDEBAR.md  # 本文档

src/stores/
└── filter.ts                # 筛选状态管理 (Nano Stores)

src/config/
├── color-families.ts        # 色系配置
└── materials.ts             # 材质配置
```

## ✨ 功能特性

### FilterSidebar (主组件)

| 功能 | 说明 |
|------|------|
| **两种模式** | Sidebar (桌面) / Drawer (移动) |
| **整合筛选器** | ColorFilter + MaterialFilter + PriceRange |
| **清空所有** | "Clear All Filters" 按钮 |
| **激活计数** | 显示当前激活的筛选数量徽章 |
| **结果计数** | 可选显示筛选后的产品数量 |
| **URL 同步** | 筛选状态自动同步到 URL 参数 |
| **移动端抽屉** | 滑入动画 + 遮罩层 + 滚动锁定 |

### ColorFilter (子组件)

| 功能 | 说明 |
|------|------|
| **色卡展示** | 6 种莫兰迪色系色卡网格 |
| **多选支持** | 可同时选择多个颜色 |
| **视觉反馈** | 选中状态: Ring + Checkmark + 放大 |
| **悬停动画** | Scale + 颜色变化 |
| **清空按钮** | 清空颜色筛选 |

### MaterialFilter (子组件)

| 功能 | 说明 |
|------|------|
| **材质列表** | 8 种常见摄影道具材质 |
| **图标展示** | Emoji 图标 + 材质名称 |
| **多选支持** | 可同时选择多个材质 |
| **视觉反馈** | 选中状态: Ring + Checkmark + 图标背景色 |
| **清空按钮** | 清空材质筛选 |

### PriceRange (子组件)

| 功能 | 说明 |
|------|------|
| **双滑块** | 独立控制最小值和最大值 |
| **实时预览** | 拖动时即时显示价格范围 |
| **延迟更新** | 松开滑块后才更新 URL (性能优化) |
| **可配置** | 自定义 min/max/step/currency |
| **视觉反馈** | 激活区间高亮显示 |

## 📖 使用方法

### 基础用法 (侧边栏模式)

```astro
---
// src/pages/shop/index.astro
import FilterSidebar from '@/components/plp/FilterSidebar';
import ProductGrid from '@/components/plp/ProductGrid.astro';
import { getCollection } from 'astro:content';

const products = await getCollection('products');
---

<div class="container mx-auto px-4 py-8">
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- 侧边栏 -->
    <div class="lg:col-span-1">
      <FilterSidebar
        client:load
        mode="sidebar"
        priceConfig={{
          min: 0,
          max: 300,
          step: 10,
          currency: '$',
        }}
        resultCount={products.length}
      />
    </div>

    <!-- 产品网格 -->
    <div class="lg:col-span-3">
      <ProductGrid products={products} />
    </div>
  </div>
</div>
```

### 移动端抽屉模式

```astro
---
import FilterSidebar from '@/components/plp/FilterSidebar';
import ProductGrid from '@/components/plp/ProductGrid.astro';
---

<div class="container mx-auto px-4 py-8">
  <!-- 抽屉触发器 + 面板 (自动隐藏在移动端) -->
  <FilterSidebar
    client:load
    mode="drawer"
    priceConfig={{
      min: 0,
      max: 500,
      step: 20,
      currency: '$',
    }}
  />

  <!-- 产品网格 -->
  <ProductGrid products={products} />
</div>
```

### 独立使用子组件

```astro
---
import ColorFilter from '@/components/plp/ColorFilter';
import MaterialFilter from '@/components/plp/MaterialFilter';
import PriceRange from '@/components/plp/PriceRange';
---

<!-- 仅使用颜色筛选 -->
<ColorFilter client:load title="Select Colors" />

<!-- 仅使用材质筛选 -->
<MaterialFilter client:load />

<!-- 仅使用价格筛选 -->
<PriceRange
  client:load
  min={0}
  max={200}
  step={5}
  currency="€"
/>
```

## 🎛️ Props 参考

### FilterSidebar Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'sidebar' \| 'drawer'` | `'sidebar'` | 显示模式 |
| `title` | `string` | `'Filters'` | 侧边栏标题 |
| `priceConfig` | `PriceConfig` | `{}` | 价格筛选配置 |
| `resultCount` | `number` | `undefined` | 筛选结果数量 (可选) |

**PriceConfig:**

```typescript
{
  min?: number;      // 最小价格 (default: 0)
  max?: number;      // 最大价格 (default: 500)
  step?: number;     // 步进值 (default: 10)
  currency?: string; // 货币符号 (default: "$")
}
```

### ColorFilter Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'Filter by Color'` | 标题文字 |
| `showClearButton` | `boolean` | `true` | 显示清空按钮 |

### MaterialFilter Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'Filter by Material'` | 标题文字 |
| `showClearButton` | `boolean` | `true` | 显示清空按钮 |

### PriceRange Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'Filter by Price'` | 标题文字 |
| `min` | `number` | `0` | 最小价格 |
| `max` | `number` | `500` | 最大价格 |
| `step` | `number` | `10` | 步进值 |
| `currency` | `string` | `'$'` | 货币符号 |
| `showClearButton` | `boolean` | `true` | 显示清空按钮 |

## 🔌 状态管理

所有筛选状态通过 Nano Stores 管理,存储在 [filter.ts](../../stores/filter.ts):42。

### Store 结构

```typescript
// src/stores/filter.ts
export interface FilterState {
  colors: Set<ColorFamilySlug>;     // 选中的颜色
  materials: Set<MaterialSlug>;     // 选中的材质
  priceRange: [number, number] | null; // 价格区间
}
```

### 可用函数

```typescript
// 颜色筛选
toggleColorFilter(color: ColorFamilySlug)
clearColorFilters()

// 材质筛选
toggleMaterialFilter(material: MaterialSlug)
clearMaterialFilters()

// 价格筛选
setPriceRange(min: number, max: number)
clearPriceRange()

// 清空所有
clearAllFilters()

// 初始化 (从 URL 读取)
initFiltersFromURL()
```

### Computed Values

```typescript
$hasActiveFilters      // boolean: 是否有激活的筛选
$activeFilterCount     // number: 激活的筛选数量
$selectedColors        // string[]: 选中的颜色数组
$selectedMaterials     // string[]: 选中的材质数组
```

## 🔗 URL 参数格式

筛选状态自动同步到 URL,支持分享和刷新保持:

```
# 单个筛选器
?colors=pastel
?materials=wood
?price=50-200

# 多个值 (逗号分隔)
?colors=pastel,cream,dusty-rose
?materials=wood,mohair,fabric

# 组合使用
?colors=dusty-rose&materials=fabric&price=30-150
```

## 🎨 样式定制

### 品牌色系

所有组件使用 Tailwind 配置的品牌色:

```css
/* tailwind.config.mjs */
brand: {
  DEFAULT: '#D4A5A5',  /* Dusty Rose */
  light: '#F5F0EB',    /* Warm Cream */
  dark: '#9C8B7E',     /* Soft Brown */
  accent: '#B4C4A4',   /* Sage Green */
}
```

### 自定义样式

通过 Tailwind classes 覆盖:

```astro
<FilterSidebar
  client:load
  class="!bg-gray-50 !border-2"
/>
```

## 📱 响应式设计

### Sidebar 模式

| 断点 | 行为 |
|------|------|
| `< lg` (1024px) | 隐藏侧边栏 |
| `≥ lg` | 显示固定侧边栏 (w-64) |

### Drawer 模式

| 断点 | 行为 |
|------|------|
| `< lg` (1024px) | 显示浮动按钮 + 抽屉 |
| `≥ lg` | 隐藏浮动按钮 (通常配合侧边栏) |

## 🧪 测试页面

访问测试页面查看组件效果:

```
http://localhost:4321/test-filter-sidebar
```

功能验证清单:
- ✅ 侧边栏模式布局
- ✅ 抽屉模式滑入/滑出
- ✅ 颜色筛选 (多选 + 清空)
- ✅ 材质筛选 (多选 + 清空)
- ✅ 价格区间 (双滑块)
- ✅ "Clear All" 清空所有筛选
- ✅ 激活计数徽章
- ✅ URL 参数同步
- ✅ 刷新保持筛选状态
- ✅ 移动端滚动锁定

## 📦 配置文件

### 色系配置

[color-families.ts](../../config/color-families.ts):15

```typescript
export const colorFamilies: ColorFamily[] = [
  {
    slug: 'pastel',
    name: 'Pastel',
    displayColor: '#E8D5E0',
    description: 'Soft pastel tones',
  },
  // ... 共 6 种色系
];
```

### 材质配置

[materials.ts](../../config/materials.ts):14

```typescript
export const materials: Material[] = [
  {
    slug: 'mohair',
    name: 'Mohair',
    description: 'Soft and fluffy mohair yarn',
    icon: '🧶',
  },
  // ... 共 8 种材质
];
```

## 🔄 与产品列表集成

### 筛选逻辑示例

```typescript
// src/pages/shop/index.astro
import { getCollection } from 'astro:content';
import { $filterState } from '@/stores/filter';

const allProducts = await getCollection('products');

// 在客户端使用 Nano Stores 筛选产品
// (这里只是示例,实际需要在 React 组件中处理)
const filteredProducts = allProducts.filter(product => {
  const state = $filterState.get();

  // 颜色筛选
  if (state.colors.size > 0 && !state.colors.has(product.data.color_family)) {
    return false;
  }

  // 材质筛选
  if (state.materials.size > 0 && !state.materials.has(product.data.material)) {
    return false;
  }

  // 价格筛选
  if (state.priceRange) {
    const [min, max] = state.priceRange;
    if (product.data.basePrice < min || product.data.basePrice > max) {
      return false;
    }
  }

  return true;
});
```

## 🐛 常见问题

### Q: 筛选状态不同步?

A: 确保在组件挂载时调用 `initFiltersFromURL()`:

```tsx
useEffect(() => {
  initFiltersFromURL();
}, []);
```

### Q: 抽屉滚动穿透?

A: 组件已自动处理 `body` 滚动锁定:

```tsx
useEffect(() => {
  if (isDrawerOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, [isDrawerOpen]);
```

### Q: 如何添加新的材质?

A: 编辑 [materials.ts](../../config/materials.ts):14,添加新的 Material 对象:

```typescript
{
  slug: 'linen',
  name: 'Linen',
  description: 'Natural linen fabric',
  icon: '🌾',
}
```

### Q: 如何自定义价格范围?

A: 通过 `priceConfig` prop 传入:

```astro
<FilterSidebar
  priceConfig={{
    min: 10,
    max: 1000,
    step: 50,
    currency: '¥',
  }}
/>
```

## 🎯 下一步

- [ ] Task-3.6: 添加 SortDropdown 排序组件
- [ ] Task-3.7: 整合到实际 PLP 页面
- [ ] [ ] 实现服务端筛选 (SSR)
- [ ] 添加更多筛选器 (尺寸、新品、特价等)

---

**Created:** 2026-02-03
**Component:** FilterSidebar + ColorFilter + MaterialFilter + PriceRange
**Dependencies:** Nano Stores, Tailwind CSS, React 18
