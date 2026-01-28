# Pesapal Payment Gateway Setup Guide - Tanzania Mobile Money

## Overview

Your Simba Express checkout now accepts mobile payments through **Pesapal**, which supports:
- ✅ M-Pesa
- ✅ Airtel Money
- ✅ Tigopesa
- ✅ Halopesa

---

## PART 1: Setup Pesapal Account

### Step 1: Create Pesapal Business Account

1. Go to https://www.pesapal.com
2. Click **"Sign Up"** → Select **"Business"**
3. Fill in these details:
   - **Business Name:** Simba Express
   - **Business Type:** Retail/E-commerce
   - **Email:** your-email@example.com
   - **Phone:** Your business phone
   - **Country:** Tanzania

4. Verify your email
5. Complete KYC (Know Your Customer):
   - Upload National ID or Passport
   - Upload business registration (if applicable)
   - Provide bank account details
6. Wait for approval (1-2 business days)

### Step 2: Get API Credentials

**After approval:**

1. Log into Pesapal dashboard: https://www.pesapal.com/dashboard
2. Go to **Settings** → **API Credentials**
3. You'll see:
   - **Consumer Key** (API Key) - Copy this
   - **Consumer Secret** (API Secret) - Copy this

**Example format:**
```
Consumer Key: YOUR_PESAPAL_CONSUMER_KEY_HERE
Consumer Secret: YOUR_PESAPAL_CONSUMER_SECRET_HERE
```

---

## PART 2: Update Your Code with Credentials

### Step 3: Add Your Pesapal Keys

Open your `index.html` file and find this section (around line 1555):

```javascript
const PESAPAL_CONSUMER_KEY = 'YOUR_PESAPAL_CONSUMER_KEY';
const PESAPAL_CONSUMER_SECRET = 'YOUR_PESAPAL_CONSUMER_SECRET';
```

**Replace with your actual keys:**

```javascript
const PESAPAL_CONSUMER_KEY = 'xxxxxxxxxxxxx'; // Your actual Consumer Key
const PESAPAL_CONSUMER_SECRET = 'xxxxxxxxxxxxxx'; // Your actual Consumer Secret
```

### Step 4: Choose Environment

In the same section, you'll see:

```javascript
const PESAPAL_API_URL = 'https://api.pesapal.com/api/redirecturl/'; // Live
// For testing: 'https://demo.pesapal.com/api/redirecturl/'
```

**For Testing (Recommended first):**
```javascript
const PESAPAL_API_URL = 'https://demo.pesapal.com/api/redirecturl/';
```

**For Production (After testing):**
```javascript
const PESAPAL_API_URL = 'https://api.pesapal.com/api/redirecturl/';
```

### Step 5: Setup Webhook (IPN - Instant Payment Notification)

Pesapal will send payment status updates to your app via webhook.

**In Pesapal Dashboard:**
1. Go to **Settings** → **API Credentials**
2. Set **IPN (Webhook) URL** to: `https://yourdomain.com/api/payment-callback`
3. Pesapal will POST payment status to this URL

**In your backend (Node.js/Firebase example):**
```javascript
// This receives payment notifications from Pesapal
app.post('/api/payment-callback', async (req, res) => {
    const { reference, pesapal_transaction_tracking_id, status } = req.body;
    
    // Update order status in Supabase based on payment status
    if (status === 'COMPLETED') {
        // Payment successful
        await supabase
            .from('orders')
            .update({ order_status: 'paid' })
            .eq('id', reference);
    }
    
    res.json({ status: 'ok' });
});
```

---

## PART 3: Database Updates

### Step 6: Add Payment Fields to Orders Table

Run this SQL in Supabase:

```sql
-- Add payment-related columns to orders table
ALTER TABLE orders
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN pesapal_reference TEXT,
ADD COLUMN pesapal_transaction_id TEXT,
ADD COLUMN payment_timestamp TIMESTAMP;

-- Create index for payment tracking
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

---

## PART 4: How the Payment Flow Works

### Customer Payment Journey:

```
1. Customer adds items to cart
2. Fills delivery info + selects payment method
3. Clicks "💳 Lipa Kwa Simu" (Pay by Phone)
4. Order created in database with status 'awaiting_payment'
5. Pesapal payment window opens
6. Customer enters phone number (e.g., 0654321098)
7. Gets USSD prompt or app redirect
8. Authorizes payment (M-Pesa/Airtel/Tigopesa/Halopesa)
9. Payment processed
10. Pesapal confirms payment
11. Order status updates to 'paid'
12. Order ready for admin routing
```

### Admin Sees:
- ✅ Order marked as 'paid' 
- ✅ Polling system activates merchant matching
- ✅ Order routes to nearest merchant
- ✅ Merchant receives notification

---

## PART 5: Testing

### Test with Demo Credentials

**Before using real money, test with:**

1. **Pesapal Demo Account:**
   - Dashboard: https://demo.pesapal.com
   - Use demo credentials
   - Test numbers: 0700000001, 0700000002, etc.

2. **Mobile Money Test Codes:**
   - M-Pesa: Dial `*150*00*00*` (Kenya test format, adjust for Tanzania)
   - Check Pesapal docs for TZ test codes

### Testing Checklist:

- [ ] Payment method selection visible (M-Pesa, Airtel, etc.)
- [ ] "Lipa Kwa Simu" button works
- [ ] Pesapal window opens
- [ ] Payment confirmation received
- [ ] Order status updates to 'paid'
- [ ] Admin dashboard shows paid order
- [ ] Order routes to merchant
- [ ] Merchant receives notification

---

## PART 6: Payment Statuses

Your orders will have these payment statuses:

| Status | Meaning | Action |
|--------|---------|--------|
| `awaiting_payment` | Customer hasn't paid yet | Show payment window |
| `pending` | Payment under review | Admin monitors |
| `paid` | Payment successful | Route to merchant |
| `failed` | Payment declined | Show retry option |
| `cancelled` | Customer cancelled | Allow retry |

---

## PART 7: Security Best Practices

### ✅ DO:
- Store keys in environment variables (not hardcoded)
- Validate all webhook signatures from Pesapal
- Use HTTPS only
- Hash sensitive data
- Log all transactions
- Implement rate limiting

### ❌ DON'T:
- Commit API keys to GitHub (use .env files)
- Expose keys in client-side code
- Trust client-side payment validation
- Skip webhook verification
- Store card/payment details

### Implementation with Environment Variables:

```javascript
// Use environment variables instead of hardcoding
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

