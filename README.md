# NORTHFORM

Dark, reference-based footwear storefront. Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-style Radix primitives, Lucide, and Zustand. No API, database, authentication, or payment integration.

## Run

Node.js 22.13+ and npm recommended.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. For production:

```powershell
npm run build
npm start
```

## Routes

- `/` — campaign homepage, category tiles, bestseller carousel.
- `/collections/new-arrivals-26` — 18 products, URL-backed filters, seven sorting modes, Quick View / Quick Add.
- `/products/[slug]` — dedicated detail pages for all 18 catalog products, with product-specific metadata, sizing, zoom, swatches, Fit Guide, and Add to Bag. The existing `/products/anytime-no-show-heel-grip` URL remains available.
- `/checkout` — required contact/address form, dummy courier and payment choices, and a live order summary. An empty bag offers a return to shopping.
- `/checkout/success` — persisted local order snapshot or an honest empty state.

Product cards and search results navigate to each product's detail page. Quick Add opens variant selection with a full-details link. Unknown product slugs return 404. Navigation categories filter the supported collection. Support, privacy, care, and brand content open scoped dialogs.

## Checks

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

For browser tests, start the production app in a separate PowerShell terminal:

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3187
```

Then run `npm run test:e2e`. Tests use installed Google Chrome in isolated browser contexts. Set `$env:QA_ORIGIN='http://localhost:YOUR_PORT'` to use another origin. Screenshots are written to `test-results`; the report opens with `npx playwright show-report`.

## Data & behavior

- Catalog: `src/data/products.ts`; independent content: `src/data/content.ts`.
- Cart state: Zustand, localStorage key `northform-store-v1`; no cookies or remote cart.
- Filter query parameters: repeated `gender`, `size`, `color`, `type`, `material`; numeric `min`/`max`; `q`; `sort`. OR within a facet, AND across facets. Unisex products remain visible in men/women browsing.
- Same product/color/size merges; different variants stay separate. Quantities range from 1–99; Remove deletes a line.
- The bag's Checkout button opens `/checkout` without clearing items. The form requires name, email, phone, street address, province, city, district, a five-digit Indonesian postal code, and explicit courier/payment selections. Notes are optional. Invalid fields display inline errors and receive focus.
- Dummy couriers: J&T ($5), JNE ($6), SiCepat ($4). Dummy payment choices: QRIS, Virtual Account (VA), Bank Transfer. Prices remain in USD; these are not official carrier rates. No QR code, account number, external payment service, shipping API, or backend is used.
- Checkout and confirmation use English retail copy, without on-screen simulation labels or development notices. The Place Order action still completes only the local order flow; it does not authorize a payment or create a shipment.
- On valid submission, checkout writes the order snapshot and empty active cart together, then navigates to `/checkout/success`. Failed storage leaves the bag and form intact. The snapshot includes product subtotal, simulated shipping, total, and selected courier/payment, but no personal details, address, or notes. Personal form fields are memory-only and reset on refresh.
- Legacy order snapshots without checkout details remain readable at their original historical total. New snapshots retain their saved shipping fee even if catalog fees later change. No payment is collected, shipment arranged, or external order created.
- Newsletter validates an email locally and acknowledges that no subscription was submitted.

## Photography limitations

See `ASSETS.md` for sources, licenses, and required sock attribution. Sock details are crops of one licensed photograph; Stone is a grayscale derivative. Stock footwear photography includes some visible third-party marks and varied backgrounds; product names describe a locally curated catalog, not an authenticated inventory. Before actual retail use, replace it with owned, variant-accurate product photography and verified specifications.

## Dependency audit

At delivery, `npm audit --omit=dev` reports no production vulnerabilities. The full audit reports five high-severity development dependency findings through `eslint-config-next -> fast-glob -> micromatch -> braces`. npm's proposed forced fix downgrades the Next lint configuration to version 14, so it is not applied to this Next 16 project. These findings affect the lint toolchain, not the shipped storefront bundle; reassess when an upstream compatible fix is published.

## Design

The inspected reference determines composition, spacing, responsive ordering, and image geometry. NORTHFORM uses the requested charcoal/ivory tokens, DM Sans body/navigation, and Newsreader product titles. UI primitives live under `src/components/ui` with custom retail geometry rather than default shadcn styling. Motion uses CSS/native scrolling and respects reduced-motion preferences.
