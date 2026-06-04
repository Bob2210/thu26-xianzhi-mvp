import type { ProductCategory } from './types';

/** 网站基本信息 */
export const SITE_NAME = 'THU毕业闲置售卖';
export const SITE_SLOGAN = '毕业季 · 闲置好物';
export const SITE_DESCRIPTION =
  '清华大学毕业生闲置物品交易平台';

/** 商品分类（key 与数据库 check 约束保持一致） */
export const CATEGORIES: { value: ProductCategory; label: string; emoji: string }[] = [
  { value: 'electronics', label: '电子产品', emoji: '💻' },
  { value: 'books', label: '书籍教材', emoji: '📚' },
  { value: 'home', label: '家居生活', emoji: '🛋️' },
  { value: 'clothing', label: '服饰', emoji: '👕' },
  { value: 'sports', label: '运动器材', emoji: '🏸' },
  { value: 'other', label: '其他', emoji: '🎁' },
];

/** category 值 → 中文 label 查表 */
export const CATEGORY_LABEL: Record<ProductCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<ProductCategory, string>
);

/** 单个商品最多图片数 */
export const MAX_IMAGES_PER_PRODUCT = 3;

/** Supabase Storage bucket 名 */
export const STORAGE_BUCKET = 'product-images';
