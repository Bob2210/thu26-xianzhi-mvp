'use client';

import { useState } from 'react';
import ContactSellerModal from './ContactSellerModal';

/**
 * 详情页底部固定的「联系卖家」按钮 + 弹窗。
 * 拆成独立 Client Component，让详情页主体可以保持 Server Component。
 */
export default function ContactSellerButton({
  nickname,
  phone,
  wechat,
}: {
  nickname: string;
  phone: string | null;
  wechat: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition shadow-sm"
      >
        📞 联系卖家
      </button>
      <ContactSellerModal
        open={open}
        onClose={() => setOpen(false)}
        nickname={nickname}
        phone={phone}
        wechat={wechat}
      />
    </>
  );
}
