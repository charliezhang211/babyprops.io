/**
 * Shipping Configuration Helper
 * Loads and provides shipping zones, countries, and rates
 */

import shippingConfig from '@/content/config/shipping.json';

// ============================================
// Types
// ============================================

export interface ShippingState {
  code: string;
  name: string;
}

export interface ShippingCountry {
  name: string;
  code: string;
  currency: string;
  enabled: boolean;
  requiresState: boolean;
  states?: ShippingState[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];  // Country codes, "*" for rest of world
  shippingRate: number;
  freeShipping: boolean;
  freeShippingThreshold?: number;
  estimatedDays: string;
  enabled?: boolean;
}

export interface ShippingConfig {
  defaultCurrency: string;
  defaultCountry: string;
  freeShippingThreshold: number;
  zones: ShippingZone[];
  countries: Record<string, ShippingCountry>;
}

// ============================================
// Config Loading
// ============================================

const config: ShippingConfig = shippingConfig as ShippingConfig;

// ============================================
// Public API
// ============================================

/**
 * Get all enabled countries sorted by name
 */
export function getEnabledCountries(): ShippingCountry[] {
  return Object.values(config.countries)
    .filter(country => country.enabled)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all countries (including disabled) sorted by name
 */
export function getAllCountries(): ShippingCountry[] {
  return Object.values(config.countries)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific country by code
 */
export function getCountry(code: string): ShippingCountry | null {
  return config.countries[code] || null;
}

/**
 * Get states/provinces for a country
 */
export function getStates(countryCode: string): ShippingState[] {
  const country = config.countries[countryCode];
  return country?.states || [];
}

/**
 * Check if a country requires state/province selection
 */
export function requiresState(countryCode: string): boolean {
  const country = config.countries[countryCode];
  return country?.requiresState ?? false;
}

/**
 * Get shipping zone for a country
 */
export function getShippingZone(countryCode: string): ShippingZone | null {
  // Find specific zone for country
  const zone = config.zones.find(z =>
    z.countries.includes(countryCode) && z.enabled !== false
  );

  if (zone) return zone;

  // Fall back to rest of world zone
  const restOfWorld = config.zones.find(z =>
    z.countries.includes('*') && z.enabled !== false
  );

  return restOfWorld || null;
}

/**
 * Calculate shipping cost for an order
 */
export function calculateShipping(
  countryCode: string,
  subtotal: number
): { cost: number; isFree: boolean; estimatedDays: string } {
  const zone = getShippingZone(countryCode);

  if (!zone) {
    return { cost: 0, isFree: false, estimatedDays: 'Contact us' };
  }

  // Check free shipping
  const threshold = zone.freeShippingThreshold ?? config.freeShippingThreshold;
  const isFree = zone.freeShipping || (threshold > 0 && subtotal >= threshold);

  return {
    cost: isFree ? 0 : zone.shippingRate,
    isFree,
    estimatedDays: zone.estimatedDays,
  };
}

/**
 * Get all enabled shipping zones
 */
export function getShippingZones(): ShippingZone[] {
  return config.zones.filter(z => z.enabled !== false);
}

/**
 * Get default country code
 */
export function getDefaultCountry(): string {
  return config.defaultCountry;
}

/**
 * Get default currency
 */
export function getDefaultCurrency(): string {
  return config.defaultCurrency;
}

/**
 * Check if shipping is available to a country
 */
export function isShippingAvailable(countryCode: string): boolean {
  const country = config.countries[countryCode];
  if (!country?.enabled) return false;

  const zone = getShippingZone(countryCode);
  return zone !== null;
}

/**
 * Get country options for select dropdown
 * Returns array of { value, label } for form selects
 */
export function getCountryOptions(): Array<{ value: string; label: string }> {
  return getEnabledCountries().map(country => ({
    value: country.code,
    label: country.name,
  }));
}

/**
 * Get state options for a country
 * Returns array of { value, label } for form selects
 */
export function getStateOptions(countryCode: string): Array<{ value: string; label: string }> {
  return getStates(countryCode).map(state => ({
    value: state.code,
    label: state.name,
  }));
}

// ============================================
// Re-export config for direct access if needed
// ============================================

export { config as shippingConfig };
