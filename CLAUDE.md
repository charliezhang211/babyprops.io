# CLAUDE.md - BabyProps.io 开发规范

> **项目:** Dvotinst 新生儿摄影道具 B2C 独立站
> **域名:** babyprops.io
> **技术栈:** Astro 5 (SSR) + React (Islands) + Tailwind CSS + Nano Stores + Supabase + PayPal
> **基座:** ULX Studio Astro Commerce Kit (Master Template)

---

## 1. 项目概述

### 1.1 业务背景

| 项目 | 说明 |
|------|------|
| **品牌** | Dvotinst (8年新生儿摄影道具专业供应商) |
| **市场** | B2C 全球独立站，面向专业摄影师 |
| **USP** | 专注 + 多样性 + 全球信任 |
| **联系人** | Tira Chan |
| **WhatsApp** | +86 158 20669823 |
| **Email** | dvotinst@gmail.com |

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                     BabyProps.io                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Astro 5 SSR)                                     │
│  ├── Static Pages: Home, About, Contact, Gallery           │
│  ├── Dynamic Pages: PLP, PDP, Cart, Checkout               │
│  └── React Islands: Filters, Cart, Configurator            │
├─────────────────────────────────────────────────────────────┤
│  State Management (Nano Stores)                             │
│  ├── cart.ts (持久化购物车)                                  │
│  ├── checkout.ts (结账状态)                                  │
│  └── auth.ts (用户认证)                                      │
├─────────────────────────────────────────────────────────────┤
│  Backend (Supabase)                                         │
│  ├── PostgreSQL (商品/订单/用户)                             │
│  ├── Auth (注册/登录)                                        │
│  └── Storage (图片 CDN)                                      │
├─────────────────────────────────────────────────────────────┤
│  Payments (PayPal REST API)                                 │
│  └── Sandbox → Production                                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 设计调性

| 维度 | 规范 |
|------|------|
| **色调** | 莫兰迪色系 (温馨、柔和、专业) |
| **主色** | Dusty Rose `#D4A5A5` / Sage Green `#B4C4A4` |
| **辅色** | Warm Cream `#F5F0EB` / Soft Brown `#9C8B7E` |
| **字体** | Heading: Playfair Display / Body: Inter |
| **调性** | 温馨、专业、值得信赖 |

---

## 2. 文件结构约定

### 2.1 完整目录结构

