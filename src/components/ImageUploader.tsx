'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MAX_IMAGES_PER_PRODUCT, STORAGE_BUCKET } from '@/lib/constants';

/** 最大长边像素（超过则等比例缩小） */
const MAX_DIMENSION = 2048;
/** 目标大小上限：3MB */
const MAX_FILE_SIZE = 3 * 1024 * 1024;

/**
 * 在浏览器端压缩图片到 ≤MAX_FILE_SIZE
 * 先用最大尺寸约束，再逐步降低 JPEG 质量
 */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      const tryQuality = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'));
              return;
            }
            if (blob.size <= MAX_FILE_SIZE || q <= 0.1) {
              resolve(blob);
            } else {
              tryQuality(Math.round((q - 0.1) * 100) / 100);
            }
          },
          'image/jpeg',
          q
        );
      };
      tryQuality(0.85);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploader({
  value,
  onChange,
  userId,
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
        if (!file.type.startsWith('image/')) {
          setError('仅支持图片文件');
          continue;
        }

        const compressed = await compressImage(file);

        const ext = 'jpg';
        const filename = `${userId}/${crypto.randomUUID()}.${ext}`;
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
      }
      onChange([...value, ...newUrls]);
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
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES_PER_PRODUCT && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-brand hover:text-brand transition">
            <span className="text-2xl mb-1">＋</span>
            <span>{uploading ? '压缩上传中…' : `${value.length}/${MAX_IMAGES_PER_PRODUCT}`}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        最多 {MAX_IMAGES_PER_PRODUCT} 张，单张 ≤ 3MB（自动压缩），第一张作为主图
      </p>
    </div>
  );
}
