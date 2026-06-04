'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ImageUploader';
import { CATEGORIES } from '@/lib/constants';
import type { ProductCategory, Product } from '@/lib/types';

/**
 * 编辑商品页
 * 加载现有商品数据，预填表单，提交后更新。
 */
export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [notOwner, setNotOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 获取当前用户
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id ?? null;
      setUserId(currentUserId);
      setLoadingUser(false);

      // 加载商品
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (fetchError || !product) {
        setNotFound(true);
        setLoadingProduct(false);
        return;
      }

      const p = product as unknown as Product;

      if (currentUserId && p.seller_id !== currentUserId) {
        setNotOwner(true);
        setLoadingProduct(false);
        return;
      }

      setTitle(p.title);
      setDescription(p.description);
      setPrice(String(Number(p.price)));
      setCategory(p.category);
      setImages(p.images);
      setLoadingProduct(false);
    };

    init();
  }, [supabase, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError('请先登录');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('请输入有效价格');
      return;
    }

    if (!title.trim()) {
      setError('请输入商品标题');
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        images,
      })
      .eq('id', params.id);

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/products/${params.id}`);
    router.refresh();
  };

  if (loadingUser || loadingProduct) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center text-slate-400 text-sm">
        加载中…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-slate-500">商品不存在或已被删除</p>
        <a href="/" className="mt-4 inline-block text-brand text-sm hover:underline">
          返回首页
        </a>
      </div>
    );
  }

  if (notOwner) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <div className="text-4xl mb-3">🚫</div>
        <p className="text-slate-500">你没有权限编辑此商品</p>
        <a href="/" className="mt-4 inline-block text-brand text-sm hover:underline">
          返回首页
        </a>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-slate-500">请先登录</p>
        <a
          href="/login"
          className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition"
        >
          去登录
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-4 sm:pt-8">
      <h1 className="text-xl font-bold text-slate-800 mb-6">编辑闲置</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            商品图片
          </label>
          <ImageUploader value={images} onChange={setImages} userId={userId} />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            标题
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            描述
          </label>
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm resize-none"
          />
          <p className="mt-1 text-xs text-slate-400">{description.length}/2000</p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
            价格（元）
          </label>
          <input
            id="price"
            type="number"
            required
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            分类
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
          >
            {submitting ? '保存中…' : '保存修改'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