```
babyprops.io/
├── public/
│   ├── images/
│   │   ├── products/          # 产品图 (WebP, 命名: {sku}-{n}.webp)
│   │   ├── gallery/           # 买家秀 (WebP)
│   │   ├── categories/        # 分类封面图
│   │   └── brand/             # Logo, OG Image
│   └── fonts/                 # 自托管字体
│
├── src/
│   ├── config/
│   │   ├── site.ts            # 货币/运费/支付配置
│   │   ├── site-settings.ts   # UI 文案中控台 (⚠️ 必须修改)
│   │   ├── navigation.ts      # 导航菜单配置
│   │   └── categories.ts      # 产品分类枚举
│   │
│   ├── content/
│   │   ├── config.ts          # Zod Schema 定义
│   │   └── products/          # 产品 Markdown 文件
│   │       ├── wooden-moon-bed.md
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── supabase.ts        # Supabase 客户端
│   │   ├── paypal.ts          # PayPal REST API
│   │   ├── shipping.ts        # 运费计算
│   │   ├── email.ts           # Resend 邮件
│   │   └── payments/          # 支付 Provider
│   │
│   ├── stores/
│   │   ├── auth.ts            # 认证状态
│   │   ├── cart.ts            # 购物车 (localStorage)
│   │   └── checkout.ts        # 结账流程
│   │
│   ├── components/
│   │   ├── layout/            # 布局组件
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── BaseLayout.astro
│   │   │
│   │   ├── home/              # 首页专用
│   │   │   ├── HeroSection.astro
│   │   │   ├── CategoryGrid.astro
│   │   │   ├── FeaturedProducts.astro
│   │   │   ├── TrustBadges.astro
│   │   │   └── InstagramFeed.astro
│   │   │
│   │   ├── plp/               # 产品列表页
│   │   │   ├── ProductGrid.astro
│   │   │   ├── ProductCard.astro
│   │   │   ├── FilterSidebar.tsx    # React Island
│   │   │   ├── ColorFilter.tsx
│   │   │   └── SortDropdown.tsx
│   │   │
│   │   ├── pdp/               # 产品详情页 (复用基座)
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductInfo.astro
│   │   │   ├── ProductOptions.tsx
│   │   │   ├── AddToCart.tsx
│   │   │   ├── ProductTabs.tsx
│   │   │   └── RelatedProducts.astro
│   │   │
│   │   ├── commerce/          # 购物流程 (复用基座)
│   │   │   ├── CartPage.tsx
│   │   │   └── CheckoutPage.tsx
│   │   │
│   │   ├── account/           # 用户中心 (复用基座 + 扩展)
│   │   │   ├── AccountDashboard.tsx
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   ├── AddressManager.tsx
│   │   │   └── AccountSettings.tsx
│   │   │
│   │   ├── auth/              # 认证组件 (复用基座)
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── gallery/           # 买家秀模块
│   │   │   ├── GalleryGrid.astro
│   │   │   └── GalleryLightbox.tsx
│   │   │
│   │   └── ui/                # 通用 UI
│   │       ├── Button.astro
│   │       ├── Badge.astro
│   │       └── WhatsAppButton.astro
│   │
│   ├── pages/
│   │   ├── index.astro        # 首页
│   │   ├── shop/
│   │   │   ├── index.astro    # Shop All (PLP)
│   │   │   └── [category].astro
│   │   ├── products/
│   │   │   └── [slug].astro   # PDP
│   │   ├── new-in.astro
│   │   ├── gallery.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── cart.astro
│   │   ├── checkout.astro
│   │   ├── thank-you.astro
│   │   ├── order-lookup.astro # Guest 订单查询
│   │   ├── auth/
│   │   │   ├── login.astro
│   │   │   ├── register.astro
│   │   │   ├── forgot-password.astro
│   │   │   └── reset-password.astro
│   │   ├── account/           # 用户中心页面
│   │   │   ├── index.astro    # Dashboard
│   │   │   ├── orders/
│   │   │   │   ├── index.astro    # 订单列表
│   │   │   │   └── [id].astro     # 订单详情
│   │   │   ├── addresses.astro    # 地址管理
│   │   │   └── settings.astro     # 账户设置
│   │   └── api/               # API Routes (复用基座)
│   │
│   └── styles/
│       └── global.css         # Tailwind 入口 + CSS 变量
│
├── .env                       # 环境变量
├── .claudeignore              # Claude Code 忽略
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── CLAUDE.md                  # 本文件
└── TASKS.md                   # 任务清单
```

### 2.2 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| **Astro 组件** | PascalCase.astro | `ProductCard.astro` |
| **React 组件** | PascalCase.tsx | `FilterSidebar.tsx` |
| **工具函数** | camelCase.ts | `formatPrice.ts` |
| **配置文件** | kebab-case.ts | `site-settings.ts` |
| **产品 Markdown** | kebab-case.md | `wooden-moon-bed.md` |
| **产品图片** | {sku}-{n}.webp | `WMB001-1.webp` |

---

## 3. 组件开发规范

### 3.1 Astro 组件模板

```astro
---
// 📍 src/components/[category]/ComponentName.astro

// 1. 导入
import { Image } from 'astro:assets';
import Button from '@/components/ui/Button.astro';

// 2. Props 类型定义
interface Props {
  title: string;
  image?: ImageMetadata;
  variant?: 'default' | 'featured';
}

// 3. 解构 Props
const { title, image, variant = 'default' } = Astro.props;

// 4. 计算属性 (如需要)
const containerClass = variant === 'featured' 
  ? 'bg-brand-light p-6' 
  : 'bg-white p-4';
---

<!-- 5. 模板 -->
<div class={containerClass} data-component="component-name">
  <h2 class="text-xl font-serif text-brand-dark">{title}</h2>
  {image && <Image src={image} alt={title} class="rounded-lg" />}
  <slot />
</div>

<style>
  /* 组件专属样式 (尽量用 Tailwind) */
</style>
```

### 3.2 React Island 模板

```tsx
// 📍 src/components/[category]/ComponentName.tsx

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart } from '@/stores/cart';

interface ComponentNameProps {
  initialValue?: string;
  onAction?: (value: string) => void;
}

export default function ComponentName({ 
  initialValue = '', 
  onAction 
}: ComponentNameProps) {
  // Nano Stores 状态
  const cart = useStore($cart);
  
  // 本地状态
  const [value, setValue] = useState(initialValue);

  const handleClick = () => {
    onAction?.(value);
  };

  return (
    <div data-component="component-name" className="p-4">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <button 
        onClick={handleClick}
        className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark"
      >
        Submit
      </button>
    </div>
  );
}
```

