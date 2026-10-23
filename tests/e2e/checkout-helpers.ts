import type { Page } from '@playwright/test';

export async function fillCheckout(page: Page, courier = 'J&T', payment = 'QRIS') {
  for (const [label, value] of [
    ['Full name', 'Nadia Putri'], ['Email address', 'nadia@example.com'], ['Phone number', '081234567890'],
    ['Street address', 'Jalan Melati 10'], ['Province', 'Jawa Barat'], ['City / Regency', 'Bandung'],
    ['District', 'Coblong'], ['Postal code', '40132'],
  ]) await page.locator('#checkout-form').getByRole('textbox', { name: label, exact: true }).fill(value);
  await page.getByRole('radio', { name: courier, exact: true }).check();
  await page.getByRole('radio', { name: payment, exact: true }).check();
}
