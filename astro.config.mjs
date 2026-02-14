import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://babyprops.pages.dev',
  output: 'server',
  adapter: cloudflare(),
  // Prefetch: hover by default, product links upgraded per-component
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/admin/') &&
        !page.includes('/auth/') &&
        !page.includes('/account/') &&
        !page.includes('/order-lookup') &&
        !page.includes('/thank-you') &&
        !page.includes('/cart') &&
        !page.includes('/checkout') &&
        !page.includes('README') &&
        !page.includes('/ui-components-demo'),
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