### 3.3 页面模板

```astro
---
// 📍 src/pages/[page-name].astro

import BaseLayout from '@/components/layout/BaseLayout.astro';
import { siteSettings } from '@/config/site-settings';

// SEO 元数据
const meta = {
  title: `Page Title | ${siteSettings.siteName}`,
  description: 'Page description for SEO',
  image: '/images/brand/og-image.jpg',
};
---

<BaseLayout {meta}>
  <main class="container mx-auto px-4 py-8">
    <!-- 页面内容 -->
  </main>
</BaseLayout>
```

---

## 4. 样式规范

### 4.1 Tailwind 配置

```js
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#D4A5A5',  // Dusty Rose
          light: '#F5F0EB',    // Warm Cream
          dark: '#9C8B7E',     // Soft Brown
          accent: '#B4C4A4',   // Sage Green
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### 4.2 全局 CSS 变量

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-brand: 212 165 165;        /* #D4A5A5 */
    --color-brand-light: 245 240 235;  /* #F5F0EB */
    --color-brand-dark: 156 139 126;   /* #9C8B7E */
    --color-brand-accent: 180 196 164; /* #B4C4A4 */
  }
}

@layer components {
  .btn-primary {
    @apply bg-brand text-white px-6 py-3 rounded-full 
           hover:bg-brand-dark transition-colors font-medium;
  }
  
  .btn-secondary {
    @apply border-2 border-brand text-brand px-6 py-3 rounded-full 
           hover:bg-brand hover:text-white transition-colors;
  }
  
  .section-title {
    @apply text-3xl md:text-4xl font-serif text-brand-dark text-center;
  }
}
```

### 4.3 样式使用原则

```
✅ 推荐:
- 使用 Tailwind 工具类
- 使用配置好的 brand 颜色
- 复用 @layer components 中的类

❌ 禁止:
- 创建新的 .css 文件
- 使用硬编码颜色值
- 使用 !important
```

---

## 5. 数据结构定义

### 5.1 产品数据 (Content Collection)

```ts
// src/content/config.ts
import { z, defineCollection } from 'astro:content';

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // 基础信息
    title: z.string(),
    slug: z.string(),
    sku_prefix: z.string(),
    basePrice: z.number(),
    
    // 图片
    featured_image: z.string(),
    gallery: z.array(z.string()).optional(),
    
    // 分类与标签
    category: z.enum([
      'photo-props',
      'theme-sets',
      'photo-clothes',
      'posing-props',
      'wraps-blankets',
      'hats-headbands',
      'training-dolls',
      'mini-creative-props'
    ]),
    tags: z.array(z.string()).optional(),
    
    // 摄影道具专属字段
    material: z.string().optional(),           // 材质: Mohair, Wood, Iron
    color_family: z.string().optional(),       // 色系: Pastel, Vintage, Cream
    prop_size: z.string().optional(),          // 尺寸: Newborn, Sitter (6-12M)
    is_handmade: z.boolean().default(false),
    
    // 状态
    in_stock: z.boolean().default(true),
    is_new: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    
    // SEO
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
});

export const collections = { products: productsCollection };
```

### 5.2 产品 Markdown 示例

```markdown
---
title: "Wooden Moon Bed"
slug: "wooden-moon-bed"
sku_prefix: "WMB"
basePrice: 89.99
featured_image: "/images/products/WMB001-1.webp"
gallery:
  - "/images/products/WMB001-2.webp"
  - "/images/products/WMB001-3.webp"
category: "posing-props"
tags: ["moon", "wooden", "classic"]
material: "Natural Pine Wood"
color_family: "Natural Wood"
prop_size: "Newborn (0-1M)"
is_handmade: true
in_stock: true
is_new: true
is_featured: true
meta_title: "Wooden Moon Bed | Newborn Photography Props | Dvotinst"
meta_description: "Buy Wooden Moon Bed at Dvotinst. Perfect for newborn photoshoots. High quality Natural Pine Wood. Worldwide shipping."
---

Beautiful handcrafted wooden moon bed, perfect for creating dreamy newborn portraits. 

## Features
- Handcrafted from premium pine wood
- Smooth, baby-safe finish
- Diameter: 45cm
- Supports up to 8kg

## Care Instructions
- Wipe with soft dry cloth
- Avoid direct sunlight
- Store in dry place
```