// .env file (never commit this)
PESAPAL_CONSUMER_KEY=xxxxx
PESAPAL_CONSUMER_SECRET=xxxxx
```

---

## PART 8: Troubleshooting

### Issue: "Pesapal not initialized"
**Solution:** Ensure SDK is loaded
```html
<!-- Check in <head> -->
<script src="https://www.pesapal.com/api/os-sdk.js"></script>
```

### Issue: Payment window doesn't open
**Solution:** Check browser console for errors
- F12 → Console tab
- Look for CORS errors
- Verify Consumer Key is correct

### Issue: Order not updating after payment
**Solution:** Setup webhook/IPN correctly
- Log payment callbacks in Pesapal dashboard
- Verify webhook URL is correct
- Check your backend is receiving notifications

### Issue: Test payment not working
**Solution:** Use demo environment
```javascript
// Switch to demo
const PESAPAL_API_URL = 'https://demo.pesapal.com/api/redirecturl/';
```

---

## PART 9: Going Live (Production)

### Checklist Before Going Live:

- [ ] Pesapal account fully approved with all documents
- [ ] API credentials obtained and verified
- [ ] Payment window tested 5+ times successfully
- [ ] Webhook/IPN receiving payments
- [ ] Order statuses updating correctly
- [ ] Database backup created
- [ ] SSL certificate installed (HTTPS)
- [ ] Payment logs being recorded
- [ ] Customer support ready
- [ ] Refund process documented

### Production Deployment:

```javascript
// Change to live API
const PESAPAL_API_URL = 'https://api.pesapal.com/api/redirecturl/';

// Enable proper error logging
const logTransaction = (orderId, status, amount) => {
    console.log(`[PAYMENT] Order: ${orderId}, Status: ${status}, Amount: ${amount}`);
    // Could also log to a service like LogRocket or Sentry
};
```

---

## PART 10: Payment Methods Explained

### M-Pesa
- Most popular in Tanzania
- Dial: `*150*00*[Amount]*[Business Number]#`
- Instant confirmation
- Best for retail customers

### Airtel Money
- Second largest network
- Dial: `*150*00*[Amount]*[Business Number]#`
- Similar to M-Pesa
- Good for Airtel subscribers

### Tigopesa
- Tigo's mobile money service
- Dial: `*150*pin*menu#`
- Growing popularity
- Tigo network integration

### Halopesa
- Newest service in market
- App-based primarily
- Fast growing in TZ
- Target younger demographic

---

## PART 11: Support & Documentation

### Useful Links:
- **Pesapal Docs:** https://pesapalsupport.zendesk.com
- **API Reference:** https://pesapal.freshdesk.com/a/solutions/articles/32000028351
- **Test Credentials:** https://pesapalsupport.zendesk.com/hc/en-us/articles/206999987
- **Webhook Setup:** https://pesapalsupport.zendesk.com/hc/en-us/articles/206894207

### Contact Pesapal:
- **Email:** support@pesapal.com
- **Phone:** +254 703 000 000
- **Live Chat:** On Pesapal website

---

## PART 12: Next Steps

### Immediate (This Week):
1. ✅ Create Pesapal account
2. ✅ Get API credentials
3. ✅ Add credentials to index.html
4. ✅ Test with demo environment
5. ✅ Setup webhook

### Short Term (This Month):
1. ✅ Test all payment methods
2. ✅ Monitor test transactions
3. ✅ Fix any issues
4. ✅ Get Pesapal approval for live

### Launch (When Ready):
1. ✅ Switch to production API URL
2. ✅ Final testing with real money
3. ✅ Monitor first transactions closely
4. ✅ Setup payment reconciliation
5. ✅ Train support team

---

## Payment Status Flow (Your App)

```
Order Created (awaiting_payment)
           ↓
  Customer initiates payment
           ↓
Pesapal payment window opens
           ↓
Customer authorizes (M-Pesa/Airtel/etc)
           ↓
Mobile money processes
           ↓
Pesapal confirms payment
           ↓
Webhook notifies your backend
           ↓
Order status → 'paid'
           ↓
Admin polling detects 'paid' order
           ↓
Matchmaker routes to merchant
           ↓
Merchant receives notification
           ↓
Order in 'sent_to_merchant'
```

---

## Quick Reference

**Current Implementation:**
- ✅ Payment method selection UI (4 options)
- ✅ Order creation before payment
- ✅ Pesapal SDK integration
- ✅ Payment window opener
- ✅ Status polling after payment
- ✅ Success notification

**Still Needed:**
- Webhook/IPN handler in backend
- Payment receipt generation
- Refund processing interface
- Payment history/receipts in customer account
- SMS/Email payment confirmation

---

This is your complete payment gateway setup! Follow these steps and you'll have mobile money payments working within hours.

**Questions?** Check Pesapal's official documentation or contact their support team.
