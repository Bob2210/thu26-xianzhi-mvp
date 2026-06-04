import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SITE_NAME} · 毕业闲置好物`,
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} · Made for Tsinghua 2026
          </p>
          <p className="max-w-xl mx-auto leading-relaxed">
            ⚠️ 本站为校内闲置物品信息展示平台，所有商品信息均由用户自行发布。
            平台方不对商品质量、真伪、交易过程等作任何形式的担保或核实。
            交易前请自行与卖家沟通确认，建议当面验货交易。平台不参与任何交易环节，亦不承担相应责任。
          </p>
        </footer>
      </body>
    </html>
  );
}
