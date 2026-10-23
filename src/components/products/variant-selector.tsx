'use client';
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import type { Product } from '@/types/product';
import { useCart } from '@/stores/cart-store';
import { useUI } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';

export function VariantSelector({ product, colorId, onColorChange, onFitGuide }: { product: Product; colorId?: string; onColorChange?: (id: string) => void; onFitGuide?: () => void }) {
  const [localColor, setLocalColor] = useState(product.colors[0].id);
  const [size, setSize] = useState(''); const [error, setError] = useState(''); const [added, setAdded] = useState(false);
  const selectedColor = colorId || localColor; const color = product.colors.find(color => color.id === selectedColor)!;
  const add = useCart(state => state.add); const hydrated = useCart(state => state.hydrated);
  function submit() {
    if (!size) { setError('Please select a size before adding to your bag.'); return; }
    useUI.getState().viewProduct(null); add(product, selectedColor, size); setAdded(true);
  }
  return <div className="variant-selector">
    <fieldset className="color-options"><legend><span className="micro">Color:</span> {color.name} <span className="muted">(Everyday Collection)</span></legend><div className="swatches">{product.colors.map(option => <button key={option.id} type="button" className={`swatch ${option.id === selectedColor ? 'selected' : ''}`} style={{ '--swatch': option.hex } as React.CSSProperties} aria-label={`Color: ${option.name}`} aria-pressed={option.id === selectedColor} onClick={() => { setLocalColor(option.id); onColorChange?.(option.id); setAdded(false); }} />)}</div></fieldset>
    <fieldset className="size-options"><legend className="sr-only">Select size</legend><div className="sizes">{product.sizes.map(option => <button type="button" key={option} className={size === option ? 'selected' : ''} aria-label={`Select size ${option}`} aria-pressed={size === option} onClick={() => { setSize(option); setError(''); setAdded(false); }}>{option}</button>)}</div></fieldset>
    <div className="fit-row"><p>Fits true to size. Prefer a little room? Size up.</p>{onFitGuide && <button type="button" className="text-link" onClick={onFitGuide}>Fit Guide</button>}</div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <Button className="add-button" onClick={submit} disabled={!hydrated}>{added ? <Check size={16} /> : <Plus size={16} />}{added ? 'Add Another' : 'Add to Bag'}{size && <span className="selected-size">{size}</span>}</Button>
    <p className="purchase-note">Thoughtful essentials. One step at a time.</p>
  </div>;
}