### 5.3 分类配置

```ts
// src/config/categories.ts
export const categories = [
  {
    slug: 'photo-props',
    name: 'Photo Props',
    description: 'General photography props for all themes',
    image: '/images/categories/photo-props.webp',
  },
  {
    slug: 'theme-sets',
    name: 'Theme Sets',
    description: 'Curated sets for specific themes',
    image: '/images/categories/theme-sets.webp',
    badge: 'Best Value',
  },
  {
    slug: 'photo-clothes',
    name: 'Photo Clothes',
    description: 'Outfits, rompers, and dresses',
    image: '/images/categories/photo-clothes.webp',
  },
  {
    slug: 'posing-props',
    name: 'Posing Props',
    description: 'Beds, buckets, bowls and posing aids',
    image: '/images/categories/posing-props.webp',
  },
  {
    slug: 'wraps-blankets',
    name: 'Wraps & Blankets',
    description: 'High quality textures for wrapping',
    image: '/images/categories/wraps-blankets.webp',
  },
  {
    slug: 'hats-headbands',
    name: 'Hats & Headbands',
    description: 'Delicate accessories for headshots',
    image: '/images/categories/hats-headbands.webp',
  },
  {
    slug: 'training-dolls',
    name: 'Training Dolls',
    description: 'Professional posing practice dolls',
    image: '/images/categories/training-dolls.webp',
    badge: 'Pro',
  },
  {
    slug: 'mini-creative-props',
    name: 'Mini Creative Props',
    description: 'Small props for detailed shots',
    image: '/images/categories/mini-creative-props.webp',
  },
] as const;

export type CategorySlug = typeof categories[number]['slug'];
```

---

## 6. 页面架构

### 6.1 首页 (index.astro)

```
首页组件结构:
├── HeroSection         # 全屏背景图 + 标题 + CTA
├── CategoryGrid        # 8 大分类网格 (2x4 或 4x2)
├── FeaturedProducts    # 精选商品轮播/网格
├── TrustBadges         # 信任徽章 (8年/全球配送/安全支付)
├── InstagramFeed       # 嵌入 Instagram @Dvotinst
└── NewsletterSignup    # 邮件订阅 (可选)
```

### 6.2 产品列表页 (PLP)

```
PLP 组件结构:
├── Breadcrumb          # 面包屑导航
├── PageHeader          # 分类标题 + 描述
├── FilterSidebar       # React Island (颜色/材质/价格)
│   ├── ColorFilter     # 色卡筛选
│   ├── MaterialFilter  # 材质筛选
│   └── PriceRange      # 价格区间
├── SortDropdown        # 排序下拉
├── ProductGrid         # 产品网格 (Masonry)
│   └── ProductCard     # 单个产品卡片
└── Pagination          # 分页
```

### 6.3 产品详情页 (PDP)

```
PDP 组件结构 (复用基座 + 扩展):
├── Breadcrumb
├── ProductGallery      # 图片画廊 + 放大镜
├── ProductInfo         # 标题/价格/SKU/材质/色系
├── ProductOptions      # 变体选择 (如有)
├── AddToCart           # 加购按钮 + 信任徽章
├── ProductTabs         # 详情/尺寸/洗涤说明
├── RelatedProducts     # 推荐搭配 (同色系)
└── RecentlyViewed      # 最近浏览
```

### 6.4 用户中心 (Account)

```
Account Dashboard (/account):
├── WelcomeHeader       # 用户名 + 头像
├── QuickLinks          # 快捷入口卡片
│   ├── My Orders       # 订单数量徽章
│   ├── My Addresses    # 地址数量徽章
│   └── Settings        # 账户设置
├── RecentOrders        # 最近 3 条订单预览
└── LogoutButton        # 登出
```

```
Order History (/account/orders):
├── PageHeader          # "My Orders"
├── StatusFilter        # All/Processing/Shipped/Delivered
├── OrderList           # 订单列表
│   └── OrderCard       # 订单卡片
│       ├── OrderNumber + Date
│       ├── ProductThumbnails (最多3个)
│       ├── TotalAmount
│       ├── StatusBadge
│       └── ViewDetailsLink
└── Pagination          # 分页
```

