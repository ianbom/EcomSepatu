import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { ProductDetail } from '@/components/products/product-detail';

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(product => product.slug === slug);
  if (!product) notFound();
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find(product => product.slug === slug);
  if (!product) notFound();
  return <main id="main-content"><ProductDetail key={product.id} product={product} /></main>;
}
