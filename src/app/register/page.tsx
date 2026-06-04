'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';

const ALLOWED_DOMAIN = '@mails.tsinghua.edu.cn';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

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
        if (t <= 1) { clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith(ALLOWED_DOMAIN)) {
      setError(`仅限清华邮箱（${ALLOWED_DOMAIN}）注册`);
      return;
    }
    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);
    if (otpError) { setError(otpError.message); return; }
    setStep('code');
    startResendTimer();
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) { setError('请输入完整的 6 位验证码'); return; }
    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: code,
      type: 'email',
    });
    setSubmitting(false);
    if (verifyError) { setError(verifyError.message); return; }
    router.push('/');
    router.refresh();
  };

  const handleResend = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: { shouldCreateUser: true },
    });
    if (error) setError(error
