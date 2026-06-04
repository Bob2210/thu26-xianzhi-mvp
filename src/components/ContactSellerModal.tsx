'use client';

import { useState } from 'react';

/**
 * 联系卖家弹窗。展示卖家手机号、微信号，并提供一键复制。
 * - 当卖家未填写联系方式时，给出友好提示。
 */
export default function ContactSellerModal({
  open,
  onClose,
  nickname,
  phone,
  wechat,
}: {
  open: boolean;
  onClose: () => void;
  nickname: string;
  phone: string | null;
  wechat: string | null;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!open) return null;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      alert('复制失败，请手动选中复制');
    }
  };

  const hasContact = Boolean(phone || wechat);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">联系 {nickname}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {!hasContact ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            该卖家还没填写联系方式，<br />
            请先催 ta 去「我的 → 编辑资料」补充 😢
          </p>
        ) : (
          <div className="space-y-3">
            {phone && (
              <ContactRow
                label="手机号"
                value={phone}
                copied={copiedKey === 'phone'}
                onCopy={() => copy(phone, 'phone')}
              />
            )}
            {wechat && (
              <ContactRow
                label="微信号"
                value={wechat}
                copied={copiedKey === 'wechat'}
                onCopy={() => copy(wechat, 'wechat')}
              />
            )}
            <p className="text-xs text-slate-400 pt-2 text-center">
              请勿恶意骚扰卖家，文明交易 🌱
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 bg-slate-50 rounded-lg">
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-mono text-slate-800 truncate">{value}</div>
      </div>
      <button
        onClick={onCopy}
        className={`shrink-0 px-3 py-1.5 text-sm rounded-full transition ${
          copied
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-brand text-white hover:bg-brand-dark'
        }`}
      >
        {copied ? '已复制 ✓' : '复制'}
      </button>
    </div>
  );
}
