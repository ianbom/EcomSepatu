import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Collection } from '@/components/products/collection';
export const metadata: Metadata = { title: 'New Arrivals', description: 'Explore 18 considered styles. Shop sneakers, slip-ons, sandals, and everyday essentials.' };
export default function CollectionPage() { return <main id="main-content"><Suspense fallback={<div className="page-loading">Opening the collection…</div>}><Collection /></Suspense></main>; }
