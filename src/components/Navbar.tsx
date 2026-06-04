'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

/**
 * 顶部导航栏。
 * - 未登录：登录 / 注册
 * - 已登录：发布 / 个人中心 / 退出
 * 移动端简化为图标 + 短文案。
 */
export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初次拉取登录状态
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setLoading(false);
    });

    // 订阅登录状态变化
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-dark">
          <span className="text-xl">🎓</span>
          <span className="text-sm sm:text-base whitespace-nowrap">{SITE_NAME}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {loading ? null : userId ? (
            <>
              <Link
                href="/products/new"
                className="px-3 py-1.5 rounded-full bg-brand text-white hover:bg-brand-dark transition"
              >
                ＋ 发布
              </Link>
              <Link
                href="/profile"
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                我的
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-full bg-brand text-white hover:bg-brand-dark transition"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
