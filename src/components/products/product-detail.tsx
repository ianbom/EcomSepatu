'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Expand, Footprints, Minus, Plus, Star, Wind } from 'lucide-react';
import { collectionPath } from '@/data/products';
import type { Product } from '@/types/product';
import { money } from '@/lib/utils';
import { useUI } from '@/stores/ui-store';
import { VariantSelector } from './variant-selector';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: string }) {
  const [active, setActive] = useState(0); const [zoom, setZoom] = useState(false); const [magnified, setMagnified] = useState(false); const touch = useRef(0);
  function move(direction: number) { setActive(index => (index + direction + images.length) % images.length); setMagnified(false); }
  return <div className="product-gallery" onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { const distance = event.changedTouches[0].clientX - touch.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}><div className="gallery-grid" style={images.length === 1 ? { gridTemplateColumns: '1fr' } : undefined}>{images.map((_, index) => { const photoIndex = (index + active) % images.length; return <button className={`gallery-photo ${index ? 'gallery-secondary' : 'gallery-main'}`} key={index} onClick={() => { setActive(photoIndex); setZoom(true); }} aria-label={`Enlarge product image ${photoIndex + 1}`}><Image src={images[photoIndex]} alt={`${name}, image ${photoIndex + 1}`} fill priority={index === 0} sizes="(max-width: 767px) 100vw, 30vw" />{index === 0 && badge && <span className="badge">{badge}</span>}<Expand size={17} className="gallery-expand" /></button>; })}</div>{images.length > 1 && <div className="gallery-controls"><button className="icon-button" aria-label="Previous image" onClick={() => move(-1)}><ArrowLeft size={18} /></button><div className="gallery-dots">{images.map((_, index) => <button key={index} aria-label={`Show image ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}</div><span className="gallery-counter">0{active + 1} / 0{images.length}</span><button className="icon-button" aria-label="Next image" onClick={() => move(1)}><ArrowRight size={18} /></button></div>}
    <Dialog open={zoom} onOpenChange={open => { setZoom(open); setMagnified(false); }}><DialogContent className="gallery-zoom"><DialogTitle className="sr-only">{name} image viewer</DialogTitle><DialogDescription className="sr-only">Tap the image to zoom. Use previous and next controls when multiple images are available.</DialogDescription><button className={`zoom-image ${magnified ? 'magnified' : ''}`} aria-label={magnified ? 'Zoom out' : 'Zoom in'} onClick={() => setMagnified(!magnified)}><Image src={images[active]} alt={`${name}, image ${active + 1}`} fill sizes="90vw" /></button><div className="zoom-toolbar">{images.length > 1 && <button className="icon-button" aria-label="Previous enlarged image" onClick={() => move(-1)}><ArrowLeft size={21} /></button>}<span>{active + 1} / {images.length}</span><button className="icon-button" aria-label="Toggle image zoom" onClick={() => setMagnified(!magnified)}>{magnified ? <Minus size={20} /> : <Plus size={20} />}</button>{images.length > 1 && <button className="icon-button" aria-label="Next enlarged image" onClick={() => move(1)}><ArrowRight size={21} /></button>}</div></DialogContent></Dialog>
  </div>;
}
export function ProductDetail({ product }: { product: Product }) {
  const [colorId, setColorId] = useState(product.colors[0].id);
  const [fit, setFit] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting && entry.boundingClientRect.bottom < 0));
    if (panel.current) observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);
  const color = product.colors.find(color => color.id === colorId)!;
  const showInfo = useUI(state => state.showInfo);
  const isSock = product.category === 'Socks';
  const isLeather = product.material === 'Leather' || product.material === 'Suede';
  const categoryQuery = new URLSearchParams({ type: product.category });
  const care = isSock
    ? 'Wash cold with similar colors on a gentle cycle. Air-dry away from direct heat. Avoid bleach and follow the care label on your own pair.'
    : isLeather
      ? 'Use a soft brush suitable for the upper to remove loose dirt. Avoid soaking or machine washing. Air-dry away from direct heat and follow the care label on your own pair.'
      : 'Gently remove loose dirt with a soft brush. Spot-clean with a damp cloth and allow to air-dry away from direct heat. Follow the care label before using cleaning products or machine washing.';

  return <div className="pdp">
    <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`${collectionPath}?${categoryQuery}`}>{isSock ? 'Unisex Essentials' : product.category}</Link></div>
    <div className="pdp-mobile-title"><h1>{product.name}</h1><p>{money(product.price)}</p></div>
    <div className="pdp-top">
      <ProductGallery key={colorId} images={color.images} name={`${product.name}, ${color.name}`} badge={product.badge} />
      <div className="product-panel" ref={panel}>
        <div className="pdp-desktop-title"><span className="micro muted">{isSock ? 'The little essentials' : product.category}</span><h1>{product.name}</h1><p className="pdp-price">{money(product.price)}</p></div>
        <VariantSelector product={product} colorId={colorId} onColorChange={setColorId} onFitGuide={() => setFit(true)} />
        <div className="panel-details"><span><Check size={14} />{isSock ? 'Low-profile silhouette' : `${product.material} upper`}</span><span><Check size={14} />{isSock ? 'Easy everyday essential' : `${color.name} finish`}</span></div>
      </div>
    </div>
    <section className="product-information">
      <div className="why-made">
        <span className="micro muted">01 / A little less, a little better</span>
        <h2>{isSock ? <>Out of sight.<br />Never out of step.</> : <>Find your form.<br />One step at a time.</>}</h2>
        <Accordion type="multiple" defaultValue={['why']}>
          <AccordionItem value="why"><AccordionTrigger>Why We Made This</AccordionTrigger><AccordionContent><p>{product.description}</p></AccordionContent></AccordionItem>
          <AccordionItem value="materials"><AccordionTrigger>Materials & Sustainability</AccordionTrigger><AccordionContent>
            <p>{isSock ? 'A soft cotton-style knit, chosen for an easy everyday feel. Stretch around the opening keeps the profile close to your foot.' : `Catalog material: ${product.material}. Explore the ${color.name.toLowerCase()} finish in the product photograph.`}</p>
            <p>Specific {isSock ? 'fiber composition' : 'material composition'} and environmental certifications are not independently verified for this locally curated catalog.</p>
          </AccordionContent></AccordionItem>
          <AccordionItem value="care"><AccordionTrigger>Care Instructions</AccordionTrigger><AccordionContent><p>{care}</p></AccordionContent></AccordionItem>
        </Accordion>
      </div>
      <div className="thoughtful">
        <div className="detail-photo"><Image src={product.images[1] ?? product.images[0]} alt={isSock ? 'Close-up crop of the no-show sock knit and opening' : `${product.name} in ${product.colors[0].name}`} fill sizes="(max-width: 767px) 100vw, 40vw" /></div>
        <div className="product-features">
          <div><h3>Thoughtfully designed</h3><p>{isSock ? 'A quiet essential, with a low-cut shape that sits beneath the opening of your everyday sneakers.' : product.description}</p></div>
          <div><h3>Best for</h3><div className="best-for"><span><Footprints size={22} strokeWidth={1.3} />Everyday</span><span><Wind size={22} strokeWidth={1.3} />Easy days</span><span><Check size={22} strokeWidth={1.3} />{isSock ? 'Low shoes' : 'Your own pace'}</span></div></div>
        </div>
      </div>
    </section>
    <section className="reviews"><div><h2>Reviews for {product.name}</h2><div className="review-stars" aria-label="No customer rating yet">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} strokeWidth={1} />)}</div></div><p>No reviews yet.<br /><span className="muted">Good things take their first step.</span></p></section>
    <section className="brand-message"><Image src="/images/campaign-nature.jpg" alt="Everyday shoes on a quiet woodland trail" fill sizes="100vw" /><div><span className="micro">A considered everyday</span><h2>Find your form.<br />Leave room for the rest.</h2><p>Less complication. More getting out there.</p><button className="button button-primary" onClick={() => showInfo('story')}>Our Story <ArrowUpRight size={14} /></button></div><div className="brand-message-labels"><span>Quiet details</span><span>Everyday shapes</span><span>Your own pace</span></div></section>
    <div className="pdp-sticky-purchase" hidden={!sticky}><div><span>{product.name}</span><strong>{money(product.price)}</strong></div><button className="button button-primary" onClick={() => {
      panel.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      panel.current?.querySelector<HTMLButtonElement>('.sizes button')?.focus({ preventScroll: true });
    }}>Choose Your Size <ArrowRight size={15} /></button></div>
    <Dialog open={fit} onOpenChange={setFit}><DialogContent className="fit-guide">
      <span className="micro muted">Find your fit</span><DialogTitle>{isSock ? 'Small detail. Right fit.' : `${product.name} Fit Guide`}</DialogTitle>
      <DialogDescription>{isSock ? 'Anytime No Show Sock — approximate size reference. Choose your usual shoe size.' : 'Available US shoe sizes are listed below. Compare with a pair you already wear; fit varies by style.'}</DialogDescription>
      <div className="fit-guide-table">{isSock ? <><table><caption>Women&apos;s size guide</caption><thead><tr><th scope="col">Sock</th><th scope="col">S</th><th scope="col">M</th><th scope="col">L</th></tr></thead><tbody><tr><th scope="row">US Shoes</th><td>5–7</td><td>8–10</td><td>11</td></tr><tr><th scope="row">UK Shoes</th><td>2–4.5</td><td>5–7.5</td><td>8–8.5</td></tr><tr><th scope="row">Foot length (cm)</th><td>21.5–23.5</td><td>24–26</td><td>26.5</td></tr></tbody></table><table><caption>Men&apos;s size guide</caption><thead><tr><th scope="col">Sock</th><th scope="col">M</th><th scope="col">L</th><th scope="col">XL</th></tr></thead><tbody><tr><th scope="row">US Shoes</th><td>8</td><td>9–12</td><td>13–14</td></tr><tr><th scope="row">UK Shoes</th><td>7</td><td>8–11</td><td>12–13</td></tr><tr><th scope="row">Foot length (cm)</th><td>25</td><td>26–29</td><td>29.5–30.5</td></tr></tbody></table></> : <table><caption>US shoe sizes</caption><thead><tr><th scope="col">Sizing</th><th scope="col">Available sizes</th></tr></thead><tbody><tr><th scope="row">{product.gender === 'women' ? "Women's US" : product.gender === 'men' ? "Men's US" : 'Unisex US'}</th><td>{product.sizes.join(', ')}</td></tr></tbody></table>}</div>
      <p className="muted">{isSock ? 'Between sizes? Choose the larger size for a roomier fit.' : 'Exact foot-length measurements are not available for this catalog. Consult the size label on your own pair.'}</p>
    </DialogContent></Dialog>
  </div>;
}
