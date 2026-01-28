# Pesapal v3 Quick Start Checklist

## ✅ WHAT'S ALREADY DONE

- [x] Backend API routes created (`/api/pesapal/auth`, `/api/pesapal/submit-order`, `/api/pesapal/ipn`)
- [x] Frontend updated to use secure backend (no direct Pesapal calls)
- [x] IPN webhook handler ready
- [x] Database schema provided
- [x] `.env` configuration template created
- [x] Code committed to GitHub
- [x] Auto-deployed to Vercel

## 📋 YOUR NEXT STEPS (In Order)

### STEP 1: Create Database Tables (5 minutes)
**Status**: ⏳ WAITING FOR YOU

1. Go to: https://app.supabase.com
2. Click "SQL Editor" → "New Query"
3. Open file: `PESAPAL_V3_DATABASE.sql`
4. Copy all SQL and paste into Supabase
5. Click "Run"
6. Verify in Table Editor - should see:
   - `payments` table
   - `payment_logs` table

**✓ Done when**: You see green checkmark in Supabase

---

### STEP 2: Register IPN Endpoint (10 minutes)
**Status**: ⏳ WAITING FOR YOU

Pesapal needs to know where to send payment notifications.

**Option A: Using Pesapal Dashboard** (Recommended)
1. Log into: https://cybqa.pesapal.com (Sandbox)
2. Go to: Settings → Webhook/IPN
3. Click "Add Webhook"
4. URL: `https://yourdomain.com/api/pesapal/ipn`
   - For development: `http://localhost:3000/api/pesapal/ipn`
   - For Vercel: `https://your-vercel-domain.vercel.app/api/pesapal/ipn`
5. Event type: Select "PAYMENT"
6. Click "Save"
7. Copy the **IPN ID** that appears
8. Update `.env`:
   ```
   PESAPAL_IPN_ID=your_ipn_id_here
   ```

**Option B: Using cURL**
```bash
# Get current IPN list
curl -X GET \
  "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList" \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Register new IPN
curl -X POST \
  "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN" \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/pesapal/ipn",
    "ipn_notification_types": "PAYMENT"
  }'
```

**✓ Done when**: You have PESAPAL_IPN_ID in `.env`

---

### STEP 3: Verify Environment Variables (5 minutes)
**Status**: ⏳ WAITING FOR YOU

Ensure your `.env` file has:

```env
# Pesapal Credentials (Already configured)
PESAPAL_CONSUMER_KEY=MgnBl7oCT2JmzK8MQ9fP6p5VVVh5rrg0
PESAPAL_CONSUMER_SECRET=tnVjvF7eUCNBLcamk/dylBi8CIs=
PESAPAL_IPN_ID=your_registered_ipn_id_here

# Supabase (Should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For dev
# For Vercel: NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

**✓ Done when**: All variables are set and Vercel environment shows them

---

### STEP 4: Test Payment Flow (15 minutes)
**Status**: ⏳ WAITING FOR YOU

#### On Your Local Machine:

```bash
# 1. Install dependencies if not done
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
```

#### Test Transaction:

1. **Add items** to cart
2. **Click cart icon** → Checkout
3. **Fill all fields**:
   - Name
   - Phone
   - Location (click GPS button)
   - Select payment method (M-Pesa recommended)
4. **Click "💳 Lipa Kwa Simu"**
5. **You'll be redirected to Pesapal**
6. **Use test credentials**:
   - Phone: 0700000001
   - Enter amount shown
7. **Confirm** on Pesapal
8. **Check Supabase**:
   - Go to `payments` table
   - Look for your test order
   - Status should be "SUCCESS"
   - Go to `orders` table
   - Status should be "paid"

**✓ Done when**: Order shows "paid" in Supabase after test payment

---

### STEP 5: Check Admin Dashboard
**Status**: ⏳ AFTER PAYMENT TEST

1. Open **Simba-Merchant-App**
2. Go to **Admin Dashboard**
3. Look for your test order
4. Should show as "paid" and ready for merchant routing
5. Order matching engine should activate

**✓ Done when**: Order appears in admin with status "sent_to_merchant"

---

### STEP 6: Go Live (When Ready)
**Status**: 🔄 AFTER SANDBOX TESTING

Switch from Sandbox to Live:

1. **Get Production Credentials**:
   - Log into: https://www.pesapal.com (Live, not cybqa)
   - Settings → API Credentials
   - Copy production Consumer Key and Secret

2. **Update `.env`**:
   ```env
   PESAPAL_CONSUMER_KEY=your_live_key
   PESAPAL_CONSUMER_SECRET=your_live_secret
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Update API URLs** in `/api/pesapal/auth.js`:
   ```javascript
   const tokenUrl = 'https://api.pesapal.com/pesapalv3/api/Auth/RequestToken';
   // (Change from cybqa.pesapal.com)
   ```

4. **Register live IPN endpoint** with Pesapal

5. **Test with real money** (small amounts)

6. **Monitor logs** for first week

**✓ Done when**: Real payments start flowing

---

## 📊 Payment Flow Overview

```
Customer fills form
     ↓
Orders table: order_status = 'awaiting_payment'
     ↓
Frontend calls: POST /api/pesapal/submit-order
     ↓
Backend:
  - Gets Pesapal token
  - Submits order to Pesapal
  - Creates payment record
  - Returns checkout URL
     ↓
Customer redirected to Pesapal
     ↓
Customer enters M-Pesa PIN
     ↓
Pesapal processes payment
     ↓
IPN webhook → POST /api/pesapal/ipn
     ↓
Backend verifies with Pesapal
     ↓
Updates Supabase:
  - payments.status = SUCCESS
  - orders.order_status = paid
     ↓
Admin dashboard polls
     ↓
Order routes to nearest merchant
```

---

## 🐛 Troubleshooting

### Issue: IPN not being received
**Check**:
1. Pesapal dashboard → IPN History
2. Status should show "Delivered"
3. If "Failed", verify URL is correct
4. Check firewall/CORS settings

### Issue: "Failed to get Pesapal token"
**Check**:
1. PESAPAL_CONSUMER_KEY is correct
2. PESAPAL_CONSUMER_SECRET is correct
3. API endpoint is correct (cybqa vs api)
4. Network request in browser DevTools

### Issue: Order not updating to 'paid'
**Check**:
1. Supabase `payment_logs` table
2. Look for IPN_RECEIVED events
3. Check error messages in logs
4. Verify transaction with Pesapal manually

### Issue: "Cannot read properties of undefined"
**Check**:
1. SUPABASE_SERVICE_ROLE_KEY is set
2. Tables exist in Supabase
3. Column names match exactly
4. Check server logs in Vercel

---

## 📞 Support

- **Pesapal Docs**: https://pesapalsupport.zendesk.com
- **API v3 Docs**: https://pesapalsupport.zendesk.com/hc/en-us/articles/206999987-API-V3-v3
- **Contact Pesapal**: support@pesapal.com

---

## ✨ Success Criteria

You'll know it's working when:

- [x] Database tables created
- [x] IPN endpoint registered
- [x] Test payment goes through
- [x] Order appears as "paid"
- [x] Admin dashboard routes order
- [x] Merchant gets notification
- [x] Customer gets SMS/notification

---

**Total Time to Full Integration**: ~1 hour

Start with Step 1! 🚀
