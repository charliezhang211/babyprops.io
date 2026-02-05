# ProductInfo Component

**Component:** `src/components/pdp/ProductInfo.astro`
**Type:** Astro Component
**Task:** Task-4.2
**Created:** 2026-02-03

---

## Purpose

Displays core product information on Product Detail Pages (PDP), including:
- Title, price, and SKU
- Photography props specific fields (material, color family, size)
- Status badges (New, Handmade, Out of Stock)
- Trust badges (Worldwide Shipping, 8 Years Experience, Secure Checkout)
- Stock status messaging

---

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Product title |
| `price` | `number` | ✅ | - | Product price (numeric value) |
| `sku` | `string` | ✅ | - | SKU identifier |
| `material` | `string` | ❌ | - | Material type (e.g., "Natural Pine Wood") |
| `colorFamily` | `string` | ❌ | - | Color family (e.g., "Natural Wood", "Cream") |
| `propSize` | `string` | ❌ | - | Suitable size (e.g., "Newborn (0-1M)") |
| `isHandmade` | `boolean` | ❌ | `false` | Show handmade badge |
| `inStock` | `boolean` | ❌ | `true` | Stock availability |
| `isNew` | `boolean` | ❌ | `false` | Show "New" badge |
| `description` | `string` | ❌ | - | Short product description |

---

## Slots

### `actions`
Used for Add to Cart / Buy Now buttons or custom action buttons.

**Example:**
```astro
<ProductInfo {...props}>
  <div slot="actions" class="flex gap-3">
    <Button variant="primary">Add to Cart</Button>
    <Button variant="secondary">Buy Now</Button>
  </div>
</ProductInfo>
```

---

## Usage Examples

### Full Example (All Fields)

```astro
---
import ProductInfo from '@/components/pdp/ProductInfo.astro';
import Button from '@/components/ui/Button.astro';
---

<ProductInfo
  title="Wooden Moon Bed"
  price={89.99}
  sku="WMB001"
  material="Natural Pine Wood"
  colorFamily="Natural Wood"
  propSize="Newborn (0-1M)"
  isHandmade={true}
  inStock={true}
  isNew={true}
  description="Handcrafted wooden moon bed for dreamy newborn portraits."
>
  <div slot="actions" class="flex gap-3">
    <Button variant="primary" fullWidth>Add to Cart</Button>
    <Button variant="secondary" fullWidth>Buy Now</Button>
  </div>
</ProductInfo>
```

### Minimal Example (Required Fields Only)

```astro
<ProductInfo
  title="Simple Product"
  price={19.99}
  sku="SP001"
  inStock={true}
>
  <Button slot="actions" variant="primary">Add to Cart</Button>
</ProductInfo>
```

### Out of Stock Example

```astro
<ProductInfo
  title="Vintage Lace Romper"
  price={42.50}
  sku="VLR003"
  material="Delicate Lace Fabric"
  inStock={false}
>
  <Button slot="actions" variant="outline" disabled>
    Out of Stock
  </Button>
</ProductInfo>
```

---

## Features

### Status Badges
- **New Badge**: Shows when `isNew={true}`
- **Handmade Badge**: Shows when `isHandmade={true}` with ✨ icon
- **Out of Stock Badge**: Shows when `inStock={false}`

### Photography Props Specifications
Displays a styled section with icons when optional fields are provided:
- 🧵 **Material**: Physical material of the prop
- 🎨 **Color Family**: Color category
- 📏 **Suitable For**: Size/age range

### Trust Badges
Automatically pulls from `siteSettings.copy.trustBadges`:
- 🌍 Worldwide Shipping
- ⭐ 8 Years Experience
- 🔒 Secure Checkout

Plus dynamic stock status:
- ✓ **In Stock** - Ships in 3-5 Business Days (when `inStock={true}`)

### Out of Stock Warning
When `inStock={false}`, displays a prominent warning box with:
- Red alert styling
- Message: "Currently Out of Stock"
- WhatsApp contact link for restock inquiries

---

## Styling

### Morandicolor Scheme
- Title: `text-brand-dark` (Soft Brown)
- Price: `text-brand` (Dusty Rose)
- Specs section: Border with `border-brand-light` (Warm Cream)
- Trust badges background: `bg-brand-light/50`

### Responsive Design
- Title: `text-3xl md:text-4xl` (scales up on desktop)
- Works well in narrow containers (max-w-xl recommended)

---

## Data Attributes

Maintains compatibility with base template:
- `data-pdp="info"` on container
- `data-pdp="price"` on price element

---

## Integration with Content Collections

Use with Astro Content Collections:

```astro
---
import { getEntry } from 'astro:content';
import ProductInfo from '@/components/pdp/ProductInfo.astro';

const product = await getEntry('products', 'wooden-moon-bed');
const { data, body } = product;
---

<ProductInfo
  title={data.title}
  price={data.basePrice}
  sku={`${data.sku_prefix}001`}
  material={data.material}
  colorFamily={data.color_family}
  propSize={data.prop_size}
  isHandmade={data.is_handmade}
  inStock={data.in_stock}
  isNew={data.is_new}
  description={body.slice(0, 200)}
/>
```

---

## Testing

**Test Page:** [/test-product-info](/test-product-info)

**Test Cases:**
1. ✅ New + Handmade product (all fields)
2. ✅ Regular product (no badges)
3. ✅ Out of stock product (warning display)
4. ✅ Minimal fields (required only)

**Run Development Server:**
```bash
npm run dev
# Visit: http://localhost:4321/test-product-info
```

---

## Accessibility

- Emoji icons marked with `aria-hidden="true"`
- Semantic HTML structure (h1, h3, h4)
- Clear text labels for all specifications
- Descriptive text for screen readers

---

## Related Components

- [Badge.astro](../ui/Badge.astro) - Status badges
- [Button.astro](../ui/Button.astro) - Action buttons
- [Gallery.astro](./Gallery.astro) - Product image gallery
- [ProductTabs](./ProductTabs.tsx) - Additional product details

---

## Notes

- Price is auto-formatted using `Intl.NumberFormat` with currency from `siteSettings.currency`
- Trust badges are centrally managed in `site-settings.ts`
- WhatsApp URL for out-of-stock contacts uses `siteSettings.contact.whatsappUrl`
- Component is fully compatible with base template's data attributes

---

**Status:** ✅ Complete
**Next Task:** Task-4.3 - ProductTabs Content
