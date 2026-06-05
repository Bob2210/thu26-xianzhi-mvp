'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

const ALLOWED_DOMAINS = ['@mails.tsinghua.edu.cn', '@tsinghua.org.cn'];
const ALLOWED_DOMAINS_LABEL = ALLOWED_DOMAINS.join(' / ');

/**
 * 登录页内部组件（使用 useSearchParams，必须包在 Suspense 里）
 * 两步流程：输入清华邮箱 → 输入验证码 → 自动登录
 */
function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  /** 第一步：发送验证码 */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailLower = email.toLowerCase().trim();
    if (!ALLOWED_DOMAINS.some((d) => emailLower.endsWith(d))) {
      setError(`仅限清华邮箱（${ALLOWED_DOMAINS_LABEL}）登录`);
      return;
    }

    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep('code');
    startResendTimer();
  };

  /** 第二步：验证验证码 */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError('请输入完整的 6 位验证码');
      return;
    }

    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: code,
      type: 'email',
    });
    setSubmitting(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    // 登录成功，跳转
    router.push(redirect);
    router.refresh();
  };

  /** 重新发送验证码 */
  const handleResend = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
    } else {
      startResendTimer();
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🎓</span>
        <h1 className="mt-2 text-xl font-bold text-slate-800">登录 {SITE_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">使用清华邮箱验证码登录</p>
      </div>

      {step === 'form' ? (
        /* ======== 第一步：输入邮箱 ======== */
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
              清华邮箱
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@mails.tsinghua.edu.cn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">支持 @mails.tsinghua.edu.cn（在校）/ @tsinghua.org.cn（校友）</p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
          >
            {submitting ? '发送中…' : '发送验证码'}
          </button>
        </form>
      ) : (
        /* ======== 第二步：输入验证码 ======== */
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="text-center text-sm text-slate-500">
            验证码已发送至
            <br />
            <span className="font-medium text-slate-700">{email}</span>
          </div>

          <div>
            <label htmlFor="login-code" className="block text-sm font-medium text-slate-700 mb-1">
              验证码
            </label>
            <input
              id="login-code"
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="输入 6 位验证码"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand text-sm text-center text-lg tracking-[0.5em]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-60"
          >
            {submitting ? '验证中…' : '登录'}
          </button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <span className="text-xs text-slate-400">{resendTimer} 秒后可重新发送</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-brand hover:underline"
              >
                重新发送验证码
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setCode('');
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              换个邮箱
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        没有账号？
        <Link href="/register" className="text-brand font-medium hover:underline">
          去注册
        </Link>
      </p>
    </div>
  );
}

/**
 * 登录页（Suspense 包装层）
 * Next.js 14 静态预渲染要求 useSearchParams 必须在 Suspense 边界内
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto pt-16 text-center text-slate-400">加载中…</div>}>
      <LoginInner />
    </Suspense>
  );
}
