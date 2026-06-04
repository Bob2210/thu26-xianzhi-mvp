'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function JoinGroupButton() {
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  // 取 Supabase Storage 公共 URL，加时间戳避免缓存
  const { data } = supabase.storage.from('assets').getPublicUrl('group-qr.png');
  const qrUrl = `${data.publicUrl}?t=${Date.now()}`;

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-brand-thu font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105 transition-all"
      >
        <span className="text-lg">💬</span>
        <span>加入紫荆闲置群</span>
        <span className="text-xs text-brand/60">→</span>
      </button>

      {/* 二维码弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 头部 */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1 mb-2">
                <span className="text-2xl">🌸</span>
              </div>
              <h3
                className="text-xl font-bold bg-gradient-to-r from-brand-thu via-brand to-brand-light bg-clip-text text-transparent"
                style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif' }}
              >
                紫荆闲置 · 校友群
              </h3>
              <p className="text-xs text-slate-500 mt-1">扫码加入清华 26 届闲置交流群</p>
            </div>

            {/* 二维码 */}
            <div className="bg-gradient-to-br from-brand-soft to-white p-4 rounded-2xl border-2 border-brand-soft">
              <img
                src={qrUrl}
                alt="群二维码"
                className="w-full aspect-square object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                  if (next) next.style.display = 'block';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="aspect-square flex flex-col items-center justify-center text-slate-400 text-sm"
              >
                <div className="text-4xl mb-2">📷</div>
                <div>二维码即将上线</div>
              </div>
            </div>

            {/* 底部提示 */}
            <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
              长按二维码识别 · 仅限清华校友<br />
              群内禁止广告 · 文明交易
            </p>
          </div>
        </div>
      )}
    </>
  );
}
