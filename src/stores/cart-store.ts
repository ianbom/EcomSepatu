'use client';
import { create } from 'zustand';
import { addItem, makeItem, quantityItems, restoreItems, restoreOrder, subtotalCents } from '@/lib/commerce';
import type { CartItem, Order, Product } from '@/types/product';
import { shippingMethods, paymentMethods } from '@/data/checkout';
import type { CheckoutValues } from '@/data/checkout';
import { validateCheckout } from '@/lib/checkout';

const storageKey = 'northform-store-v1';
type CartState = {
  items: CartItem[]; order: Order | null; hydrated: boolean; open: boolean; error: string;
  hydrate: () => void; setOpen: (open: boolean) => void; dismissError: () => void;
  add: (product: Product, color: string, size: string) => void;
  quantity: (id: string, quantity: number) => void; checkout: (values: CheckoutValues) => boolean;
};
function save(items: CartItem[], order: Order | null) {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, items, order }));
}
export const useCart = create<CartState>((set, get) => {
  function update(items: CartItem[]) {
    let error = '';
    try { save(items, get().order); } catch { error = 'Browser storage is unavailable. Your bag is kept for this session only.'; }
    set({ items, error });
  }
  return {
    items: [], order: null, hydrated: false, open: false, error: '',
    hydrate: () => {
      try {
        const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
        set({ items: raw.version === 1 ? restoreItems(raw.items) : [], order: raw.version === 1 ? restoreOrder(raw.order) : null, hydrated: true });
      } catch { set({ hydrated: true, error: 'Saved bag could not be read. Your current bag is available in this tab.' }); }
    },
    setOpen: open => set({ open }), dismissError: () => set({ error: '' }),
    add: (product, color, size) => { update(addItem(get().items, makeItem(product, color, size))); set({ open: true }); },
    quantity: (id, quantity) => update(quantityItems(get().items, id, quantity)),
    checkout: values => {
      const { items, hydrated } = get(); if (!hydrated || !items.length) return false;
      if (Object.keys(validateCheckout(values)).length) { set({ error: 'Complete your details and choose a shipping and payment method to continue.' }); return false; }
      const courier = shippingMethods.find(method => method.id === values.courier);
      const payment = paymentMethods.find(method => method.id === values.payment);
      if (!courier || !payment) return false;
      const subtotal = subtotalCents(items);
      const order: Order = {
        reference: `NF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), items: structuredClone(items), totalCents: subtotal + courier.feeCents,
        checkout: { courier: courier.id, payment: payment.id, subtotalCents: subtotal, shippingCents: courier.feeCents },
      };
      try { save([], order); } catch { set({ error: 'Order could not be saved. Your bag is unchanged. Enable browser storage and try again.' }); return false; }
      set({ items: [], order, open: false, error: '' }); return true;
    },
  };
});
