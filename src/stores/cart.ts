/**
 * Cart Store - Nano Stores with localStorage persistence
 * Manages shopping cart state with server-side sync via API
 */

import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';

// Cart item addon structure
export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
}

// Cart item structure (aligned with server-side CartItemDB)
export interface CartItem {
  sku: string;                      // Unique product SKU (e.g., "NITTO-WHT-1IN")
  product_slug: string;             // Product slug for lookup
  name: string;                     // Product name
  variant: string;                  // Selected variant name
  color?: string;                   // Selected color name
  size?: string;                    // Selected size
  custom_texts?: Record<string, string>;  // Custom text inputs
  stripe?: {
    id: string;
    name: string;
    price: number;
  };
  addons: CartItemAddon[];          // Selected add-ons
  unit_price: number;               // Price per unit
  quantity: number;                 // Number of tires (typically 4 or 5)
  image?: string;                   // Product image URL
}

// Persistent cart store - survives page refresh
export const cartItems = persistentAtom<CartItem[]>('commerce-kit-cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Sync status
export const cartSyncStatus = atom<'idle' | 'syncing' | 'error'>('idle');
export const cartSyncError = atom<string | null>(null);

// Computed: Total number of items in cart
export const cartCount = computed(cartItems, (items) => items.length);

// Computed: Total quantity (tires count)
export const cartTotalQuantity = computed(cartItems, (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
});

// Computed: Cart subtotal
export const cartSubtotal = computed(cartItems, (items) => {
  return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
});

/**
 * Generate SKU from product configuration
 */
export function generateSKU(
  skuPrefix: string,
  variantSku?: string,
  colorSku?: string,
  sizeSku?: string
): string {
  const parts = [skuPrefix];
  if (variantSku) parts.push(variantSku);
  if (colorSku) parts.push(colorSku);
  if (sizeSku) parts.push(sizeSku);
  return parts.join('-');
}

/**
 * Add item to cart (optimistic update + background sync)
 * Returns immediately after local update for fast UX
 */
export async function addToCart(item: CartItem): Promise<void> {
  const items = cartItems.get();

  // Check if item with same SKU already exists
  const existingIndex = items.findIndex(i => i.sku === item.sku);

  if (existingIndex >= 0) {
    // Update quantity of existing item
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + item.quantity,
    };
    cartItems.set(updated);
  } else {
    // Add new item
    cartItems.set([...items, item]);
  }

  // Sync to server in background (non-blocking)
  debouncedSync();
}

/**
 * Remove item from cart by SKU (optimistic update)
 */
export async function removeFromCart(sku: string): Promise<void> {
  cartItems.set(cartItems.get().filter((item) => item.sku !== sku));

  // Sync to server in background
  debouncedSync();
}

/**
 * Update item quantity by SKU (optimistic update)
 */
export async function updateCartItemQuantity(sku: string, quantity: number): Promise<void> {
  if (quantity < 1) {
    await removeFromCart(sku);
    return;
  }

  cartItems.set(
    cartItems.get().map((item) => {
      if (item.sku === sku) {
        return { ...item, quantity };
      }
      return item;
    })
  );

  // Sync to server in background
  debouncedSync();
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  cartItems.set([]);

  // Sync to server
  try {
    await fetch('/api/cart/clear', { method: 'POST' });
  } catch (error) {
    console.error('Failed to clear server cart:', error);
  }
}

// Debounce timer for cart sync
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced sync - waits 500ms after last change before syncing
 * This batches rapid updates into a single sync operation
 */
function debouncedSync(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncCartToServer();
  }, 500);
}

/**
 * Sync local cart to server (batch operation)
 * Uses a single API call to sync entire cart
 */
export async function syncCartToServer(): Promise<void> {
  cartSyncStatus.set('syncing');
  cartSyncError.set(null);

  try {
    const items = cartItems.get();

    // Use batch sync endpoint for better performance
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    cartSyncStatus.set('idle');
  } catch (error) {
    console.error('Cart sync error:', error);
    cartSyncStatus.set('error');
    cartSyncError.set(error instanceof Error ? error.message : 'Sync failed');
    // Cart data is preserved in localStorage even if sync fails
  }
}

