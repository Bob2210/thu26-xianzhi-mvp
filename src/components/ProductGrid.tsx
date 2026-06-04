import ProductCard from './ProductCard';
import type { ProductWithSeller } from '@/lib/types';

/**
 * 商品网格 / 瀑布流。
 * 移动端 2 列、平板 3 列、桌面 4 列。
 */
export default function ProductGrid({ products }: { products: ProductWithSeller[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="text-5xl mb-2">🫥</div>
        <p>暂时没有符合条件的闲置</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
