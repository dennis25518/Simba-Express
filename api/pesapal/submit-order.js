/**
 * Submit Order to Pesapal API Route
 * Endpoint: POST /api/pesapal/submit-order
 * Purpose: Create payment order and get checkout URL
 * 
 * Request body:
 * {
 *   orderId: "uuid",
 *   amount: 50000,
 *   email: "customer@example.com",
 *   phone: "255654321098",
 *   paymentMethod: "mpesa"
 * }
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, amount, email, phone, paymentMethod } = req.body;

        // Validate inputs
        if (!orderId || !amount || !email || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        console.log(`[Pesapal] Submitting order ${orderId} for ${amount} TZS`);

        // Step 1: Get Pesapal token
        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pesapal/auth`, {
            method: 'GET',
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.token) {
            throw new Error('Failed to get Pesapal token');
        }

        const bearerToken = tokenData.token;

        // Step 2: Submit order to Pesapal
        const pesapalOrderUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Orders/SubmitOrder';

        const orderPayload = {
            id: orderId, // Must match internal order_id
            currency: 'TZS',
            amount: parseFloat(amount),
            description: `Simba Express Order #${orderId.slice(0, 8)}`,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/pending`,
            notification_id: process.env.PESAPAL_IPN_ID, // Registered IPN ID
            billing_address: {
                email_address: email,
                phone_number: phone,
            },
            redirect_mode: 'REDIRECT',
        };

        const submitResponse = await fetch(pesapalOrderUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearerToken}`,
            },
            body: JSON.stringify(orderPayload),
        });

        const submitData = await submitResponse.json();

        if (!submitResponse.ok || submitData.error) {
            console.error('Pesapal submit error:', submitData);
            return res.status(400).json({
                error: 'Failed to submit order to Pesapal',
                details: submitData.error || submitData.message,
            });
        }

        // Step 3: Store payment record in Supabase
        const { data: paymentRecord, error: paymentError } = await supabase
            .from('payments')
            .insert([{
                order_id: orderId,
                merchant_reference: orderId,
                pesapal_order_tracking_id: submitData.order_tracking_id,
                amount: parseFloat(amount),
                currency: 'TZS',
                phone: phone,
                status: 'PENDING',
                payment_method: paymentMethod,
            }])
            .select();

        if (paymentError) {
            console.error('Database error:', paymentError);
            // Don't fail - order is submitted to Pesapal
        }

        console.log(`[Pesapal] Order ${orderId} submitted successfully`);

        // Step 4: Return checkout URL to frontend
        return res.status(200).json({
            success: true,
            checkoutUrl: submitData.redirect_url,
            orderTrackingId: submitData.order_tracking_id,
        });

    } catch (error) {
        console.error('[Pesapal] Order submission error:', error);
        return res.status(500).json({ error: error.message });
    }
};
