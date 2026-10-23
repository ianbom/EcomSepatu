'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowUpRight } from 'lucide-react';
import { money } from '@/lib/utils';
import { productPath } from '@/data/products';
import type { Product } from '@/types/product';
import { useUI } from '@/stores/ui-store';

export function ProductCard({ product }: { product: Product }) {
  const view = useUI(state => state.viewProduct);
  const content = <><Image src={product.images[0]} alt={`${product.name} in ${product.colors[0].name}`} fill sizes="(max-width: 767px) 48vw, (max-width: 1023px) 32vw, 25vw" className="product-image" />{product.badge && <span className="badge">{product.badge}</span>}<span className="product-view-label">View product <ArrowUpRight size={13} /></span></>;
  return <article className="product-card" data-testid="product-card" data-price={product.price} data-name={product.name}>
    <Link href={productPath(product)} className="product-photo" aria-label={`View ${product.name}`}>{content}</Link>
    <div className="product-card-info"><div><h3>{product.name}</h3><p>{product.colors[0].name}</p></div><div className="product-price">{money(product.price)} {product.compareAtPrice && <s>{money(product.compareAtPrice)}</s>}</div></div>
    <button className="quick-add" onClick={() => view(product)} aria-label={`Quick Add ${product.name}`}><Plus size={14} /><span>Quick Add</span><span className="quick-add-sizes">{product.sizes.slice(0, 5).join(' / ')}</span></button>
  </article>;
}
