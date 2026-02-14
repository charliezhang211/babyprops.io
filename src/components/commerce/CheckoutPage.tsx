/**
 * CheckoutPage - React Island Component
 * Handles shipping address form and PayPal payment
 * Uses Supabase for order storage — Tailwind only, no external CSS
 * Brand palette: Dusty Rose / Warm Cream / Soft Brown / Sage Green
 */

import { useStore } from '@nanostores/react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';

const LazyPayPalProvider = lazy(() =>
  import('@paypal/react-paypal-js').then((mod) => ({ default: mod.PayPalScriptProvider }))
);
const LazyPayPalButtons = lazy(() =>
  import('@paypal/react-paypal-js').then((mod) => ({ default: mod.PayPalButtons }))
);
import {
  cartItems,
  cartSubtotal,
  clearCart,
  loadCartFromServer,
  type CartItem,
} from '@/stores/cart';
import {
  shippingAddress,
  updateShippingAddress,
  isAddressValid,
  isProcessing,
  checkoutError,
  couponCode as couponCodeStore,
  appliedDiscount,
  couponError as couponErrorStore,
  couponLoading,
  applyCoupon,
  removeCoupon,
  type ShippingAddress,
} from '@/stores/checkout';
import { authUser, isAuthenticated } from '@/stores/auth';
import { formatPrice, CURRENCY } from '@/config/site';
import { siteSettings } from '@/config/site-settings';

const L = siteSettings.checkout;

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

/* ------------------------------------------------------------------ */
/*  Shared Tailwind classnames                                         */
/* ------------------------------------------------------------------ */

const inputCls =
  'w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50 disabled:bg-gray-100';

const labelCls = 'block text-sm font-medium text-brand-dark mb-1.5';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SavedAddress {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  is_default: boolean;
}

/* ------------------------------------------------------------------ */
/*  AddressForm                                                        */
/* ------------------------------------------------------------------ */

interface AddressFormProps {
  address: ShippingAddress;
  onChange: (updates: Partial<ShippingAddress>) => void;
  disabled?: boolean;
  savedAddresses?: SavedAddress[];
}

