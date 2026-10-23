'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, ArrowUpRight, ArrowRight } from 'lucide-react';
import { collectionPath } from '@/data/products';
import { useCart } from '@/stores/cart-store';
import { useUI } from '@/stores/ui-store';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const categories = [['Shop All', ''], ['Sneakers', 'Sneakers'], ['Slip Ons', 'Slip Ons'], ['Sandals', 'Sandals'], ['Running Shoes', 'Running Shoes'], ['Socks', 'Socks']];
export function Header() {
  const [menu, setMenu] = useState<string | null>(null); const [mobile, setMobile] = useState(false);
  const items = useCart(state => state.items); const hydrated = useCart(state => state.hydrated); const count = items.reduce((count, item) => count + item.quantity, 0);
  const setSearch = useUI(state => state.setSearch); const openCart = useCart(state => state.setOpen);
  return <><div className="announcement"><Link href={collectionPath}>A lighter step. A new everyday. <span>Discover the collection</span><ArrowUpRight size={12} /></Link></div>
    <header className="site-header" onKeyDown={event => { if (event.key === 'Escape') setMenu(null); }}>
      <div className={`header-inner ${menu ? 'menu-is-open' : ''}`} onMouseLeave={() => setMenu(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null); }}>
        <button className="icon-button mobile-menu-button" onClick={() => setMobile(true)} aria-label="Open main menu"><Menu size={22} /></button>
        <Link href="/" className="wordmark" aria-label="NORTHFORM homepage" onClick={() => setMenu(null)}>northform<span>®</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation"><Link href={collectionPath} onMouseEnter={() => setMenu(null)}>New Arrivals</Link><Link href={collectionPath} onMouseEnter={() => setMenu(null)}>Shop All</Link>{['Men', 'Women'].map(gender => <button key={gender} onMouseEnter={() => setMenu(gender)} onFocus={() => setMenu(gender)} onClick={() => setMenu(menu === gender ? null : gender)} aria-expanded={menu === gender} aria-controls="mega-menu">{gender}</button>)}</nav>
        <div className="header-actions"><button className="icon-button" aria-label="Search products" onClick={() => { setMenu(null); setSearch(true); }}><Search size={20} /></button><button className="icon-button cart-trigger" aria-label={`Open bag${hydrated && count ? `, ${count} items` : ''}`} onClick={() => { setMenu(null); openCart(true); }}><ShoppingBag size={20} /><span className="cart-count" aria-hidden="true">{hydrated ? count : 0}</span></button></div>
        {menu && <div className="mega-menu" id="mega-menu"><div className="mega-featured"><span className="micro">{menu}&apos;s collection</span><Link href={`${collectionPath}?gender=${menu.toLowerCase()}`} onClick={() => setMenu(null)}>New Arrivals <ArrowUpRight size={15} /></Link><Link href={`${collectionPath}?gender=${menu.toLowerCase()}&sort=best-selling`} onClick={() => setMenu(null)}>Best Sellers <ArrowUpRight size={15} /></Link></div><div><h3>{menu}&apos;s Shoes</h3>{categories.map(([name, type]) => <Link key={name} href={`${collectionPath}?gender=${menu.toLowerCase()}${type ? `&type=${encodeURIComponent(type)}` : ''}`} onClick={() => setMenu(null)}>{name}</Link>)}</div><div><h3>Find your everyday</h3><Link href={`${collectionPath}?material=Canvas`} onClick={() => setMenu(null)}>Easy canvas</Link><Link href={`${collectionPath}?material=Knit`} onClick={() => setMenu(null)}>Soft knit essentials</Link><Link href={`${collectionPath}?type=Socks`} onClick={() => setMenu(null)}>The finishing touch</Link></div><Link className="mega-image" href={`${collectionPath}?gender=${menu.toLowerCase()}`} onClick={() => setMenu(null)}><Image src={`/images/campaign-${menu.toLowerCase()}.jpg`} alt={`${menu}'s everyday street style`} fill sizes="300px" /><span>Made for your everyday <ArrowRight size={17} /></span></Link></div>}
      </div>
    </header>
    <Dialog open={mobile} onOpenChange={setMobile}><DialogContent side className="mobile-nav-sheet"><DialogTitle className="wordmark">northform</DialogTitle><DialogDescription className="sr-only">Browse the NORTHFORM collection</DialogDescription><nav aria-label="Mobile navigation"><Link href={collectionPath} onClick={() => setMobile(false)}>New Arrivals <ArrowUpRight /></Link><Link href={collectionPath} onClick={() => setMobile(false)}>Shop All <ArrowUpRight /></Link>{['Men', 'Women'].map(gender => <details key={gender}><summary>{gender}</summary><Link href={`${collectionPath}?gender=${gender.toLowerCase()}`} onClick={() => setMobile(false)}>Shop {gender}</Link>{categories.slice(1).map(([name, type]) => <Link key={name} href={`${collectionPath}?gender=${gender.toLowerCase()}&type=${encodeURIComponent(type)}`} onClick={() => setMobile(false)}>{name}</Link>)}</details>)}</nav><p className="muted">Good things start with a comfortable pair.</p></DialogContent></Dialog>
  </>;
}
