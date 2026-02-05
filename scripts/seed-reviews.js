/**
 * Reviews Seed Script
 * Inserts test review data into Supabase for development/testing.
 *
 * Covers test scenarios:
 *   - Multiple reviews per product (rating distribution)
 *   - Reviews with photos (images array)
 *   - Reviews with seller replies (admin_response)
 *   - Verified purchase vs guest reviews
 *   - Products with no reviews (mini-floral-crown-set left empty)
 *
 * Usage: node scripts/seed-reviews.js
 * Reset:  node scripts/seed-reviews.js --reset
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Test Review Data ────────────────────────────────────────

const SEED_REVIEWS = [
  // ── wooden-moon-bed: 5 reviews, mixed ratings, photos, seller reply ──
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'Sarah M.',
    reviewer_email: 'sarah.m@test.dev',
    rating: 5,
    title: 'Absolutely stunning craftsmanship!',
    content:
      'The wooden moon bed exceeded my expectations. The finish is smooth and baby-safe, and the natural wood grain gives each photo a warm, organic feel. My clients love the results. Highly recommend for any newborn photographer.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    admin_response: 'Thank you so much Sarah! We are thrilled you love the moon bed. Your photos are incredible!',
    admin_responded_at: '2026-01-20T10:00:00Z',
    created_at: '2026-01-15T08:30:00Z',
  },
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'Mike T.',
    reviewer_email: 'mike.t@test.dev',
    rating: 4,
    title: 'Great quality, shipping was slow',
    content:
      'Product quality is excellent and exactly as described. The only reason for 4 stars is that shipping took about 3 weeks. But the moon bed itself is worth the wait. Beautiful natural wood finish.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    created_at: '2026-01-10T14:20:00Z',
  },
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'Elena R.',
    reviewer_email: 'elena.r@test.dev',
    rating: 5,
    title: 'Perfect prop for dreamy newborn shots',
    content:
      'I have been using this moon bed for two months now and it is my go-to prop for newborn sessions. The curved shape cradles the baby beautifully and the wood tone complements every color palette. Five stars without hesitation.',
    images: [
      'https://placehold.co/400x400/F5F0EB/9C8B7E?text=Moon+Bed+1',
      'https://placehold.co/400x400/F5F0EB/9C8B7E?text=Moon+Bed+2',
    ],
    status: 'approved',
    verified_purchase: false,
    created_at: '2026-01-22T09:15:00Z',
  },
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'Jenny L.',
    reviewer_email: 'jenny.l@test.dev',
    rating: 3,
    title: 'Nice but smaller than expected',
    content:
      'The quality is good and the wood finish is lovely. However it is a bit smaller than I expected from the photos. Still usable for newborns up to about 3 weeks. Make sure to check the dimensions before ordering.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    created_at: '2026-01-05T16:45:00Z',
  },
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'David K.',
    reviewer_email: 'david.k@test.dev',
    rating: 5,
    title: 'Best prop investment I have made',
    content:
      'As a full-time newborn photographer I have tried dozens of props. This moon bed is hands down the most versatile and photogenic piece in my studio. The craftsmanship is superb and it photographs beautifully from every angle.',
    images: [
      'https://placehold.co/400x400/F5F0EB/9C8B7E?text=Studio+Shot',
    ],
    status: 'approved',
    verified_purchase: true,
    admin_response: 'Thank you David! It means a lot coming from a professional. We love seeing your work!',
    admin_responded_at: '2026-01-30T11:00:00Z',
    created_at: '2026-01-28T12:00:00Z',
  },

  // ── mohair-wrap-cream: 3 reviews ──
  {
    product_slug: 'mohair-wrap-cream',
    reviewer_name: 'Amanda P.',
    reviewer_email: 'amanda.p@test.dev',
    rating: 5,
    title: 'So soft and beautiful',
    content:
      'This mohair wrap is incredibly soft and drapes perfectly. The cream color is exactly as shown in the photos. Great for creating an angelic look in newborn portraits. I will definitely be ordering more colors.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    created_at: '2026-01-18T11:30:00Z',
  },
  {
    product_slug: 'mohair-wrap-cream',
    reviewer_name: 'Lisa W.',
    reviewer_email: 'lisa.w@test.dev',
    rating: 4,
    title: 'Lovely texture, a bit delicate',
    content:
      'The wrap has a gorgeous texture that adds so much depth to photos. Just be careful when handling as it can snag easily. I hand wash mine and it holds up well. Great value for the quality.',
    images: [
      'https://placehold.co/400x400/F5F0EB/D4A5A5?text=Wrap+Detail',
    ],
    status: 'approved',
    verified_purchase: false,
    created_at: '2026-01-12T15:00:00Z',
  },
  {
    product_slug: 'mohair-wrap-cream',
    reviewer_name: 'Rachel S.',
    reviewer_email: 'rachel.s@test.dev',
    rating: 5,
    title: 'Must-have for every newborn photographer',
    content:
      'I cannot imagine doing a newborn session without this wrap. The cream shade complements every skin tone and the mohair fibers catch the light beautifully. This is my third purchase from Dvotinst and the quality is always consistent.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    admin_response: 'Thank you Rachel! We appreciate your loyalty and kind words.',
    admin_responded_at: '2026-02-01T09:00:00Z',
    created_at: '2026-01-30T10:20:00Z',
  },

  // ── vintage-lace-romper: 2 reviews ──
  {
    product_slug: 'vintage-lace-romper',
    reviewer_name: 'Claire B.',
    reviewer_email: 'claire.b@test.dev',
    rating: 5,
    title: 'Exquisite lace detail',
    content:
      'The lace work on this romper is remarkable. It fits newborns perfectly and the vintage style adds such charm to photos. My clients always ask where I got it. Packaging was also very careful with tissue paper protection.',
    images: [
      'https://placehold.co/400x400/F5F0EB/B4C4A4?text=Lace+Detail',
      'https://placehold.co/400x400/F5F0EB/B4C4A4?text=On+Baby',
      'https://placehold.co/400x400/F5F0EB/B4C4A4?text=Full+Set',
    ],
    status: 'approved',
    verified_purchase: true,
    created_at: '2026-01-25T13:45:00Z',
  },
  {
    product_slug: 'vintage-lace-romper',
    reviewer_name: 'Tom H.',
    reviewer_email: 'tom.h@test.dev',
    rating: 2,
    title: 'Color was different from photos',
    content:
      'The romper arrived and while the quality is fine, the color was noticeably different from what was shown on the website. It looked more ivory online but in person it has a yellowish tint. Might just be my monitor though.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    admin_response: 'Hi Tom, we are sorry about the color difference. Monitor settings can affect how colors appear. Please contact us at dvotinst@gmail.com and we will make it right for you.',
    admin_responded_at: '2026-01-28T08:00:00Z',
    created_at: '2026-01-26T17:10:00Z',
  },

  // ── training-doll-professional: 1 review ──
  {
    product_slug: 'training-doll-professional',
    reviewer_name: 'Natalie F.',
    reviewer_email: 'natalie.f@test.dev',
    rating: 5,
    title: 'Essential for newborn posing practice',
    content:
      'This training doll is incredibly realistic in weight and proportions. I use it to practice new poses before every session. The silicone feel is very close to a real newborn. Worth every penny for photographers who want to improve their posing skills safely.',
    images: [],
    status: 'approved',
    verified_purchase: true,
    created_at: '2026-02-01T07:00:00Z',
  },

  // ── mini-floral-crown-set: NO reviews (tests empty state) ──

  // ── Pending review (tests moderation flow) ──
  {
    product_slug: 'wooden-moon-bed',
    reviewer_name: 'Test Pending',
    reviewer_email: 'pending@test.dev',
    rating: 1,
    title: 'This is a pending review',
    content:
      'This review should NOT appear on the front-end because its status is pending. It is used to verify that the moderation filter works correctly.',
    images: [],
    status: 'pending',
    verified_purchase: false,
    created_at: '2026-02-03T12:00:00Z',
  },
];

// ─── Main ────────────────────────────────────────────────────

async function resetReviews() {
  console.log('Deleting existing seed reviews...');
  const seedEmails = SEED_REVIEWS.map((r) => r.reviewer_email);
  const { error } = await supabase
    .from('reviews')
    .delete()
    .in('reviewer_email', seedEmails);

  if (error) {
    console.error('Delete failed:', error.message);
  } else {
    console.log(`Deleted reviews with seed emails.`);
  }
}

async function seedReviews() {
  console.log(`\nInserting ${SEED_REVIEWS.length} test reviews...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const review of SEED_REVIEWS) {
    const { error } = await supabase.from('reviews').insert(review);

    if (error) {
      if (error.code === '23505') {
        console.log(`  SKIP  ${review.reviewer_email} (${review.product_slug}) - already exists`);
        skipped++;
      } else {
        console.error(`  FAIL  ${review.reviewer_email}: ${error.message}`);
      }
    } else {
      console.log(`  OK    ${review.reviewer_name} - ${review.product_slug} (${review.rating} stars, ${review.status})`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped.\n`);
  console.log('Test scenarios covered:');
  console.log('  - wooden-moon-bed:            5 approved + 1 pending (rating distribution: 5,5,5,4,3)');
  console.log('  - mohair-wrap-cream:          3 approved (5,5,4)');
  console.log('  - vintage-lace-romper:        2 approved (5,2) with seller reply on negative');
  console.log('  - training-doll-professional: 1 approved (5)');
  console.log('  - mini-floral-crown-set:      0 reviews (empty state test)');
  console.log('  - Seller replies:             3 reviews have admin_response');
  console.log('  - Photos:                     4 reviews have images');
  console.log('  - Verified purchases:         8 reviews');
  console.log('  - Guest reviews:              3 reviews');
  console.log('  - Pending moderation:         1 review (should not appear on front-end)\n');
}

// Parse args
const isReset = process.argv.includes('--reset');

if (isReset) {
  await resetReviews();
}
await seedReviews();
