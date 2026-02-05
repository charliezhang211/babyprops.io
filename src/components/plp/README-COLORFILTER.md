# ColorFilter 组件文档

## 📍 位置
```
src/components/plp/ColorFilter.tsx
```

## 🎯 功能

色卡样式的产品颜色筛选器，支持多选和 URL 参数同步。

## ✨ 特性

- ✅ **色卡界面**: 6 种摄影道具色系，直观展示
- ✅ **多选支持**: 可同时选择多个颜色筛选
- ✅ **URL 同步**: 自动同步到 URL 参数 (`?colors=pastel,cream`)
- ✅ **状态持久化**: 刷新页面后保持选中状态
- ✅ **视觉反馈**: 选中状态带 checkmark 和 ring 效果
- ✅ **悬停动画**: 鼠标悬停时的缩放和颜色变化
- ✅ **清空功能**: 一键清除所有颜色筛选
- ✅ **无障碍访问**: 完整的 ARIA 标签支持

## 📦 组件结构

```
ColorFilter (主组件)
└── ColorSwatch (色卡子组件) x6
```

## 🎨 色系配置

色系数据来自 `src/config/color-families.ts`:

| 色系 | Slug | 显示颜色 | 描述 |
|------|------|----------|------|
| Pastel | `pastel` | #E8D5E0 | Soft pastel tones perfect for dreamy shots |
| Vintage Brown | `vintage-brown` | #9C8B7E | Warm vintage brown for timeless photos |
| Cream | `cream` | #F5F0EB | Classic cream tones for elegant portraits |
| Natural Wood | `natural-wood` | #C8B4A0 | Natural wood tones for organic feel |
| Sage | `sage` | #B4C4A4 | Calming sage green for peaceful scenes |
| Dusty Rose | `dusty-rose` | #D4A5A5 | Romantic dusty rose for sweet moments |

## 🔧 使用方法

### 基础用法

```astro
---
import ColorFilter from '@/components/plp/ColorFilter';
---

<div class="sidebar">
  <ColorFilter client:load />
</div>
```

### 自定义标题

```astro
<ColorFilter
  client:load
  title="选择颜色"
/>
```

### 隐藏清空按钮

```astro
<ColorFilter
  client:load
  showClearButton={false}
/>
```

## 🎛️ Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `"Filter by Color"` | 组件标题 |
| `showClearButton` | `boolean` | `true` | 是否显示清空按钮 |

## 🗄️ 状态管理

使用 Nano Stores 管理全局筛选状态:

```ts
import { $filterState, toggleColorFilter, clearColorFilters } from '@/stores/filter';
```

### Store 结构

```ts
interface FilterState {
  colors: Set<ColorFamilySlug>;  // 选中的颜色
  materials: Set<string>;         // 材质筛选 (预留)
  priceRange: [number, number] | null;  // 价格区间 (预留)
}
```

### 可用函数

```ts
// 添加颜色
addColorFilter(color: ColorFamilySlug)

// 移除颜色
removeColorFilter(color: ColorFamilySlug)

// 切换颜色 (添加或移除)
toggleColorFilter(color: ColorFamilySlug)

// 清空所有颜色筛选
clearColorFilters()

// 清空所有筛选
clearAllFilters()

// 从 URL 初始化状态
initFiltersFromURL()

// 同步状态到 URL
syncFiltersToURL()
```

### Computed Values

```ts
// 获取选中的颜色数组
const selectedColors = useStore($selectedColors);

// 是否有激活的筛选
const hasActiveFilters = useStore($hasActiveFilters);

// 激活的筛选数量
const activeFilterCount = useStore($activeFilterCount);
```

## 🔗 URL 参数格式

```
无筛选:
/shop

单个颜色:
/shop?colors=pastel

多个颜色:
/shop?colors=pastel,cream,sage

组合筛选 (预留):
/shop?colors=pastel,cream&materials=wood,mohair&price=0-100
```

## 🎬 交互行为

### 点击色卡

1. 未选中 → 选中: 添加到筛选列表
2. 已选中 → 未选中: 从筛选列表移除
3. 自动更新 URL 参数
4. 触发产品列表重新筛选

### 点击清空按钮

1. 清除所有颜色筛选
2. 移除 URL 中的 `colors` 参数
3. 重置为无筛选状态

### 页面加载

