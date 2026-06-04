'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ImageUploader';
import { CATEGORIES, SITE_NAME } from '@/lib/constants';
import type { ProductCategory, Profile } from '@/lib/types';

/**
 * 发布商品页
 * 必须先填写联系方式才能发布。
 */
export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();
        setProfile((data ?? null) as unknown as Profile | null);
      }

      setLoadingUser(false);
    };

    init();
  }, [supabase]);

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

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        seller_id: userId,
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        images,
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/products/${newProduct.id}`);
    router.refresh();
  };

  if (loadingUser) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center text-slate-400 text-sm">
        检查登录状态…
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-slate-500">请先登录后再发布商品</p>
        <a
          href="/login"
          className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition"
        >
          去登录
        </a>
      </div>
    );
  }

  // 检查是否已填写联系方式
  if (!profile?.phone && !profile?.wechat) {
    return (
      <div className="max-w-lg mx-auto pt-8 sm:pt-16 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">先填写联系方式</h1>
        <p className="text-sm text-slate-500 mb-6">
          发布商品前需要先填写手机号或微信号
          <br />
          方便买家联系你
        </p>
        <Link
          href="/profile"
          className="inline-block px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition"
        >
          去填写
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-4 sm:pt-8">
      <h1 className="text-xl font-bold text-slate-800 mb-6">发布闲置</h1>

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
            id="title" type="text" required maxLength={100}
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：全新 iPad Air 保护壳"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            描述
          </label>
          <textarea
            id="description" rows={4} maxLength={2000}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="描述商品状况、使用时间、购买渠道等…"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm resize-none"
          />
          <p className="mt-1 text-xs text-slate-400">{description.length}/2000</p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
            价格（元）
          </label>
          <input
            id="price" type="number" required min={0} step={0.01}
            value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            分类
          </label>
          <select
            id="category" value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit" disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
        >
          {submitting ? '发布中…' : '发布闲置'}
        </button>
      </form>
    </div>
  );
}
