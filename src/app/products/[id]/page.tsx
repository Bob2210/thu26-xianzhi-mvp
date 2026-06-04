import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import ImageCarousel from '@/components/ImageCarousel';
import ContactSellerButton from '@/components/ContactSellerButton';
import { CATEGORY_LABEL, CATEGORIES } from '@/lib/constants';
import type { ProductWithSeller } from '@/lib/types';

// 不缓存，每次请求都拉最新
export const dynamic = 'force-dynamic';

/**
 * 商品详情页
 * 展示大图轮播、标题、价格、分类、描述、发布时间，
 * 以及卖家信息卡片和「联系卖家」按钮。
 */
export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
        id, seller_id, title, description, price, category, images, status, created_at, updated_at,
        seller:profiles!products_seller_id_fkey (id, nickname, avatar_url, phone, wechat)
      `
    )
    .eq('id', params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as unknown as ProductWithSeller;
  const categoryInfo = CATEGORIES.find((c) => c.value === product.category);

  const sold = product.status === 'sold';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* 图片轮播 */}
      <ImageCarousel images={product.images} title={product.title} />

      {/* 基本信息 */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{product.title}</h1>
          {sold && (
            <span className="shrink-0 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
              已售出
            </span>
          )}
        </div>

        <div className="mt-2 text-2xl sm:text-3xl font-bold text-brand-dark">
          ¥{Number(product.price).toFixed(2)}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {categoryInfo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100">
              {categoryInfo.emoji} {categoryInfo.label}
            </span>
          )}
          <span>
            {new Date(product.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* 描述 */}
      {product.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">商品描述</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* 卖家信息卡片 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg overflow-hidden shrink-0">
          {product.seller?.avatar_url ? (
            <Image
              src={product.seller.avatar_url}
              alt={product.seller.nickname}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            '👤'
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800">
            {product.seller?.nickname || '匿名'}
          </div>
          <div className="text-xs text-slate-400">卖家</div>
        </div>
      </div>

      {/* 联系卖家按钮 */}
      <ContactSellerButton
        nickname={product.seller?.nickname || '卖家'}
        phone={product.seller?.phone ?? null}
        wechat={product.seller?.wechat ?? null}
      />

      {/* 底部留白 */}
      <div className="h-8" />
    </div>
  );
}