1. 读取 URL 中的 `colors` 参数
2. 解析颜色 slugs
3. 初始化为选中状态
4. 渲染界面

## 🎨 样式说明

### 未选中状态

```css
- 背景: 白色
- 边框: 灰色
- 悬停: 品牌浅色背景 + 边框变品牌色 + 轻微缩放
```

### 选中状态

```css
- 背景: 品牌浅色 (brand-light)
- 外圈: 品牌色 ring (2px)
- 色卡: 放大 (scale-110) + 阴影
- Checkmark: 白色 ✓ 图标
```

### 响应式布局

```css
- 默认: 3 列网格
- 间距: 12px (gap-3)
- 色卡大小: 40px 圆形
```

## 📱 响应式设计

ColorFilter 组件本身是固定 3 列布局，但可以放在不同容器中:

```astro
<!-- 桌面端侧边栏 -->
<div class="hidden lg:block lg:w-64">
  <ColorFilter client:load />
</div>

<!-- 移动端抽屉 -->
<div class="lg:hidden">
  <button onclick="openFilterDrawer()">Filters</button>
  <div id="filter-drawer" class="hidden">
    <ColorFilter client:load />
  </div>
</div>
```

## 🧪 测试页面

访问测试页面验证功能:

```
http://localhost:4330/test-color-filter
```

### 测试检查清单

- [ ] 点击色卡可以选中/取消选中
- [ ] 选中后显示 checkmark 和 ring
- [ ] URL 参数自动更新
- [ ] 刷新页面后选中状态保持
- [ ] "Clear" 按钮清空所有选择
- [ ] 选中数量显示正确 "(2 selected)"
- [ ] 悬停效果流畅
- [ ] 多选支持正常

## 🔌 集成到 PLP

```astro
---
// src/pages/shop/[category].astro
import FilterSidebar from '@/components/plp/FilterSidebar';
import ColorFilter from '@/components/plp/ColorFilter';
import ProductGrid from '@/components/plp/ProductGrid.astro';
import { useStore } from '@nanostores/react';
import { $selectedColors } from '@/stores/filter';

// 获取产品并筛选
const allProducts = await getCollection('products');
const selectedColors = $selectedColors.get();

const filteredProducts = selectedColors.length > 0
  ? allProducts.filter(p => selectedColors.includes(p.data.color_family))
  : allProducts;
---

<div class="flex gap-8">
  <!-- 侧边栏 -->
  <aside class="w-64">
    <ColorFilter client:load />
  </aside>

  <!-- 产品网格 -->
  <main class="flex-1">
    <ProductGrid products={filteredProducts} />
  </main>
</div>
```

## 🎯 未来扩展

### MaterialFilter 组件

```tsx
// src/components/plp/MaterialFilter.tsx
// 复用 ColorFilter 的逻辑，调整为材质筛选
// Materials: Wood, Mohair, Cotton, Metal, etc.
```

### PriceRangeFilter 组件

```tsx
// src/components/plp/PriceRangeFilter.tsx
// 价格区间滑块筛选器
```

### FilterSidebar 整合

```tsx
// src/components/plp/FilterSidebar.tsx
<FilterSidebar>
  <ColorFilter />
  <MaterialFilter />
  <PriceRangeFilter />
</FilterSidebar>
```

## 📊 性能考虑

- ✅ React Island 仅在客户端激活
- ✅ URL 更新使用 `replaceState` (不触发导航)
- ✅ 色卡数量固定 (6 个)，无需虚拟滚动
- ✅ Nano Stores 轻量级 (~1KB)

## 🐛 已知问题

无

## 📝 更新日志

### v1.0.0 (2026-02-03)

- ✅ 创建 ColorFilter 组件
- ✅ 实现多选功能
- ✅ 添加 URL 参数同步
- ✅ 创建色系配置文件
- ✅ 创建筛选状态 Store
- ✅ 添加测试页面
- ✅ 编写完整文档

## 🔗 相关文件

| 文件 | 说明 |
|------|------|
| [ColorFilter.tsx](./ColorFilter.tsx) | 主组件 |
| [color-families.ts](../../config/color-families.ts) | 色系配置 |
| [filter.ts](../../stores/filter.ts) | 筛选状态 Store |
| [test-color-filter.astro](../../pages/test-color-filter.astro) | 测试页面 |

---

**Last Updated:** 2026-02-03
**Component Version:** 1.0.0
**Author:** ULX Studio
