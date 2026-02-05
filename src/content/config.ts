// BabyProps.io Content Collections Configuration
// Newborn Photography Props Product Schema

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Category Enum (8 core categories)
const categoryEnum = z.enum([
  'photo-props',
  'theme-sets',
  'photo-clothes',
  'posing-props',
  'wraps-blankets',
  'hats-headbands',
  'training-dolls',
  'mini-creative-props'
]);

// Product Collection Schema
const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: z.object({
    // Basic Information
    title: z.string(),
    slug: z.string(),
    sku_prefix: z.string(),
    basePrice: z.number(),

    // Images
    featured_image: z.string(),
    gallery: z.array(z.string()).optional(),

    // Category & Tags
    category: categoryEnum,
    tags: z.array(z.string()).optional(),

    // Short description (displayed on PDP)
    short_description: z.string().optional(),

    // Newborn Photography Props Specific Fields
    material: z.string().optional(),           // e.g., "Mohair", "Natural Pine Wood", "Soft Knit"
    color_family: z.string().optional(),       // e.g., "Pastel Pink", "Natural Wood", "Cream"
    prop_size: z.string().optional(),          // e.g., "Newborn (0-1M)", "Sitter (6-12M)"
    is_handmade: z.boolean().default(false),

    // Product Variants (optional - for colors/styles)
    variants: z.array(z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().optional(),
      hex: z.string().optional(),
      price_mod: z.number().default(0),
      image: z.string().optional(),
      sku_suffix: z.string().optional(),
    })).optional(),

    // Status Flags
    in_stock: z.boolean().default(true),
    is_new: z.boolean().default(false),
    is_featured: z.boolean().default(false),

    // SEO
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),

    // Product Details (for description content)
    features: z.array(z.string()).optional(),
    care_instructions: z.array(z.string()).optional(),
    dimensions: z.object({
      length: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      diameter: z.string().optional(),
      weight: z.string().optional(),
    }).optional(),

    // Related Products (for "Complete the Look")
    related_products: z.array(z.string()).optional(),
  }),
});

export const collections = { products };
export type Category = z.infer<typeof categoryEnum>;