/**
 * Load cart from server (on initial page load)
 */
export async function loadCartFromServer(): Promise<void> {
  try {
    const response = await fetch('/api/cart');
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // Merge server cart with local cart
        const serverItems: CartItem[] = data.items;
        const localItems = cartItems.get();

        // If local cart is empty, use server cart
        if (localItems.length === 0) {
          cartItems.set(serverItems);
        } else {
          // Merge: server items take precedence, add any local-only items
          const mergedItems = [...serverItems];
          for (const localItem of localItems) {
            if (!mergedItems.find(s => s.sku === localItem.sku)) {
              mergedItems.push(localItem);
            }
          }
          cartItems.set(mergedItems);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load server cart:', error);
    // Keep using local cart on error
  }
}

/**
 * Validate cart prices with server before checkout
 */
export async function validateCartPrices(): Promise<{
  valid: boolean;
  subtotal: number;
  errors: string[];
}> {
  try {
    const response = await fetch('/api/cart/validate', { method: 'POST' });
    const data = await response.json();

    if (!data.valid) {
      // Update local cart with corrected prices
      const correctedItems = data.items.map((item: any) => ({
        sku: item.sku,
        product_slug: item.product_slug,
        name: item.name,
        variant: item.variant,
        color: item.color,
        size: item.size,
        custom_texts: item.custom_texts,
        stripe: item.stripe,
        addons: item.addons,
        unit_price: item.validated_unit_price,
        quantity: item.quantity,
        image: item.image,
      }));
      cartItems.set(correctedItems);
    }

    return {
      valid: data.valid,
      subtotal: data.subtotal,
      errors: data.errors || [],
    };
  } catch (error) {
    console.error('Cart validation error:', error);
    return {
      valid: false,
      subtotal: 0,
      errors: ['Failed to validate cart'],
    };
  }
}

/**
 * Get cart items formatted for order creation
 */
export function getCartForOrder(): Array<{
  sku: string;
  name: string;
  quantity: number;
  price: number;
  meta_data: Array<{ key: string; value: string }>;
}> {
  return cartItems.get().map((item) => {
    const configParts: string[] = [];
    if (item.variant) configParts.push(`Style: ${item.variant}`);
    if (item.color) configParts.push(`Color: ${item.color}`);
    if (item.size) configParts.push(`Size: ${item.size}`);
    if (item.stripe) configParts.push(`Stripe: ${item.stripe.name}`);
    if (item.addons.length > 0) {
      configParts.push(`Add-ons: ${item.addons.map(a => a.name).join(', ')}`);
    }
    if (item.custom_texts) {
      Object.entries(item.custom_texts).forEach(([key, value]) => {
        if (value) configParts.push(`${key}: ${value}`);
      });
    }

    return {
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price,
      meta_data: [
        { key: 'kit_configuration', value: configParts.join(' | ') },
        { key: 'kit_sku', value: item.sku },
      ],
    };
  });
}

/**
 * Merge guest cart with user cart on login
 * Called when user signs in - merges visitor cart into user cart
 */
export async function mergeCartsOnLogin(): Promise<void> {
  try {
    // Call API to merge carts server-side
    const response = await fetch('/api/cart/merge', { method: 'POST' });

    if (response.ok) {
      // Reload cart from server with merged items
      await loadCartFromServer();
    }
  } catch (error) {
    console.error('Cart merge error:', error);
  }
}

/**
 * Initialize cart event listeners
 * Call this once on app load
 */
export function initCartListeners(): void {
  // Listen for auth sign-in event
  window.addEventListener('auth:signed-in', async () => {
    await mergeCartsOnLogin();
  });

  // Listen for auth sign-out event
  window.addEventListener('auth:signed-out', () => {
    // Clear local cart on logout
    cartItems.set([]);
  });
}