function AddressForm({ address, onChange, disabled, savedAddresses }: AddressFormProps) {
  const [showSaved, setShowSaved] = useState(false);

  const handleSelectAddress = (saved: SavedAddress) => {
    const nameParts = saved.full_name.split(' ');
    onChange({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      address1: saved.address_line1,
      address2: saved.address_line2 || '',
      city: saved.city,
      state: saved.state,
      postcode: saved.postal_code,
      country: saved.country,
      phone: saved.phone || '',
      email: saved.email || address.email,
    });
    setShowSaved(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif font-bold text-brand-dark">{L.shippingTitle}</h2>
        {savedAddresses && savedAddresses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSaved(!showSaved)}
            className="text-xs text-brand hover:text-brand-dark transition-colors"
          >
            {showSaved ? L.enterNewAddress : L.useSavedAddress}
          </button>
        )}
      </div>

      {/* Saved addresses */}
      {showSaved && savedAddresses && savedAddresses.length > 0 && (
        <div className="grid gap-2">
          {savedAddresses.map((saved) => (
            <button
              key={saved.id}
              type="button"
              onClick={() => handleSelectAddress(saved)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                saved.is_default
                  ? 'border-brand/60 bg-brand/10'
                  : 'border-gray-200 bg-white hover:border-brand/40 hover:bg-brand-light/30'
              }`}
            >
              <span className="block text-sm text-gray-900 font-medium">{saved.full_name}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{saved.address_line1}</span>
              <span className="block text-xs text-gray-500">
                {saved.city}, {saved.state} {saved.postal_code}
              </span>
              {saved.is_default && (
                <span className="inline-block mt-1.5 text-[10px] font-semibold text-brand bg-brand/15 px-2 py-0.5 rounded-full">
                  {L.defaultBadge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Manual form */}
      {!showSaved && (
        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelCls}>{L.firstNameLabel} *</label>
              <input
                type="text"
                id="firstName"
                value={address.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                disabled={disabled}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>{L.lastNameLabel} *</label>
              <input
                type="text"
                id="lastName"
                value={address.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                disabled={disabled}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelCls}>{L.emailLabel} *</label>
              <input
                type="email"
                id="email"
                value={address.email}
                onChange={(e) => onChange({ email: e.target.value })}
                disabled={disabled}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelCls}>{L.phoneLabel}</label>
              <input
                type="tel"
                id="phone"
                value={address.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                disabled={disabled}
                className={inputCls}
              />
            </div>
          </div>

          {/* Street */}
          <div>
            <label htmlFor="address1" className={labelCls}>{L.address1Label} *</label>
            <input
              type="text"
              id="address1"
              value={address.address1}
              onChange={(e) => onChange({ address1: e.target.value })}
              placeholder={L.address1Placeholder}
              disabled={disabled}
              required
              className={inputCls}
            />
          </div>

          {/* Apt */}
          <div>
            <label htmlFor="address2" className={labelCls}>{L.address2Label}</label>
            <input
              type="text"
              id="address2"
              value={address.address2}
              onChange={(e) => onChange({ address2: e.target.value })}
              disabled={disabled}
              className={inputCls}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className={labelCls}>{L.cityLabel} *</label>
              <input
                type="text"
                id="city"
                value={address.city}
                onChange={(e) => onChange({ city: e.target.value })}
                disabled={disabled}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="state" className={labelCls}>{L.stateLabel}</label>
              {address.country === 'US' ? (
                <select
                  id="state"
                  value={address.state}
                  onChange={(e) => onChange({ state: e.target.value })}
                  disabled={disabled}
                  className={inputCls}
                >
                  <option value="">{L.selectStateLabel}</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="state"
                  value={address.state}
                  onChange={(e) => onChange({ state: e.target.value })}
                  disabled={disabled}
                  className={inputCls}
                />
              )}
            </div>
          </div>

          {/* Postcode + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postcode" className={labelCls}>{L.postcodeLabel} *</label>
              <input
                type="text"
                id="postcode"
                value={address.postcode}
                onChange={(e) => onChange({ postcode: e.target.value })}
                disabled={disabled}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="country" className={labelCls}>{L.countryLabel} *</label>
              <select
                id="country"
                value={address.country}
                onChange={(e) => onChange({ country: e.target.value, state: '' })}
                disabled={disabled}
                required
                className={inputCls}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OrderSummary                                                       */
/* ------------------------------------------------------------------ */

function OrderSummary({
  items,
  subtotal,
  discount,
  activeCoupon,
  couponErr,
  loading,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  activeCoupon: string;
  couponErr: string | null;
  loading: boolean;
}) {
  const [inputCode, setInputCode] = useState('');

  const handleApply = () => {
    const code = inputCode.trim();
    if (code) applyCoupon(code, subtotal);
  };

  const handleRemove = () => {
    removeCoupon();
    setInputCode('');
  };

  const total = subtotal - discount;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-serif font-bold text-brand-dark">{L.orderSummaryTitle}</h2>

      {/* Item list */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const itemTotal = item.unit_price * item.quantity;
          return (
            <div key={item.sku} className="flex gap-3">
              {/* Thumb */}
              <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-light">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-dark/30 text-xs">No Image</div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-gray-500">{item.variant}</p>
                )}
                <p className="text-xs text-gray-500">
                  {siteSettings.cart.quantityLabel}: {item.quantity}
                </p>
              </div>
              <span className="text-sm text-gray-900 font-medium flex-shrink-0">
                {formatPrice(itemTotal)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Coupon input */}
      <div className="pt-3 border-t border-gray-200">
        <label className="block text-sm font-medium text-brand-dark mb-1.5">{L.couponLabel}</label>
        {activeCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-brand-accent/10 border border-brand-accent/30 rounded-lg">
            <span className="text-sm text-brand-accent font-medium">{activeCoupon}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              {L.couponRemoveButton}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder={L.couponPlaceholder}
              disabled={loading}
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !inputCode.trim()}
              className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-300 flex-shrink-0"
            >
              {loading ? L.couponApplyingButton : L.couponApplyButton}
            </button>
          </div>
        )}
        {couponErr && (
          <p className="mt-1.5 text-xs text-red-500">{couponErr}</p>
        )}
      </div>

      {/* Totals */}
      <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{siteSettings.cart.subtotalLabel}</span>
          <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-brand-accent">
            <span>{L.couponDiscountLabel}</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>{siteSettings.cart.shippingLabel}</span>
          <span className="text-brand-accent font-medium">{siteSettings.cart.shippingFree}</span>
        </div>
        <div className="h-px bg-gray-200" />
        <div className="flex justify-between text-gray-900 font-bold text-base">
          <span>{siteSettings.cart.totalLabel}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CheckoutPage (default export)                                      */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const storeItems = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const address = useStore(shippingAddress);
  const addressValid = useStore(isAddressValid);
  const processing = useStore(isProcessing);
  const error = useStore(checkoutError);
  const user = useStore(authUser);
  const loggedIn = useStore(isAuthenticated);

  const activeCoupon = useStore(couponCodeStore);
  const discount = useStore(appliedDiscount);
  const couponErr = useStore(couponErrorStore);
  const couponLoad = useStore(couponLoading);

  const [isMounted, setIsMounted] = useState(false);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paypalVisible, setPaypalVisible] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  const paypalClientId = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID || 'test';

  /* ---- Mount: instant localStorage read + parallel background fetches ---- */
  useEffect(() => {
    // 1. Instant: read cart from localStorage (synchronous, no lag)
    const stored = localStorage.getItem('commerce-kit-cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalItems(parsed);
        if (parsed.length > 0 && storeItems.length === 0) {
          cartItems.set(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }

    // 2. Instant: prefill user info from auth store
    if (user?.email && !address.email) {
      updateShippingAddress({ email: user.email });
    }
    if (user?.user_metadata?.full_name && !address.firstName) {
      const nameParts = user.user_metadata.full_name.split(' ');
      updateShippingAddress({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
      });
    }

    setIsMounted(true);

    // 3. Background: fire cart sync + address fetch in parallel
    const bgCartSync = loadCartFromServer().catch((err) => {
      console.error('Background cart sync failed:', err);
    });

    const bgAddressFetch = loggedIn
      ? fetch('/api/account/addresses')
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return;
            setSavedAddresses(data.addresses || []);
            const defaultAddr = data.addresses?.find((a: SavedAddress) => a.is_default);
            if (defaultAddr && !address.address1) {
              const nameParts = defaultAddr.full_name.split(' ');
              updateShippingAddress({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                address1: defaultAddr.address_line1,
                address2: defaultAddr.address_line2 || '',
                city: defaultAddr.city,
                state: defaultAddr.state,
                postcode: defaultAddr.postal_code,
                country: defaultAddr.country,
                phone: defaultAddr.phone || '',
                email: defaultAddr.email || user?.email || '',
              });
            }
          })
          .catch((err) => console.error('Failed to fetch addresses:', err))
      : Promise.resolve();

    // Both run concurrently — no waterfall
    Promise.all([bgCartSync, bgAddressFetch]);
  }, []);

  /* ---- Lazy-load PayPal when payment section enters viewport ---- */
  useEffect(() => {
    if (!paypalRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPaypalVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(paypalRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const items = localItems.length > 0 ? localItems : storeItems;

  /* ---- Redirect if cart empty (click hidden link for ViewTransitions) ---- */
  const emptyCartLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (isMounted && items.length === 0 && emptyCartLinkRef.current) {
      emptyCartLinkRef.current.click();
    }
  }, [isMounted, items.length]);

  if (!isMounted) {
    return (
      <div data-commerce="checkout" className="max-w-5xl mx-auto py-4 sm:py-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-10 bg-gray-100 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="lg:w-96 space-y-4">
            <div className="p-5 bg-brand-light border border-gray-200 rounded-2xl space-y-3">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-px bg-gray-200" />
              <div className="h-6 bg-gray-200 rounded" />
            </div>
            <div className="p-5 bg-white border border-gray-200 rounded-2xl">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-12 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div data-commerce="checkout" className="flex items-center justify-center min-h-[40vh]">
        <a ref={emptyCartLinkRef} href="/cart/" className="hidden" aria-hidden="true">redirect</a>
        <p className="text-gray-500 text-sm">{L.redirectingLabel}</p>
      </div>
    );
  }

  /* ---- PayPal handlers ---- */

  const handlePayPalCreateOrder = async () => {
    if (!addressValid) {
      checkoutError.set(L.addressInvalidError);
      return '';
    }

    isProcessing.set(true);
    checkoutError.set(null);

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: address, couponCode: activeCoupon || undefined }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create order');
      }

      const data = await response.json();
      setCurrentOrderId(data.orderId);
      return data.paypalOrderId;
    } catch (err) {
      console.error('Create order failed:', err);
      checkoutError.set(err instanceof Error ? err.message : 'Failed to create order');
      isProcessing.set(false);
      return '';
    }
  };

  const handlePayPalApprove = async (data: any) => {
    isProcessing.set(true);
    checkoutError.set(null);

    try {
      const response = await fetch('/api/checkout/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId: currentOrderId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Payment capture failed');
      }

      const result = await response.json();

      clearCart();
      localStorage.removeItem('commerce-kit-cart');

      const params = new URLSearchParams({
        order_id: result.orderNumber,
        paypal_id: data.orderID,
        email: result.email || address.email,
      });

      if (!loggedIn) {
        params.append('guest', 'true');
      }

      window.location.href = `/thank-you/?${params.toString()}`;
    } catch (err) {
      console.error('Order capture failed:', err);
      checkoutError.set(
        err instanceof Error ? err.message : 'Failed to process order. Please contact support.'
      );
      isProcessing.set(false);
    }
  };

  const handlePayPalError = (err: any) => {
    console.error('PayPal Error:', err);
    checkoutError.set('Payment failed. Please try again.');
    isProcessing.set(false);
  };

  const handlePayPalCancel = () => {
    checkoutError.set('Payment was cancelled.');
    isProcessing.set(false);
  };

  /* ---- Render ---- */
  return (
    <div data-commerce="checkout" className="max-w-5xl mx-auto py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <a
          href="/cart/"
          className="text-gray-500 hover:text-brand transition-colors text-sm flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {L.backToCart}
        </a>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">{L.pageTitle}</h1>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Address form */}
        <div className="flex-1 space-y-6">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <AddressForm
              address={address}
              onChange={updateShippingAddress}
              disabled={processing}
              savedAddresses={savedAddresses}
            />
          </div>

          {/* Guest notice */}
          {!loggedIn && (
            <div className="p-4 bg-brand-light/50 border border-brand/20 rounded-xl text-sm text-gray-600">
              <a
                href="/auth/login/?redirect=/checkout/"
                className="text-brand hover:text-brand-dark font-medium transition-colors"
              >
                {L.guestSignIn}
              </a>{' '}
              {L.guestNotice}
            </div>
          )}
        </div>

        {/* Right — Summary + Payment */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Order summary card */}
            <div className="p-5 bg-brand-light border border-gray-200 rounded-2xl">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                discount={discount}
                activeCoupon={activeCoupon}
                couponErr={couponErr}
                loading={couponLoad}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Address incomplete warning */}
            {!addressValid && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                {L.addressRequired}
              </div>
            )}

            {/* Payment section */}
            <div ref={paypalRef} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-lg font-serif font-bold text-brand-dark">{L.paymentTitle}</h2>

              <div className="relative min-h-[120px]">
                {paypalVisible ? (
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-500">Loading payment...</span>
                      </div>
                    }
                  >
                    <LazyPayPalProvider
                      options={{
                        clientId: paypalClientId,
                        currency: CURRENCY.code,
                        intent: 'capture',
                      }}
                    >
                      <LazyPayPalButtons
                        style={{
                          layout: 'vertical',
                          color: 'gold',
                          shape: 'pill',
                          label: 'pay',
                        }}
                        disabled={!addressValid || processing}
                        createOrder={handlePayPalCreateOrder}
                        onApprove={handlePayPalApprove}
                        onError={handlePayPalError}
                        onCancel={handlePayPalCancel}
                      />
                    </LazyPayPalProvider>
                  </Suspense>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-brand rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Preparing payment...</span>
                  </div>
                )}

                {/* Processing overlay */}
                {processing && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 rounded-xl backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">{L.processingLabel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-brand-dark/60 text-xs py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>{L.trustBadge}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
