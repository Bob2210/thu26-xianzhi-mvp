'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MAX_IMAGES_PER_PRODUCT, STORAGE_BUCKET } from '@/lib/constants';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
          if (file.size > MAX_FILE_SIZE) {
            setError('单张图片不能超过 10MB');
            continue;
          }

          const ext = file.name.split('.').pop() || 'jpg';
          const filename = `${userId}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, file, {
              cacheControl: '3600',
              upsert: false,
            });
          if (upErr) {
            setError(`上传失败：${upErr.message}`);
            continue;
          }
          const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
          newUrls.push(data.publicUrl);
        } catch (err: any) {
          setError(err?.message || '上传出错');
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
            <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            <button type="button" onClick={() => remove(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs">×</button>
          </div>
        ))}
        {value.length < MAX_IMAGES_PER_PRODUCT && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-brand hover:text-brand transition">
            <span className="text-2xl mb-1">＋</span>
            <span>{uploading ? '上传中…' : `${value.length}/${MAX_IMAGES_PER_PRODUCT}`}</span>
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={handleUpload} />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        最多 {MAX_IMAGES_PER_PRODUCT} 张，单张 ≤ 10MB，第一张作为主图
      </p>
    </div>
  );
}
