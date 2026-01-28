# Pesapal v3 Secure Payment Integration Guide

## Overview

This implementation uses **Pesapal v3 API** in SANDBOX mode with:
- ✅ Server-side payment processing (Vercel serverless functions)
- ✅ Bearer token authentication
- ✅ IPN webhook for payment confirmation
- ✅ Secure Supabase integration
- ✅ Idempotent payment handling
- ✅ Complete audit logging

**CRITICAL RULE**: Only IPN verifies payment. Redirect URLs are UX only.

---

## Architecture

```
Frontend (Simba Express)
    ↓
[POST] /api/pesapal/submit-order
    ↓
Backend Vercel Function
    ├─ Get Pesapal token
    ├─ Submit order to Pesapal
    ├─ Store payment record (Supabase)
    └─ Return checkout URL to frontend
    ↓
Frontend redirects user to Pesapal
    ↓
User enters M-Pesa/Airtel/Tigopesa/Halopesa PIN on phone
    ↓
Pesapal processes payment
    ↓
Pesapal IPN sends webhook → /api/pesapal/ipn
    ↓
Backend verifies transaction with Pesapal
    ↓
Backend updates Supabase:
    ├─ payments.status = SUCCESS
    └─ orders.order_status = paid
    ↓
Admin dashboard polls for 'paid' orders
    ↓
Order routes to merchants
```

---

## Step 1: Create Database Tables

Run this in Supabase SQL Editor:

**Go to**: https://app.supabase.com → SQL Editor → New Query

**Paste the SQL from**: `PESAPAL_V3_DATABASE.sql`

**Tables created**:
- `payments` - Tracks all Pesapal transactions
- `payment_logs` - Audit trail for debugging

---

## Step 2: Pesapal IPN Registration (CRITICAL)

The backend needs a registered IPN ID to receive payment notifications.

### Register IPN Endpoint:

1. **Get your current IPN list**:
   ```bash
   curl -X GET \
   "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList" \
   -H "Authorization: Bearer {YOUR_TOKEN}"
   ```

2. **Register new IPN URL**:
   ```bash
   curl -X POST \
   "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN" \
   -H "Authorization: Bearer {YOUR_TOKEN}" \
   -H "Content-Type: application/json" \
   -d '{
     "url": "https://yourdomain.com/api/pesapal/ipn",
     "ipn_notification_types": "PAYMENT"
   }'
   ```

3. **Response will include**:
   ```json
   {
     "ipn_id": "12345678-abcd-1234-abcd-1234567890ab"
   }
   ```

4. **Add to `.env`**:
   ```
   PESAPAL_IPN_ID=12345678-abcd-1234-abcd-1234567890ab
   ```

---

## Step 3: Backend API Routes

Three serverless functions created in `/api/pesapal/`:

### Route 1: `/api/pesapal/auth` (GET)
- Gets Bearer token from Pesapal
- Called by other endpoints
- No request body needed

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Route 2: `/api/pesapal/submit-order` (POST)
- Frontend calls this to initiate payment
- Creates payment record in Supabase
- Returns Pesapal checkout URL

