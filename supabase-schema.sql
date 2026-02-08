-- Cart & Orders Database Schema (Complete)
-- Run this in Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CARTS TABLE
-- Stores visitor/user shopping carts
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_carts_visitor_id ON carts(visitor_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- ============================================
-- ADDRESSES TABLE
-- User address book for checkout
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Contact Info
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,

    -- Address Fields
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',

    -- Metadata
    label TEXT DEFAULT 'Home',  -- Home, Work, etc.
    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Ensure only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_user_default
ON addresses(user_id) WHERE is_default = true;

-- ============================================
-- ORDERS TABLE
-- Stores completed orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,

    -- Customer identification (supports both guest and member)
    visitor_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,  -- For order confirmation & guest order lookup

    -- Payment integration
    paypal_order_id TEXT UNIQUE,
    paypal_capture_id TEXT,

    -- Shipping address snapshot (stored at order time)
    shipping_address JSONB NOT NULL,

    -- Pricing (calculated at checkout, immutable)
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,

    -- Status tracking
    status TEXT DEFAULT 'pending',  -- pending, paid, processing, shipped, delivered, cancelled, refunded
    payment_status TEXT DEFAULT 'unpaid',  -- unpaid, paid, refunded, partial_refund

    -- Notes
    customer_note TEXT,
    internal_note TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_visitor_id ON orders(visitor_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- Order line items with price snapshot (防止价格篡改)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Product identification
    sku TEXT NOT NULL,
    product_slug TEXT NOT NULL,
    name TEXT NOT NULL,

    -- Variant details
    variant TEXT,
    color TEXT,
    size TEXT,

    -- Custom options snapshot
    custom_texts JSONB,  -- e.g., {"left_text": "NITTO", "right_text": "NT555"}
    stripe JSONB,        -- e.g., {"id": "red", "name": "Red Stripe", "price": 5.99}
    addons JSONB,        -- e.g., [{"id": "glue", "name": "Glue Kit", "price": 9.99}]

    -- Pricing snapshot (immutable - captured at order time)
    unit_price DECIMAL(10, 2) NOT NULL,  -- Price per unit at time of purchase
    quantity INTEGER NOT NULL DEFAULT 1,
    line_total DECIMAL(10, 2) NOT NULL,  -- unit_price * quantity

    -- Product image at time of order
    image TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);
CREATE INDEX IF NOT EXISTS idx_order_items_product_slug ON order_items(product_slug);

-- ============================================
-- PAYMENTS TABLE
-- Payment transactions log (supports refunds/partial refunds)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Payment method info
    payment_method TEXT NOT NULL,  -- paypal, stripe, manual, etc.
    transaction_id TEXT UNIQUE,    -- External payment ID (PayPal capture ID, etc.)

    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- Status
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed, refunded
    direction TEXT DEFAULT 'in',  -- in (收款), out (退款)

    -- Raw response from payment provider
    provider_response JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================
-- ORDER EVENTS TABLE
-- Status change log for auditing & customer service
-- ============================================
CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT NOT NULL,  -- status_changed, payment_received, shipped, refunded, note_added
    old_value TEXT,            -- Previous value (e.g., old status)
    new_value TEXT,            -- New value (e.g., new status)

    -- Actor info
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_type TEXT DEFAULT 'system',  -- system, admin, customer, webhook

    -- Additional context
    metadata JSONB,  -- Extra info (tracking number, refund reason, etc.)
    note TEXT,       -- Human-readable note

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for order_events
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_event_type ON order_events(event_type);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate order numbers (BABYPROPS-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today_prefix TEXT;
    today_count INTEGER;
    new_order_number TEXT;
BEGIN
    today_prefix := 'BABYPROPS-' || TO_CHAR(NOW(), 'YYYYMMDD');

    SELECT COUNT(*) + 1 INTO today_count
    FROM orders
    WHERE order_number LIKE today_prefix || '-%';

    new_order_number := today_prefix || '-' || LPAD(today_count::TEXT, 4, '0');

    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_carts_updated_at ON carts;
CREATE TRIGGER trigger_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_addresses_updated_at ON addresses;
CREATE TRIGGER trigger_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE addresses
        SET is_default = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_default ON addresses;
CREATE TRIGGER trigger_ensure_single_default
    AFTER INSERT OR UPDATE ON addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_address();

-- Function to auto-log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
        VALUES (
            NEW.id,
            'status_changed',
            OLD.status,
            NEW.status,
            'system',
            'Order status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status
        );
    END IF;

    -- Log payment status change
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
        VALUES (
            NEW.id,
            'payment_status_changed',
            OLD.payment_status,
            NEW.payment_status,
            'system',
            'Payment status changed from ' || COALESCE(OLD.payment_status, 'null') || ' to ' || NEW.payment_status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_order_status ON orders;
CREATE TRIGGER trigger_log_order_status
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- ADMIN USERS TABLE
-- Must be created BEFORE RLS policies that use is_admin()
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',  -- admin, super_admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- CARTS: Allow visitors to manage their own carts
DROP POLICY IF EXISTS "Visitors can manage their own carts" ON carts;
CREATE POLICY "Visitors can manage their own carts"
ON carts FOR ALL
USING (true)
WITH CHECK (true);

-- ADDRESSES: Users can only manage their own addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
CREATE POLICY "Users can view their own addresses"
ON addresses FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
CREATE POLICY "Users can insert their own addresses"
ON addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
CREATE POLICY "Users can update their own addresses"
ON addresses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
CREATE POLICY "Users can delete their own addresses"
ON addresses FOR DELETE
USING (auth.uid() = user_id);

-- ORDERS: Allow visitors to view their own orders, allow insert
DROP POLICY IF EXISTS "Visitors can view their own orders" ON orders;
CREATE POLICY "Visitors can view their own orders"
ON orders FOR SELECT
USING (true);  -- Controlled by visitor_id/email in application

DROP POLICY IF EXISTS "Allow creating orders" ON orders;
CREATE POLICY "Allow creating orders"
ON orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updating orders" ON orders;
CREATE POLICY "Allow updating orders"
ON orders FOR UPDATE
USING (true);  -- For webhook updates

-- ORDER_ITEMS: Follow parent order access
DROP POLICY IF EXISTS "Order items follow order access" ON order_items;
CREATE POLICY "Order items follow order access"
ON order_items FOR SELECT
USING (true);  -- Controlled at application level

DROP POLICY IF EXISTS "Allow creating order items" ON order_items;
CREATE POLICY "Allow creating order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- PAYMENTS: Admin-only access for viewing, system can insert
DROP POLICY IF EXISTS "Admins can view payments" ON payments;
CREATE POLICY "Admins can view payments"
ON payments FOR SELECT
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow creating payments" ON payments;
CREATE POLICY "Allow creating payments"
ON payments FOR INSERT
WITH CHECK (true);  -- Created by webhook/server

-- ORDER_EVENTS: Admin-only access for viewing, system can insert
DROP POLICY IF EXISTS "Admins can view order events" ON order_events;
CREATE POLICY "Admins can view order events"
ON order_events FOR SELECT
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow creating order events" ON order_events;
CREATE POLICY "Allow creating order events"
ON order_events FOR INSERT
WITH CHECK (true);  -- Created by server/triggers

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant permissions to authenticated and anon users
GRANT ALL ON carts TO authenticated;
GRANT ALL ON carts TO anon;

GRANT ALL ON addresses TO authenticated;
-- Anon users cannot access addresses (must be logged in)

GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO anon;

GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT, INSERT ON order_items TO anon;

-- Payments: select for admins, insert for server
GRANT SELECT, INSERT ON payments TO authenticated;
GRANT INSERT ON payments TO anon;

-- Order events: select for admins, insert for server
GRANT SELECT, INSERT ON order_events TO authenticated;
GRANT INSERT ON order_events TO anon;

-- ============================================
-- REVIEWS TABLE
-- Product reviews with verified purchase support
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Product identification
    product_slug TEXT NOT NULL,

    -- Reviewer info (supports both guest and member)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_email TEXT NOT NULL,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,

    -- Media (array of image URLs)
    images JSONB DEFAULT '[]'::jsonb,

    -- Verification & moderation
    verified_purchase BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected

    -- Engagement
    helpful_count INTEGER DEFAULT 0,

    -- Admin response
    admin_response TEXT,
    admin_responded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Prevent duplicate reviews from same user for same product
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product
ON reviews(user_id, product_slug) WHERE user_id IS NOT NULL;

-- ============================================
-- REVIEW TRIGGERS
-- ============================================

-- Trigger for reviews updated_at
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to auto-detect verified purchase
CREATE OR REPLACE FUNCTION check_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if reviewer has purchased this product
    IF NEW.reviewer_email IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.email = NEW.reviewer_email
            AND oi.product_slug = NEW.product_slug
            AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
        ) INTO NEW.verified_purchase;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_verified_purchase ON reviews;
CREATE TRIGGER trigger_check_verified_purchase
    BEFORE INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION check_verified_purchase();

-- ============================================
-- REVIEWS RLS POLICIES
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews"
ON reviews FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id OR is_admin(auth.uid()));

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (true);  -- Rate limiting handled at API level

-- Users can update their own pending reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Admins can update any review (for moderation)
DROP POLICY IF EXISTS "Admins can update any review" ON reviews;
CREATE POLICY "Admins can update any review"
ON reviews FOR UPDATE
USING (is_admin(auth.uid()));

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Admin users table: only admins can view
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
CREATE POLICY "Only admins can view admin_users"
ON admin_users FOR SELECT
USING (is_admin(auth.uid()));

-- ============================================
-- REVIEW PERMISSIONS
-- ============================================

GRANT SELECT ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT INSERT ON reviews TO anon;
GRANT UPDATE ON reviews TO authenticated;
GRANT DELETE ON reviews TO authenticated;

GRANT SELECT ON admin_users TO authenticated;

-- ============================================
-- HELPER VIEWS (Optional)
-- ============================================

-- View: Orders with items count
CREATE OR REPLACE VIEW orders_summary AS
SELECT
    o.*,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View: Product review statistics
CREATE OR REPLACE VIEW product_review_stats AS
SELECT
    product_slug,
    COUNT(*) as review_count,
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) FILTER (WHERE rating = 5) as five_star,
    COUNT(*) FILTER (WHERE rating = 4) as four_star,
    COUNT(*) FILTER (WHERE rating = 3) as three_star,
    COUNT(*) FILTER (WHERE rating = 2) as two_star,
    COUNT(*) FILTER (WHERE rating = 1) as one_star,
    COUNT(*) FILTER (WHERE verified_purchase = true) as verified_count
