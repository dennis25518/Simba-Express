-- Migration: Add delivery information columns to orders table
-- Purpose: Store customer delivery details for order fulfillment and merchant routing
-- Created: 2026-01-26

-- Add customer delivery information columns
ALTER TABLE orders
ADD COLUMN customer_name TEXT NOT NULL DEFAULT '',
ADD COLUMN customer_phone TEXT NOT NULL DEFAULT '',
ADD COLUMN delivery_latitude NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN delivery_longitude NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN delivery_notes TEXT;

-- Add comments to describe the new columns
COMMENT ON COLUMN orders.customer_name IS 'Customer full name for delivery';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone number (format: 255...)';
COMMENT ON COLUMN orders.delivery_latitude IS 'GPS latitude coordinate for delivery location';
COMMENT ON COLUMN orders.delivery_longitude IS 'GPS longitude coordinate for delivery location';
COMMENT ON COLUMN orders.delivery_notes IS 'Optional delivery instructions or notes';

-- Create indexes for location-based merchant matching (geo-spatial queries)
CREATE INDEX idx_orders_delivery_location ON orders(delivery_latitude, delivery_longitude);

-- Create an index on customer_phone for order lookup
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);