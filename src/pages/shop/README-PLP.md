# PLP (Product Listing Pages) - 产品列表页

> **完成时间:** 2026-02-03
> **任务:** Task-3.7 - PLP 页面整合
> **状态:** ✅ 已完成

---

## 概述

实现了完整的产品列表页系统,包括 Shop All 页面和 8 个分类页面。支持筛选、排序、分页功能,并针对 SEO 进行了优化。

---

## 已创建文件

### 核心页面

1. **[src/pages/shop/index.astro](../../pages/shop/index.astro)**
   Shop All 页面,展示所有在售产品
   - URL: `/shop`
   - 功能: 筛选、排序、分页
   - SEO: 完整元数据 + 结构化数据

2. **[src/pages/shop/[category].astro](../../pages/shop/[category].astro)**
   动态分类页面 (8 个分类)
   - URL: `/shop/{category-slug}`
   - 功能: 按分类筛选 + 筛选、排序、分页
   - SEO: 动态元数据 + 结构化数据
   - SSG: 使用 getStaticPaths 预生成所有分类页

### 工具函数

3. **[src/lib/product-utils.ts](../../lib/product-utils.ts)**
   产品筛选、排序、分页工具函数库
   - `filterProducts()` - 产品筛选
   - `sortProducts()` - 产品排序
   - `paginateProducts()` - 分页处理
   - `getPriceRange()` - 价格范围计算

---

## 功能特性

### 1. 筛选功能

#### 支持的筛选维度
- **颜色 (Colors):** 6 种色系,多选 OR 逻辑
- **材质 (Materials):** 8 种材质,多选 OR 逻辑
- **价格 (Price Range):** 双滑块区间筛选

#### URL 参数格式
```
?colors=pastel,cream
&materials=wood,mohair
&price=20-100
```

#### 筛选逻辑
```typescript
// 颜色筛选 (OR 逻辑)
if (filters.colors && filters.colors.length > 0) {
  const hasMatchingColor = filters.colors.some(color =>
    data.color_family?.toLowerCase().includes(color.toLowerCase())
  );
  if (!hasMatchingColor) return false;
}

// 材质筛选 (OR 逻辑)
if (filters.materials && filters.materials.length > 0) {
  const hasMatchingMaterial = filters.materials.some(material =>
    data.material?.toLowerCase().includes(material.toLowerCase())
  );
  if (!hasMatchingMaterial) return false;
}

// 价格筛选 (范围)
if (filters.priceRange) {
  const [min, max] = filters.priceRange;
  if (data.basePrice < min || data.basePrice > max) return false;
}
```

### 2. 排序功能

#### 支持的排序选项
| 选项 | 键值 | 排序规则 |
|------|------|----------|
| Featured | `featured` | `is_featured` 优先 |
| Price: Low to High | `price-asc` | 价格升序 |
| Price: High to Low | `price-desc` | 价格降序 |
| Newest | `newest` | `is_new` 优先 |

#### URL 参数
```
?sort=price-asc
```

### 3. 分页功能

#### 配置
- **每页数量:** 12 个产品
- **页码参数:** `?page=2`
- **页码范围:** 自动计算 (最小 1)

#### 分页导航
```
[Previous] [1] ... [3] [4] [5] ... [10] [Next]
         显示当前页 ±1 的页码
```

#### 结果计数
```
Showing 13 - 24 of 48 products
```

### 4. SEO 优化

#### Meta 标签

**Shop All 页面**
```html
<title>Shop All | Newborn Photography Props | Dvotinst</title>
<meta name="description" content="Browse all newborn photography props...">
```

**分类页面**
```html
<title>{Category Name} | Newborn Photography Props | Dvotinst</title>
<meta name="description" content="Browse our {Category Name} collection. {Description}...">
```

#### 结构化数据

**Breadcrumb Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://babyprops.io"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://babyprops.io/shop"
    }
  ]
}
```

---

## 组件整合

### Desktop 布局

```
┌────────────────────────────────────────────────┐
│  Breadcrumb                                    │
├────────────────────────────────────────────────┤
│  Page Header (Title + Description)            │
├──────────┬─────────────────────────────────────┤
│ Filter   │  Toolbar (Count + Sort)             │
│ Sidebar  ├─────────────────────────────────────┤
│          │  Product Grid (2/3/4 列)            │
│ - Colors │  ┌──────┬──────┬──────┬──────┐     │
│ - Mater. │  │ Card │ Card │ Card │ Card │     │
│ - Price  │  ├──────┼──────┼──────┼──────┤     │
│          │  │ Card │ Card │ Card │ Card │     │
│ [Clear]  │  └──────┴──────┴──────┴──────┘     │
│          ├─────────────────────────────────────┤
│          │  Pagination                         │
└──────────┴─────────────────────────────────────┘
```

### Mobile 布局

```
┌────────────────────────────────────┐
│  Breadcrumb                        │
├────────────────────────────────────┤
│  Page Header                       │
├────────────────────────────────────┤
│  [Filter Button] + [Sort Dropdown] │
├────────────────────────────────────┤
│  Product Grid (1 列)               │
│  ┌──────────────────────────────┐ │
│  │        Product Card          │ │
│  ├──────────────────────────────┤ │
│  │        Product Card          │ │
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  Pagination                        │
└────────────────────────────────────┘

