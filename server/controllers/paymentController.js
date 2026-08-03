const axios = require('axios');

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

const getBanks = async (req, res) => {
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ error: 'Flutterwave secret key not configured' });
  }

  try {
    const response = await axios.get(`${FLW_BASE_URL}/banks`, {
      params: { country: 'NG' },
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
    });
    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Flutterwave getBanks error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch banks' });
  }
};

const verifyAccount = async (req, res) => {
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ success: false, message: 'Flutterwave secret key not configured' });
  }

  try {
    const { bankCode, accountNumber } = req.query;
    if (!bankCode || !accountNumber) {
      return res.status(400).json({ success: false, message: 'bankCode and accountNumber are required' });
    }

    const response = await axios.get(`${FLW_BASE_URL}/accounts/resolve`, {
      params: {
        account_number: accountNumber,
        account_bank: bankCode
      },
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
    });

    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Flutterwave verifyAccount error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { success: false, message: 'Verification failed' };
    res.status(status).json(data);
  }
};

module.exports = {
  getBanks,
  verifyAccount
};
