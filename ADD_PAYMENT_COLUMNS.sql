-- SQL Script to Add Payment Columns to Orders Table
-- Run this in your Supabase SQL Editor: https://app.supabase.com → SQL Editor

-- Step 1: Add payment-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa',
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'awaiting_payment',
ADD COLUMN IF NOT EXISTS pesapal_reference TEXT,
ADD COLUMN IF NOT EXISTS pesapal_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP;

-- Step 2: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_pesapal_ref ON orders(pesapal_reference);

-- Step 3: Add comments to columns (optional, for documentation)
COMMENT ON COLUMN orders.payment_method IS 'Payment method: mpesa, airtel, tigopesa, halopesa';
COMMENT ON COLUMN orders.order_status IS 'Order status: awaiting_payment, paid, sent_to_merchant, accepted, ready_for_dispatch, delivered';
COMMENT ON COLUMN orders.pesapal_reference IS 'Pesapal payment reference ID';
COMMENT ON COLUMN orders.pesapal_transaction_id IS 'Pesapal transaction tracking ID';
COMMENT ON COLUMN orders.payment_timestamp IS 'When payment was completed';

-- Done! Your orders table now supports payments.
