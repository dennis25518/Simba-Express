# How to Add Payment Columns to Your Supabase Database

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** on the left menu
4. Click **"New Query"**

### Step 2: Copy & Paste This SQL

```sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa',
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'awaiting_payment',
ADD COLUMN IF NOT EXISTS pesapal_reference TEXT,
ADD COLUMN IF NOT EXISTS pesapal_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_pesapal_ref ON orders(pesapal_reference);
```

### Step 3: Click "Run" (Ctrl+Enter)

Wait for the green checkmark ✅

### Step 4: Verify Columns Were Added
1. Go to **"Table Editor"**
2. Click **"orders"** table
3. Scroll right - you should see new columns:
   - payment_method
   - order_status
   - pesapal_reference
   - pesapal_transaction_id
   - payment_timestamp

## What These Columns Do

| Column | Purpose | Example |
|--------|---------|---------|
| `payment_method` | Which payment method customer used | "mpesa", "airtel", "tigopesa", "halopesa" |
| `order_status` | Current order state | "awaiting_payment", "paid", "sent_to_merchant" |
| `pesapal_reference` | Pesapal payment ID | "ORD-001234" |
| `pesapal_transaction_id` | Pesapal transaction tracking | "TXN-5678901" |
| `payment_timestamp` | When payment completed | 2026-01-28 14:30:00 |

## Done! 🎉

Now your Simba Express can:
- ✅ Accept payments via M-Pesa, Airtel, Tigopesa, Halopesa
- ✅ Track payment status
- ✅ Store payment references
- ✅ Route paid orders to merchants

## If You Get an Error

**Error: "Column already exists"**
- The columns are already there, no action needed
- Try placing an order again

**Error: "Relation 'orders' does not exist"**
- Make sure you're using the correct table name
- Check your database schema in Table Editor

**Still having issues?**
- Check the "ADD_PAYMENT_COLUMNS.sql" file in your project
- Copy the SQL and run it in Supabase
