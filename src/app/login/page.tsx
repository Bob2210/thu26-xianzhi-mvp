'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
      options: {
        shouldCreateUser: true,
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
        {/* 品牌标识 */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-thu to-brand mb-3 shadow-lg shadow-brand/30">
          <span className="text-3xl">🌸</span>
        </div>
        {/* 品牌标题 - 衬线体 */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-brand mb-1 tracking-wide"
          style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif' }}
        >
          紫荆为念 · 好物相传
        </h1>
        {/* 新 slogan */}
        <p
          className="text-base sm:text-lg text-brand-dark font-medium tracking-widest"
          style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif' }}
        >
          紫荆市场 · 低价淘好货
        </p>
        {/* 分隔 */}
        <div className="my-4 mx-auto w-12 h-0.5 rounded-full bg-gradient-to-r from-transparent via-brand-light to-transparent" />
        <p className="text-sm text-slate-500">清华邮箱登录 · 点链接即可</p>
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
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {submitting ? '发送中…' : '发送验证链接'}
        </button>
      </form>
    </div>
  );
}
