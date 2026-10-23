'use client';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SlidersHorizontal, X, ArrowUpRight } from 'lucide-react';
import { products, collectionPath } from '@/data/products';
import { facets, selectProducts, sorts, type Facet } from '@/lib/commerce';
import { ProductCard } from './product-card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const labels: Record<Facet, string> = { gender: 'Gender', size: 'Size', color: 'Color', type: 'Product Type', material: 'Material' };
const options: Record<Facet, string[]> = {
  gender: ['men', 'women', 'unisex'], size: ['S', 'M', 'L', 'XL', ...Array.from({ length: 9 }, (_, index) => String(index + 5))],
  color: [...new Set(products.flatMap(product => product.colors.map(color => color.name)))],
  type: [...new Set(products.map(product => product.category))], material: [...new Set(products.map(product => product.material))],
};

export function Collection() {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString()); const [sidebar, setSidebar] = useState(false); const [mobile, setMobile] = useState(false);
  const filtered = selectProducts(products, params); const active = [...params.entries()].filter(([key]) => key !== 'sort');
  function navigate(next: URLSearchParams) { router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false }); }
  function toggle(facet: Facet, value: string) {
    const next = new URLSearchParams(params); const values = next.getAll(facet); next.delete(facet);
    (values.includes(value) ? values.filter(option => option !== value) : [...values, value]).forEach(option => next.append(facet, option)); navigate(next);
  }
  function change(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); navigate(next); }
  function clear() { const next = new URLSearchParams(); if (params.has('sort')) next.set('sort', params.get('sort')!); navigate(next); }
  const sortControl = <label className="sort-control"><span className="sr-only">Sort products</span><select aria-label="Sort products" value={params.get('sort') || 'featured'} onChange={event => change('sort', event.target.value)}>{sorts.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>;
  const filterContents = <div className="filter-content">{facets.map(facet => <details open key={facet} className="filter-group"><summary>{labels[facet]}</summary>{facet === 'size' && <p className="filter-hint">Choose your usual size. Socks use S–XL.</p>}<div className={facet === 'size' ? 'filter-sizes' : 'filter-options'}>{options[facet].map(value => <label key={value} className={facet === 'size' ? 'filter-size' : 'filter-checkbox'}><input type="checkbox" checked={params.getAll(facet).includes(value)} onChange={() => toggle(facet, value)} /><span>{facet === 'gender' ? value[0].toUpperCase() + value.slice(1) : value}</span>{facet === 'color' && <i style={{ background: products.flatMap(product => product.colors).find(color => color.name === value)?.hex }} />}</label>)}</div></details>)}<details open className="filter-group"><summary>Price</summary><label className="price-range-label">Up to ${params.get('max') || '150'}<input aria-label="Maximum price" type="range" min="14" max="150" step="1" value={params.get('max') || '150'} onChange={event => change('max', event.target.value)} /></label><div className="price-inputs"><label>Min $<input aria-label="Minimum price" type="number" min="0" max="150" value={params.get('min') || ''} placeholder="0" onChange={event => change('min', event.target.value)} /></label><span>—</span><label>Max $<input aria-label="Maximum price amount" type="number" min="0" max="150" value={params.get('max') || ''} placeholder="150" onChange={event => change('max', event.target.value)} /></label></div></details>{active.length > 0 && <button className="text-link" onClick={clear}>Clear All Filters</button>}</div>;
  return <div className="collection-page"><div className="collection-title"><h1>New Arrivals</h1><p>Fresh forms. Familiar comfort.</p></div><div className="collection-toolbar"><button className="filter-toggle desktop-filter-toggle" aria-expanded={sidebar} onClick={() => setSidebar(!sidebar)}><SlidersHorizontal size={15} />{sidebar ? 'Collapse Filters' : 'Filter'}<span>({filtered.length} products)</span></button><button className="filter-toggle mobile-filter-toggle" onClick={() => setMobile(true)}><SlidersHorizontal size={15} />Filter and Sort<span>({filtered.length})</span></button><div className="desktop-sort">{sortControl}</div></div>
    {!!active.length && <div className="active-filters" aria-label="Active filters">{active.map(([key, value]) => <button key={`${key}-${value}`} onClick={() => { const next = new URLSearchParams(params); if (facets.includes(key as Facet)) next.delete(key, value); else next.delete(key); navigate(next); }} aria-label={`Clear ${key}: ${value}`}>{key === 'min' ? 'From $' : key === 'max' ? 'Up to $' : ''}{value}<X size={12} /></button>)}<button className="clear-all" onClick={clear}>Clear All</button></div>}
    <div className={`collection-body ${sidebar ? 'has-sidebar' : ''}`}>{sidebar && <aside className="filter-sidebar" aria-label="Product filters">{filterContents}</aside>}<div className="collection-results"><p className="sr-only" role="status">{filtered.length} products shown</p>{filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-results"><h2>No matches. Plenty of possibilities.</h2><p>Try a different size or clear a filter to find your everyday.</p><Button variant="outline" onClick={clear}>Clear All Filters</Button></div>}</div></div>
    <section className="editorial-grid collection-promos" aria-label="Explore the collection">{[['Men', 'campaign-men', 'gender=men'], ['Women', 'campaign-women', 'gender=women'], ['Essentials', 'campaign-city', 'type=Socks']].map(([title, image, query]) => <article className="editorial-tile" key={title}><Image src={`/images/${image}.jpg`} alt={`${title} collection`} fill sizes="(max-width: 767px) 100vw, 33vw" /><div><h2>{title}</h2><Link href={`${collectionPath}?${query}`} className="button button-primary">Shop {title} <ArrowUpRight size={14} /></Link></div></article>)}</section>
    <Dialog open={mobile} onOpenChange={setMobile}><DialogContent side className="filter-sheet"><DialogTitle>Filter & Sort</DialogTitle><DialogDescription>{filtered.length} styles to make your own.</DialogDescription><div className="mobile-filter-body">{sortControl}{filterContents}</div><Button onClick={() => setMobile(false)}>Show {filtered.length} Products</Button></DialogContent></Dialog>
  </div>;
}
