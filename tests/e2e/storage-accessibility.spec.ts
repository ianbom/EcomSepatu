import { test, expect } from '@playwright/test';
import { fillCheckout } from './checkout-helpers';
const pdp='/products/anytime-no-show-heel-grip';

test('checkout storage failure preserves the active cart', async ({ page }) => {
  await page.goto(pdp); await page.getByRole('button',{name:'Select size M',exact:true}).click(); await page.getByRole('button',{name:'Add to Bag M'}).click();
  await page.evaluate(() => { const original=Storage.prototype.setItem; Storage.prototype.setItem=function(key,value){ if(key==='northform-store-v1'&&JSON.parse(value).order) throw new DOMException('Storage disabled','QuotaExceededError'); return original.call(this,key,value); }; });
  await page.getByRole('button',{name:'Checkout',exact:true}).click(); await expect(page).toHaveURL('/checkout');
  await fillCheckout(page); await page.getByRole('button',{name:'Place Order',exact:true}).click(); await expect(page).toHaveURL('/checkout');
  await expect(page.getByTestId('checkout-line')).toHaveCount(1); await expect(page.getByTestId('checkout-subtotal')).toHaveText('$14'); await expect(page.getByText('Order could not be saved.',{exact:false})).toBeVisible();
  await expect(page.getByRole('textbox',{name:'Full name',exact:true})).toHaveValue('Nadia Putri');
  await page.reload(); await page.getByRole('button',{name:/Open bag/}).click(); await expect(page.getByTestId('cart-line')).toHaveCount(1);
});
test('dialog keyboard dismissal and focus restore, accordion and carousel', async ({ page }) => {
  await page.goto('/'); const search=page.getByRole('button',{name:'Search products',exact:true}); await search.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox',{name:'Search products'})).toBeFocused(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(search).toBeFocused();
  await page.getByRole('button',{name:'Next products',exact:true}).click(); await expect.poll(()=>page.locator('.product-carousel').evaluate(element=>element.scrollLeft)).toBeGreaterThan(10);
  await page.goto(pdp); await page.getByRole('button',{name:'Care Instructions',exact:true}).click(); await expect(page.getByText('Wash cold with similar colors',{exact:false})).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'}); expect(await page.locator('html').evaluate(element=>getComputedStyle(element).scrollBehavior)).toBe('auto');
});
test('mobile swipe, image selection, and touch-friendly cart', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto(pdp);
  const session=await page.context().newCDPSession(page); await session.send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:440}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:90,y:440}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.getByRole('button',{name:'Show image 2'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Select size XL',exact:true}).click(); await page.getByRole('button',{name:'Add to Bag XL'}).click(); await expect(page.getByTestId('cart-line')).toContainText('Size: XL');
  await expect.poll(() => page.getByRole('dialog').evaluate(element => { const rect=element.getBoundingClientRect(); return rect.width<=innerWidth+1&&rect.left>=-1&&rect.right<=innerWidth+1; })).toBe(true);
});
