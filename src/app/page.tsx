import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import { SITE_SLOGAN } from '@/lib/constants';
import type { ProductWithSeller } from '@/lib/types';

// 不缓存，每次请求都拉最新商品
export const dynamic = 'force-dynamic';

/**
 * 首页：闲置商品列表。
 * 支持 ?category=xxx&q=xxx 两个查询参数。
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();

  // 构造查询：products + 联表 profiles
  let query = supabase
    .from('products')
    .select(
      `
        id, seller_id, title, description, price, category, images, status, created_at, updated_at,
        seller:profiles!products_seller_id_fkey (id, nickname, avatar_url, phone, wechat)
      `
    )
    .order('created_at', { ascending: false })
    .limit(60);

  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.q) {
    // 简单的 ilike 模糊搜索；后续可换成 Postgres FTS
    query = query.ilike('title', `%${searchParams.q}%`);
  }

  const { data, error } = await query;
  const products = (data ?? []) as unknown as ProductWithSeller[];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero / Slogan */}
      <section className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-100 rounded-2xl p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-800">
          {SITE_SLOGAN}
        </h1>
        <p className="mt-1.5 text-sm text-emerald-700/80">
          把陪你度过紫荆岁月的好物，继续传递下去 🌿
        </p>
      </section>

      {/* 搜索 + 分类 */}
      <SearchBar />
      <CategoryFilter />

      {/* 商品网格 */}
      {error ? (
        <div className="py-10 text-center text-red-500 text-sm">
          加载失败：{error.message}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
