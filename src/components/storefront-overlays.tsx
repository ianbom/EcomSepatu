'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VariantSelector } from '@/components/products/variant-selector';
import { useCart } from '@/stores/cart-store';
import { useUI } from '@/stores/ui-store';
import { products, collectionPath, productPath } from '@/data/products';
import { information } from '@/data/content';
import { selectProducts, subtotalCents } from '@/lib/commerce';
import { money } from '@/lib/utils';

export function StorefrontOverlays() {
  const cart = useCart(); const ui = useUI(); const router = useRouter(); const [query, setQuery] = useState('');
  const [quickColor, setQuickColor] = useState('');
  useEffect(() => {
    useCart.getState().hydrate();
    function sync(event: StorageEvent) { if (event.key === 'northform-store-v1' || event.key === null) useCart.getState().hydrate(); }
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  const results = selectProducts(products, new URLSearchParams({ q: query })).slice(0, query ? 18 : 5);
  const info = ui.info ? information[ui.info] : null;
  const activeQuickColor = ui.product?.colors.find(color => color.id === quickColor) || ui.product?.colors[0];
  return <>
    <Dialog open={cart.open} onOpenChange={cart.setOpen}><DialogContent side className="cart-sheet"><div className="sheet-heading"><DialogTitle>Your Bag <span>({cart.items.reduce((count, item) => count + item.quantity, 0)})</span></DialogTitle><DialogDescription>Good things for your everyday.</DialogDescription></div>{cart.error && <div className="storage-error" role="alert">{cart.error}<button aria-label="Dismiss storage message" onClick={cart.dismissError}><X size={15} /></button></div>}
      {!cart.items.length ? <div className="empty-bag"><ShoppingBag size={42} strokeWidth={1} /><h3>A little room for something good.</h3><p>Your bag is currently empty.</p><Link href={collectionPath} className="button button-primary" onClick={() => cart.setOpen(false)}>Discover New Arrivals <ArrowRight size={16} /></Link></div> : <><div className="cart-items">{cart.items.map(item => <article className="cart-line" key={item.variantId} data-testid="cart-line"><div className="cart-line-image"><Image src={item.image} alt={`${item.name}, ${item.color}`} fill sizes="110px" /></div><div className="cart-line-details"><h3>{item.name}</h3><p>{item.color}</p><p>Size: {item.size}</p><div className="cart-line-actions"><div className="quantity-control"><button aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => cart.quantity(item.variantId, item.quantity - 1)}><Minus size={13} /></button><span aria-live="polite">{item.quantity}</span><button aria-label={`Increase quantity of ${item.name}`} disabled={item.quantity >= 99} onClick={() => cart.quantity(item.variantId, item.quantity + 1)}><Plus size={13} /></button></div><button className="text-link muted" onClick={() => cart.quantity(item.variantId, 0)} aria-label={`Remove ${item.name}`}>Remove</button></div></div><strong>{money(item.unitPrice)}</strong></article>)}</div><div className="cart-summary"><div className="subtotal"><span>Subtotal</span><strong data-testid="cart-subtotal">{money(subtotalCents(cart.items) / 100)}</strong></div><p>Your selected pieces, ready for the next step.</p><Button disabled={!cart.hydrated || !cart.items.length} onClick={() => { cart.setOpen(false); router.push('/checkout'); }}>Checkout <ArrowRight size={17} /></Button><button className="text-link continue-link" onClick={() => cart.setOpen(false)}>Continue Shopping</button></div></>}
    </DialogContent></Dialog>
    <Dialog open={ui.search} onOpenChange={ui.setSearch}><DialogContent className="search-dialog"><DialogTitle>Find your everyday.</DialogTitle><DialogDescription>Search the collection by name, style, or material.</DialogDescription><div className="search-field"><Search size={20} /><input aria-label="Search products" placeholder="Try sneakers, canvas, socks…" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" /></div><div className="search-results" aria-live="polite"><p className="micro muted">{query ? `${results.length} matching styles` : 'A few good places to start'}</p>{!results.length && <div className="search-empty"><p>No matches for “{query}”.</p><button className="text-link" onClick={() => setQuery('')}>Clear your search</button></div>}{results.map(product => { const content = <><div className="search-result-image"><Image src={product.images[0]} alt={product.name} fill sizes="72px" /></div><span><strong>{product.name}</strong><small>{product.category} · {product.colors[0].name}</small></span><span>{money(product.price)}</span><ArrowRight size={16} /></>; return <Link className="search-result" key={product.id} href={productPath(product)} onClick={() => ui.setSearch(false)}>{content}</Link>; })}</div></DialogContent></Dialog>
    <Dialog open={!!ui.product} onOpenChange={open => { if (!open) { ui.viewProduct(null); setQuickColor(''); } }}><DialogContent className="quick-view-dialog">{ui.product && <><div className="quick-view-image"><Image src={activeQuickColor!.images[0]} alt={`${ui.product.name} in ${activeQuickColor!.name}`} fill sizes="(max-width: 767px) 90vw, 450px" /></div><div className="quick-view-content"><span className="micro muted">A new everyday</span><DialogTitle>{ui.product.name}</DialogTitle><DialogDescription>{ui.product.description}</DialogDescription><p className="quick-price">{money(ui.product.price)}</p><VariantSelector key={ui.product.id} product={ui.product} colorId={activeQuickColor!.id} onColorChange={setQuickColor} /><Link className="text-link" href={productPath(ui.product)} onClick={() => ui.viewProduct(null)}>View full details <ArrowRight size={14} /></Link></div></>}</DialogContent></Dialog>
    <Dialog open={!!info} onOpenChange={open => { if (!open) ui.showInfo(null); }}><DialogContent className="info-dialog"><span className="micro muted">NORTHFORM / A considered everyday</span><DialogTitle>{info?.title}</DialogTitle><DialogDescription className="sr-only">NORTHFORM information</DialogDescription>{info?.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{ui.info === 'credits' && <div className="credit-links"><a className="text-link" href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels photography license <ArrowRight size={14} /></a><a className="text-link" href="https://commons.wikimedia.org/wiki/File:F%C3%BC%C3%9Flinge.jpg" target="_blank" rel="noreferrer">Sock photograph by Sae1962 <ArrowRight size={14} /></a><a className="text-link" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0 license <ArrowRight size={14} /></a></div>}</DialogContent></Dialog>
  </>;
}
