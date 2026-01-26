# Simba Express - Frontend Upgrade Setup Guide

## 🎉 New Features Implemented

Your Simba Express frontend has been successfully upgraded with the following features:

### 1. **User Account Management (Login/Register)**
- 👤 User icon added to navbar top right
- Complete registration form with:
  - Full Name
  - Phone Number
  - Email
  - Password
  - Location (Street/Building name)
  - Live GPS Location Tracking
  - Profile Picture Upload (ready for implementation)

### 2. **Supabase Backend Integration**
- Replace WhatsApp checkout with direct Supabase database integration
- Registered users can submit orders directly to backend
- Automatic user session management
- Order history tracking capability

### 3. **Enhanced Checkout Flow**
- **Guest Users**: Still have option to use WhatsApp checkout
- **Registered Users**: Direct order submission to Supabase backend
- Transparent billing display
- Automatic calculation of delivery fees (Tsh 5,000)

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)

### Step 2: Create Required Tables in Supabase

Go to your Supabase project dashboard and create the following tables:

#### **Table 1: `user_profiles`**
```sql
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table 2: `orders`**
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  order_items JSONB NOT NULL,
  subtotal BIGINT NOT NULL,
  delivery_fee BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,
  order_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Configure Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (under "Project API URL")
   - **Anon Public Key** (under "Project API Key")

3. Open your `index.html` file and find these lines (around line 510):

```javascript
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

4. Replace the placeholders with your actual credentials:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 4: Configure Email Confirmation (Optional but Recommended)

1. In Supabase, go to **Authentication** → **Providers**
2. Enable Email provider (should be on by default)
3. Go to **Email Templates** to customize welcome emails
4. Under **Settings**, configure:
   - Confirm signup (recommend enabling)
   - Email confirmation validity (recommended: 24 hours)

### Step 5: Set Up Row Level Security (RLS) Policies

For security, set up RLS policies in Supabase:

#### **For `user_profiles` table:**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### **For `orders` table:**
```sql
-- Users can only view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert orders
CREATE POLICY "Users can insert orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Step 6: Test Your Setup

1. Go to your website
2. Click the **👤** icon in the top right
3. Click **"Jisajili"** to register a new account
4. Fill in all required information
5. Click **"📍 Pata Mahali Yangu"** to capture your location
6. Submit the registration
7. Log in with your new account
8. Add products to cart
9. Click **"✅ Thibitisha Oda"** to submit order

---

## 📱 Feature Details

### User Registration Form
- **Jina Kamili** (Full Name) - Text input
- **Namba ya Simu** (Phone Number) - Tel input
- **Barua Pepe** (Email) - Email input
- **Nenosiri** (Password) - Secure password field
- **Mahali** (Location) - Street/Building name
- **📍 Pata Mahali Yangu** - GPS location button
- **Profile Picture** - File upload (integration ready)

### Checkout Flow - Registered Users
1. Add products to cart
2. Click "Tazama Oda" button
3. Review order summary
4. Click "✅ Thibitisha Oda"
5. Order is immediately saved to Supabase backend
6. Success notification appears
7. Order appears in your backend database

### Checkout Flow - Guest Users
1. Add products to cart
2. Click "Tazama Oda" button
3. Fill in phone, name, location manually
4. Click "💬 Thibitisha Oda WhatsApp"
5. Order sent via WhatsApp to +255 685 636 220

---

## 🔧 Customization Options

### Change Delivery Fee
Find this line in the JavaScript (around line 650):
```javascript
const deliveryFee = 5000;
```
Change `5000` to your desired fee (in Tanzanian Shillings).

### Change WhatsApp Business Number
Find the `sendWhatsApp()` function and change:
```javascript
window.location.href = `https://wa.me/255685636220?text=${msg}`;
```
Replace `255685636220` with your WhatsApp number (without + symbol).

### Customize Email After Registration
The system sends confirmation emails. Customize templates in:
**Supabase Dashboard** → **Authentication** → **Email Templates**

---

## 🐛 Troubleshooting

### "Supabase is not defined"
- Make sure the Supabase CDN link is loaded before your script
- Check that the script tag is: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

### Orders not saving
1. Verify your Supabase credentials are correct
2. Check that the `orders` table exists in Supabase
3. Verify RLS policies are correctly configured
4. Check browser console (F12) for error messages

### Location not capturing
- Enable location permissions in your browser
- Ensure the website is served over HTTPS (browsers require this for geolocation)
- Check that the device has GPS capability

### Users can't register
1. Verify email configuration in Supabase is enabled
2. Check that users can confirm their email
3. Verify the `user_profiles` table has correct structure

---

## 📊 Database Schema Reference

### `user_profiles` Table Structure
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | UUID | Foreign key to auth.users |
| fullname | TEXT | User's full name |
| phone | TEXT | Phone number |
| email | TEXT | Email address |
| location | TEXT | Street/Building name |
| latitude | DECIMAL | GPS latitude |
| longitude | DECIMAL | GPS longitude |
| profile_picture_url | TEXT | URL to profile picture |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last update |

### `orders` Table Structure
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | UUID | Foreign key to auth.users |
| user_email | TEXT | Customer email |
| order_items | JSONB | Array of order items |
| subtotal | BIGINT | Item total (without delivery) |
| delivery_fee | BIGINT | Delivery charge |
| total_amount | BIGINT | Grand total |
| order_status | TEXT | Status (pending/confirmed/delivered) |
| notes | TEXT | Special notes |
| created_at | TIMESTAMP | Order date |
| updated_at | TIMESTAMP | Last update |

---

## 🔐 Security Checklist

- [ ] Changed Supabase credentials from defaults
- [ ] Enabled email confirmation for new users
- [ ] Configured RLS policies for tables
- [ ] Tested login/logout functionality
- [ ] Verified order submission works
- [ ] Set strong password requirements in Supabase auth settings
- [ ] Enable HTTPS on your website
- [ ] Regularly backup your Supabase data

---

## 📝 Future Enhancement Ideas

1. **Profile Picture Upload** - Currently prepared in UI, needs integration
2. **Order Tracking** - Real-time tracking of deliveries
3. **Payment Gateway** - Integrate M-Pesa, Airtel Money, or Stripe
4. **Order History** - Display past orders for logged-in users
5. **Wishlist** - Save favorite products
6. **Notifications** - SMS/Email updates on order status
7. **Admin Dashboard** - Manage orders and users
8. **Reviews & Ratings** - Customer feedback system

---

## 📞 Support

For Supabase documentation and help:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Community](https://discord.supabase.io)

For this project:
- Check the browser console (F12) for error messages
- Verify all Supabase tables are correctly created
- Ensure Supabase credentials are accurate

---

## 📄 License

This upgrade maintains the original project's license and structure.

**Last Updated:** January 26, 2026
**Version:** 2.0 (With User Auth & Supabase Backend)
