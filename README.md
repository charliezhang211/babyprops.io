# Astro Commerce Kit (Master Template)

### 1. 核心定位
本套件是 **ULX Studio** 专用的工业级电商/B2B 架构模具。采用 **Astro 5 (SSR)** + **Tailwind CSS** + **Nano Stores** + **Supabase** 逻辑闭环。旨在通过"逻辑与视觉分离"实现多站点（B2B/B2C）的快速克隆与重构。

### 2. 真理来源：`SITE_CONFIG`
全站禁止硬编码。所有业务逻辑必须从 `@/config/site-settings.ts` 读取配置：
* **B2C 模式**：开启支付链路（PayPal/Stripe），激活购物车与结账流程。
* **B2B 模式**：切换为"询盘模式（Inquiry Mode）"，主要针对机械设备等垂直领域，表单直通 Supabase。
* **文案中控**：所有按钮标签、页脚信息、联系电话统一在此处修改。

### 3. 核心技术契约 (The Contract)
* **状态管理**：使用 Nano Stores 实现轻量化持久化（localStorage）。
* **数据校验**：Markdown 产品数据必须严格遵守 `@/content/config.ts` 中的 Zod Schema 定义。
* **支付架构**：采用 Provider 模式（`src/lib/payments/`），支持无缝切换支付网关（PayPal, Stripe, Bank Transfer）。
* **路径规范**：强制使用 `@/` 路径别名（lib, stores, components, config），确保代码在克隆后逻辑不报错。

### 4. AI 协作指南 (For Cursor/Windsurf/Claude)
当你（AI Agent）接手此项目时，请务必遵守以下准则以保持工程纯净度：
1. **样式约束**：仅允许使用 Tailwind CSS。严禁引入任何新的 `.css` 文件。
2. **逻辑保护**：在重写 UI 组件（PDP/Cart/Checkout）时，必须完整保留对 `@/stores/` 中原子状态的原始调用逻辑。
3. **数据标识**：所有核心组件的主容器必须带有 `data-pdp` 或 `data-commerce` 属性，以便于全局样式注入。
4. **Token 优化**：优先参考本 README 及 `@/config/` 下的配置文件，避免在不理解全局架构的情况下重写核心逻辑。

---

## 移植对接指南 (Integration Guide)

本节说明如何将此电商模块移植到一个新的 Astro 站点。

### Step 1: 安装依赖

在目标项目中安装以下 npm 包：

```bash
# 核心框架
npm install astro @astrojs/react react react-dom

# 状态管理
npm install nanostores @nanostores/persistent @nanostores/react

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# PayPal
npm install @paypal/react-paypal-js

# 样式
npm install tailwindcss @astrojs/tailwind
```

### Step 2: TypeScript 配置

确保目标项目的 `tsconfig.json` 包含路径别名：

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Step 3: 环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase (必填)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# PayPal (必填)
PUBLIC_PAYPAL_CLIENT_ID=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxB
PAYPAL_CLIENT_SECRET=ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxF
PAYPAL_SANDBOX=true

# 邮件通知 (选填，不配置则跳过发送)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Your Store <orders@yourdomain.com>

