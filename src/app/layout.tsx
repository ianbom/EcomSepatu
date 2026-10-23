import type { Metadata } from 'next';
import { DM_Sans, Newsreader } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StorefrontOverlays } from '@/components/storefront-overlays';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
export const metadata: Metadata = { title: { default: 'NORTHFORM — Find Your Everyday', template: '%s | NORTHFORM' }, description: 'Considered footwear. Quiet details. A new everyday. Explore the NORTHFORM collection of sneakers, slip-ons, and essentials.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${serif.variable}`}><a className="skip-link" href="#main-content">Skip to content</a><Header />{children}<Footer /><StorefrontOverlays /></body></html>;
}
