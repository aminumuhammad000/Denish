const axios = require('axios');

const VTSTACK_BASE_URL = 'https://api.vtstack.com.ng/api';
const SECRET_KEY = process.env.VTSTACK_SECRET_KEY;

const getBanks = async (req, res) => {
  try {
    const response = await axios.get(`${VTSTACK_BASE_URL}/banks`, {
      headers: { 'x-api-key': SECRET_KEY }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch banks' });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.query;
    if (!bankCode || !accountNumber) {
      return res.status(400).json({ success: false, message: 'bankCode and accountNumber are required' });
    }

    const response = await axios.get(`${VTSTACK_BASE_URL}/banks/verify`, {
      params: { bankCode, accountNumber },
      headers: { 'x-api-key': SECRET_KEY }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Verification failed' });
  }
};

module.exports = {
  getBanks,
  verifyAccount
};