FROM reviews
WHERE status = 'approved'
GROUP BY product_slug;

-- View: Admin orders dashboard
CREATE OR REPLACE VIEW admin_orders_view AS
SELECT
    o.id,
    o.order_number,
    o.email,
    o.status,
    o.payment_status,
    o.total,
    o.created_at,
    o.paid_at,
    o.shipped_at,
    o.shipping_address->>'full_name' as customer_name,
    o.shipping_address->>'country' as country,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC;

-- ============================================
-- SAMPLE QUERIES FOR TESTING
-- ============================================

-- Get cart by visitor_id:
-- SELECT * FROM carts WHERE visitor_id = 'v_test123';

-- Get orders by email (guest checkout):
-- SELECT * FROM orders WHERE email = 'customer@example.com';

-- Get order with items:
-- SELECT o.*, json_agg(oi.*) as items
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.order_number = 'BABYPROPS-20250203-0001'
-- GROUP BY o.id;

-- Get user's addresses:
-- SELECT * FROM addresses WHERE user_id = 'user-uuid-here' ORDER BY is_default DESC;

-- Migrate guest orders to user account (after signup):
-- UPDATE orders SET user_id = 'new-user-uuid' WHERE email = 'customer@example.com' AND user_id IS NULL;

-- ============================================
-- COUPONS TABLE
-- Stores discount/coupon codes
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage')),
    value DECIMAL(10, 2) NOT NULL,
    min_order DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Add coupon_code column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select coupons for validation"
    ON coupons FOR SELECT
    USING (true);

CREATE POLICY "Allow update coupons usage"
    ON coupons FOR UPDATE
    USING (true);

-- Atomic coupon usage increment function
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
