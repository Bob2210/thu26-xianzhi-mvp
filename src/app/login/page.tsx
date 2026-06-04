'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

const ALLOWED_DOMAIN = '@mails.tsinghua.edu.cn';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith(ALLOWED_DOMAIN)) {
      setError(`仅限清华邮箱（${ALLOWED_DOMAIN}）登录`);
      return;
    }

    setSubmitting(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);

    if (sendError) { setError(sendError.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto pt-8 sm:pt-16 text-center">
        <span className="text-4xl">📬</span>
        <h1 className="mt-2 text-xl font-bold text-slate-800">验证链接已发送</h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          请检查你的清华邮箱<br />
          <span className="font-medium text-slate-700">{email}</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">点击邮件中的链接即可自动登录</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🎓</span>
        <h1 className="mt-2 text-xl font-bold text-slate-800">登录 {SITE_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">使用清华邮箱，点链接即可登录</p>
      </div>

      <form onSubmit={handleSendLink} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">清华邮箱</label>
          <input id="login-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@mails.tsinghua.edu.cn"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm" />
          <p className="mt-1 text-xs text-slate-400">仅限 @mails.tsinghua.edu.cn 邮箱</p>
        </div>

        {error && <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

        <button type="submit" disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60">
          {submitting ? '发送中…' : '发送验证链接'}
        </button>
      </form>
    </div>
  );
}
