import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_LABEL } from '@/lib/constants';
import type { ProductWithSeller } from '@/lib/types';

/**
 * 商品卡片。两列瀑布流布局下的单元。
 */
export default function ProductCard({ product }: { product: ProductWithSeller }) {
  const cover = product.images[0];
  const sold = product.status === 'sold';

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition"
    >
      <div className="relative aspect-square bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
            📦
          </div>
        )}
        {sold && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white text-sm sm:text-base font-bold border-2 border-white px-3 py-1 rounded">
              已售出
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-white/85 text-slate-700">
          {CATEGORY_LABEL[product.category]}
        </span>
      </div>

      <div className="p-2.5 sm:p-3">
        <h3 className="text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-end justify-between">
          <span className="text-brand-dark font-bold text-base sm:text-lg">
            ¥{Number(product.price).toFixed(0)}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-[60%] text-right">
            {product.seller?.nickname || '匿名'}
          </span>
        </div>
      </div>
    </Link>
  );
}
