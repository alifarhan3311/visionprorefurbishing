const https = require('https');

const CLOVER_BASE_URL = process.env.CLOVER_SANDBOX === 'true' 
  ? 'https://scl-sandbox.dev.clover.com' 
  : 'https://scl.clover.com';

/**
 * @desc    Create a Clover charge using a card token from the iframe
 * @route   POST /api/v1/payment/clover-charge
 * @access  Private
 */
exports.createCloverCharge = async (req, res) => {
  try {
    const { token, amount, currency = 'usd', idempotencyKey } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Card token is required' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const privateKey = process.env.CLOVER_PRIVATE_API_KEY;
    if (!privateKey) {
      return res.status(500).json({ success: false, error: 'Clover private key not configured' });
    }

    // Amount must be in cents (integer)
    const amountInCents = Math.round(Number(amount) * 100);

    const payload = JSON.stringify({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      source: token,
      ecomind: 'ecom'
    });

    // Use a UUID v4 idempotency key to prevent double charges
    const idemKey = idempotencyKey || generateUUID();

    const chargeResult = await cloverRequest(
      'POST',
      '/v1/charges',
      payload,
      privateKey,
      idemKey,
      req.ip
    );

    if (chargeResult.status === 'succeeded' || chargeResult.paid === true) {
      return res.status(200).json({
        success: true,
        chargeId: chargeResult.id,
        status: chargeResult.status,
        amount: chargeResult.amount,
        currency: chargeResult.currency
      });
    } else {
      return res.status(402).json({
        success: false,
        error: chargeResult.error?.message || 'Payment was not successful',
        cloverStatus: chargeResult.status
      });
    }
  } catch (error) {
    console.error('Clover charge error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function cloverRequest(method, path, body, privateKey, idempotencyKey, clientIp) {
  return new Promise((resolve, reject) => {
    const url = new URL(CLOVER_BASE_URL + path);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${privateKey}`,
        'idempotency-key': idempotencyKey,
        'x-forwarded-for': clientIp || '127.0.0.1',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid response from Clover: ' + data));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
