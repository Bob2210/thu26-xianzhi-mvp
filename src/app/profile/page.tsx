'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { CATEGORY_LABEL } from '@/lib/constants';
import type { Profile, ProductWithSeller } from '@/lib/types';

/**
 * 个人中心
 * - 用户信息 + 编辑资料
 * - 我的商品列表（在售 / 已售出 tab）
 */
export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // 编辑资料状态
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 商品列表
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [tab, setTab] = useState<'on_sale' | 'sold'>('on_sale');

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (data) {
      const p = data as unknown as Profile;
      setProfile(p);
      setNickname(p.nickname);
      setPhone(p.phone ?? '');
      setWechat(p.wechat ?? '');
    }
  };

  const loadProducts = async (uid: string) => {
    setProductsLoading(true);
    const { data } = await supabase
      .from('products')
      .select(
        `
          id, seller_id, title, description, price, category, images, status, created_at, updated_at,
          seller:profiles!products_seller_id_fkey (id, nickname, avatar_url, phone, wechat)
        `
      )
      .eq('seller_id', uid)
      .order('created_at', { ascending: false });

    setProducts((data ?? []) as unknown as ProductWithSeller[]);
    setProductsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        await loadProfile(uid);
        await loadProducts(uid);
      }

      setLoading(false);
    };

    init();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!userId) return;

    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: nickname.trim() || emailName,
        phone: phone.trim() || null,
        wechat: wechat.trim() || null,
      })
      .eq('id', userId);

    setSaving(false);

    if (updateError) {
      setSaveError(updateError.message);
      return;
    }

    setEditMode(false);
    if (userId) await loadProfile(userId);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error && userId) {
      await loadProducts(userId);
    }
  };

  const handleMarkSold = async (productId: string) => {
    if (!confirm('标记为已售出？')) return;
    const { error } = await supabase
      .from('products')
      .update({ status: 'sold' })
      .eq('id', productId);
    if (!error && userId) {
      await loadProducts(userId);
    }
  };

  const emailName = profile?.nickname || '用户';
  const myProducts = products.filter((p) => p.status === tab);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center text-slate-400 text-sm">
        加载中…
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-slate-500">请先登录</p>
        <Link
          href="/login"
          className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 用户信息 / 编辑资料 */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">个人资料</h2>
          <button
            onClick={() => {
              if (editMode) {
                // 取消编辑，恢复原始值
                setNickname(profile?.nickname || '');
                setPhone(profile?.phone ?? '');
                setWechat(profile?.wechat ?? '');
                setSaveError(null);
              }
              setEditMode(!editMode);
            }}
            className="text-sm text-brand hover:underline"
          >
            {editMode ? '取消' : '编辑'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="选填，买家联系用"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">微信号</label>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="选填，买家联系用"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand text-sm"
              />
            </div>
            {saveError && (
              <p className="text-xs text-red-500">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-60"
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg overflow-hidden">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.nickname}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{profile?.nickname || '用户'}</div>
                <div className="text-xs text-slate-400">个人主页</div>
              </div>
            </div>
            {profile?.phone && (
              <div className="flex gap-2">
                <span className="text-slate-400 w-10">📱</span>
                <span className="text-slate-700">{profile.phone}</span>
              </div>
            )}
            {profile?.wechat && (
              <div className="flex gap-2">
                <span className="text-slate-400 w-10">💬</span>
                <span className="text-slate-700">{profile.wechat}</span>
              </div>
            )}
            {!profile?.phone && !profile?.wechat && (
              <p className="text-xs text-slate-400 py-1">
                还没有填写联系方式，快去编辑吧~
              </p>
            )}
          </div>
        )}
      </section>

      {/* 我的商品 */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3">我的闲置</h2>

        {/* Tab 切换 */}
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setTab('on_sale')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'on_sale'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            在售 ({products.filter((p) => p.status === 'on_sale').length})
          </button>
          <button
            onClick={() => setTab('sold')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'sold'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            已售出 ({products.filter((p) => p.status === 'sold').length})
          </button>
        </div>

        {productsLoading ? (
          <div className="text-center text-sm text-slate-400 py-8">加载中…</div>
        ) : myProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2">{tab === 'on_sale' ? '📭' : '✅'}</div>
            <p className="text-sm">{tab === 'on_sale' ? '还没有发布闲置哦' : '还没有已售出的商品'}</p>
            {tab === 'on_sale' && (
              <Link
                href="/products/new"
                className="mt-3 inline-block text-brand text-sm hover:underline"
              >
                去发布 →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {myProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 p-3 flex gap-3"
              >
                {/* 缩略图 */}
                <Link
                  href={`/products/${product.id}`}
                  className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-100 overflow-hidden"
                >
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">
                      📦
                    </div>
                  )}
                </Link>

                {/* 信息 */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-brand transition"
                    >
                      {product.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {CATEGORY_LABEL[product.category]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-dark font-bold text-sm">
                      ¥{Number(product.price).toFixed(0)}
                    </span>
                    {tab === 'on_sale' && (
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="text-xs text-slate-500 hover:text-brand transition"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleMarkSold(product.id)}
                          className="text-xs text-slate-500 hover:text-green-600 transition"
                        >
                          标记已售
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
