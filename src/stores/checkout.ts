/**
 * Checkout Store - Manages shipping address and checkout state
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// Shipping address structure
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

// Default empty address
const emptyAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'US',
};

// Persistent shipping address (saves for returning customers)
export const shippingAddress = persistentAtom<ShippingAddress>(
  'commerce-kit-shipping',
  emptyAddress,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

// Checkout processing state
export const isProcessing = atom<boolean>(false);
export const checkoutError = atom<string | null>(null);

// PayPal order ID after creation
export const paypalOrderId = atom<string | null>(null);

// Validation
export const isAddressValid = computed(shippingAddress, (addr) => {
  return (
    addr.firstName.trim() !== '' &&
    addr.lastName.trim() !== '' &&
    addr.email.trim() !== '' &&
    addr.email.includes('@') &&
    addr.address1.trim() !== '' &&
    addr.city.trim() !== '' &&
    addr.postcode.trim() !== '' &&
    addr.country.trim() !== ''
  );
});

// Update shipping address
export function updateShippingAddress(updates: Partial<ShippingAddress>): void {
  shippingAddress.set({ ...shippingAddress.get(), ...updates });
}

// Coupon state
export const couponCode = atom<string>('');
export const appliedDiscount = atom<number>(0);
export const couponError = atom<string | null>(null);
export const couponLoading = atom<boolean>(false);

// Apply coupon code
export async function applyCoupon(code: string, subtotal: number): Promise<void> {
  couponLoading.set(true);
  couponError.set(null);

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await res.json();

    if (!data.valid) {
      couponError.set(data.error || 'Invalid coupon');
      appliedDiscount.set(0);
      couponCode.set('');
      return;
    }

    couponCode.set(data.code);
    appliedDiscount.set(data.discount);
  } catch {
    couponError.set('Failed to validate coupon');
  } finally {
    couponLoading.set(false);
  }
}

// Remove applied coupon
export function removeCoupon(): void {
  couponCode.set('');
  appliedDiscount.set(0);
  couponError.set(null);
}

// Clear checkout state
export function clearCheckoutState(): void {
  isProcessing.set(false);
  checkoutError.set(null);
  paypalOrderId.set(null);
  couponCode.set('');
  appliedDiscount.set(0);
  couponError.set(null);
  couponLoading.set(false);
}
