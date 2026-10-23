'use client';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customerFields, paymentMethods, shippingMethods } from '@/data/checkout';
import type { CheckoutValues, CheckoutErrors } from '@/data/checkout';
import { collectionPath } from '@/data/products';
import { validateCheckout } from '@/lib/checkout';
import { subtotalCents } from '@/lib/commerce';
import { money } from '@/lib/utils';
import { useCart } from '@/stores/cart-store';

const emptyValues: CheckoutValues = { fullName: '', email: '', phone: '', address: '', province: '', city: '', district: '', postalCode: '', notes: '', courier: '', payment: '' };

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const [values, setValues] = useState<CheckoutValues>({ ...emptyValues });
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const errors: CheckoutErrors = attempted ? validateCheckout(values) : {};
  const courier = shippingMethods.find(method => method.id === values.courier);
  const subtotal = subtotalCents(cart.items);

  function update(key: keyof CheckoutValues, value: string) {
    setValues(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setAttempted(true);
    const validation = validateCheckout(values);
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    if (cart.checkout(values)) router.push('/checkout/success');
    else { submittingRef.current = false; setSubmitting(false); }
  }

  function renderField(field: typeof customerFields[number]) {
    const props = {
      id: `checkout-${field.key}`, name: field.key, value: values[field.key], autoComplete: field.autoComplete,
      maxLength: field.maxLength, required: true, 'aria-invalid': !!errors[field.key],
      'aria-describedby': errors[field.key] ? `checkout-${field.key}-error` : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field.key, event.target.value),
    };
    return <div className={`checkout-field ${field.key === 'address' || field.key === 'fullName' ? 'checkout-field-wide' : ''}`} key={field.key}>
      <label htmlFor={props.id}>{field.label} <span aria-hidden="true">*</span></label>
      {field.key === 'address' ? <textarea {...props} rows={3} /> : <input {...props} type={field.type} inputMode={field.key === 'postalCode' ? 'numeric' : undefined} />}
      {errors[field.key] && <p className="form-error" id={`checkout-${field.key}-error`}>{errors[field.key]}</p>}
    </div>;
  }

  if (!cart.hydrated || submitting) return <main id="main-content" className="checkout-page" lang="en"><p role="status">{submitting ? 'Opening your order confirmation...' : 'Preparing checkout...'}</p></main>;
  if (!cart.items.length) return <main id="main-content" className="checkout-page" lang="en"><section className="success-empty"><ShoppingBag size={40} strokeWidth={1} /><h1>Your bag is empty.</h1><p>Discover something for your everyday.</p><Link href={collectionPath} className="button button-primary">Continue Shopping <ArrowRight size={16} /></Link></section></main>;

  return <main id="main-content" className="checkout-page" lang="en">
    <div className="checkout-heading"><Link href={collectionPath} className="text-link"><ArrowLeft size={14} /> Continue Shopping</Link><span className="micro muted">NORTHFORM / Your next step</span><h1>Checkout</h1><p>A few details. Your next step.</p></div>
    <div className="checkout-layout">
      <form id="checkout-form" noValidate onSubmit={submit}>
        {attempted && Object.keys(errors).length > 0 && <p className="form-error checkout-validation" role="alert">Please check the highlighted fields before continuing.</p>}
        <section className="checkout-section" aria-labelledby="checkout-contact-title"><div className="checkout-section-heading"><span>01</span><h2 id="checkout-contact-title">Contact details</h2></div><div className="checkout-fields">{customerFields.slice(0, 3).map(renderField)}</div></section>
        <section className="checkout-section" aria-labelledby="checkout-address-title"><div className="checkout-section-heading"><span>02</span><h2 id="checkout-address-title">Shipping address</h2></div><p className="checkout-section-note">Shipping within Indonesia. Fields marked * are required.</p><div className="checkout-fields">{customerFields.slice(3).map(renderField)}<div className="checkout-field checkout-field-wide"><label htmlFor="checkout-notes">Order notes <span>(optional)</span></label><textarea id="checkout-notes" name="notes" rows={2} maxLength={1000} value={values.notes} onChange={event => update('notes', event.target.value)} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? 'checkout-notes-error' : undefined} />{errors.notes && <p className="form-error" id="checkout-notes-error">{errors.notes}</p>}</div></div></section>
        <fieldset className="checkout-section checkout-options" aria-describedby={errors.courier ? 'checkout-courier-error' : undefined}><legend><span>03</span> Shipping method</legend><div className="checkout-shipping-options">{shippingMethods.map(method => <label className={`checkout-option ${values.courier === method.id ? 'selected' : ''}`} key={method.id}><input type="radio" name="courier" value={method.id} aria-label={method.name} required checked={values.courier === method.id} onChange={() => update('courier', method.id)} aria-describedby={errors.courier ? 'checkout-courier-error' : undefined} /><Truck size={20} strokeWidth={1.3} /><span><strong>{method.name}</strong></span><b>{money(method.feeCents / 100)}</b></label>)}</div>{errors.courier && <p className="form-error" id="checkout-courier-error">{errors.courier}</p>}</fieldset>
        <fieldset className="checkout-section checkout-options" aria-describedby={errors.payment ? 'checkout-payment-error' : undefined}><legend><span>04</span> Payment method</legend><div className="checkout-payment-options">{paymentMethods.map(method => <label className={`checkout-option ${values.payment === method.id ? 'selected' : ''}`} key={method.id}><input type="radio" name="payment" value={method.id} aria-label={method.name} required checked={values.payment === method.id} onChange={() => update('payment', method.id)} aria-describedby={errors.payment ? 'checkout-payment-error' : undefined} /><span><strong>{method.name}</strong></span></label>)}</div>{errors.payment && <p className="form-error" id="checkout-payment-error">{errors.payment}</p>}</fieldset>
      </form>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
        <div className="checkout-summary-heading"><h2 id="checkout-summary-title">Order summary</h2><span>{cart.items.reduce((count, item) => count + item.quantity, 0)} items</span></div>
        <div className="checkout-products">{cart.items.map(item => <article className="checkout-product" key={item.variantId} data-testid="checkout-line"><div className="checkout-product-photo"><Image src={item.image} alt={`${item.name}, ${item.color}`} fill sizes="90px" /></div><div><h3>{item.name}</h3><p>{item.color} / Size {item.size}</p><p>{money(item.unitPrice)} &times; {item.quantity}</p></div><strong>{money(item.unitPrice * item.quantity)}</strong></article>)}</div>
        <dl className="checkout-totals"><div><dt>Subtotal</dt><dd data-testid="checkout-subtotal">{money(subtotal / 100)}</dd></div><div><dt>Shipping {courier && `(${courier.name})`}</dt><dd data-testid="checkout-shipping">{courier ? money(courier.feeCents / 100) : 'Select shipping'}</dd></div><div className="checkout-grand-total"><dt>{courier ? 'Order total' : 'Subtotal'}</dt><dd data-testid="checkout-total">{money((subtotal + (courier?.feeCents ?? 0)) / 100)}</dd></div></dl>
        <p className="checkout-currency-note">All prices are in USD.</p>
        {cart.error && <p className="form-error" role="alert">{cart.error}</p>}
        <Button type="submit" form="checkout-form" disabled={submitting} className="checkout-submit">Place Order <ArrowRight size={16} /></Button>
        <button type="button" className="text-link checkout-edit-bag" onClick={() => cart.setOpen(true)}>Edit bag</button>
      </aside>
    </div>
  </main>;
}