# 站点
SITE_URL=https://yourdomain.com
```

### Step 4: 数据库初始化

在 Supabase SQL Editor 中执行 `supabase-schema.sql`，会创建以下表：

| 表名 | 用途 |
|------|------|
| `carts` | 购物车 (visitor/user 双轨) |
| `orders` | 订单主表 (含状态机) |
| `order_items` | 订单商品快照 (不可变) |
| `payments` | 支付流水日志 |
| `order_events` | 订单审计日志 (trigger 自动写入) |
| `addresses` | 用户地址簿 |
| `reviews` | 商品评论 (含审核状态) |
| `admin_users` | 管理员标记表 |
| `coupons` | 优惠券/折扣码 |

所有表均已配置 RLS 策略，无需额外设置。

### Step 5: 复制模块文件

将以下目录整体复制到目标项目 `src/` 下：

```
src/
├── config/
│   ├── site.ts              # 货币/支付/运费配置
│   └── site-settings.ts     # UI 文案中控台
├── lib/
│   ├── supabase.ts          # Supabase 客户端封装
│   ├── paypal.ts            # PayPal REST API
│   ├── shipping.ts          # 运费计算
│   ├── email.ts             # Resend 邮件发送
│   ├── email-templates.ts   # 邮件 HTML 模板
│   └── payments/            # 支付 Provider 注册
│       ├── index.ts
│       ├── types.ts
│       └── providers/
│           ├── paypal.ts
│           ├── stripe.ts      (骨架)
│           └── bank-transfer.ts (骨架)
├── stores/
│   ├── auth.ts              # 认证状态
│   ├── cart.ts              # 购物车状态 + 服务端同步
│   └── checkout.ts          # 结账 + 优惠券状态
├── components/
│   ├── auth/                # 登录/注册/密码重置 (6个组件)
│   ├── commerce/            # 购物车页 + 结账页
│   ├── pdp/                 # 商品详情页组件 (6个)
│   ├── account/             # 用户中心 + 地址管理
│   └── admin/               # 订单管理 + 评论管理 + 优惠券管理
├── pages/api/
│   ├── cart/                # 购物车 CRUD + 同步 + 校验
│   ├── checkout/            # 订单创建 + 支付捕获 + 运费
│   ├── coupons/             # 优惠券验证
│   ├── account/             # 地址 CRUD + 订单迁移
│   ├── reviews/             # 评论提交 + 查询
│   ├── admin/               # 管理端 (订单/评论/发货通知)
│   └── webhooks/            # PayPal Webhook
└── content/
    └── config.ts            # 产品 Zod Schema
```

### Step 6: 适配目标站点

**必须修改的文件：**

1. **`src/config/site-settings.ts`** — 替换公司名、邮箱、电话、WhatsApp 等
2. **`src/config/site.ts`** — 如需修改货币 (默认 USD)
3. **`tailwind.config.mjs`** — 替换 `brand` 主色：
   ```js
   colors: {
     brand: {
       DEFAULT: '#你的品牌色',
       light: '#亮色',
       dark: '#暗色',
     },
   }
   ```

**创建产品内容：**

在 `src/content/products/` 下创建 Markdown 文件，遵循 `content/config.ts` 中的 Zod Schema：

```markdown
---
title: "Product Name"
slug: "product-name"
sku_prefix: "PROD"
basePrice: 29.99
featured_image: "/images/product.webp"
in_stock: true
---
Product description here.
```

### Step 7: 创建页面路由

模块只提供 API + 组件，页面需自行创建：

```
src/pages/
├── cart.astro           # 引入 <CartPage client:load />
├── checkout.astro       # 引入 <CheckoutPage client:load />
├── thank-you.astro      # 支付成功页
├── auth/
│   ├── login.astro      # 引入 <LoginForm client:load />
│   └── register.astro   # 引入 <RegisterForm client:load />
├── account/
│   └── addresses.astro  # 引入 <AddressManager client:load />
└── products/
    └── [slug].astro     # 引入 PDP 组件 (Gallery, Configurator 等)
```

页面模板示例 (`cart.astro`)：

```astro
---
import Layout from '@/layouts/Layout.astro';
import CartPage from '@/components/commerce/CartPage';
---
<Layout title="Shopping Cart">
  <CartPage client:load />
</Layout>
```

### Step 8: Astro 配置

确保 `astro.config.mjs` 启用 SSR 和 React：

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  integrations: [react(), tailwind()],
});
```

### Step 9: PayPal 上线切换

开发阶段使用沙箱，上线时：
1. 将 `.env` 中 `PAYPAL_SANDBOX=false`
2. 替换为生产环境的 `CLIENT_ID` 和 `CLIENT_SECRET`
3. 在 PayPal 开发者后台配置 Webhook URL: `https://yourdomain.com/api/webhooks/paypal`

