'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';

/**
 * 分类筛选条。基于 URL query (?category=xxx) 控制状态，
 * 便于 Server Component 拉取数据时直接读取。
 */
export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') ?? '';

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('category', value);
    else params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => setCategory('')}
        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition ${
          !active
            ? 'bg-brand text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        全部
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => setCategory(c.value)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition ${
            active === c.value
              ? 'bg-brand text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  );
}
