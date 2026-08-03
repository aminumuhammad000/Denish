const axios = require('axios');

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

const getBanks = async (req, res) => {
  const secretKey = process.env.FLW_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ success: false, message: 'Flutterwave secret key not configured' });
  }

  try {
    const response = await axios.get(`${FLW_BASE_URL}/banks/NG`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });

    if (response.data && response.data.data) {
      const banks = response.data.data.map((bank) => ({
        ...bank,
        code: bank.code,
      }));
      return res.status(200).json({ success: true, data: banks });
    }

    return res.status(500).json({ success: false, message: 'Flutterwave bank list response missing data' });
  } catch (error) {
    console.error('Flutterwave getBanks error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Could not retrieve bank list';
    return res.status(status).json({ success: false, message });
  }
};

const verifyAccount = async (req, res) => {
  const secretKey = process.env.FLW_SECRET_KEY;
  const { bankCode, accountNumber, country } = req.query;

  if (!bankCode || !accountNumber) {
    return res.status(400).json({ success: false, message: 'bankCode and accountNumber are required' });
  }

  if (!secretKey) {
    return res.status(500).json({ success: false, message: 'Flutterwave secret key not configured' });
  }

  try {
    const requestBody = {
      account_number: accountNumber,
      account_bank: bankCode,
      country: country || 'NG',
    };

    const response = await axios.post(`${FLW_BASE_URL}/accounts/resolve`, requestBody, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.status === 'success' && response.data.data) {
      const accountData = response.data.data;
      return res.status(200).json({
        success: true,
        data: {
          ...accountData,
          accountName: accountData.account_name || accountData.customer_name || '',
          accountNumber: accountData.account_number || accountNumber,
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: response.data?.message || 'Verification failed',
      data: null,
    });
  } catch (error) {
    console.error('Flutterwave verifyAccount error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { success: false, message: 'Verification failed' };
    return res.status(status).json(data);
  }
};

module.exports = {
  getBanks,
  verifyAccount
};
