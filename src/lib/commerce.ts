import { products } from '../data/products.ts';
import type { Product, CartItem, Order } from '../types/product.ts';
import { shippingMethods, paymentMethods } from '../data/checkout.ts';

export const sorts = [ ['featured', 'Featured'], ['best-selling', 'Best Selling'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['az', 'Alphabetically: A-Z'], ['za', 'Alphabetically: Z-A'], ['newest', 'Newest'] ] as const;
export const facets = ['gender', 'size', 'color', 'type', 'material'] as const;
export type Facet = typeof facets[number];
export function selectProducts(catalog: Product[], params: URLSearchParams) {
  const query = (params.get('q') || '').toLowerCase().trim();
  const min = Number(params.get('min') || 0); const max = Number(params.get('max') || Infinity);
  const selected = catalog.filter(product => {
    if (query && ![product.name, product.category, ...product.keywords].join(' ').toLowerCase().includes(query)) return false;
    if (product.price < min || product.price > max) return false;
    return facets.every(facet => {
      const values = params.getAll(facet); if (!values.length) return true;
      if (facet === 'gender') return product.gender === 'unisex' || values.includes(product.gender);
      if (facet === 'size') return values.some(value => product.sizes.includes(value));
      if (facet === 'color') return values.some(value => product.colors.some(color => color.name === value));
      return values.includes(facet === 'type' ? product.category : product.material);
    });
  });
  const order = params.get('sort') || 'featured';
  return selected.sort((first, second) => {
    if (order === 'price-asc') return first.price - second.price;
    if (order === 'price-desc') return second.price - first.price;
    if (order === 'az') return first.name.localeCompare(second.name);
    if (order === 'za') return second.name.localeCompare(first.name);
    if (order === 'newest') return second.createdAt.localeCompare(first.createdAt);
    if (order === 'best-selling') return first.salesRank - second.salesRank;
    return Number(second.featured) - Number(first.featured);
  });
}
export function makeItem(product: Product, colorId: string, size: string): CartItem {
  const color = product.colors.find(option => option.id === colorId);
  if (!color || !product.sizes.includes(size)) throw new Error('Choose a valid color and size.');
  return { variantId: `${product.id}:${color.id}:${size}`, productId: product.id, name: product.name, image: color.images[0], color: color.name, colorId: color.id, size, unitPrice: product.price, quantity: 1 };
}
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const exists = items.some(current => current.variantId === item.variantId);
  return exists ? items.map(current => current.variantId === item.variantId ? { ...current, quantity: Math.min(99, current.quantity + item.quantity) } : current) : [...items, { ...item }];
}
export function quantityItems(items: CartItem[], id: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return items;
  return quantity === 0 ? items.filter(item => item.variantId !== id) : items.map(item => item.variantId === id ? { ...item, quantity } : item);
}
export const subtotalCents = (items: CartItem[]) => items.reduce((total, item) => total + Math.round(item.unitPrice * 100) * item.quantity, 0);
export function restoreItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 200).reduce<CartItem[]>((items, item) => {
    if (!item || typeof item !== 'object' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return items;
    const product = products.find(product => product.id === item.productId);
    if (!product) return items;
    try { return addItem(items, { ...makeItem(product, item.colorId, item.size), quantity: item.quantity }); } catch { return items; }
  }, []);
}
export function restoreOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object') return null;
  const order = raw as Order;
  if (typeof order.reference !== 'string' || !/^NF-[A-Z0-9-]{6,40}$/.test(order.reference) || typeof order.createdAt !== 'string' || Number.isNaN(Date.parse(order.createdAt)) || !Array.isArray(order.items) || !order.items.length || order.items.length > 200) return null;
  if (!order.items.every(item => item && typeof item.variantId === 'string' && typeof item.productId === 'string' && typeof item.colorId === 'string' && typeof item.name === 'string' && item.name.length < 150 && typeof item.color === 'string' && item.color.length < 50 && typeof item.size === 'string' && item.size.length < 20 && typeof item.image === 'string' && /^\/images\/[a-z0-9-]+\.jpg$/.test(item.image) && Number.isFinite(item.unitPrice) && item.unitPrice >= 0 && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99)) return null;
  const subtotal = subtotalCents(order.items);
  if (!Number.isSafeInteger(order.totalCents) || !Number.isSafeInteger(subtotal)) return null;
  if (order.checkout === undefined) return order.totalCents === subtotal ? order : null;
  const details = order.checkout;
  if (!details || typeof details !== 'object' || !shippingMethods.some(method => method.id === details.courier) || !paymentMethods.some(method => method.id === details.payment)) return null;
  if (details.subtotalCents !== subtotal || !Number.isSafeInteger(details.shippingCents) || details.shippingCents < 0 || order.totalCents !== subtotal + details.shippingCents) return null;
  return order;
}