(Filter Button 点击 → 抽屉从右侧滑出)
```

---

## URL 路由结构

### Shop All
```
/shop                              # 第 1 页
/shop?page=2                       # 第 2 页
/shop?colors=pastel,cream          # 颜色筛选
/shop?materials=wood               # 材质筛选
/shop?price=20-100                 # 价格筛选
/shop?sort=price-asc               # 排序
/shop?page=2&colors=pastel&sort=newest  # 组合
```

### 分类页面
```
/shop/posing-props                 # 分类页第 1 页
/shop/posing-props?page=2          # 分类页第 2 页
/shop/posing-props?colors=pastel   # 分类 + 颜色筛选
/shop/theme-sets?sort=price-asc    # 分类 + 排序
```

---

## 技术实现

### 数据流程

```
1. URL 参数解析
   ↓
2. getCollection (从 Content Collections 获取产品)
   ↓
3. filterProducts (应用筛选条件)
   ↓
4. sortProducts (应用排序)
   ↓
5. paginateProducts (分页处理)
   ↓
6. 渲染 ProductGrid
```

### 状态管理

**Server-Side (Astro)**
- URL 参数解析
- 产品数据查询
- 筛选、排序、分页计算

**Client-Side (React Islands)**
- FilterSidebar: 筛选器交互
- SortDropdown: 排序下拉交互
- 状态同步到 URL (Nano Stores)

### SSG 配置

**分类页面使用 getStaticPaths 预生成**
```typescript
export const getStaticPaths = (async () => {
  return categories.map(category => ({
    params: { category: category.slug },
  }));
}) satisfies GetStaticPaths;
```

**生成的路径:**
```
/shop/photo-props
/shop/theme-sets
/shop/photo-clothes
/shop/posing-props
/shop/wraps-blankets
/shop/hats-headbands
/shop/training-dolls
/shop/mini-creative-props
```

---

## 测试验证

### 功能测试清单

- [x] Shop All 页面访问正常
- [x] 8 个分类页面访问正常
- [x] 颜色筛选生效 (多选 OR 逻辑)
- [x] 材质筛选生效 (多选 OR 逻辑)
- [x] 价格筛选生效 (区间)
- [x] 排序功能正常 (4 种排序)
- [x] 分页导航正常 (前/后/页码)
- [x] URL 参数同步 (筛选/排序/分页)
- [x] 桌面侧边栏显示正常
- [x] 移动端抽屉显示正常
- [x] 面包屑导航正确
- [x] SEO 元数据正确
- [x] 结构化数据正确
- [x] 空状态显示友好提示
- [x] 响应式布局正常

### 测试命令

```bash
# 启动开发服务器
npm run dev

# 访问页面
http://localhost:4321/shop
http://localhost:4321/shop/posing-props
http://localhost:4321/shop?colors=pastel&sort=price-asc
```

---

## 使用示例

### 从其他页面链接到 PLP

```astro
<!-- 链接到 Shop All -->
<a href="/shop">Shop All Products</a>

<!-- 链接到特定分类 -->
<a href="/shop/posing-props">Browse Posing Props</a>

<!-- 带筛选条件的链接 -->
<a href="/shop?colors=pastel">Shop Pastel Colors</a>

<!-- 带排序的链接 -->
<a href="/shop/theme-sets?sort=price-asc">Theme Sets (Low to High)</a>
```

### 在导航菜单中使用

```astro
<nav>
  <a href="/shop">Shop All</a>
  {categories.map(cat => (
    <a href={`/shop/${cat.slug}`}>{cat.name}</a>
  ))}
</nav>
```

---

## 性能优化

### 1. 图片优化
- 前 4 个产品 `loading="eager"` (首屏)
- 其他产品 `loading="lazy"` (懒加载)
- 自动生成 WebP 格式 (Astro Image)

### 2. 静态生成
- 所有分类页面预生成 (SSG)
- 无需服务器端渲染
- CDN 缓存友好

### 3. 代码分割
- FilterSidebar 和 SortDropdown 使用 `client:load`
- React 代码仅在需要时加载

---

## 待优化项 (Phase 8)

### 性能
- [ ] 虚拟滚动 (如产品数量 > 100)
- [ ] 图片预加载优化
- [ ] 骨架屏动画优化

### 功能
- [ ] 收藏/心愿单功能
- [ ] 产品比较功能
- [ ] 快速预览 (Quick View)

### SEO
- [ ] 分类页面动态 Schema.org (ItemList)
- [ ] 产品 JSON-LD 聚合
- [ ] Canonical URL 配置

---

## 相关文档

- [CLAUDE.md](../../../CLAUDE.md) - 项目规范
- [categories.ts](../../config/categories.ts) - 分类配置
- [filter.ts](../../stores/filter.ts) - 筛选状态管理
- [ProductGrid 文档](README-PRODUCTGRID.md)
- [FilterSidebar 文档](README-FILTERSIDEBAR.md)
- [SortDropdown 文档](README-SORTDROPDOWN.md)

---

## 常见问题

### Q: 如何修改每页显示的产品数量?

修改 `pageSize` 变量:
```typescript
const pageSize = 12; // 改为 16 或 24
```

### Q: 如何添加新的排序选项?

1. 在 `filter.ts` 添加新的 `SortOption`
2. 在 `product-utils.ts` 的 `sortProducts()` 添加排序逻辑
3. 在 `SortDropdown.tsx` 添加新选项

### Q: 筛选逻辑是 AND 还是 OR?

- **颜色之间:** OR (选中任一颜色即可)
- **材质之间:** OR (选中任一材质即可)
- **颜色与材质:** AND (同时满足)
- **价格:** 范围筛选 (min ≤ price ≤ max)

### Q: 如何隐藏某个分类?

在 `categories.ts` 中注释掉或删除该分类即可。

---

**维护者:** ULX Studio
**最后更新:** 2026-02-03
**任务:** Task-3.7 ✅
