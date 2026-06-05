import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  if (!ADMIN_EMAILS.includes((user.email || '').toLowerCase())) {
    return NextResponse.json({ error: '无权限访问' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = data.users || [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  const totalUsers = users.length;
  const todayNew = users.filter((u) => {
    const created = new Date(u.created_at).getTime();
    return now - created < ONE_DAY;
  }).length;
  const last7DaysNew = users.filter((u) => {
    const created = new Date(u.created_at).getTime();
    return now - created < SEVEN_DAYS;
  }).length;
  const activeLast7Days = users.filter((u) => {
    if (!u.last_sign_in_at) return false;
    const last = new Date(u.last_sign_in_at).getTime();
    return now - last < SEVEN_DAYS;
  }).length;

  const { count: productCount } = await admin
    .from('products')
    .select('*', { count: 'exact', head: true });
  const { count: soldCount } = await admin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sold');

  const userList = users
    .map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return NextResponse.json({
    stats: {
      totalUsers,
      todayNew,
      last7DaysNew,
      activeLast7Days,
      totalProducts: productCount || 0,
      soldProducts: soldCount || 0,
      onSaleProducts: (productCount || 0) - (soldCount || 0),
    },
    users: userList,
  });
}
