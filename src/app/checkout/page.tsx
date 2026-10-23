import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout-form';

export const metadata: Metadata = { title: 'Checkout', description: 'Review your NORTHFORM selection and complete your order.' };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
