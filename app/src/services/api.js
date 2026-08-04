import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2. For iOS emulator, use localhost.
// Replace with your local machine's IP if testing on a physical device.
// For physical devices on local network, use local IP 192.168.1.85. For Simulator, localhost works as well.
const getBaseUrl = () => {
  return 'https://api.denishng.com/api';
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

export const addVendorMenuItem = async (itemData) => {
  try {
    const response = await api.post('/vendor/menu', itemData);
    return response.data;
  } catch (error) {
    console.error('API addVendorMenuItem error:', error);
    throw error;
  }
};

export const uploadItemImage = async (uri) => {
  try {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri,
      name: `item-image.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await api.post('/vendor/upload-item-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('API uploadItemImage error:', error);
    throw error;
  }
};

export const updateVendorMenuItem = async (id, itemData) => {
  try {
    const response = await api.put(`/vendor/menu/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error('API updateVendorMenuItem error:', error);
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

export const getDriverProfile = async () => {
  try {
    const response = await api.get('/driver/profile');
    return response.data;
  } catch (error) {
    console.error('API getDriverProfile error:', error);
    throw error;
  }
};

export const updateDriverProfile = async (profileData) => {
  try {
    const response = await api.put('/driver/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('API updateDriverProfile error:', error);
    throw error;
  }
};

export const uploadDriverProfilePic = async (uri) => {
  try {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri,
      name: `driver-profile.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await api.post('/driver/upload-profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('API uploadDriverProfilePic error:', error);
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

export const forgotPassword = async (email, role = 'vendor') => {
  try {
    const response = await api.post('/auth/forgot-password', { email, role });
    return response.data;
  } catch (error) {
    console.error('API forgotPassword error:', error);
    throw error;
  }
};

export const requestVendorPayout = async (amount) => {
  try {
    const response = await api.post('/vendor/payout', { amount });
    return response.data;
  } catch (error) {
    console.error('API requestVendorPayout error:', error);
    throw error;
  }
};

export const getRestaurants = async () => {
  try {
    const response = await api.get('/customer/restaurants');
    return response.data;
  } catch (error) {
    console.error('API getRestaurants error:', error);
    throw error;
  }
};
export const searchAll = async (query) => {
  try {
    const response = await api.get(`/customer/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('API searchAll error:', error);
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

export const getCustomerOrders = async () => {
  try {
    const response = await api.get('/customer/orders');
    return response.data;
  } catch (error) {
    console.error('API getCustomerOrders error:', error);
    throw error;
  }
};

export const getCustomerProfile = async () => {
  try {
    const response = await api.get('/customer/profile');
    return response.data;
  } catch (error) {
    console.error('API getCustomerProfile error:', error);
    throw error;
  }
};

export const updateCustomerProfile = async (profileData) => {
  try {
    const response = await api.put('/customer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('API updateCustomerProfile error:', error);
    throw error;
  }
};

export const saveAddress = async (addressData) => {
  try {
    const response = await api.post('/customer/add-address', addressData);
    return response.data;
  } catch (error) {
    console.error('API saveAddress error:', error);
    throw error;
  }
};

export const savePaymentMethod = async (paymentData) => {
  try {
    const response = await api.post('/customer/add-payment-method', paymentData);
    return response.data;
  } catch (error) {
    console.error('API savePaymentMethod error:', error);
    throw error;
  }
};

export const deleteCustomerAddress = async (addressId) => {
  try {
    const response = await api.delete(`/customer/address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('API deleteCustomerAddress error:', error);
    throw error;
  }
};

export const deleteCustomerPaymentMethod = async (paymentId) => {
  try {
    const response = await api.delete(`/customer/payment-method/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('API deleteCustomerPaymentMethod error:', error);
    throw error;
  }
};

export const fetchSystemContent = async (key) => {
  try {
    const response = await api.get(`/admin/content/${key}`);
    return response.data;
  } catch (error) {
    console.error('API fetchSystemContent error:', error);
    throw error;
  }
};

export const fetchChatThreads = async () => {
  try {
    const response = await api.get('/customer/chats');
    return response.data;
  } catch (error) {
    console.error('API fetchChatThreads error:', error);
    throw error;
  }
};

export const fetchMessages = async (recipientName) => {
  try {
    const response = await api.get('/customer/messages', { params: { recipientName } });
    return response.data;
  } catch (error) {
    console.error('API fetchMessages error:', error);
    throw error;
  }
};

export const sendChatMessage = async (payload) => {
  try {
    const response = await api.post('/customer/messages', payload);
    return response.data;
  } catch (error) {
    console.error('API sendChatMessage error:', error);
    throw error;
  }
};

export const initiateCallSession = async (payload) => {
  try {
    const response = await api.post('/customer/call/initiate', payload);
    return response.data;
  } catch (error) {
    console.error('API initiateCallSession error:', error);
    throw error;
  }
};

export const fetchIncomingCall = async () => {
  try {
    const response = await api.get('/customer/call/incoming');
    return response.data;
  } catch (error) {
    console.error('API fetchIncomingCall error:', error);
    throw error;
  }
};

export const respondCallSession = async (payload) => {
  try {
    const response = await api.post('/customer/call/respond', payload);
    return response.data;
  } catch (error) {
    console.error('API respondCallSession error:', error);
    throw error;
  }
};

export const fetchCallStatus = async (callId) => {
  try {
    const response = await api.get(`/customer/call/status/${callId}`);
    return response.data;
  } catch (error) {
    console.error('API fetchCallStatus error:', error);
    throw error;
  }
};

export const initFlutterwaveCheckout = async (payload) => {
  try {
    const response = await api.post('/customer/flw/initialize', payload);
    return response.data;
  } catch (error) {
    console.error('API initFlutterwaveCheckout error:', error);
    throw error;
  }
};

export const verifyFlutterwaveCheckout = async (payload) => {
  try {
    const response = await api.post('/customer/flw/verify', payload);
    return response.data;
  } catch (error) {
    console.error('API verifyFlutterwaveCheckout error:', error);
    throw error;
  }
};

export const fetchOrderTracking = async (orderId) => {
  try {
    const response = await api.get(`/customer/order/${orderId}/tracking`);
    return response.data;
  } catch (error) {
    console.error('API fetchOrderTracking error:', error);
    throw error;
  }
};

export const uploadCustomerProfilePic = async (uri) => {
  try {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri,
      name: `profile-pic.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await api.post('/customer/upload-profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('API uploadCustomerProfilePic error:', error);
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
  const response = await api.get('/payment/verify-account', {
    params: { bankCode, accountNumber, country: 'NG' }
  });
  return response.data;
};

// ─── Driver Core APIs ─────────────────────────────────────────────────────────

export const getDriverProfile = async () => {
  try {
    const response = await api.get('/driver/profile');
    return response.data;
  } catch (error) {
    console.error('API getDriverProfile error:', error);
    throw error;
  }
};

export const updateDriverProfile = async (payload) => {
  try {
    const response = await api.put('/driver/profile', payload);
    return response.data;
  } catch (error) {
    console.error('API updateDriverProfile error:', error);
    throw error;
  }
};

export const getDriverEarnings = async () => {
  try {
    const response = await api.get('/driver/earnings');
    return response.data;
  } catch (error) {
    console.error('API getDriverEarnings error:', error);
    throw error;
  }
};

export const withdrawEarnings = async (amount) => {
  try {
    const response = await api.post('/driver/withdraw', { amount });
    return response.data;
  } catch (error) {
    console.error('API withdrawEarnings error:', error);
    throw error;
  }
};

export const getDriverDeliveries = async () => {
  try {
    const response = await api.get('/driver/deliveries');
    return response.data;
  } catch (error) {
    console.error('API getDriverDeliveries error:', error);
    throw error;
  }
};

// ─── Driver Notifications ────────────────────────────────────────────────────

export const getDriverNotifications = async () => {
  try {
    const response = await api.get('/driver/notifications');
    return response.data;
  } catch (error) {
    console.error('API getDriverNotifications error:', error);
    throw error;
  }
};

export const markDriverNotificationRead = async (id) => {
  try {
    const response = await api.patch(`/driver/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('API markDriverNotificationRead error:', error);
    throw error;
  }
};

export const markAllDriverNotificationsRead = async () => {
  try {
    const response = await api.patch('/driver/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('API markAllDriverNotificationsRead error:', error);
    throw error;
  }
};

// ─── Driver Chats ─────────────────────────────────────────────────────────────

export const getDriverChats = async () => {
  try {
    const response = await api.get('/driver/chats');
    return response.data;
  } catch (error) {
    console.error('API getDriverChats error:', error);
    return { success: false, threads: [] };
  }
};

export const fetchDriverMessages = async (recipientName) => {
  try {
    const response = await api.get('/driver/messages', {
      params: { recipientName }
    });
    return response.data;
  } catch (error) {
    console.error('API fetchDriverMessages error:', error);
    return { success: false, messages: [] };
  }
};

export const sendDriverChatMessage = async (data) => {
  try {
    const response = await api.post('/driver/messages', data);
    return response.data;
  } catch (error) {
    console.error('API sendDriverChatMessage error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/driver/order/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('API updateOrderStatus error:', error);
    throw error;
  }
};

export default api;
