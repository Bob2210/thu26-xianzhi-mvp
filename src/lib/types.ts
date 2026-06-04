// =====================================================================
// 全局类型定义
// =====================================================================

/** 商品分类枚举（与数据库 check 约束保持一致） */
export type ProductCategory =
  | 'electronics'
  | 'books'
  | 'home'
  | 'clothing'
  | 'sports'
  | 'other';

/** 商品状态 */
export type ProductStatus = 'on_sale' | 'sold';

/** 用户公开资料（profiles 表） */
export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  phone: string | null;
  wechat: string | null;
  created_at: string;
  updated_at: string;
}

/** 商品（products 表） */
export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

/** 商品 + 卖家信息（联表查询用） */
export interface ProductWithSeller extends Product {
  seller: Pick<Profile, 'id' | 'nickname' | 'avatar_url' | 'phone' | 'wechat'>;
}
