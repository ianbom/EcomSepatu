import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { fillCheckout } from './checkout-helpers';
import { sock } from '../../src/data/products';
import { makeItem } from '../../src/lib/commerce';

async function openCheckout(page: Page) {
  await page.goto('/products/anytime-no-show-heel-grip');
  await page.getByRole('button', { name: 'Select size M', exact: true }).click();
  await page.getByRole('button', { name: 'Add to Bag M', exact: true }).click();
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(page).toHaveURL('/checkout');
}

test('checkout validates required fields, formats and explicit method choices', async ({ page }) => {
  await openCheckout(page);
  await expect(page.getByTestId('checkout-line')).toContainText('Anytime No Show Heel Grip Sock');
  await expect(page.getByTestId('checkout-subtotal')).toHaveText('$14');
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northform-store-v1')!).items.length)).toBe(1);
  await page.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toBeFocused();
  await expect(page.locator('#checkout-courier-error')).toBeVisible();
  await expect(page.locator('#checkout-payment-error')).toBeVisible();
  await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('   ');
  await page.locator('#checkout-form').getByRole('textbox', { name: 'Email address', exact: true }).fill('bad-email');
  await page.getByRole('textbox', { name: 'Phone number', exact: true }).fill('abc123');
  await page.getByRole('textbox', { name: 'Postal code', exact: true }).fill('123');
  for (const field of ['fullName', 'email', 'phone', 'postalCode']) await expect(page.locator(`#checkout-${field}-error`)).toBeVisible();
  await fillCheckout(page);
  await expect(page.locator('#checkout-form .form-error')).toHaveCount(0);
  for (const [courier, fee, total] of [['J&T', '$5', '$19'], ['JNE', '$6', '$20'], ['SiCepat', '$4', '$18']]) {
    await page.getByRole('radio', { name: courier, exact: true }).check();
    await expect(page.getByTestId('checkout-shipping')).toHaveText(fee);
    await expect(page.getByTestId('checkout-total')).toHaveText(total);
  }
});

test('checkout uses English copy without preview disclaimers', async ({ page }) => {
  await openCheckout(page);
  await expect(page.locator('main')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Contact details', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shipping address', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order summary', exact: true })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/\b(demo|dummy|simulasi|simulation|simulated)\b|No payment (was )?collected|No shipment has been arranged|data contoh/i);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /simulation|dummy|demo/i);
  await page.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(page.locator('#checkout-fullName-error')).toHaveText('Full name is required.');
  await expect(page.locator('#checkout-courier-error')).toHaveText('Choose a shipping method.');
  await expect(page.locator('#checkout-payment-error')).toHaveText('Choose a payment method.');
});

for (const [courier, payment, total] of [['J&T', 'QRIS', '$19'], ['JNE', 'Virtual Account (VA)', '$20'], ['SiCepat', 'Bank Transfer', '$18']]) {
  test(`dummy checkout completes with ${courier} and ${payment}`, async ({ page }) => {
    await openCheckout(page);
    await fillCheckout(page, courier, payment);
    await page.getByLabel('Order notes', { exact: false }).fill('Catatan contoh pribadi');
    await page.getByRole('button', { name: 'Place Order', exact: true }).dblclick();
    await expect(page).toHaveURL('/checkout/success');
    await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/\b(demo|dummy|simulasi|simulation|simulated)\b|No payment (was )?collected|No shipment has been arranged/i);
    await expect(page.locator('.confirmation-methods')).toContainText('Shipping method');
    await expect(page.locator('.confirmation-methods')).toContainText('Payment method');
    await expect(page.locator('.confirmation-methods')).toContainText(courier);
    await expect(page.locator('.confirmation-methods')).toContainText(payment);
    await expect(page.getByTestId('order-total')).toHaveText(total);
    await expect(page.getByTestId('order-subtotal')).toHaveText('$14');
    const saved = await page.evaluate(() => localStorage.getItem('northform-store-v1')!);
    expect(JSON.parse(saved).items).toEqual([]);
    for (const personal of ['Nadia Putri', 'nadia@example.com', '081234567890', 'Jalan Melati 10', 'Catatan contoh pribadi']) expect(saved).not.toContain(personal);
    const reference = JSON.parse(saved).order.reference;
    await page.reload();
    await expect(page.getByTestId('order-total')).toHaveText(total);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northform-store-v1')!).order.reference)).toBe(reference);
  });
}

test('checkout uses current cart quantities and discards personal form data on reload', async ({ page }) => {
  await openCheckout(page);
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Edit bag', exact: true }).click();
  await page.getByRole('button', { name: /Increase quantity/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('checkout-subtotal')).toHaveText('$28');
  await expect(page.getByTestId('checkout-total')).toHaveText('$33');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('');
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(0);
  await expect(page.getByTestId('checkout-subtotal')).toHaveText('$28');
  await fillCheckout(page, 'SiCepat', 'Bank Transfer');
  await page.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(page.getByTestId('order-total')).toHaveText('$32');
});

test('empty checkout offers shopping without submitting an order', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Your bag is empty.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place Order' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Continue Shopping' }).click();
  await expect(page).toHaveURL('/collections/new-arrivals-26');
});

test('legacy order confirmation retains its historical total without checkout metadata', async ({ page }) => {
  await page.goto('/');
  const order = { reference: 'NF-LEGACY12', createdAt: '2026-10-23T12:00:00.000Z', items: [{ ...makeItem(sock, 'natural', 'M'), unitPrice: 12 }], totalCents: 1200 };
  await page.evaluate(order => localStorage.setItem('northform-store-v1', JSON.stringify({ version: 1, items: [], order })), order);
  await page.goto('/checkout/success');
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('$12');
  await expect(page.locator('.confirmation-methods')).toHaveCount(0);
});
