'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MAX_IMAGES_PER_PRODUCT, STORAGE_BUCKET } from '@/lib/constants';

/** 最大长边像素 */
const MAX_DIMENSION = 2048;

/** 用 FileReader + createImageBitmap 压缩图片 */
async function compressImage(file: File): Promise<Blob> {
  // 1. 读取为 ArrayBuffer
  const buf = await file.arrayBuffer();

  // 2. 解码为 ImageBitmap
  const bitmap = await createImageBitmap(buf, { colorSpaceConversion: 'none' });

  // 3. 计算缩放
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 4. canvas 绘制
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // 5. 输出 JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('压缩失败')); return; }
      resolve(blob);
    }, 'image/jpeg', 0.8);
  });
}

export default function ImageUploader({
  value, onChange, userId,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  userId: string;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remain = MAX_IMAGES_PER_PRODUCT - value.length;
    if (remain <= 0) {
      setError(`最多上传 ${MAX_IMAGES_PER_PRODUCT} 张图片`);
      return;
    }
    const toUpload = files.slice(0, remain);

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of toUpload) {
        try {
          if (!file.type.startsWith('image/')) {
            setError('仅支持图片文件');
            continue;
          }

          const compressed = await compressImage(file);
          const filename = `${userId}/${crypto.randomUUID()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, compressed, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg',
            });
          if (upErr) {
            setError(`上传失败：${upErr.message}`);
            continue;
          }
          const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
          newUrls.push(data.publicUrl);
        } catch (err: any) {
          setError(err?.message || '图片处理出错');
        }
      }
      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
            <Image src={url} alt="已上传图片" fill sizes="120px" className="object-cover" />
            <button type="button" onClick={() => remove(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs">×</button>
          </div>
        ))}
        {value.length < MAX_IMAGES_PER_PRODUCT && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-brand hover:text-brand transition">
            <span className="text-2xl mb-1">＋</span>
            <span>{uploading ? '压缩上传中…' : `${value.length}/${MAX_IMAGES_PER_PRODUCT}`}</span>
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={handleUpload} />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        最多 {MAX_IMAGES_PER_PRODUCT} 张，自动压缩，第一张作为主图
      </p>
    </div>
  );
}
