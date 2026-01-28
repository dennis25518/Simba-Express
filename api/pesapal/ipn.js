/**
 * Pesapal IPN Webhook Handler
 * Endpoint: POST /api/pesapal/ipn
 * 
 * This endpoint receives payment notifications from Pesapal
 * ONLY THIS verifies actual payment completion
 * Redirect URLs are NOT payment confirmation
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTransaction(orderTrackingId, token) {
    /**
     * Verify transaction status with Pesapal
     * This is the ONLY source of truth for payment status
     */
    const verifyUrl = `https://cybqa.pesapal.com/pesapalv3/api/Orders/GetOrderDetails?orderTrackingId=${orderTrackingId}`;

    try {
        const response = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Transaction verification error:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { OrderTrackingId, OrderMerchantReference, pesapal_transaction_tracking_id } = req.body;

        console.log('[IPN] Received notification:', {
            OrderTrackingId,
            OrderMerchantReference,
            pesapal_transaction_tracking_id,
        });

        // Validate notification
        if (!OrderTrackingId || !OrderMerchantReference) {
            console.warn('[IPN] Invalid notification - missing required fields');
            return res.status(400).json({ error: 'Invalid notification' });
        }

        const orderId = OrderMerchantReference;

        // Step 1: Get Pesapal token for verification
        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pesapal/auth`, {
            method: 'GET',
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.token) {
            throw new Error('Failed to get Pesapal token for verification');
        }

        // Step 2: Verify transaction with Pesapal
        const transactionData = await verifyTransaction(OrderTrackingId, tokenData.token);

        console.log('[IPN] Transaction verification:', transactionData);

        // Step 3: Check transaction status
        const paymentStatus = transactionData.payment_status_description;
        const amount = transactionData.amount;

        // Step 4: Update payment record in Supabase
        const paymentUpdateData = {
            pesapal_order_tracking_id: OrderTrackingId,
            pesapal_transaction_tracking_id: pesapal_transaction_tracking_id,
            status: 'PROCESSING', // Will be updated to SUCCESS below if verified
        };

        // If Pesapal confirms COMPLETED, mark as SUCCESS
        if (paymentStatus === 'COMPLETED') {
            paymentUpdateData.status = 'SUCCESS';
            paymentUpdateData.verified_at = new Date();

            console.log(`[IPN] Payment verified as SUCCESS for order ${orderId}`);
        } else if (paymentStatus === 'PENDING') {
            paymentUpdateData.status = 'PENDING';
            console.log(`[IPN] Payment still PENDING for order ${orderId}`);
        } else {
            paymentUpdateData.status = 'FAILED';
            console.log(`[IPN] Payment FAILED for order ${orderId}: ${paymentStatus}`);
        }

        // Update payment record (idempotent - safe on duplicate notifications)
        const { data: updatedPayment, error: paymentError } = await supabase
            .from('payments')
            .update(paymentUpdateData)
            .eq('merchant_reference', orderId)
            .select();

        if (paymentError) {
            console.error('[IPN] Payment update error:', paymentError);
            // Continue - we'll try to update order anyway
        }

        // Step 5: If payment successful, update order status
        if (paymentStatus === 'COMPLETED') {
            const { data: updatedOrder, error: orderError } = await supabase
                .from('orders')
                .update({ 
                    order_status: 'paid',
                    updated_at: new Date(),
                })
                .eq('id', orderId)
                .select();

            if (orderError) {
                console.error('[IPN] Order update error:', orderError);
            } else {
                console.log(`[IPN] Order ${orderId} marked as PAID`);
            }
        }

        // Step 6: Log the IPN event for reconciliation
        await supabase
            .from('payment_logs')
            .insert([{
                order_id: orderId,
                event_type: 'IPN_RECEIVED',
                status: paymentStatus,
                amount: amount,
                tracking_id: OrderTrackingId,
                raw_data: req.body,
            }])
            .catch(err => console.error('Log error:', err));

        // Return 200 OK to acknowledge receipt
        return res.status(200).json({
            success: true,
            message: 'IPN processed',
            orderId: orderId,
        });

    } catch (error) {
        console.error('[IPN] Error processing notification:', error);
        
        // Still return 200 to prevent Pesapal retries
        // We've logged the error for manual investigation
        return res.status(200).json({
            success: false,
            error: error.message,
        });
    }
}
