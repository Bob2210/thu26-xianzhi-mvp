import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import JoinGroupButton from '@/components/JoinGroupButton';
import type { ProductWithSeller } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();
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
    query = query.ilike('title', `%${searchParams.q}%`);
  }

  const { data, error } = await query;
  const products = (data ?? []) as unknown as ProductWithSeller[];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero · 紫荆主题 */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-brand-thu via-brand to-brand-light shadow-xl shadow-brand/20">
        {/* 装饰图案 */}
        <div className="absolute -top-8 -right-8 text-[120px] sm:text-[160px] opacity-10 select-none rotate-12">
          🌸
        </div>
        <div className="absolute bottom-2 right-6 text-4xl sm:text-5xl opacity-20 select-none -rotate-12">
          🎓
        </div>
        <div className="absolute top-4 right-32 text-3xl opacity-15 select-none">
          ✨
        </div>

        {/* 内容 */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/95 text-xs font-medium tracking-wider mb-3">
            <span>🌸</span>
            <span>TSINGHUA · CLASS OF 2026</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold text-white mb-2 tracking-wide"
            style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif' }}
          >
            紫荆为念 · 好物相传
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-3 leading-relaxed max-w-md">
            把陪你度过清华园的每一件好物，<br className="sm:hidden" />
            继续传递给下一位紫荆少年 🌸
          </p>

          {/* 一键入群 CTA */}
          <div className="mt-5">
            <JoinGroupButton />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/80">
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              📚 仅限清华校内
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              🤝 当面交易
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              💜 校友信任
            </span>
          </div>
        </div>
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
