import type { Product } from '../types/product.ts';

const image = (name: string) => `/images/${name}.jpg`;
const rows: [string, string, Product['gender'], number, string, string, string, string][] = [
  ['Everyday Knit Runner', 'Sneakers', 'women', 105, 'shoe-02', 'White', '#e5e2da', 'Knit'],
  ['Coast Canvas', 'Sneakers', 'men', 85, 'shoe-08', 'Blue', '#526c91', 'Canvas'],
  ['Form Court', 'Sneakers', 'unisex', 115, 'shoe-16', 'White', '#e9e5da', 'Cotton'],
  ['City Low', 'Sneakers', 'men', 120, 'shoe-24', 'Black', '#272727', 'Leather'],
  ['Canvas High', 'Sneakers', 'unisex', 95, 'shoe-23', 'Black', '#282828', 'Canvas'],
  ['Coast Slip On', 'Slip Ons', 'men', 90, 'shoe-18', 'Blue', '#8495ad', 'Suede'],
  ['Studio Loafer', 'Slip Ons', 'men', 125, 'shoe-19', 'Black', '#272727', 'Suede'],
  ['Daybreak Sandal', 'Sandals', 'women', 65, 'shoe-20', 'Blue', '#a7bec5', 'Leather'],
  ['Poolside Slide', 'Slides', 'women', 60, 'shoe-21', 'Pink', '#a53f73', 'Leather'],
  ['Essential Sandal', 'Sandals', 'women', 75, 'shoe-22', 'White', '#eee8df', 'Leather'],
  ['Weekend High', 'Sneakers', 'unisex', 95, 'hero-street', 'White', '#d9d4c8', 'Canvas'],
  ['Weekend Low', 'Sneakers', 'unisex', 85, 'hero-detail', 'Yellow', '#b79d5e', 'Canvas'],
  ['Motion Runner', 'Running Shoes', 'men', 140, 'shoe-01', 'Grey', '#8b8c89', 'Mesh'],
  ['Pace Runner', 'Running Shoes', 'women', 130, 'shoe-06', 'Black', '#252525', 'Mesh'],
  ['Terrain Runner', 'Running Shoes', 'unisex', 135, 'shoe-11', 'Green', '#b7c9c2', 'Mesh'],
  ['Harbor Slip On', 'Slip Ons', 'men', 100, 'shoe-14', 'Blue', '#4b6474', 'Suede'],
  ['Flex Knit Slip On', 'Slip Ons', 'women', 95, 'shoe-17', 'Black', '#292929', 'Knit'],
];

export const products: Product[] = rows.map(([name, category, gender, price, asset, color, hex, material], index) => ({
  id: `nf-${String(index + 1).padStart(2, '0')}`, slug: name.toLowerCase().replaceAll(' ', '-'), name, category, gender, price,
  compareAtPrice: index === 1 ? 105 : undefined, badge: index < 4 ? 'New' : index === 12 ? 'Bestseller' : undefined,
  description: `${name}. An easy-going ${category === 'Running Shoes' ? 'athletic' : 'everyday'} silhouette with a ${color.toLowerCase()} finish. Find your own pace, from the first step to the last stop.`,
  images: [image(asset)], colors: [{ id: color.toLowerCase(), name: color, hex, images: [image(asset)] }],
  sizes: gender === 'women' ? ['5', '6', '7', '8', '9', '10', '11'] : ['7', '8', '9', '10', '11', '12', '13'],
  material, featured: index < 6, salesRank: ((index + 5) % 17) + 1,
  createdAt: `2026-10-${String(22 - index).padStart(2, '0')}`, keywords: [category, color, material, gender, 'footwear', 'walking'],
}));

export const sock: Product = {
  id: 'nf-18', slug: 'anytime-no-show-heel-grip', name: 'Anytime No Show Heel Grip Sock', category: 'Socks', gender: 'unisex', price: 14,
  badge: 'New', description: 'The little layer that makes a big difference. A low-profile sock for a barely-there feel, with a close-fitting heel and a soft, flexible finish. Made for the shoes you reach for every day.',
  images: ['sock-natural', 'sock-natural-detail', 'sock-natural-heel'].map(image),
  colors: [
    { id: 'natural', name: 'Natural', hex: '#d5c9b6', images: ['sock-natural', 'sock-natural-detail', 'sock-natural-heel'].map(image) },
    { id: 'stone', name: 'Stone', hex: '#b0afac', images: ['sock-stone', 'sock-stone-detail', 'sock-stone-heel'].map(image) },
  ], sizes: ['S', 'M', 'L', 'XL'], material: 'Cotton', featured: true, salesRank: 3, createdAt: '2026-10-23', keywords: ['socks', 'heel grip', 'no show', 'accessories', 'unisex'],
};
products.push(sock);
export const collectionPath = '/collections/new-arrivals-26';
export const productPath = (product: Product) => `/products/${product.slug}`;
