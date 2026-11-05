-- ====================================================================
-- KABADIWALA CONNECT - PRODUCTION DATABASE SCHEMA
-- Primary Database: Supabase PostgreSQL
-- Version: 1.0.0
-- Description: Digital Scrap Passport & Collector Empowerment Network
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if migrating
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sync_records CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS traceability_events CASCADE;
DROP TABLE IF EXISTS scrap_passports CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS handover_records CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS recycler_offers CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS recycler_material_rates CASCADE;
DROP TABLE IF EXISTS material_lot_images CASCADE;
DROP TABLE IF EXISTS material_lots CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS recycler_documents CASCADE;
DROP TABLE IF EXISTS recyclers CASCADE;
DROP TABLE IF EXISTS collectors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- TABLE 1: profiles
-- User profiles linked to Supabase Auth UUID
-- ====================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('collector', 'recycler', 'admin')),
    preferred_language VARCHAR(8) DEFAULT 'mr' CHECK (preferred_language IN ('en', 'hi', 'mr')),
    account_status VARCHAR(32) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- ====================================================================
-- TABLE 2: collectors
-- Profile extension for informal scrap collectors
-- ====================================================================
CREATE TABLE collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    pin_code VARCHAR(16) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_collectors_city ON collectors(city);
CREATE INDEX idx_collectors_pin_code ON collectors(pin_code);

-- ====================================================================
-- TABLE 3: recyclers
-- Profile extension for verified recycling facilities & scrap mills
-- ====================================================================
CREATE TABLE recyclers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    pin_code VARCHAR(16) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status VARCHAR(32) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'requires_info')),
    gst_number VARCHAR(32),
    registration_number VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_recyclers_verification ON recyclers(verification_status);
CREATE INDEX idx_recyclers_city ON recyclers(city);

-- ====================================================================
-- TABLE 4: recycler_documents
-- KYC documents: GST, Pollution Board Consent, Factory License
-- ====================================================================
CREATE TABLE recycler_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL CHECK (document_type IN ('gst_certificate', 'business_license', 'pollution_board_noc', 'id_proof')),
    storage_path TEXT NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_recycler_docs_status ON recycler_documents(verification_status);

-- ====================================================================
-- TABLE 5: materials
-- Standard scrap categories & indicative benchmark pricing
-- ====================================================================
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    subtype VARCHAR(255),
    unit VARCHAR(16) DEFAULT 'kg' NOT NULL,
    description TEXT,
    indicative_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_materials_category ON materials(category);

