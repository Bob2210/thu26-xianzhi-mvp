import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 邮箱验证回调路由
 * Supabase Auth 发送的确认链接会跳转到此。
 * 从 URL 取 code → exchangeCodeForSession → 重定向到首页。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 出错或没有 code，仍重定向到首页（让登录页兜底）
  console.error('Auth callback error: missing code or exchange failed');
  return NextResponse.redirect(`${origin}/?auth_error=callback_failed`);
}
