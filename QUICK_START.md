# 🚀 Quick Start - 5 Minute Setup

## Step 1: Create Supabase Project (2 min)
1. Go to https://supabase.com
2. Click "Sign Up"
3. Create account with email
4. Create new project (name it "simba-express")
5. Wait 2-3 minutes for it to initialize

## Step 2: Get Your Credentials (1 min)
1. Open your Supabase project
2. Click "Settings" (bottom left)
3. Click "API"
4. Copy these two values:
   - **Project URL** - starts with `https://`
   - **anon public** - long string starting with `eyJ`

## Step 3: Copy Credentials to index.html (1 min)
1. Open `index.html` with a text editor
2. Use Ctrl+F to find: `SUPABASE_URL = `
3. You'll see around line 510:
```javascript
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
4. Replace those values with your actual credentials

## Step 4: Create Database Tables (1 min)
1. In Supabase, click "SQL Editor" (left menu)
2. Click "New Query"
3. Copy-paste this SQL code:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  order_items JSONB NOT NULL,
  subtotal BIGINT NOT NULL,
  delivery_fee BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,
  order_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Click "Run" (or Ctrl+Enter)
5. You should see "Success" messages

**That's it!** You're ready to go! 🎉

## Test It

1. Open your website
2. Click the 👤 icon in top right
3. Click "Jisajili" (Register)
4. Fill in the form
5. Click "📍 Pata Mahali Yangu" to capture your location
6. Click "Jisajili Sasa"
7. Log in with your new account
8. Add products to cart
9. Click "Tazama Oda"
10. Click "✅ Thibitisha Oda"
11. Order saved! ✅

## Verify Data in Supabase

1. In Supabase, click "Table Editor" (left menu)
2. You should see:
   - `user_profiles` - your registered account
   - `orders` - your test order

Done! Everything is working! 🚀

---

## Optional: Enable Email Confirmation

1. In Supabase, click "Authentication" → "Providers"
2. Make sure "Email" is enabled (it is by default)
3. Users will get a confirmation email when they register

---

## Troubleshooting

**Not working?** Check:
1. ✅ Credentials copied correctly to index.html (no extra spaces)
2. ✅ SQL tables created in Supabase
3. ✅ Website loaded after making changes
4. ✅ Using modern browser (Chrome, Firefox, Safari, Edge)

**Check browser console for errors:**
- Press F12
- Click "Console" tab
- Refresh page
- Look for red error messages

---

For detailed setup and more features, see **SETUP_GUIDE.md**
