# 🎓 THU26 届毕业闲置售卖

> **清华大学 2026 届毕业生闲置物品交易平台**
>
> 毕业季 · 把学长学姐的好物留给学弟学妹 🌿

## 技术栈

| 层    | 技术                      |
| ----- | ------------------------- |
| 框架  | Next.js 14 (App Router)   |
| 认证  | Supabase Auth (邮箱密码)   |
| 数据库 | Supabase PostgreSQL       |
| 存储  | Supabase Storage (图片)    |
| 样式  | Tailwind CSS              |
| 部署  | Vercel                    |

## 功能清单

- [x] 用户注册 / 登录（邮箱 + 密码）
- [x] 邮箱验证
- [x] 发布闲置（标题、描述、价格、分类、多图上传）
- [x] 编辑 / 删除闲置
- [x] 标记商品为"已售出"
- [x] 商品列表（分类筛选 + 标题搜索）
- [x] 商品详情（大图轮播、卖家信息）
- [x] 联系卖家（手机号 / 微信号一键复制）
- [x] 个人中心（编辑资料、我的商品管理）
- [x] 移动端适配

## 快速开始

### 1. 创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 创建新项目
2. 在项目 Dashboard → **SQL Editor** 中，**完整复制并执行** `supabase/schema.sql`
3. 这会自动创建：
   - `profiles` 表（用户资料）
   - `products` 表（商品）
   - 触发器（`updated_at` 自动更新、新用户注册自动建 profile）
   - 行级安全策略（RLS）
4. 前往 **Storage** → 手动创建一个名为 **`product-images`** 的 **Public Bucket**（公开读）
5. 回到 SQL Editor，执行 `schema.sql` 中的 **Storage 策略部分**（从第 6 节开始），以设置上传/删除权限

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填入你的 Supabase 项目信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

你可以在 Supabase Dashboard → **Settings → API** 中找到这两个值。

### 3. 安装依赖并启动

```bash
cd xianzhi-mvp
npm install
npm run dev
```

访问 `http://localhost:3000` 即可看到首页。

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 前往 [vercel.com](https://vercel.com) → **Add New Project**
3. 导入该仓库
4. 在 **Environment Variables** 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 **Deploy**，等待部署完成
6. 在 Supabase Dashboard → **Authentication → Settings** 中，将 **Site URL** 设为你的 Vercel 域名（如 `https://your-app.vercel.app`），并在 **Redirect URLs** 中添加 `https://your-app.vercel.app/auth/callback`

## 项目结构

```
xianzhi-mvp/
├── supabase/
│   └── schema.sql                # 数据库完整 Schema
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 全局布局 (Navbar + Footer)
│   │   ├── page.tsx              # 首页（商品列表 + 筛选 + 搜索）
│   │   ├── globals.css           # 全局样式
│   │   ├── login/
│   │   │   └── page.tsx          # 登录页
│   │   ├── register/
│   │   │   └── page.tsx          # 注册页
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts      # 邮箱验证回调路由
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # 商品详情页
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx  # 编辑商品页
│   │   │   └── new/
│   │   │       └── page.tsx      # 发布商品页
│   │   └── profile/
│   │       └── page.tsx          # 个人中心
│   ├── components/
│   │   ├── Navbar.tsx            # 顶部导航栏
│   │   ├── ProductCard.tsx       # 商品卡片
│   │   ├── ProductGrid.tsx       # 商品网格
│   │   ├── CategoryFilter.tsx    # 分类筛选
│   │   ├── SearchBar.tsx         # 搜索框
│   │   ├── ImageCarousel.tsx     # 图片轮播
│   │   ├── ImageUploader.tsx     # 图片上传器
│   │   ├── ContactSellerButton.tsx  # 联系卖家按钮
│   │   └── ContactSellerModal.tsx   # 联系卖家弹窗
│   ├── lib/
│   │   ├── constants.ts          # 全局常量
│   │   ├── types.ts              # 类型定义
│   │   └── supabase/
│   │       ├── client.ts         # 浏览器端 Supabase 客户端
│   │       ├── server.ts         # 服务端 Supabase 客户端
│   │       └── middleware.ts     # 中间件 Supabase 客户端
│   └── middleware.ts             # Next.js 中间件（session 刷新）
├── .env.local.example            # 环境变量模板
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .gitignore
```

## 注意事项

- 图片上传限制：单张 ≤ 5MB，最多 6 张
- 注册后需要邮箱验证，请确保 Supabase Auth **已开启邮箱确认**
- 第一次启动前请务必先执行 `supabase/schema.sql`
- Storage bucket `product-images` 需要手动创建（Supabase 控制台 → Storage）

---

Made with 💚 for Tsinghua 2026