**Request**:
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "email": "customer@example.com",
  "phone": "255654321098",
  "paymentMethod": "mpesa"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://cybqa.pesapal.com/api/Merchants/...",
  "orderTrackingId": "6f6a2e97-91fa-4f13-85f9-f8ecd38e42f5"
}
```

### Route 3: `/api/pesapal/ipn` (POST)
- Pesapal sends payment notifications here
- Verifies transaction with Pesapal
- Updates order status to 'paid'
- **Only this endpoint confirms payment**

**Received from Pesapal**:
```json
{
  "OrderTrackingId": "6f6a2e97-91fa-4f13-85f9-f8ecd38e42f5",
  "OrderMerchantReference": "550e8400-e29b-41d4-a716-446655440000",
  "pesapal_transaction_tracking_id": "PESAPALPAYID12345"
}
```

---

## Step 4: Update Frontend

Replace the insecure `initiatePayment()` with secure backend calls.

**In `index.html`, update `processPayment()` function**:

```javascript
async function processPayment() {
    if (!currentUser) {
        alert('Tafadhali ingia kwa akaunti kwanza!');
        return;
    }

    if (cart.length === 0) {
        alert('Kapu lako halina bidhaa!');
        return;
    }

    // Get delivery info
    const deliveryName = document.getElementById('delivery-name')?.value.trim();
    const deliveryPhone = document.getElementById('delivery-phone')?.value.trim();
    const deliveryLatitude = parseFloat(document.getElementById('delivery-latitude')?.value);
    const deliveryLongitude = parseFloat(document.getElementById('delivery-longitude')?.value);

    if (!deliveryName || !deliveryPhone || !deliveryLatitude || !deliveryLongitude) {
        alert('Tafadhali jaza: Jina, Namba ya Simu, na Mahali!');
        return;
    }

    // Get payment method
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'mpesa';

    try {
        const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const deliveryFee = 5000;
        const grandTotal = subtotal + deliveryFee;

        // Create order items
        const orderItems = cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.qty,
            unit_price: item.price,
            total_price: item.price * item.qty
        }));

        // Step 1: Create order in Supabase with status 'awaiting_payment'
        const { data: orderData, error: orderError } = await supabaseClient
            .from('orders')
            .insert([{
                user_id: currentUser.id,
                user_email: currentUser.email,
                customer_name: deliveryName,
                customer_phone: deliveryPhone,
                delivery_latitude: deliveryLatitude,
                delivery_longitude: deliveryLongitude,
                order_items: orderItems,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                total_amount: grandTotal,
                payment_method: paymentMethod,
                order_status: 'awaiting_payment',
                created_at: new Date(),
            }])
            .select();

        if (orderError) {
            console.error('Order creation error:', orderError);
            alert('Kosa katika kuandaa oda: ' + orderError.message);
            return;
        }

        const orderId = orderData[0].id;
        console.log('Order created:', orderId);

        // Step 2: Call backend to get Pesapal checkout URL
        const submitResponse = await fetch('/api/pesapal/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId: orderId,
                amount: grandTotal,
                email: currentUser.email,
                phone: deliveryPhone,
                paymentMethod: paymentMethod,
            }),
        });

        const submitData = await submitResponse.json();

        if (!submitData.success || !submitData.checkoutUrl) {
            console.error('Pesapal submission error:', submitData);
            alert('Kosa katika kuandaa malipo: ' + (submitData.error || 'Unknown error'));
            return;
        }

        console.log('Payment order submitted:', submitData.orderTrackingId);

        // Step 3: Redirect user to Pesapal checkout
        // Use window.location.href for direct navigation
        // Or window.open for popup
        window.location.href = submitData.checkoutUrl;

        // Step 4: Poll for payment completion (optional - IPN is authoritative)
        pollPaymentStatusWithBackend(orderId);

    } catch (error) {
        console.error('Payment processing error:', error);
        alert('Kosa katika kulipwa: ' + error.message);
    }
}

