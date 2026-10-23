export type ProductColor = { id: string; name: string; hex: string; images: string[] };
export type Product = {
  id: string; slug: string; name: string; category: string; gender: 'men' | 'women' | 'unisex';
  price: number; compareAtPrice?: number; badge?: string; description: string; images: string[];
  colors: ProductColor[]; sizes: string[]; material: string; featured: boolean; createdAt: string;
  salesRank: number; keywords: string[];
};
export type CartItem = { variantId: string; productId: string; name: string; image: string; color: string; colorId: string; size: string; unitPrice: number; quantity: number };
export type Order = {
  reference: string; createdAt: string; items: CartItem[]; totalCents: number;
  checkout?: { courier: 'jnt' | 'jne' | 'sicepat'; payment: 'qris' | 'va' | 'bank'; subtotalCents: number; shippingCents: number };
};
