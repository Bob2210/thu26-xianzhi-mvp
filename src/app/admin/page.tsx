'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  todayNew: number;
  last7DaysNew: number;
  activeLast7Days: number;
  totalProducts: number;
  soldProducts: number;
  onSaleProducts: number;
}

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { hour12: false });
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/login?redirect=/admin');
          return;
        }
        if (res.status === 403) {
          setError('你没有访问管理后台的权限');
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || '加载失败');
        } else {
          setStats(json.stats);
          setUsers(json.users);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-purple-700">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <div className="text-lg font-medium text-slate-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-900">
              🌸 紫荆闲置 · 管理后台
            </h1>
            <p className="text-sm text-slate-500 mt-1">仅管理员可见</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition shadow"
          >
            🔄 刷新
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="总注册人数" value={stats.totalUsers} icon="👥" color="from-purple-500 to-purple-700" />
            <StatCard label="今日新增" value={stats.todayNew} icon="✨" color="from-pink-500 to-pink-600" />
            <StatCard label="近 7 天新增" value={stats.last7DaysNew} icon="📈" color="from-indigo-500 to-indigo-700" />
            <StatCard label="近 7 天活跃" value={stats.activeLast7Days} icon="🔥" color="from-orange-500 to-orange-600" />
            <StatCard label="商品总数" value={stats.totalProducts} icon="📦" color="from-blue-500 to-blue-700" />
            <StatCard label="在售商品" value={stats.onSaleProducts} icon="🏷️" color="from-emerald-500 to-emerald-700" />
            <StatCard label="已售商品" value={stats.soldProducts} icon="✅" color="from-slate-500 to-slate-700" />
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-purple-900 mb-4">
            📋 注册用户列表（按注册时间倒序）
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-purple-100 text-left text-purple-700">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">邮箱</th>
                  <th className="py-3 px-2">注册时间</th>
                  <th className="py-3 px-2">最近登录</th>
                  <th className="py-3 px-2">邮箱验证</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 hover:bg-purple-50 transition"
                  >
                    <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-800 break-all">
                      {u.email}
                    </td>
                    <td className="py-2 px-2 text-slate-600 whitespace-nowrap">
                      {formatTime(u.created_at)}
                    </td>
                    <td className="py-2 px-2 text-slate-600 whitespace-nowrap">
                      {formatTime(u.last_sign_in_at)}
                    </td>
                    <td className="py-2 px-2">
                      {u.email_confirmed_at ? (
                        <span className="text-emerald-600">✅</span>
                      ) : (
                        <span className="text-slate-400 text-xs">未验证</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      还没有用户注册
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-3xl p-4 shadow-lg bg-gradient-to-br ${color} text-white`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs opacity-90 mt-1">{label}</div>
    </div>
  );
}
