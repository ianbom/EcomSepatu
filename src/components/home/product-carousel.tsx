'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { ProductCard } from '@/components/products/product-card';
import { collectionPath } from '@/data/products';

export function ProductCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null); const [edges, setEdges] = useState({ start: true, end: false });
  function update() { const element = track.current; if (element) setEdges({ start: element.scrollLeft < 5, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 5 }); }
  useEffect(() => { const observer = new ResizeObserver(update); if (track.current) observer.observe(track.current); return () => observer.disconnect(); }, []);
  function move(direction: number) { const element = track.current; element?.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  return <section className="home-products"><div className="section-heading"><h2>Best Sellers</h2><div><Link href={`${collectionPath}?sort=best-selling`} className="text-link">Shop the favorites</Link><button className="icon-button carousel-arrow" aria-label="Previous products" disabled={edges.start} onClick={() => move(-1)}><ArrowLeft size={19} /></button><button className="icon-button carousel-arrow" aria-label="Next products" disabled={edges.end} onClick={() => move(1)}><ArrowRight size={19} /></button></div></div><div ref={track} className="product-carousel" onScroll={update}>{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>;
}
