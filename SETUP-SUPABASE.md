# Supabase 配置指南 - BabyProps.io

> **Task-0.2: 配置环境变量和 Supabase**

本指南将帮助你完成 Supabase 数据库的配置。

---

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息:
   - **Name:** babyprops-io
   - **Database Password:** 设置一个强密码(请保存好)
   - **Region:** 选择离你的目标用户最近的区域
   - **Pricing Plan:** Free tier (开发测试) 或 Pro (生产环境)
4. 点击 "Create new project"
5. 等待 2-3 分钟,项目初始化完成

---

## 步骤 2: 获取 API 凭据

1. 在项目 Dashboard,点击左侧菜单 **Settings** (齿轮图标)
2. 点击 **API**
3. 找到以下信息:
   - **Project URL** - 复制到 `PUBLIC_SUPABASE_URL`
   - **anon public** key - 复制到 `PUBLIC_SUPABASE_ANON_KEY`

4. 更新 `.env` 文件:

```env
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 步骤 3: 运行数据库 Schema

### 方式 1: 使用 Supabase SQL Editor (推荐)

1. 在 Supabase Dashboard,点击左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 打开项目中的 `supabase-schema.sql` 文件
4. 复制所有内容
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 按钮执行
7. 确认没有错误信息

### 方式 2: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 链接到你的项目
supabase link --project-ref your-project-ref

# 运行 schema
supabase db push
```

---

## 步骤 4: 验证数据库表

执行完 schema 后,在 **Table Editor** 中应该看到以下表:

### 核心表

- ✅ `carts` - 购物车
- ✅ `addresses` - 用户地址
- ✅ `orders` - 订单
- ✅ `order_items` - 订单明细
- ✅ `payments` - 支付记录
- ✅ `order_events` - 订单事件日志
- ✅ `reviews` - 产品评论
- ✅ `admin_users` - 管理员
- ✅ `coupons` - 优惠券

### 视图 (Views)

- ✅ `orders_summary` - 订单汇总
- ✅ `product_review_stats` - 评论统计
- ✅ `admin_orders_view` - 管理员订单视图

---

## 步骤 5: 配置 Row Level Security (RLS)

Schema 已自动配置了 RLS 策略,但需要确认已启用:

1. 在 **Authentication** > **Policies** 中检查各表的策略
2. 确保 RLS 已在所有表上启用 (Enable RLS)

---

## 步骤 6: (可选) 创建管理员账户

如果需要访问管理功能,需要创建管理员用户:

1. 在 **SQL Editor** 中运行:

```sql
-- 首先创建一个用户账户 (通过注册页面或直接创建)
-- 假设用户 ID 为: 'your-user-uuid-here'

-- 将用户设为管理员
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'super_admin');
```

---

## 步骤 7: 测试连接

1. 启动开发服务器:

```bash
npm run dev
```

2. 访问 http://localhost:4321
3. 打开浏览器开发者工具,检查是否有 Supabase 连接错误
4. 测试添加商品到购物车功能

---

## 常见问题

### Q: 看到 "Invalid API key" 错误?

**A:** 检查 `.env` 文件:
- 确保 `PUBLIC_SUPABASE_URL` 和 `PUBLIC_SUPABASE_ANON_KEY` 没有多余的空格
- 确保使用的是 `anon public` key,而不是 `service_role` key
- 重启开发服务器 (`npm run dev`)

### Q: 看到 "relation does not exist" 错误?

**A:** 数据库表未创建成功:
- 重新运行 `supabase-schema.sql`
- 在 SQL Editor 中检查是否有报错
- 确认 Table Editor 中能看到所有表

### Q: RLS 策略导致查询失败?

**A:** 临时禁用 RLS 测试:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```
⚠️ 生产环境必须启用 RLS!

---

## 下一步

完成 Supabase 配置后,继续执行:

- **Task-0.3:** 配置 Tailwind 品牌色
- **Task-0.4:** 配置 site-settings.ts

---

**完成时间:** 约 10-15 分钟
**难度:** ⭐⭐☆☆☆

如有问题,请参考 [Supabase 官方文档](https://supabase.com/docs)
