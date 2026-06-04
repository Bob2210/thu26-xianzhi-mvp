-- =====================================================================
-- THU26届毕业闲置售卖 - 数据库 Schema
-- 直接在 Supabase 控制台 → SQL Editor 中执行
-- =====================================================================

-- ============ 1. 用户扩展信息表 (profiles) ============
-- auth.users 是 Supabase 内置表，仅存账号凭据，
-- 这里扩展一张 profiles 表存昵称、头像、手机号、微信号等。
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  avatar_url text,
  phone text,        -- 手机号（用于"联系卖家"）
  wechat text,       -- 微信号（用于"联系卖家"）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ 2. 商品表 (products) ============
-- 分类：electronics / books / home / clothing / sports / other
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null check (category in ('electronics','books','home','clothing','sports','other')),
  images text[] not null default '{}',     -- 公共 URL 数组，最多 6 张
  status text not null default 'on_sale' check (status in ('on_sale','sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 索引：方便筛选/搜索/排序
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_products_seller on public.products(seller_id);

-- ============ 3. 自动维护 updated_at ============
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============ 4. 新用户注册时自动建 profile ============
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 5. 行级安全策略 (RLS)
-- =====================================================================

-- ---- profiles ----
alter table public.profiles enable row level security;

-- 任何人都能看其他用户的公开 profile（用于商品页展示卖家信息）
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- 只能修改自己的 profile
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 只能为自己 insert profile（一般由 trigger 自动建，保留兜底）
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---- products ----
alter table public.products enable row level security;

-- 所有人都能看商品列表 & 详情
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

-- 只有登录用户能发布，且 seller_id 必须是自己
drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own" on public.products
  for insert with check (auth.uid() = seller_id);

-- 只能改自己的商品
drop policy if exists "products_update_own" on public.products;
create policy "products_update_own" on public.products
  for update using (auth.uid() = seller_id);

-- 只能删自己的商品
drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own" on public.products
  for delete using (auth.uid() = seller_id);

-- =====================================================================
-- 6. Storage Bucket 策略
-- =====================================================================
-- ⚠️ 请先在 Supabase 控制台 → Storage 手动创建一个名为 `product-images`
--    的 Public Bucket（公开读），然后再执行下面的策略 SQL。
-- =====================================================================

-- 任何人都能读取（已通过 Public Bucket 设置，此处保留兜底策略）
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

-- 仅登录用户能上传，且文件路径第一层必须是自己的 user id
-- 前端约定文件路径：{user_id}/{uuid}.{ext}
drop policy if exists "product_images_user_upload" on storage.objects;
create policy "product_images_user_upload" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 仅能删自己上传的图片
drop policy if exists "product_images_user_delete" on storage.objects;
create policy "product_images_user_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 仅能更新自己上传的图片
drop policy if exists "product_images_user_update" on storage.objects;
create policy "product_images_user_update" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
