import { test, expect } from '@playwright/test';
import { fillCheckout } from './checkout-helpers';
const collection = '/collections/new-arrivals-26';
const pdp = '/products/anytime-no-show-heel-grip';

test('homepage navigation, search, quick view, newsletter', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Good things. In your own time.' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Shop by category' }).getByRole('link', { name: 'Men', exact: true })).toHaveAttribute('href', `${collection}?gender=men`);
  await expect(page.getByRole('region', { name: 'Shop by category' }).getByRole('link', { name: 'Women', exact: true })).toHaveAttribute('href', `${collection}?gender=women`);
  await page.getByRole('button', { name: 'Men', exact: true }).hover(); await expect(page.locator('#mega-menu')).toBeVisible();
  await page.locator('#mega-menu').getByRole('link', { name: 'New Arrivals' }).click(); await expect(page).toHaveURL(/gender=men/);
  await page.getByRole('button', { name: 'Search products', exact: true }).click(); await page.getByRole('textbox', { name: 'Search products' }).fill('heel grip');
  await page.getByRole('dialog').getByRole('link', { name: /Anytime No Show/ }).click(); await expect(page).toHaveURL(pdp);
  await page.getByRole('button', { name: 'Search products', exact: true }).click(); await page.getByRole('textbox', { name: 'Search products' }).fill('no-match-xyz'); await expect(page.getByText('No matches for')).toBeVisible(); await page.keyboard.press('Escape');
  await page.goto(collection); await page.getByRole('button', { name: 'Quick Add Everyday Knit Runner', exact: true }).click(); await expect(page.getByRole('dialog').getByRole('heading', { name: 'Everyday Knit Runner' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to Bag' }).click(); await expect(page.locator('.form-error')).toContainText('select a size'); await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Email address' }).fill('hello@example.com'); await page.getByRole('button', { name: 'Sign up for newsletter' }).click(); await expect(page.getByRole('status').filter({ hasText: 'no subscription was created' })).toBeVisible();
});
test('filters, clearing, empty results, all sorts, URL restore', async ({ page }) => {
  await page.goto(collection); await expect(page.getByTestId('product-card')).toHaveCount(18);
  await page.getByRole('button', { name: /Filter \(18 products\)/ }).click(); await page.getByRole('checkbox', { name: 'Socks', exact: true }).click(); await expect(page.getByRole('checkbox', { name: 'Socks', exact: true })).toBeChecked(); await expect(page.getByTestId('product-card')).toHaveCount(1); await expect(page).toHaveURL(/type=Socks/);
  await page.reload(); await expect(page.getByTestId('product-card')).toHaveCount(1); await page.getByRole('button', { name: 'Clear All', exact: true }).click(); await expect(page.getByTestId('product-card')).toHaveCount(18);
  for (const value of ['price-asc','price-desc','az','za','newest','best-selling','featured']) { await page.getByLabel('Sort products').selectOption(value); await expect(page).toHaveURL(new RegExp(`sort=${value}`)); }
  await page.getByLabel('Sort products').selectOption('price-asc'); await expect(page.getByTestId('product-card').first()).toHaveAttribute('data-price','14');
  await page.goto(`${collection}?type=Socks&size=13`); await expect(page.getByText('No matches. Plenty of possibilities.')).toBeVisible(); await page.getByRole('button', { name: 'Clear All Filters', exact: true }).click(); await expect(page.getByTestId('product-card')).toHaveCount(18);
});
test('PDP gallery, fit guide, variants, cart persistence and checkout', async ({ page }) => {
  await page.goto(pdp); await page.getByRole('button', { name: 'Next image', exact: true }).click(); await expect(page.getByRole('button', { name: 'Show image 2' })).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', { name: 'Enlarge product image 2' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Fit Guide', exact: true }).click(); await expect(page.getByRole('table')).toHaveCount(2); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Add to Bag', exact: true }).click(); await expect(page.locator('.form-error')).toContainText('select a size');
  await page.getByRole('button', { name: 'Color: Stone', exact: true }).click(); await page.getByRole('button', { name: 'Select size M', exact: true }).click(); await page.getByRole('button', { name: 'Add to Bag M' }).click();
  await expect(page.getByTestId('cart-line')).toHaveCount(1); await expect(page.getByTestId('cart-line')).toContainText('Stone'); await expect(page.getByTestId('cart-line')).toContainText('Size: M');
  await page.getByRole('button', { name: /Increase quantity/ }).click(); await expect(page.getByTestId('cart-subtotal')).toHaveText('$28');
  await page.getByRole('button', { name: /Decrease quantity/ }).click(); await expect(page.getByTestId('cart-subtotal')).toHaveText('$14');
  await page.reload(); await page.getByRole('button', { name: /Open bag/ }).click(); await expect(page.getByTestId('cart-line')).toHaveCount(1); await expect(page.getByTestId('cart-subtotal')).toHaveText('$14');
  await page.getByRole('button', { name: 'Checkout', exact: true }).click(); await expect(page).toHaveURL('/checkout'); await fillCheckout(page); await page.getByRole('button', { name: 'Place Order', exact: true }).click(); await expect(page).toHaveURL('/checkout/success'); await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible(); await expect(page.getByText('Size M',{exact:false})).toBeVisible();
  await page.reload(); await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible(); await page.getByRole('button', { name: /Open bag/ }).click(); await expect(page.getByText('Your bag is currently empty.')).toBeVisible(); await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Continue Shopping', exact: true }).click(); await expect(page).toHaveURL('/');
});
test('quick add merges variants, separates sizes, removes products', async ({ page }) => {
  await page.goto(collection);
  for (const size of ['7','7','8']) { await page.getByRole('button', { name: 'Quick Add City Low', exact: true }).click(); await page.getByRole('button', { name: `Select size ${size}`, exact: true }).click(); await page.getByRole('button', { name: `Add to Bag ${size}` }).click(); await page.keyboard.press('Escape'); }
  await page.getByRole('button', { name: /Open bag/ }).click(); await expect(page.getByTestId('cart-line')).toHaveCount(2); await expect(page.getByTestId('cart-subtotal')).toHaveText('$360');
  await page.getByRole('button', { name: 'Remove City Low', exact: true }).first().click(); await expect(page.getByTestId('cart-line')).toHaveCount(1); await page.getByRole('button', { name: 'Remove City Low', exact: true }).click(); await expect(page.getByText('Your bag is currently empty.')).toBeVisible();
});
test('missing order and corrupt storage recover', async ({ page }) => {
  await page.goto('/checkout/success'); await expect(page.getByText('We could not find an order confirmation.')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('northform-store-v1','{broken')); await page.reload(); await expect(page.getByText('We could not find an order confirmation.')).toBeVisible();
});
for (const width of [390,768,1024,1440,1920]) {
  test(`responsive pages and images at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 }); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const path of ['/',collection,pdp,'/products/city-low','/checkout','/checkout/success']) {
      if (path === '/checkout') {
        await page.goto(pdp); await page.getByRole('button', { name: 'Select size M', exact: true }).click(); await page.getByRole('button', { name: 'Add to Bag M' }).click(); await page.getByRole('button', { name: 'Checkout', exact: true }).click(); await expect(page).toHaveURL('/checkout');
      } else if (path === '/checkout/success') {
        await fillCheckout(page); await page.getByRole('button', { name: 'Place Order', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
      } else await page.goto(path);
      await page.locator('main').waitFor();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('main img').evaluateAll(images => images.forEach(image => image.setAttribute('loading', 'eager')));
      await page.evaluate(async () => { const height=document.documentElement.scrollHeight; for(let top=0;top<height;top+=700){scrollTo({top,behavior:'instant'});await new Promise(resolve=>setTimeout(resolve,40));} scrollTo({top:0,behavior:'instant'}); });
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('main img')].every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)), { timeout: 30000 }).toBe(true);
      await page.screenshot({ path: `test-results/visual-${width}-${path === '/' ? 'home' : path.split('/').pop()}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
    if (width===390) {
      await page.goto('/'); await page.getByRole('button', { name: 'Open main menu' }).click(); await page.getByRole('dialog').getByRole('link', { name: /New Arrivals/ }).click(); await expect(page).toHaveURL(collection);
      await page.getByRole('button', { name: /Filter and Sort/ }).click(); await page.getByRole('checkbox', { name: 'Socks', exact: true }).click(); await expect(page.getByRole('checkbox', { name: 'Socks', exact: true })).toBeChecked(); await page.getByRole('button', { name: 'Show 1 Products' }).click(); await expect(page.getByTestId('product-card')).toHaveCount(1);
    }
  });
}
