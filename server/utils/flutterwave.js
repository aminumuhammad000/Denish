const axios = require('axios');

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Resolves the Flutterwave Authorization header.
 * Uses FLW_SECRET_KEY if it starts with 'FLWSECK'.
 * Otherwise, uses FLW_CLIENT_ID and FLW_CLIENT_SECRET to obtain an OAuth Bearer token.
 */
const getFlutterwaveAuthHeader = async () => {
  const rawKey = (process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (rawKey && rawKey.length > 5) {
    return rawKey.startsWith('Bearer ') ? rawKey : `Bearer ${rawKey}`;
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 60000) {
    return `Bearer ${cachedToken}`;
  }

  const clientId = (process.env.FLW_CLIENT_ID || '').trim().replace(/^["']|["']$/g, '');
  const clientSecret = (process.env.FLW_CLIENT_SECRET || '').trim().replace(/^["']|["']$/g, '');

  if (clientId && clientSecret) {
    try {
      const response = await axios.post(
        'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
      );

      if (response.data && response.data.access_token) {
        cachedToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        tokenExpiry = now + expiresIn * 1000;
        return `Bearer ${cachedToken}`;
      }
    } catch (err) {
      console.warn('Flutterwave OAuth token error:', err.response?.data || err.message);
    }
  }

  return `Bearer ${rawKey || ''}`;
};

const getFlutterwaveKeys = () => {
  return {
    merchantId: process.env.FLW_MERCHANT_ID || '',
    publicKey: process.env.FLW_PUBLIC_KEY || process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    secretKey: process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || '',
    clientId: process.env.FLW_CLIENT_ID || '',
    clientSecret: process.env.FLW_CLIENT_SECRET || '',
    encryptionKey: process.env.FLW_ENCRYPTION_KEY || process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
  };
};

module.exports = {
  getFlutterwaveAuthHeader,
  getFlutterwaveKeys,
};
