import { test, expect } from '@playwright/test';
import { products } from '../../src/data/products';

const collection = '/collections/new-arrivals-26';

test('all catalog products have matching dedicated detail pages', async ({ page }) => {
  test.setTimeout(90000);
  for (const product of products) {
    const response = await page.goto(`/products/${product.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.pdp-desktop-title h1')).toHaveText(product.name);
    await expect(page.locator('.pdp-price')).toHaveText(`$${product.price}`);
    await expect(page).toHaveTitle(new RegExp(product.name));
    await expect(page.locator('.gallery-photo')).toHaveCount(product.colors[0].images.length);
    await expect(page.getByRole('button', { name: `Color: ${product.colors[0].name}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
    for (const size of product.sizes) {
      await expect(page.getByRole('button', { name: `Select size ${size}`, exact: true })).toBeVisible();
    }
    await expect(page.locator('.gallery-main img')).toHaveAttribute('alt', new RegExp(product.name));
    await expect.poll(() => page.locator('.gallery-main img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    if (product.category !== 'Socks') {
      await expect(page.getByRole('button', { name: 'Next image', exact: true })).toHaveCount(0);
      await expect(page.locator('.product-information')).not.toContainText('low-cut shape');
    }
  }
});

test('cards, search and quick-add detail links navigate to the selected product', async ({ page }) => {
  await page.goto('/');
  const featured = page.locator('.product-carousel .product-photo').first();
  const destination = await featured.getAttribute('href');
  expect(destination).toMatch(/^\/products\//);
  await featured.click();
  await expect(page).toHaveURL(destination!);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.goto(collection);
  await page.getByRole('link', { name: 'View Everyday Knit Runner', exact: true }).click();
  await expect(page).toHaveURL('/products/everyday-knit-runner');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Search products', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search products' }).fill('City Low');
  await page.getByRole('dialog').getByRole('link', { name: /City Low/ }).click();
  await expect(page).toHaveURL('/products/city-low');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.goto(collection);
  await page.getByRole('button', { name: 'Quick Add Coast Canvas', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Coast Canvas', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View full details', exact: true }).click();
  await expect(page).toHaveURL('/products/coast-canvas');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('footwear detail supports zoom, sizing, cart and fresh options between products', async ({ page }) => {
  await page.goto('/products/city-low');
  await page.getByRole('button', { name: 'Enlarge product image 1' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next enlarged image' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Fit Guide', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('US shoe sizes');
  await expect(page.getByRole('dialog')).not.toContainText('Sock');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Add to Bag', exact: true }).click();
  await expect(page.locator('.form-error')).toContainText('select a size');
  await page.getByRole('button', { name: 'Select size 9', exact: true }).click();
  await page.getByRole('button', { name: 'Add to Bag 9', exact: true }).click();
  await expect(page.getByTestId('cart-line')).toContainText('City Low');
  await expect(page.getByTestId('cart-line')).toContainText('Black');
  await expect(page.getByTestId('cart-line')).toContainText('Size: 9');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$120');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Search products', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search products' }).fill('Everyday Knit Runner');
  await page.getByRole('dialog').getByRole('link', { name: /Everyday Knit Runner/ }).click();
  await expect(page).toHaveURL('/products/everyday-knit-runner');
  await expect(page.getByRole('button', { name: 'Color: White', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.sizes button[aria-pressed="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add to Bag', exact: true }).click();
  await expect(page.locator('.form-error')).toContainText('select a size');
  await page.reload();
  await page.getByRole('button', { name: /Open bag/ }).click();
  await expect(page.getByTestId('cart-line')).toContainText('City Low');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$120');
});

test('unknown product slug returns 404', async ({ request }) => {
  const response = await request.get('/products/not-a-real-product');
  expect(response.status()).toBe(404);
});
