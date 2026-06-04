'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * 简易大图轮播。点小图切换主图。
 * 移动端 1 列、桌面适中尺寸。
 */
export default function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-slate-100 flex items-center justify-center rounded-xl text-slate-300 text-5xl">
        📦
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
        <Image
          src={images[active]}
          alt={`${title} - 图 ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-contain"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === active ? 'border-brand' : 'border-transparent'
              }`}
            >
              <Image
                src={src}
                alt={`缩略图 ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
