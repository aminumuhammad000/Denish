import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2. For iOS emulator, use localhost.
// Replace with your local machine's IP if testing on a physical device.
const getBaseUrl = () => {
  // Use Production server for stability
  return 'https://denish-production.up.railway.app/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVendorDashboardData = async () => {
  try {
    const response = await api.get('/vendor/dashboard');
    return response.data;
  } catch (error) {
    console.error('API getVendorDashboardData error:', error);
    throw error;
  }
};

export const getVendorOrders = async () => {
  try {
    const response = await api.get('/vendor/orders');
    return response.data;
  } catch (error) {
    console.error('API getVendorOrders error:', error);
    throw error;
  }
};

export const getVendorMenu = async () => {
  try {
    const response = await api.get('/vendor/menu');
    return response.data;
  } catch (error) {
    console.error('API getVendorMenu error:', error);
    throw error;
  }
};

export const toggleVendorMenuItem = async (id) => {
  try {
    const response = await api.put(`/vendor/menu/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error('API toggleVendorMenuItem error:', error);
    throw error;
  }
};

export const vendorLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/vendor/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('API vendorLogin error:', error);
    throw error;
  }
};

export const vendorSignup = async (name, email, phone, password) => {
  try {
    const response = await api.post('/auth/vendor/signup', { name, email, phone, password });
    return response.data;
  } catch (error) {
    console.error('API vendorSignup error:', error);
    throw error;
  }
};

export const customerLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/customer/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('API customerLogin error:', error);
    throw error;
  }
};

export const customerSignup = async (name, email, phone, password) => {
  try {
    const response = await api.post('/auth/customer/signup', { name, email, phone, password });
    return response.data;
  } catch (error) {
    console.error('API customerSignup error:', error);
    throw error;
  }
};

export const driverLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/driver/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('API driverLogin error:', error);
    throw error;
  }
};

export const driverSignup = async (name, email, phone, password, vehicleType) => {
  try {
    const response = await api.post('/auth/driver/signup', { name, email, phone, password, vehicleType });
    return response.data;
  } catch (error) {
    console.error('API driverSignup error:', error);
    throw error;
  }
};

export const updateVendorProfile = async (profileData) => {
  try {
    const response = await api.put('/vendor/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('API updateVendorProfile error:', error);
    throw error;
  }
};

export const getCustomerRestaurantDetails = async (restaurantId) => {
  try {
    const response = await api.get(`/customer/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('API getCustomerRestaurantDetails error:', error);
    throw error;
  }
};

export const placeCustomerOrder = async (orderPayload) => {
  try {
    const response = await api.post('/customer/order', orderPayload);
    return response.data;
  } catch (error) {
    console.error('API placeCustomerOrder error:', error);
    throw error;
  }
};

export const uploadVendorImages = async (logoUri, coverUri) => {
  try {
    const formData = new FormData();
    if (logoUri) {
      formData.append('logo', {
        uri: logoUri,
        name: 'logo.jpg',
        type: 'image/jpeg',
      });
    }
    if (coverUri) {
      formData.append('cover', {
        uri: coverUri,
        name: 'cover.jpg',
        type: 'image/jpeg',
      });
    }

    const response = await api.post('/vendor/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('API uploadVendorImages error:', error);
    throw error;
  }
};

export const getBanks = async () => {
  try {
    const response = await api.get('/payment/banks');
    return response.data;
  } catch (error) {
    console.error('API getBanks error:', error);
    throw error;
  }
};

export const verifyAccount = async (bankCode, accountNumber) => {
  try {
    const response = await api.get('/payment/verify-account', {
      params: { bankCode, accountNumber }
    });
    return response.data;
  } catch (error) {
    console.error('API verifyAccount error:', error);
    throw error;
  }
};

export default api;
