-- SQL: Create payments and payment_logs tables for Pesapal v3 integration

-- ===========================
-- PAYMENTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Order reference
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merchant_reference TEXT NOT NULL UNIQUE, -- Must match order_id
    
    -- Pesapal tracking IDs
    pesapal_order_tracking_id TEXT,
    pesapal_transaction_tracking_id TEXT,
    
    -- Payment details
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'TZS',
    phone TEXT,
    payment_method TEXT, -- mpesa, airtel, tigopesa, halopesa
    
    -- Status: PENDING | PROCESSING | SUCCESS | FAILED
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for fast queries
    CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_merchant_reference ON payments(merchant_reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_pesapal_tracking ON payments(pesapal_order_tracking_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ===========================
-- PAYMENT LOGS TABLE (for reconciliation)
-- ===========================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Event tracking
    event_type TEXT, -- IPN_RECEIVED, VERIFICATION_STARTED, VERIFICATION_SUCCESS, etc.
    status TEXT, -- Payment status from Pesapal
    amount NUMERIC,
    tracking_id TEXT,
    
    -- Raw data for debugging
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX idx_payment_logs_created_at ON payment_logs(created_at);
CREATE INDEX idx_payment_logs_event_type ON payment_logs(event_type);

-- ===========================
-- UPDATE ORDERS TABLE (if needed)
-- ===========================
-- Add payment-related columns to orders if they don't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'awaiting_payment';

-- Create index for order status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- ===========================
-- COMMENTS (for documentation)
-- ===========================
COMMENT ON TABLE payments IS 'Tracks all Pesapal payment transactions. IPN updates payment status.';
COMMENT ON COLUMN payments.status IS 'PENDING=order created, PROCESSING=user at Pesapal, SUCCESS=IPN verified, FAILED=declined/cancelled';
COMMENT ON TABLE payment_logs IS 'Audit log of payment events. For reconciliation and debugging.';
COMMENT ON COLUMN payment_logs.raw_data IS 'Complete Pesapal IPN data as JSON for debugging.';

-- ===========================
-- RUN THESE COMMANDS IN SUPABASE SQL EDITOR
-- ===========================
-- 1. Copy all SQL above
-- 2. Go to: https://app.supabase.com → SQL Editor
-- 3. Create new query
-- 4. Paste and run
-- 5. Verify tables created in Table Editor