```
Order Detail (/account/orders/[id]):
├── BackLink            # 返回订单列表
├── OrderHeader         # 订单号 + 日期 + 状态
├── OrderTimeline       # 状态时间线
│   ├── Order Placed    # ✓ 已下单
│   ├── Processing      # ✓ 处理中
│   ├── Shipped         # ● 已发货 (当前)
│   └── Delivered       # ○ 已送达
├── TrackingInfo        # 物流追踪 (如有)
├── ProductList         # 商品清单
│   └── ProductItem     # 图片/名称/SKU/数量/单价
├── ShippingAddress     # 收货地址
├── PaymentSummary      # 支付方式摘要
├── OrderSummary        # 小计/运费/折扣/总计
└── NeedHelpCard        # 联系客服入口
```

```
Address Manager (/account/addresses):
├── PageHeader          # "My Addresses"
├── AddressList         # 地址列表
│   └── AddressCard     # 地址卡片
│       ├── Name + Phone
│       ├── Full Address
│       ├── DefaultBadge (如果是默认)
│       └── Actions (编辑/删除/设为默认)
├── AddAddressButton    # + 添加新地址
└── AddressModal        # 添加/编辑地址表单
```

```
Account Settings (/account/settings):
├── PageHeader          # "Account Settings"
├── ProfileSection      # 个人信息
│   ├── Name            # 可编辑
│   └── Email           # 可编辑
├── PasswordSection     # 修改密码
│   ├── CurrentPassword
│   ├── NewPassword
│   └── ConfirmPassword
├── PreferencesSection  # 偏好设置
│   └── EmailSubscription (开关)
└── DangerZone          # 危险操作
    └── DeleteAccount   # 删除账户 (可选)
```

```
Guest Order Lookup (/order-lookup):
├── PageHeader          # "Track Your Order"
├── LookupForm          # 查询表单
│   ├── OrderNumber     # 订单号输入
│   ├── Email           # 邮箱输入
│   └── SubmitButton    # 查询按钮
├── ErrorMessage        # 错误提示 (如未找到)
└── HelpText            # 提示文字 + 联系客服链接
```

---

## 7. 配置文件修改清单

### 7.1 site-settings.ts

```ts
// src/config/site-settings.ts
export const siteSettings = {
  // 品牌信息
  siteName: 'Dvotinst',
  siteUrl: 'https://babyprops.io',
  tagline: 'Premium Newborn Photography Props',
  
  // 联系方式
  contact: {
    email: 'dvotinst@gmail.com',
    phone: '+86 158 20669823',
    whatsapp: '8615820669823',
    address: 'Shenzhen, China',
  },
  
  // 社交媒体
  social: {
    instagram: 'https://instagram.com/dvotinst',
    facebook: 'https://facebook.com/dvotinst',
    pinterest: 'https://pinterest.com/dvotinst',
  },
  
  // 运营文案
  copy: {
    heroTitle: 'Capture the Perfect Moment',
    heroSubtitle: 'Premium Newborn Photography Props',
    heroDescription: 'Serving Professional Photographers Worldwide for 8 Years',
    ctaText: 'Shop Now',
    trustBadges: [
      { icon: 'globe', text: 'Worldwide Shipping' },
      { icon: 'clock', text: '8 Years Experience' },
      { icon: 'shield', text: 'Secure Checkout' },
    ],
  },
  
  // 功能开关
  features: {
    enableReviews: true,
    enableWishlist: false,
    enableCoupons: true,
    enableNewsletter: true,
  },
};
```

### 7.2 .env

```env
# Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# PayPal
PUBLIC_PAYPAL_CLIENT_ID=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxB
PAYPAL_CLIENT_SECRET=ExxxxxxxxxxxxxxxxxxxxxxxxxxxxF
PAYPAL_SANDBOX=true

# Resend (邮件)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Dvotinst <orders@babyprops.io>

# Site
SITE_URL=https://babyprops.io
```

---

## 8. SEO 规范

### 8.1 元数据模板

```ts
// 首页
title: 'Dvotinst | Premium Newborn Photography Props'
description: 'Shop professional newborn photography props at Dvotinst. 8 years serving photographers worldwide. Posing props, wraps, outfits & more. Free shipping over $99.'

// 分类页
title: `${categoryName} | Newborn Photography Props | Dvotinst`
description: `Browse our ${categoryName} collection. High quality newborn photography props. ${categoryDescription}`

// 产品页
title: `${productName} | Newborn Photography Props | Dvotinst`
description: `Buy ${productName} at Dvotinst. Perfect for newborn photoshoots. High quality ${material}, available in ${colorFamily}. Worldwide shipping.`
```

