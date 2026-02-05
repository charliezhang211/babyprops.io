# Header 组件使用文档

## 组件位置
`src/components/layout/Header.astro`

## 功能概述

Header 组件是 BabyProps.io 的主导航栏，提供以下功能：

### ✅ 已实现功能

1. **Logo 和品牌标识**
   - Dvotinst logo（圆形 D 字母图标）
   - 品牌名称和 tagline
   - 悬停效果（Logo 缩放）

2. **主导航菜单**
   - Home - 首页
   - Shop All - 商品总览（带分类下拉菜单）
   - New In - 新品页面
   - Gallery - 买家秀
   - About - 关于我们
   - Contact - 联系页面

3. **Shop All 分类下拉菜单**
   - Desktop: 悬停显示下拉菜单
   - 显示所有 8 大分类
   - 显示分类徽章（Best Value, Pro）
   - 平滑过渡动画

4. **购物车图标**
   - React Island 组件 (CartIcon)
   - 实时显示购物车数量
   - 与 cart store 集成

5. **搜索图标**（可选功能）
   - Desktop 显示搜索按钮
   - 预留功能，待后续实现

6. **响应式设计**
   - **Desktop (lg+)**: 水平导航 + 下拉菜单
   - **Mobile**: 汉堡菜单 + 全屏抽屉导航
   - 移动端分类可折叠展开

7. **移动端导航**
   - 汉堡菜单按钮
   - 全屏导航抽屉
   - 分类折叠/展开功能
   - 社交媒体链接（Instagram, Facebook, Pinterest）
   - 点击链接自动关闭菜单
   - ESC 键关闭菜单

8. **当前页面高亮**
   - 自动检测当前路径
   - 高亮当前导航项

## 品牌配色

使用 BabyProps.io 品牌色系：

- 主色 (brand): `#D4A5A5` Dusty Rose
- 浅色 (brand-light): `#F5F0EB` Warm Cream
- 深色 (brand-dark): `#9C8B7E` Soft Brown

## 技术实现

### 依赖项

```typescript
import { siteSettings } from '@/config/site-settings';
import { categories } from '@/config/categories';
import CartIcon from '@/components/commerce/CartIcon';
```

### CSS 特性

- Tailwind CSS 工具类
- Fixed positioning (z-50)
- 下拉菜单过渡动画
- 响应式断点 (lg: 1024px)

### JavaScript 功能

1. **移动菜单切换**
   - 汉堡图标 ↔ 关闭图标
   - 显示/隐藏菜单面板

2. **分类下拉展开**
   - 移动端点击展开/收起分类
   - 箭头旋转动画

3. **自动关闭**
   - 点击链接后关闭菜单
   - ESC 键关闭菜单

## 在 BaseLayout 中的集成

```astro
---
import Header from '@/components/layout/Header.astro';
---

<body>
  <Header />
  <slot />
</body>
```

## 高度占位

Header 使用 `fixed` 定位，组件底部添加了 20 高度的占位 div：

```html
<div class="h-20" aria-hidden="true"></div>
```

确保页面内容不会被 Header 遮挡。

## 导航结构

```
Header
├── Logo (Dvotinst + Tagline)
├── Desktop Navigation
│   ├── Home
│   ├── Shop All (Dropdown)
│   │   └── 8 Categories
│   ├── New In
│   ├── Gallery
│   ├── About
│   └── Contact
├── Actions
│   ├── Search Icon (可选)
│   ├── Cart Icon (React Island)
│   └── Mobile Menu Toggle
└── Mobile Navigation (隐藏)
    ├── Navigation Links
    ├── Categories (可折叠)
    └── Social Links
```

## 未来优化建议

1. **搜索功能**
   - 实现搜索弹窗或搜索页面
   - 添加搜索输入框和自动完成

2. **粘性导航**
   - 滚动时缩小 Header 高度
   - 添加阴影效果

3. **Logo 图片**
   - 替换圆形字母为实际品牌 logo
   - 支持深浅色模式（如需要）

4. **分类图标**
   - 在下拉菜单中添加分类图标
   - 提升视觉识别度

5. **用户认证**
   - 添加登录/注册入口
   - 用户头像下拉菜单

## 验证清单

- ✅ Header 在所有页面正常显示
- ✅ Desktop 导航正常工作
- ✅ Mobile 汉堡菜单正常展开/收起
- ✅ Shop All 下拉菜单显示所有分类
- ✅ 分类徽章正确显示
- ✅ 购物车图标集成（需要 CartIcon 组件正常工作）
- ✅ 响应式布局在不同屏幕尺寸正常
- ✅ 当前页面高亮功能正常
- ✅ 移动端社交链接正常跳转

## 测试

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:4321/ 查看 Header 显示效果。

## 相关文件

- `src/components/layout/Header.astro` - Header 组件
- `src/components/layout/BaseLayout.astro` - 基础布局（包含 Header）
- `src/config/categories.ts` - 分类配置
- `src/config/site-settings.ts` - 站点配置
- `src/components/commerce/CartIcon.tsx` - 购物车图标组件

---

**Created:** 2026-02-03
**Task:** Task-1.2 Header 组件
**Status:** ✅ 完成
