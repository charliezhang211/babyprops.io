// ProductConfigurator - React Island Component
// Handles variant selection, color selection, add-ons, and price calculation

import { useState, useEffect, useMemo } from 'react';
import { addToCart, generateSKU } from '@/stores/cart';
import { formatPrice } from '@/config/site';
import { siteSettings } from '@/config/site-settings';

interface Color {
    name: string;
    hex: string;
    sku?: string;
    image?: string;
}

interface Variant {
    id: string;
    sku?: string;
    name: string;
    label: string;
    price_mod: number;
    display?: 'button' | 'hex' | 'thumbnail';
    image?: string;
    hex?: string;
    colors?: Color[];
}

interface Stripe {
    id: string;
    sku?: string;
    name: string;
    image?: string;
    price: number;
    hex?: string;
}

interface Addon {
    id: string;
    sku?: string;
    name: string;
    description?: string;
    price: number;
    default?: boolean;
}

interface Size {
    id: string;
    sku?: string;
    name: string;
    price_mod: number;
}

interface TextInput {
    id: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    max_length?: number;
}

interface Props {
    productName: string;
    productSlug: string;
    productImage?: string;
    skuPrefix?: string;
    variants: Variant[];
    basePrice: number;
    comparePrice?: number;
    stripes?: Stripe[];
    addons?: Addon[];
    sizes?: Size[];
    text_inputs?: TextInput[];
    variantLabel?: string;
}

// Calculate estimated delivery
function getDeliveryDates(rush: boolean = false) {
    const today = new Date();
    const startDays = rush ? 5 : 10;
    const endDays = rush ? 8 : 14;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startDays);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endDays);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