### 8.2 结构化数据

```json
// Product Schema
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wooden Moon Bed",
  "image": "https://babyprops.io/images/products/WMB001-1.webp",
  "description": "Beautiful handcrafted wooden moon bed",
  "sku": "WMB001",
  "brand": {
    "@type": "Brand",
    "name": "Dvotinst"
  },
  "offers": {
    "@type": "Offer",
    "price": "89.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## 9. 性能优化

### 9.1 图片规范

| 类型 | 格式 | 尺寸 | 质量 |
|------|------|------|------|
| 产品主图 | WebP | 800x800 | 85% |
| 产品缩略图 | WebP | 400x400 | 80% |
| 分类封面 | WebP | 600x400 | 85% |
| Hero 背景 | WebP | 1920x1080 | 80% |
| OG Image | JPG | 1200x630 | 90% |

### 9.2 Astro Image 使用

```astro
---
import { Image } from 'astro:assets';
import productImage from '@/images/products/WMB001-1.webp';
---

<Image 
  src={productImage} 
  alt="Wooden Moon Bed" 
  width={400} 
  height={400}
  loading="lazy"
  decoding="async"
/>
```

---

## 10. 开发注意事项

### 10.1 复用基座模块

从 Commerce Kit 复用以下目录，**不要修改核心逻辑**:

```
✅ 直接复用:
- src/lib/              # 工具库
- src/stores/           # 状态管理
- src/pages/api/        # API 路由
- src/components/auth/  # 认证组件
- src/components/commerce/ # 购物流程

⚠️ 复用但需调整样式:
- src/components/pdp/   # 产品详情组件

🆕 新建:
- src/components/home/  # 首页组件
- src/components/plp/   # 列表页组件
- src/components/gallery/ # 买家秀模块
```

### 10.2 必须保留的属性

所有核心组件容器必须保留 `data-commerce` 或 `data-pdp` 属性:

```html
<div data-commerce="cart-item">...</div>
<div data-pdp="gallery">...</div>
```

### 10.3 路径别名

强制使用 `@/` 路径别名:

```ts
// ✅ 正确
import { $cart } from '@/stores/cart';
import Button from '@/components/ui/Button.astro';

// ❌ 错误
import { $cart } from '../../stores/cart';
```

### 10.4 样式约束

```
✅ 允许:
- Tailwind 工具类
- 修改 tailwind.config.mjs 的 brand 颜色
- 在 global.css 的 @layer 中添加组件类

❌ 禁止:
- 创建新的 .css 文件
- 在 React 组件中使用 CSS-in-JS
- 使用行内样式 (除非动态计算)
```

---

## 11. 常用代码片段

### 11.1 获取所有产品

```ts
import { getCollection } from 'astro:content';

const products = await getCollection('products');
const inStockProducts = products.filter(p => p.data.in_stock);
```

### 11.2 按分类筛选

```ts
const posingProps = await getCollection('products', 
  ({ data }) => data.category === 'posing-props'
);
```

### 11.3 WhatsApp 按钮

```astro
---
import { siteSettings } from '@/config/site-settings';
const whatsappUrl = `https://wa.me/${siteSettings.contact.whatsapp}`;
---

<a 
  href={whatsappUrl} 
  target="_blank"
  class="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
>
  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <!-- WhatsApp icon -->
  </svg>
</a>
```

### 11.4 信任徽章

```astro
<div class="flex justify-center gap-8 py-4 border-t">
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <span class="text-brand">🌍</span>
    <span>Worldwide Shipping</span>
  </div>
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <span class="text-brand">⭐</span>
    <span>8 Years Experience</span>
  </div>
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <span class="text-brand">🔒</span>
    <span>Secure Checkout</span>
  </div>
</div>
```

---

## 12. 参考资源

| 资源 | 链接 |
|------|------|
| Astro 5 文档 | https://docs.astro.build |
| Tailwind CSS | https://tailwindcss.com/docs |
| Nano Stores | https://github.com/nanostores/nanostores |
| Supabase | https://supabase.com/docs |
| PayPal REST | https://developer.paypal.com/docs/api/overview/ |

---

**Maintainer:** ULX Studio  
**Version:** 1.0.0 (BabyProps.io - Dvotinst)  
**Last Updated:** 2026-02-03