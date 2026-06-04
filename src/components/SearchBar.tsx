'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * 搜索框，提交时通过 URL query (?q=xxx) 触发服务端重新查询。
 */
export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  // 处理浏览器前进后退导致 URL 变化时同步输入框
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索闲置标题，如 iPad、教材..."
        className="flex-1 px-4 py-2 rounded-full bg-white border border-slate-200 focus:outline-none focus:border-brand text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-brand text-white text-sm hover:bg-brand-dark transition"
      >
        🔍 搜索
      </button>
    </form>
  );
}