---

## 模块架构图

```
浏览器 (React + Nano Stores)
  │
  ├── stores/cart.ts ──── localStorage 持久化
  ├── stores/checkout.ts ─ 地址 + 优惠券状态
  └── stores/auth.ts ──── Supabase Auth 监听
        │
        ▼
Astro API Routes (服务端)
  │
  ├── /api/cart/*        ← 购物车 CRUD + 防篡改校验
  ├── /api/coupons/*     ← 优惠券验证
  ├── /api/checkout/*    ← 订单创建 + 支付捕获 + 邮件通知
  └── /api/webhooks/*    ← PayPal Webhook
        │
        ▼
Supabase (PostgreSQL + Auth + RLS)
  │
  ├── carts / orders / order_items / payments
  ├── coupons (折扣码)
  ├── reviews / addresses / admin_users
  └── order_events (审计 trigger)
        │
        ▼
外部服务
  ├── PayPal REST API (支付)
  └── Resend API (邮件通知)
```

## API 端点速查表

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/cart` | GET/POST/PUT/DELETE | 购物车 CRUD |
| `/api/cart/sync` | POST | 批量同步购物车 |
| `/api/cart/validate` | POST | 结账前价格校验 |
| `/api/cart/merge` | POST | 登录后合并 Guest 购物车 |
| `/api/cart/clear` | POST | 清空购物车 |
| `/api/coupons/validate` | POST | 验证优惠券码 |
| `/api/checkout/create-order` | POST | 创建订单 + PayPal 订单 |
| `/api/checkout/capture-order` | POST | 捕获支付 + 发确认邮件 |
| `/api/checkout/shipping` | POST | 计算运费 |
| `/api/checkout/payment-methods` | GET | 获取可用支付方式 |
| `/api/account/addresses` | GET/POST/PUT/DELETE | 地址簿管理 |
| `/api/account/migrate-orders` | POST | Guest 订单迁移到账户 |
| `/api/reviews` | POST | 提交评论 |
| `/api/reviews/[slug]` | GET | 获取商品评论 |
| `/api/admin/orders` | GET | 管理员查看所有订单 |
| `/api/admin/orders/[id]` | GET/PATCH | 订单详情/更新状态 |
| `/api/admin/orders/[id]/notify` | POST | 发送发货通知邮件 |
| `/api/admin/reviews` | GET/POST | 评论审核列表 |
| `/api/admin/reviews/[id]` | PATCH | 审批/拒绝/回复评论 |
| `/api/admin/coupons` | GET/POST | 优惠券列表 + 创建 |
| `/api/admin/coupons/[id]` | PATCH/DELETE | 优惠券编辑/删除 |
| `/api/webhooks/paypal` | POST | PayPal Webhook 处理 |

## 优惠券管理

管理员可通过后台 UI 或 Supabase SQL 管理优惠券。

**后台 UI**（推荐）：在管理页面引入组件即可：
```astro
---
import CouponsManager from '@/components/admin/CouponsManager';
---
<CouponsManager client:load />
```

支持：创建/编辑/启停/删除优惠券，查看使用次数统计。

**SQL 方式**（批量操作）：
```sql
-- 百分比折扣：满 $50 打 9 折，限 100 次，年底过期
INSERT INTO coupons (code, type, value, min_order, max_uses, valid_to)
VALUES ('WELCOME10', 'percentage', 10, 50, 100, '2026-12-31');

-- 固定金额：减 $20，无门槛
INSERT INTO coupons (code, type, value, min_order)
VALUES ('SAVE20', 'fixed', 20, 0);

-- 停用优惠券
UPDATE coupons SET is_active = false WHERE code = 'WELCOME10';
```

---
**Maintainer**: ULX Studio
**Version**: 1.1.0 (Astro 5 Ready — with Email Notifications & Coupons)