-- ====================================================================
-- TABLE 6: material_lots
-- Scrap listings created by collectors
-- ====================================================================
CREATE TABLE material_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID NOT NULL REFERENCES collectors(id) ON DELETE RESTRICT,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    weight NUMERIC(10, 2) NOT NULL,
    weight_unit VARCHAR(16) DEFAULT 'kg',
    estimated_value NUMERIC(12, 2) NOT NULL,
    condition VARCHAR(64) NOT NULL,
    pickup_address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    preferred_pickup_date DATE NOT NULL,
    preferred_pickup_time VARCHAR(64),
    status VARCHAR(32) DEFAULT 'available' CHECK (status IN ('draft', 'available', 'offer_received', 'offer_accepted', 'pickup_scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_material_lots_status ON material_lots(status);
CREATE INDEX idx_material_lots_collector ON material_lots(collector_id);

-- ====================================================================
-- TABLE 7: material_lot_images
-- Photos of scrap lots for physical inspection
-- ====================================================================
CREATE TABLE material_lot_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_lot_id UUID NOT NULL REFERENCES material_lots(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 8: recycler_material_rates
-- Buying rates published by recyclers
-- ====================================================================
CREATE TABLE recycler_material_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    rate NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(16) DEFAULT 'kg',
    minimum_quantity NUMERIC(10, 2) DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(recycler_id, material_id)
);

-- ====================================================================
-- TABLE 9: price_history
-- Benchmark price audit history for market transparency
-- ====================================================================
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(16) DEFAULT 'kg',
    source VARCHAR(255) DEFAULT 'Admin Market Index',
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 10: recycler_offers
-- Commercial bids made by recyclers on scrap listings
-- ====================================================================
CREATE TABLE recycler_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_lot_id UUID NOT NULL REFERENCES material_lots(id) ON DELETE CASCADE,
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    offered_price NUMERIC(10, 2) NOT NULL,
    offered_quantity NUMERIC(10, 2) NOT NULL,
    pickup_proposal TEXT,
    valid_until TIMESTAMPTZ NOT NULL,
    message TEXT,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_offers_lot ON recycler_offers(material_lot_id);
CREATE INDEX idx_offers_recycler ON recycler_offers(recycler_id);

-- ====================================================================
-- TABLE 11: orders
-- Transaction created upon offer acceptance
-- ====================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(32) UNIQUE NOT NULL,
    material_lot_id UUID NOT NULL REFERENCES material_lots(id) ON DELETE RESTRICT,
    accepted_offer_id UUID NOT NULL REFERENCES recycler_offers(id) ON DELETE RESTRICT,
    collector_id UUID NOT NULL REFERENCES collectors(id) ON DELETE RESTRICT,
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE RESTRICT,
    agreed_price NUMERIC(10, 2) NOT NULL,
    agreed_quantity NUMERIC(10, 2) NOT NULL,
    final_weight NUMERIC(10, 2),
    final_amount NUMERIC(12, 2),
    pickup_date DATE NOT NULL,
    pickup_time VARCHAR(64),
    order_status VARCHAR(32) DEFAULT 'accepted' CHECK (order_status IN ('accepted', 'pickup_scheduled', 'handover_pending', 'handed_over', 'payment_pending', 'completed', 'cancelled', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_orders_status ON orders(order_status);

-- ====================================================================
-- TABLE 12: handover_records
-- Digital scale physical weigh-in and mutual confirmation
-- ====================================================================
CREATE TABLE handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    collector_confirmation BOOLEAN DEFAULT FALSE,
    recycler_confirmation BOOLEAN DEFAULT FALSE,
    handover_date TIMESTAMPTZ NOT NULL,
    final_weight NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 13: payments
-- Financial payout tracking (UPI, Cash, Bank Transfer)
-- ====================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('UPI', 'Cash', 'Bank Transfer', 'Other')),
    payment_status VARCHAR(32) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference VARCHAR(255) NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 14: scrap_passports
-- Verifiable Digital Scrap Passport with QR Code
-- ====================================================================
CREATE TABLE scrap_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_lot_id UUID UNIQUE NOT NULL REFERENCES material_lots(id) ON DELETE CASCADE,
    passport_code VARCHAR(64) UNIQUE NOT NULL,
    qr_payload TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'recycled', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_passports_code ON scrap_passports(passport_code);

-- ====================================================================
-- TABLE 15: traceability_events
-- Immutable chain-of-custody recycling audit events
-- ====================================================================
CREATE TABLE traceability_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passport_id UUID NOT NULL REFERENCES scrap_passports(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    location VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_events_passport ON traceability_events(passport_id);

-- ====================================================================
-- TABLE 16: notifications
-- Real-time notifications for offers, pickups, and payments
-- ====================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(64) NOT NULL,
    related_entity_type VARCHAR(64),
    related_entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ====================================================================
-- TABLE 17: complaints
-- Dispute redressal module
-- ====================================================================
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_code VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    assigned_admin UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 18: sync_records
-- Offline SQLite sync queue reconciliation
-- ====================================================================
CREATE TABLE sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_operation_id VARCHAR(64) UNIQUE NOT NULL,
    operation_type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID,
    sync_status VARCHAR(32) DEFAULT 'synced' CHECK (sync_status IN ('saved_locally', 'syncing', 'synced', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- TABLE 19: audit_logs
-- Append-only tamper-evident compliance audit trail
-- ====================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycler_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycler_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy
CREATE POLICY "Users can view all public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- 2. Material Lots policy
CREATE POLICY "Anyone can view available scrap lots" ON material_lots FOR SELECT USING (status != 'draft');
CREATE POLICY "Collectors can manage their own lots" ON material_lots FOR ALL USING (
    collector_id IN (SELECT id FROM collectors WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);

-- 3. Offers policy
CREATE POLICY "Recyclers can view and create their own offers" ON recycler_offers FOR ALL USING (
    recycler_id IN (SELECT id FROM recyclers WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Collectors can view offers on their lots" ON recycler_offers FOR SELECT USING (
    material_lot_id IN (
        SELECT id FROM material_lots WHERE collector_id IN (
            SELECT id FROM collectors WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    )
);

-- 4. Audit Logs append-only policy
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
);
