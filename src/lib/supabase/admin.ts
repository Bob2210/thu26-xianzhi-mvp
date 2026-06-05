import { createClient } from '@supabase/supabase-js';

/**
 * 服务端管理员客户端（使用 service_role key，拥有完整权限）。
 * 只能在 Route Handler / Server Action 中使用，绝不可在客户端引入！
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
