'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

/**
 * 注册页
 * 邮箱 + 密码 + 昵称注册。nickname 写入 user_metadata，
 * 由数据库 trigger（handle_new_user）自动插入 profiles 表。
 */
export default function RegisterPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() || email.split('@')[0] },
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto pt-8 sm:pt-16 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h1 className="text-xl font-bold text-slate-800">注册成功！</h1>
        <p className="mt-2 text-sm text-slate-500">
          验证邮件已发送至 <span className="font-medium text-slate-700">{email}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">请查收邮件并点击确认链接完成注册。</p>
        <Link
          href="/login"
          className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🎓</span>
        <h1 className="mt-2 text-xl font-bold text-slate-800">注册 {SITE_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">加入清华毕业闲置好物社区</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-1">
            昵称
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="想让大家怎么称呼你？"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            密码
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
        >
          {submitting ? '注册中…' : '注册'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        已有账号？
        <Link href="/login" className="text-brand font-medium hover:underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