// Poll for payment status (IPN updates are authoritative)
async function pollPaymentStatusWithBackend(orderId) {
    let pollCount = 0;
    const maxPolls = 120; // 2 minutes

    const pollInterval = setInterval(async () => {
        pollCount++;

        try {
            // Check order status in Supabase
            const { data: order } = await supabaseClient
                .from('orders')
                .select('order_status')
                .eq('id', orderId)
                .single();

            if (order?.order_status === 'paid') {
                clearInterval(pollInterval);
                showPaymentSuccess(orderId);
                return;
            }

            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                console.log('Payment polling timeout - check status manually');
            }

        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 1000);
}

function showPaymentSuccess(orderId) {
    const toast = document.getElementById("success-toast");
    if (toast) {
        toast.textContent = '✅ Malipo yamefanikiwa! Oda iko katika mlangoni.';
        toast.className = "show";
    }

    setTimeout(() => {
        if (toast) toast.className = toast.className.replace("show", "");
        cart = [];
        updateCartUI();
        closePopup('cart-modal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
}
```

---

## Step 5: Payment Redirect Pages

Create redirect pages that users see after Pesapal:

### `/payment/pending.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Malipo Inapolipwa...</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 500px; margin: 0 auto; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏳ Malipo Inapolipwa...</h1>
        <p>Tafadhali subiri habari inapojifunza kuhusu oda yako.</p>
        <div class="spinner"></div>
        <p id="status">Kuangalia hali...</p>
    </div>

    <script>
        // Get order ID from URL
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id') || localStorage.getItem('lastOrderId');

        // Poll for payment confirmation
        if (orderId) {
            let attempts = 0;
            const checkPayment = setInterval(async () => {
                attempts++;
                
                try {
                    // Check Supabase
                    const response = await fetch(`/api/order-status?id=${orderId}`);
                    const data = await response.json();

                    document.getElementById('status').textContent = `Hali: ${data.order_status}`;

                    if (data.order_status === 'paid') {
                        clearInterval(checkPayment);
                        window.location.href = '/payment-success';
                    }

                    if (attempts > 60) {
                        clearInterval(checkPayment);
                        window.location.href = '/payment-check';
                    }
                } catch (error) {
                    console.error('Check payment error:', error);
                }
            }, 2000);
        }
    </script>
</body>
</html>
```

### `/payment-success.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Malipo Yamefanikiwa!</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 500px; margin: 0 auto; }
        .success { font-size: 48px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Malipo Yamefanikiwa!</h1>
        <p class="success">🎉</p>
        <p>Oda yako imefanikiwa na imejifunza kwa wauzaji.</p>
        <p>Utapata arifa kwenye simu yako hapo karibuni.</p>
        <a href="/">← Rudia kwa nyumbani</a>
    </div>
</body>
</html>
```

### `/payment-failed.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Malipo Kushindwa</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 500px; margin: 0 auto; }
        .error { color: red; font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Malipo Kushindwa</h1>
        <p class="error">Malipo yako haikufanikiwa au kughairiwa.</p>
        <p>Tafadhali jaribu tena au wasiliana na msaada.</p>
        <a href="/">← Rudia kwa nyumbani</a>
    </div>
</body>
</html>
```

---

## Step 6: Verify IPN is Receiving Payments

**In Pesapal Dashboard**:
1. Go to **Settings** → **IPN History**
2. Check if notifications are being received
3. Status should show "SUCCESSFUL DELIVERY"

**In Supabase**:
1. Go to **Table Editor**
2. Click **payment_logs** table
3. Should see IPN_RECEIVED events after test payment

---

## Step 7: Test Payment Flow

### Using Pesapal Sandbox:

1. **Add test item to cart** on Simba Express
2. **Go to checkout** and fill all info
3. **Click "💳 Lipa Kwa Simu"**
4. **Redirect to Pesapal** test checkout
5. **Use test credentials**:
   - Phone: 0700000001
   - Amount: Anything
6. **Confirm** and wait for IPN
7. **Check Supabase** - orders table should show `order_status = 'paid'`
8. **Admin dashboard** should automatically route order

---

## Troubleshooting

### Issue: IPN not being received

**Solution**:
- Check Pesapal IPN History in dashboard
- Verify IPN URL is correct
- Check firewall/CORS is not blocking
- Add NEXT_PUBLIC_APP_URL to .env

### Issue: Order not updating to 'paid'

**Solution**:
- Check payment_logs table for errors
- Verify token generation is working
- Check Pesapal credentials in .env
- Manually verify transaction with Pesapal API

### Issue: "Cannot read properties of undefined"

**Solution**:
- Check Supabase SERVICE_ROLE_KEY is set
- Verify table names match exactly
- Check column names (order_id vs orderId)

---

## Security Checklist

✅ API credentials in .env (never in code)
✅ SERVICE_ROLE_KEY only in backend
✅ IPN endpoint validates Pesapal response
✅ Redirect URLs don't update payment status
✅ Only IPN is source of truth
✅ Idempotent IPN handling (safe duplicates)
✅ All transactions logged for audit
✅ No card/PIN data handled by us
✅ HTTPS only in production

---

## Production Deployment

When ready to go live:

1. **Switch API URL**:
   ```
   PESAPAL_API_URL=https://api.pesapal.com/pesapalv3/api
   PESAPAL_TOKEN_ENDPOINT=https://api.pesapal.com/pesapalv3/api/Auth/RequestToken
   ```

2. **Get production credentials**:
   - Update PESAPAL_CONSUMER_KEY
   - Update PESAPAL_CONSUMER_SECRET
   - Register new production IPN

3. **Update URLs**:
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   PESAPAL_CALLBACK_URL=https://yourdomain.com/payment/pending
   PESAPAL_FAILURE_URL=https://yourdomain.com/payment/failed
   ```

4. **Deploy**:
   - Push to GitHub
   - Vercel auto-deploys
   - Monitor payment_logs table

---

## Support

- **Pesapal Docs**: https://pesapalsupport.zendesk.com
- **API Reference**: https://pesapalsupport.zendesk.com/hc/en-us/articles/206999987-API-V3-v3
- **Slack Community**: Join Pesapal Slack for support

---

This implementation is **production-ready**, **secure**, and **follows Pesapal v3 best practices**.
