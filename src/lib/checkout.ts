import { customerFields, shippingMethods, paymentMethods } from '../data/checkout.ts';
import type { CheckoutValues, CheckoutErrors } from '../data/checkout.ts';

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  for (const field of customerFields) {
    const value = values[field.key].trim();
    if (!value) errors[field.key] = `${field.label} is required.`;
    else if (value.length > field.maxLength) errors[field.key] = `Enter no more than ${field.maxLength} characters.`;
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  const phone = values.phone.trim();
  if (!errors.phone && (!/^\+?[\d\s()-]+$/.test(phone) || !/^\d{10,15}$/.test(phone.replace(/\D/g, '')))) errors.phone = 'Enter a valid phone number with 10-15 digits.';
  if (!errors.postalCode && !/^\d{5}$/.test(values.postalCode.trim())) errors.postalCode = 'Postal code must contain 5 digits.';
  if (values.notes.length > 1000) errors.notes = 'Enter no more than 1,000 characters.';
  if (!shippingMethods.some(method => method.id === values.courier)) errors.courier = 'Choose a shipping method.';
  if (!paymentMethods.some(method => method.id === values.payment)) errors.payment = 'Choose a payment method.';
  return errors;
}
