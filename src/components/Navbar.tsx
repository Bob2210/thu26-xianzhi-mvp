'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * 顶部导航栏 · 紫荆主题
 */
export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setLoading(false);
    });
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-soft">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* 紫荆花徽标 */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-brand-light via-brand to-brand-thu flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <span className="text-lg">🌸</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="font-bold text-base sm:text-lg bg-gradient-to-r from-brand-thu via-brand to-brand-light bg-clip-text text-transparent tracking-wide"
              style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif' }}
            >
              紫荆闲置
            </span>
            <span className="text-[10px] text-brand/60 tracking-[0.2em] font-medium">
              THU · 2026
            </span>
          </div>
        </Link>

        {/* 导航按钮 */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-sm">
          {loading ? null : userId ? (
            <>
              <Link
                href="/products/new"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand to-brand-thu text-white font-medium hover:shadow-md hover:shadow-brand/30 transition-all"
              >
                ＋ 发布
              </Link>
              <Link
                href="/profile"
                className="px-3.5 py-1.5 rounded-full bg-brand-soft text-brand-dark font-medium hover:bg-brand-light/30 transition"
              >
                我的
              </Link>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-full text-slate-400 hover:text-brand-dark transition text-xs sm:text-sm"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full bg-brand-soft text-brand-dark font-medium hover:bg-brand-light/30 transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand to-brand-thu text-white font-medium hover:shadow-md hover:shadow-brand/30 transition-all"
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
