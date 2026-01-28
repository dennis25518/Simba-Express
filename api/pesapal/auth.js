/**
 * Pesapal v3 Authentication API Route
 * Endpoint: /api/pesapal/auth
 * Purpose: Get Bearer token for Pesapal API requests
 */

module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get credentials from environment variables
        const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
        const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
            console.error('Missing Pesapal credentials in environment');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Pesapal token endpoint (SANDBOX)
        const tokenUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';

        // Request token from Pesapal
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
            }),
        });

        const tokenData = await tokenResponse.json();

        // Check for errors
        if (!tokenResponse.ok || tokenData.error) {
            console.error('Pesapal token error:', tokenData);
            return res.status(400).json({ 
                error: 'Failed to authenticate with Pesapal',
                details: tokenData.error || tokenData.message 
            });
        }

        // Return token to frontend
        return res.status(200).json({
            token: tokenData.token,
            expiresIn: tokenData.expiresIn,
        });

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ error: error.message });
    }
};
