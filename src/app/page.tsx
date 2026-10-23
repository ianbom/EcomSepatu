import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { products, collectionPath } from '@/data/products';
import { ProductCarousel } from '@/components/home/product-carousel';

const categories = [
  { name: 'New Arrivals', image: 'shoe-24', href: collectionPath, men: true, women: true },
  { name: 'Men', image: 'campaign-men', href: `${collectionPath}?gender=men`, men: true, women: false },
  { name: 'Women', image: 'campaign-women', href: `${collectionPath}?gender=women`, men: false, women: true },
  { name: 'Best Sellers', image: 'shoe-02', href: `${collectionPath}?sort=best-selling`, men: true, women: true },
];
const promotions = [
  { title: 'Take the long way.', subtitle: 'Everyday travel essentials', image: 'campaign-city', href: collectionPath },
  { title: 'A new kind of everyday.', subtitle: 'Meet the latest arrivals', image: 'campaign-walk', href: collectionPath },
  { title: 'Less noise. More you.', subtitle: 'A fresh perspective on the classics', image: 'campaign-detail', href: `${collectionPath}?type=Sneakers` },
];
function withGender(href: string, gender: string) {
  const [path, query] = href.split('?'); const params = new URLSearchParams(query); params.set('gender', gender); return `${path}?${params}`;
}
export default function Home() {
  return <main id="main-content"><section className="hero" aria-label="New everyday collection"><div className="hero-media"><div className="hero-portrait"><Image src="/images/campaign-men.jpg" alt="Relaxed city style: walking in sneakers across a quiet street" fill priority sizes="40vw" /></div><div className="hero-closeup"><Image src="/images/campaign-detail.jpg" alt="White everyday sneakers against dark city paving" fill priority sizes="(max-width: 767px) 100vw, 65vw" /></div></div><div className="hero-copy"><p className="micro">The Everyday Collection / No. 01</p><h1>Good things. In your own time.</h1><div className="hero-actions"><Link href={`${collectionPath}?gender=men`} className="button button-primary">Shop Men</Link><Link href={`${collectionPath}?gender=women`} className="button button-primary">Shop Women</Link></div></div></section>
    <section className="category-row" aria-label="Shop by category">{categories.map(category => <article className="category-tile" key={category.name}><Link href={category.href} className="category-image-link" aria-label={category.name}><Image src={`/images/${category.image}.jpg`} alt={`${category.name}: considered footwear and everyday style`} fill sizes="(max-width: 767px) 72vw, 25vw" /></Link><div className="category-tile-content"><h2>{category.name}</h2><div>{category.men && <Link href={withGender(category.href, 'men')}>Shop Men <ArrowUpRight size={12} /></Link>}{category.women && <Link href={withGender(category.href, 'women')}>Shop Women <ArrowUpRight size={12} /></Link>}</div></div></article>)}</section>
    <ProductCarousel products={[...products].sort((first, second) => first.salesRank - second.salesRank).slice(0, 9)} />
    <section className="editorial-grid" aria-label="Everyday inspiration">{promotions.map(promo => <article className="editorial-tile" key={promo.title}><Image src={`/images/${promo.image}.jpg`} alt={promo.subtitle} fill sizes="(max-width: 767px) 100vw, 33vw" /><div><p className="micro">{promo.subtitle}</p><h2>{promo.title}</h2><Link href={promo.href} className="button button-primary">Discover More <ArrowUpRight size={14} /></Link></div></article>)}</section>
  </main>;
}
