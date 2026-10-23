import test from 'node:test';
import assert from 'node:assert/strict';
import { products, productPath } from '../src/data/products.ts';
import { validateCheckout } from '../src/lib/checkout.ts';
import { selectProducts, addItem, quantityItems, subtotalCents, restoreItems, restoreOrder, makeItem } from '../src/lib/commerce.ts';

test('catalog has 18 distinct, complete products with sock sizing', () => {
  assert.equal(products.length,18); assert.equal(new Set(products.map(product=>product.id)).size,18);
  assert.equal(new Set(products.map(productPath)).size, 18);
  for (const product of products) assert.equal(productPath(product), `/products/${product.slug}`);
  assert.deepEqual(products.find(product=>product.category==='Socks')?.sizes,['S','M','L','XL']);
});
test('filter OR within facets, AND across facets, unisex included', () => {
  const result=selectProducts(products,new URLSearchParams('gender=men&type=Socks'));
  assert.equal(result.length,1); assert.equal(result[0].gender,'unisex');
  assert.ok(selectProducts(products,new URLSearchParams('color=Black&color=White')).length>1);
  assert.equal(selectProducts(products,new URLSearchParams('size=impossible')).length,0);
});
test('all sort modes, search, and price filters derive from catalog', () => {
  for(const sort of ['price-asc','price-desc','az','za','newest','best-selling','featured']) {
    const result=selectProducts(products,new URLSearchParams({sort})); assert.equal(result.length,18);
    if(sort==='price-asc') assert.ok(result.every((product,index)=>!index||product.price>=result[index-1].price));
    if(sort==='price-desc') assert.ok(result.every((product,index)=>!index||product.price<=result[index-1].price));
    if(sort==='az') assert.ok(result.every((product,index)=>!index||product.name.localeCompare(result[index-1].name)>=0));
    if(sort==='za') assert.ok(result.every((product,index)=>!index||product.name.localeCompare(result[index-1].name)<=0));
    if(sort==='best-selling') assert.equal(result[0].salesRank,1);
    if(sort==='newest') assert.equal(result[0].id,'nf-18');
    if(sort==='featured') assert.ok(result.slice(0,7).every(product=>product.featured));
  }
  assert.equal(selectProducts(products,new URLSearchParams('q=heel+grip')).length,1);
  assert.ok(selectProducts(products,new URLSearchParams('max=80')).every(product=>product.price<=80));
});
test('cart merges identical variants, separates size and color, rejects invalid input', () => {
  const product=products[17]; const item=makeItem(product,product.colors[0].id,'M');
  let items=addItem([],item); items=addItem(items,item); assert.equal(items.length,1); assert.equal(items[0].quantity,2);
  items=addItem(items,makeItem(product,product.colors[0].id,'L')); assert.equal(items.length,2);
  items=addItem(items,makeItem(product,product.colors[1].id,'M')); assert.equal(items.length,3);
  assert.throws(()=>makeItem(product,'unknown','M')); assert.throws(()=>makeItem(product,product.colors[0].id,''));
  assert.equal(quantityItems(items,item.variantId,-1).length,3);
  assert.equal(quantityItems(items,item.variantId,0).length,2);
  assert.equal(subtotalCents(items),product.price*100*4);
});
test('restored storage validates variants and ignores spoofed prices', () => {
  const product=products[17]; const item=makeItem(product,product.colors[0].id,'M');
  assert.deepEqual(restoreItems([{...item,unitPrice:0,name:'spoofed'}]),[item]);
  assert.deepEqual(restoreItems([{...item,quantity:-1},{...item,size:'bad'},null]),[]);
  assert.deepEqual(restoreItems('malformed'),[]);
});
test('order snapshots retain historical prices and reject unsafe images or totals', () => {
  const product=products[17]; const item={...makeItem(product,product.colors[0].id,'M'),unitPrice:12};
  const order={reference:'NF-ABC12345',createdAt:'2026-10-23T12:00:00.000Z',items:[item],totalCents:1200};
  assert.deepEqual(restoreOrder(order),order);
  assert.equal(restoreOrder({...order,totalCents:0}),null);
  assert.equal(restoreOrder({...order,items:[{...item,image:'/images/../../private'}]}),null);
  assert.equal(restoreOrder({...order,items:[{...item,quantity:1.5}]}),null);
});

const checkoutValues = { fullName: 'Nadia Putri', email: 'nadia@example.com', phone: '081234567890', address: 'Jalan Melati 10', province: 'Jawa Barat', city: 'Bandung', district: 'Coblong', postalCode: '40132', notes: '', courier: 'jnt', payment: 'qris' };
test('checkout requires valid personal details, address and explicit dummy methods', () => {
  assert.deepEqual(validateCheckout(checkoutValues), {});
  const errors = validateCheckout({ ...checkoutValues, fullName: '   ', email: 'invalid', phone: 'abc123', postalCode: '123', courier: '', payment: 'real-payment' });
  for (const key of ['fullName', 'email', 'phone', 'postalCode', 'courier', 'payment']) assert.ok(errors[key as keyof typeof errors]);
  assert.equal(errors.fullName, 'Full name is required.');
  assert.equal(errors.email, 'Enter a valid email address.');
  assert.equal(errors.courier, 'Choose a shipping method.');
  assert.equal(errors.payment, 'Choose a payment method.');
  for (const key of ['address', 'province', 'city', 'district'] as const) assert.ok(validateCheckout({ ...checkoutValues, [key]: ' ' })[key]);
  assert.ok(validateCheckout({ ...checkoutValues, notes: 'x'.repeat(1001) }).notes);
  assert.ok(validateCheckout({ ...checkoutValues, fullName: 'x'.repeat(101) }).fullName);
  for (const courier of ['jnt', 'jne', 'sicepat']) for (const payment of ['qris', 'va', 'bank']) {
    assert.deepEqual(validateCheckout({ ...checkoutValues, courier, payment }), {});
  }
});
test('checkout snapshots restore shipping totals without rewriting historical fees', () => {
  const product = products[17];
  const item = { ...makeItem(product, product.colors[0].id, 'M'), unitPrice: 12 };
  const order = { reference: 'NF-CHECK123', createdAt: '2026-10-23T12:00:00.000Z', items: [item], totalCents: 1550, checkout: { courier: 'jnt', payment: 'qris', subtotalCents: 1200, shippingCents: 350 } };
  assert.deepEqual(restoreOrder(order), order);
  assert.equal(restoreOrder({ ...order, totalCents: 1200 }), null);
  for (const checkout of [
    { ...order.checkout, courier: 'unknown' }, { ...order.checkout, payment: 'real' },
    { ...order.checkout, subtotalCents: 1 }, { ...order.checkout, shippingCents: -1 },
    { ...order.checkout, shippingCents: 3.5 }, null,
  ]) assert.equal(restoreOrder({ ...order, checkout }), null);
});
