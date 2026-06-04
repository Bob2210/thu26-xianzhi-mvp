'use client';

import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 3;

interface ImageUploaderProps {
  images: File[];
  onChange: (files: File[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 计算缩放尺寸，最长边不超过 4000px
          let { width, height } = img;
          const MAX_DIM = 4000;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = height * MAX_DIM / width;
              width = MAX_DIM;
            } else {
              width = width * MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('无法创建画布')); return; }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('压缩失败')); return; }
            // 如果压缩后反而更大，用原文件
            const compressed = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed.size < file.size ? compressed : file);
          }, 'image/jpeg', 0.95);
        };
        img.onerror = () => reject(new Error('无法读取图片'));
        img.src = e.target!.result as string;
      };
      reader.onerror = () => reject(new Error('无法读取文件'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    const newFiles: File[] = [];
    const validFiles = Array.from(files).slice(0, remaining);

    for (const file of validFiles) {
      if (!file.type.startsWith('image/')) {
        setError('只支持图片文件');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`单张图片不能超过 10MB`);
        continue;
      }
      try {
        const compressed = await compressImage(file);
        newFiles.push(compressed);
      } catch {
        // 压缩失败就用原文件
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      const allFiles = [...images, ...newFiles];
      onChange(allFiles);

      // 生成预览
      const newPreviews = await Promise.all(
        newFiles.map(f => new Promise<string>((resolve) => {
          const url = URL.createObjectURL(f);
          resolve(url);
        }))
      );
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  }, [images, onChange, compressImage]);

  const removeImage = useCallback((index: number) => {
    const newFiles = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onChange(newFiles);
    setPreviews(newPreviews);

    // 释放旧 URL
    URL.revokeObjectURL(previews[index]);
  }, [images, previews, onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">商品图片</label>

      {images.length < MAX_IMAGES && (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <Upload className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-sm text-gray-500">点击上传（最多{MAX_IMAGES}张）</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt={`预览 ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        支持 JPG/PNG/WebP，单张不超过 10MB（自动压缩至 2-3MB）
      </p>
    </div>
  );
}
