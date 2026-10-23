export const shippingMethods = [
  { id: 'jnt', name: 'J&T', feeCents: 500 },
  { id: 'jne', name: 'JNE', feeCents: 600 },
  { id: 'sicepat', name: 'SiCepat', feeCents: 400 },
] as const;

export const paymentMethods = [
  { id: 'qris', name: 'QRIS' },
  { id: 'va', name: 'Virtual Account (VA)' },
  { id: 'bank', name: 'Bank Transfer' },
] as const;

export const customerFields = [
  { key: 'fullName', label: 'Full name', autoComplete: 'name', type: 'text', maxLength: 100 },
  { key: 'email', label: 'Email address', autoComplete: 'email', type: 'email', maxLength: 254 },
  { key: 'phone', label: 'Phone number', autoComplete: 'tel', type: 'tel', maxLength: 30 },
  { key: 'address', label: 'Street address', autoComplete: 'street-address', type: 'text', maxLength: 400 },
  { key: 'province', label: 'Province', autoComplete: 'address-level1', type: 'text', maxLength: 100 },
  { key: 'city', label: 'City / Regency', autoComplete: 'address-level2', type: 'text', maxLength: 100 },
  { key: 'district', label: 'District', autoComplete: 'address-level3', type: 'text', maxLength: 100 },
  { key: 'postalCode', label: 'Postal code', autoComplete: 'postal-code', type: 'text', maxLength: 5 },
] as const;

export type CheckoutValues = Record<typeof customerFields[number]['key'], string> & { notes: string; courier: string; payment: string };
export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;
