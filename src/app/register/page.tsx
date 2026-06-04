'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

const ALLOWED_DOMAIN = '@mails.tsinghua.edu.cn';

export default function RegisterPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith(ALLOWED_DOMAIN)) {
      setError(`仅限清华邮箱（${ALLOWED_DOMAIN}）注册`);
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto pt-8 sm:pt-16">
        <div className="text-center mb-8">
          <span className="text-4xl">✉️</span>
          <h1 className="mt-2 text-xl font-bold text-slate-800">验证邮件已发送</h1>
          <p className="mt-4 text-sm text-slate-500">
            请前往
            <br />
            <span className="font-medium text-slate-700">{email}</span>
            <br />
            查收登录链接，点击即可自动登录
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            换个邮箱
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🎓</span>
        <h1 className="mt-2 text-xl font-bold text-slate-800">注册 {SITE_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">使用清华邮箱验证，仅限校内同学</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
            清华邮箱
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@mails.tsinghua.edu.cn"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">仅限 @mails.tsinghua.edu.cn 邮箱</p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
        >
          {submitting ? '发送中…' : '发送登录链接'}
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