export default function ProductConfigurator({
    productName,
    productSlug,
    productImage = '',
    skuPrefix: skuPrefixProp,
    variants,
    basePrice,
    comparePrice,
    stripes = [],
    addons = [],
    sizes = [],
    text_inputs = [],
    variantLabel = siteSettings.pdp.variantLabel,
}: Props) {
    const skuPrefix = skuPrefixProp || productSlug.split('-')[0].toUpperCase();

    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [selectedStripe, setSelectedStripe] = useState<Stripe | null>(null);

    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        addons.forEach(addon => {
            initial[addon.id] = addon.default || false;
        });
        return initial;
    });

    const [selectedSize, setSelectedSize] = useState<Size | null>(sizes[0] || null);

    const [customTexts, setCustomTexts] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        text_inputs.forEach(input => {
            initial[input.id] = '';
        });
        return initial;
    });

    const updateCustomText = (id: string, value: string) => {
        setCustomTexts(prev => ({ ...prev, [id]: value }));
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const { unitPrice, totalPrice, addonsTotal } = useMemo(() => {
        let unit = basePrice + (selectedVariant?.price_mod || 0) + (selectedSize?.price_mod || 0);
        const stripePrice = selectedStripe?.price || 0;

        const addOnsSum = addons.reduce((sum, addon) => {
            return sum + (selectedAddons[addon.id] ? addon.price : 0);
        }, 0);

        const total = (unit * quantity) + stripePrice + addOnsSum;

        return { unitPrice: unit, totalPrice: total, addonsTotal: addOnsSum };
    }, [basePrice, selectedVariant, selectedSize, selectedStripe, selectedAddons, addons, quantity]);

    const hasRush = selectedAddons['rush'] || false;

    const deliveryEstimate = useMemo(() => getDeliveryDates(hasRush), [hasRush]);

    // Sync dynamic price to the main price display in ProductInfo
    useEffect(() => {
        const priceEl = document.querySelector('[data-pdp="price"]');
        if (priceEl) {
            priceEl.textContent = formatPrice(totalPrice);
        }
    }, [totalPrice]);

    useEffect(() => {
        const image = selectedColor?.image || selectedVariant?.image;
        if (image) {
            window.dispatchEvent(new CustomEvent('variant-image-change', {
                detail: { image }
            }));
        }
    }, [selectedVariant, selectedColor]);

    const handleAddToCart = () => {
        if (isAdding) return;

        setIsAdding(true);

        const variantSku = selectedVariant?.sku || selectedVariant?.id?.toUpperCase();
        const colorSku = selectedColor?.sku || (selectedColor?.name ? selectedColor.name.substring(0, 3).toUpperCase() : undefined);
        const sizeSku = selectedSize?.sku || selectedSize?.id?.toUpperCase();

        const sku = generateSKU(skuPrefix, variantSku, colorSku, sizeSku);

        const selectedAddonsList = addons
            .filter(addon => selectedAddons[addon.id])
            .map(addon => ({
                id: addon.sku || addon.id,
                name: addon.name,
                price: addon.price,
            }));

        addToCart({
            sku,
            product_slug: productSlug,
            name: productName,
            variant: selectedVariant?.name || '',
            color: selectedColor?.name,
            size: selectedSize?.name,
            custom_texts: Object.keys(customTexts).length > 0 ? customTexts : undefined,
            stripe: selectedStripe ? {
                id: selectedStripe.sku || selectedStripe.id,
                name: selectedStripe.name,
                price: selectedStripe.price,
            } : undefined,
            addons: selectedAddonsList,
            unit_price: unitPrice,
            quantity: quantity,
            image: selectedColor?.image || selectedVariant?.image || productImage,
        });

        setTimeout(() => {
            setIsAdding(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            window.dispatchEvent(new CustomEvent('cart-item-added', {
                detail: { productName, quantity, sku }
            }));
        }, 200);
    };

    return (
        <div data-pdp="configurator" className="space-y-5">
            {/* Variant Selection */}
            {variants.length > 1 && (() => {
                const displayMode = variants[0]?.display || 'button';

                const handleVariantClick = (variant: Variant) => {
                    if (selectedVariant?.id === variant.id) {
                        setSelectedVariant(null);
                        setSelectedColor(null);
                    } else {
                        setSelectedVariant(variant);
                        setSelectedColor(variant.colors?.[0] || null);
                    }
                };

                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                            {variantLabel}: <span className="text-gray-800 font-semibold">{selectedVariant?.name}</span>
                        </label>

                        {displayMode === 'thumbnail' ? (
                            <div className="flex flex-wrap gap-2">
                                {variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-150 cursor-pointer ${
                                            selectedVariant?.id === variant.id
                                                ? 'border-brand ring-1 ring-brand/30'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => handleVariantClick(variant)}
                                        title={variant.name}
                                    >
                                        {variant.image ? (
                                            <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-sm font-medium">
                                                {variant.name[0]}
                                            </span>
                                        )}
                                        {variant.price_mod > 0 && (
                                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center text-white py-0.5">
                                                +{formatPrice(variant.price_mod)}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : displayMode === 'hex' ? (
                            <div className="flex flex-wrap gap-2">
                                {variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`w-9 h-9 rounded-full border-2 transition-all duration-150 cursor-pointer ${
                                            selectedVariant?.id === variant.id
                                                ? 'border-brand-dark scale-110 ring-2 ring-brand/40'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: variant.hex || '#888' }}
                                        onClick={() => handleVariantClick(variant)}
                                        aria-label={variant.name}
                                        title={variant.name}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                                            selectedVariant?.id === variant.id
                                                ? 'border-brand bg-brand/10 text-brand-dark'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleVariantClick(variant)}
                                    >
                                        <span>{variant.name}</span>
                                        {variant.price_mod > 0 && (
                                            <span className="ml-1.5 text-xs text-gray-400">+{formatPrice(variant.price_mod)}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Color Selection */}
            {selectedVariant?.colors && selectedVariant.colors.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                        Color: <span className="text-gray-800 font-semibold">{selectedColor?.name}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {selectedVariant.colors.map(color => (
                            <button
                                key={color.name}
                                className={`w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer ${
                                    selectedColor?.name === color.name
                                        ? 'border-brand-dark scale-110 ring-2 ring-brand/40'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => setSelectedColor(color)}
                                aria-label={color.name}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                        Letter Height: <span className="text-gray-800 font-semibold">{selectedSize?.name}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map(size => (
                            <button
                                key={size.id}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                                    selectedSize?.id === size.id
                                        ? 'border-brand bg-brand/10 text-brand-dark'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size.name}
                                {size.price_mod > 0 && (
                                    <span className="ml-1.5 text-xs text-gray-400">+{formatPrice(size.price_mod)}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Text Inputs */}
            {text_inputs.length > 0 && (
                <div className="space-y-3">
                    {text_inputs.map(input => (
                        <div key={input.id} className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-600">
                                {input.label} {input.required && <span className="text-brand">*</span>}
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                                placeholder={input.placeholder || 'Enter your text'}
                                value={customTexts[input.id] || ''}
                                onChange={(e) => updateCustomText(input.id, e.target.value)}
                                maxLength={input.max_length}
                                required={input.required}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Stripe Options */}
            {stripes.length > 0 && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span>Add Stripes:</span>
                        <span className="text-gray-800 font-semibold">{selectedStripe?.name || 'None'}</span>
                        {selectedStripe && selectedStripe.price > 0 && (
                            <span className="text-xs text-brand">(+{formatPrice(selectedStripe.price)})</span>
                        )}
                        {selectedStripe && (
                            <button
                                className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 text-xs flex items-center justify-center transition-colors cursor-pointer"
                                onClick={() => setSelectedStripe(null)}
                                title="Clear selection"
                            >
                                &times;
                            </button>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {stripes.map(stripe => (
                            <button
                                key={stripe.id}
                                className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-colors duration-150 cursor-pointer ${
                                    selectedStripe?.id === stripe.id
                                        ? 'border-brand ring-1 ring-brand/30'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => setSelectedStripe(stripe)}
                                title={stripe.name}
                            >
                                {stripe.image ? (
                                    <img src={stripe.image} alt={stripe.name} className="w-full h-full object-cover" />
                                ) : stripe.hex ? (
                                    <span className="block w-full h-full" style={{ backgroundColor: stripe.hex }} />
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic Add-ons */}
            {addons.length > 0 && (
                <div className="space-y-2 border-t border-gray-200 pt-4">
                    {addons.map(addon => (
                        <label
                            key={addon.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedAddons[addon.id] || false}
                                onChange={() => toggleAddon(addon.id)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand/30 bg-white cursor-pointer"
                            />
                            <span className="flex flex-col text-sm">
                                <strong className="text-gray-800">{addon.name}</strong>
                                <span className="text-gray-500 text-xs">
                                    {addon.description} (+{formatPrice(addon.price)})
                                </span>
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">{siteSettings.pdp.quantityLabel}</label>
                <div className="flex items-center gap-0">
                    <button
                        className="w-10 h-10 rounded-l-lg border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                    </button>
                    <input
                        type="number"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.max(1, Math.min(99, val)));
                        }}
                        className="w-16 h-10 px-2 bg-white border-y border-gray-400 text-center text-gray-800 font-semibold text-base focus:outline-none focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        className="w-10 h-10 rounded-r-lg border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                        disabled={quantity >= 99}
                        aria-label="Increase quantity"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Add to Cart */}
            <button
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    isAdding
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-brand hover:bg-brand-dark active:scale-[0.98] shadow-lg shadow-brand/20'
                }`}
                onClick={handleAddToCart}
                disabled={isAdding}
            >
                {isAdding ? (
                    <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                    </>
                ) : (
                    `${siteSettings.pdp.addToCartButton} - ${formatPrice(totalPrice)}`
                )}
            </button>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl animate-[slideUp_0.3s_ease-out]">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-sm text-white">Added to cart!</span>
                    <a href="/cart/" className="text-sm font-medium text-brand hover:text-brand-light transition-colors">View Cart</a>
                </div>
            )}

            {/* Delivery Estimate */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 pt-2 border-t border-gray-200">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Estimated delivery: <strong className="text-gray-800">{deliveryEstimate}</strong></span>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-gray-200 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Worldwide Shipping</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>8 Years Experience</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="font-medium">In Stock</span>
                </div>
            </div>
        </div>
    );
}
