/**
 * CartPage - React Island Component
 * Full shopping cart with item management, price validation, and checkout flow
 * Uses Tailwind exclusively — no external CSS files
 * Brand palette: Dusty Rose / Warm Cream / Soft Brown / Sage Green
 */

import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import {
  cartItems,
  cartSubtotal,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  loadCartFromServer,
  type CartItem,
} from '@/stores/cart';
import { formatPrice } from '@/config/site';
import { siteSettings } from '@/config/site-settings';

const L = siteSettings.cart;

/* ------------------------------------------------------------------ */
/*  TrustBadges                                                        */
/* ------------------------------------------------------------------ */

function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-5 border-t border-gray-200 mt-2">
      <div className="flex items-center gap-2 text-sm text-brand-dark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span>Worldwide Shipping</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-brand-dark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>8 Years Experience</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-brand-dark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Secure Checkout</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CartItemRow                                                        */
/* ------------------------------------------------------------------ */

function CartItemRow({ item }: { item: CartItem }) {
  const handleRemove = async () => {
    await removeFromCart(item.sku);
  };

  const handleQuantityChange = async (newQty: number) => {
    await updateCartItemQuantity(item.sku, newQty);
  };

  const itemTotal = item.unit_price * item.quantity;

  const configParts: string[] = [];
  if (item.variant) configParts.push(item.variant);
  if (item.color) configParts.push(item.color);
  if (item.size) configParts.push(item.size);

  return (
    <div className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl transition-colors hover:border-brand/40 hover:shadow-sm">
      {/* Thumbnail — larger for better product visibility */}
      <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-brand-light">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-dark/40 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="text-gray-900 font-semibold text-sm leading-tight truncate">
          {item.name}
        </h3>

        {configParts.length > 0 && (
          <p className="text-brand-dark text-xs">{configParts.join(' / ')}</p>
        )}

        <p className="text-gray-400 text-xs font-mono">
          {L.skuLabel}: {item.sku}
        </p>

        {item.stripe && (
          <p className="text-brand text-xs">
            + {item.stripe.name} (+{formatPrice(item.stripe.price)})
          </p>
        )}

        {item.addons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.addons.map((addon) => (
              <span
                key={addon.id}
                className="inline-flex items-center text-[11px] px-2 py-0.5 bg-brand/10 text-brand-dark rounded-full"
              >
                {addon.name} (+{formatPrice(addon.price)})
              </span>
            ))}
          </div>
        )}

        {item.custom_texts && Object.keys(item.custom_texts).length > 0 && (
          <div className="space-y-0.5 pt-0.5">
            {Object.entries(item.custom_texts).map(
              ([key, value]) =>
                value && (
                  <p key={key} className="text-brand-dark/70 text-xs italic">
                    {key}: {value}
                  </p>
                )
            )}
          </div>
        )}
      </div>

      {/* Quantity + Price */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-2 flex-shrink-0">
        {/* Price */}
        <span className="text-gray-900 font-bold text-base sm:text-right order-2 sm:order-1">
          {formatPrice(itemTotal)}
        </span>

        {/* Qty controls */}
        <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden order-1 sm:order-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center text-brand-dark hover:text-gray-900 hover:bg-brand-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
          </button>
          <span className="w-10 h-8 flex items-center justify-center text-gray-900 text-sm font-medium bg-brand-light/50 border-x border-gray-300">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-brand-dark hover:text-gray-900 hover:bg-brand-light transition-colors"
            aria-label="Increase quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-400 transition-colors order-3"
          aria-label={L.removeLabel}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CartPage (default export)                                          */
/* ------------------------------------------------------------------ */

export default function CartPage() {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadCartFromServer().catch((err) => {
      console.error('Background cart sync failed:', err);
    });
  }, []);

  const handleClearCart = async () => {
    if (window.confirm(L.clearCartConfirm)) {
      await clearCart();
    }
  };

  if (!isMounted) return null;

  /* ---- Empty state ---- */
  if (items.length === 0) {
    return (
      <div
        data-commerce="cart"
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16"
      >
        <div className="text-brand-dark/40 mb-6">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-bold text-brand-dark mb-2">{L.emptyTitle}</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">{L.emptyDescription}</p>
        <a
          href="/shop/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-full transition-colors duration-300"
        >
          {L.continueShoppingButton}
        </a>
      </div>
    );
  }

  /* ---- Cart with items ---- */
  return (
    <div data-commerce="cart" className="max-w-5xl mx-auto py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">{L.pageTitle}</h1>
        <span className="text-brand-dark/60 text-sm">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Item list */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <CartItemRow key={item.sku} item={item} />
          ))}

          {/* Actions under items */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleClearCart}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              {L.clearCartButton}
            </button>
            <a
              href="/shop/"
              className="text-brand-dark hover:text-brand text-sm transition-colors"
            >
              {L.continueShoppingButton}
            </a>
          </div>

          {/* Trust badges below items */}
          <TrustBadges />
        </div>

        {/* Right — Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-8 p-6 bg-brand-light border border-gray-200 rounded-2xl space-y-5">
            <h2 className="text-lg font-serif font-bold text-brand-dark">{L.orderSummaryTitle}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{L.subtotalLabel}</span>
                <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{L.shippingLabel}</span>
                <span className="text-brand-accent font-medium">{L.shippingFree}</span>
              </div>
              <div className="h-px bg-gray-300/60" />
              <div className="flex justify-between text-gray-900 font-bold text-base">
                <span>{L.totalLabel}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <a
              href={items.length > 0 ? '/checkout' : undefined}
              data-astro-prefetch="viewport"
              className={`block w-full py-3.5 text-center text-white font-semibold rounded-full transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg ${
                items.length > 0
                  ? 'bg-brand hover:bg-brand-dark cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed pointer-events-none'
              }`}
            >
              {L.checkoutButton}
            </a>

            <div className="flex items-center justify-center gap-2 text-brand-dark/60 text-xs">
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
