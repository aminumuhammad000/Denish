import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlatformSettings } from '../services/api';

const CART_STORAGE_KEY = 'denish_customer_cart_data';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(null);

  const fetchPlatformSettings = async () => {
    try {
      const platRes = await getPlatformSettings();
      if (platRes?.success && platRes.settings) {
        const resolvedDeliveryFee = platRes.settings.baseDeliveryFee ?? platRes.settings.deliveryFee;
        const normalized = {
          ...platRes.settings,
          baseDeliveryFee: resolvedDeliveryFee,
          deliveryFee: resolvedDeliveryFee,
        };
        setPlatformSettings(normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Error fetching platform settings in CartContext:', e.message);
    }
    return null;
  };

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  // Load cart from persistent storage on mount
  useEffect(() => {
    const loadSavedCart = async () => {
      try {
        let rawData = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          rawData = window.localStorage.getItem(CART_STORAGE_KEY);
        } else {
          rawData = await AsyncStorage.getItem(CART_STORAGE_KEY);
        }

        if (rawData) {
          const parsed = JSON.parse(rawData);
          if (parsed && Array.isArray(parsed.cartItems)) {
            setCartItems(parsed.cartItems);
            setRestaurantId(parsed.restaurantId || null);
          }
        }
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedCart();
  }, []);

  // Save cart to persistent storage whenever cartItems or restaurantId changes
  useEffect(() => {
    if (!isLoaded) return;

    const persistCart = async () => {
      try {
        const payload = JSON.stringify({
          cartItems,
          restaurantId,
        });

        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(CART_STORAGE_KEY, payload);
        } else {
          await AsyncStorage.setItem(CART_STORAGE_KEY, payload);
        }
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    };

    persistCart();
  }, [cartItems, restaurantId, isLoaded]);

  const addToCart = (item, restId, quantity = 1, instructions = '', restaurantName = '') => {
    if (!item) return;
    let updatedItems = [...cartItems];

    const targetId = item._id || item.id;
    const resolvedRestId = restId || item.restaurantId || item.vendorId?._id || item.vendorId || restaurantId;
    const resolvedRestName = restaurantName || item.restaurantName || item.vendorId?.businessName || item.vendorId?.name || '';

    // Check for existing item with SAME instructions, SAME ID, and SAME restaurant
    const existingIndex = updatedItems.findIndex(i => {
      const iId = i._id || i.id;
      const iRest = i.restaurantId || i.restId;
      return iId === targetId && 
        (i.instructions || '') === (instructions || '') && 
        (!resolvedRestId || !iRest || iRest === resolvedRestId);
    });
    
    if (existingIndex > -1) {
      const clonedItems = [...updatedItems];
      clonedItems[existingIndex].quantity += quantity;
      if (resolvedRestId && !clonedItems[existingIndex].restaurantId) {
        clonedItems[existingIndex].restaurantId = resolvedRestId;
      }
      if (resolvedRestName && !clonedItems[existingIndex].restaurantName) {
        clonedItems[existingIndex].restaurantName = resolvedRestName;
      }
      updatedItems = clonedItems;
    } else {
      updatedItems.push({ 
        ...item, 
        _id: targetId,
        id: targetId,
        restaurantId: resolvedRestId,
        restaurantName: resolvedRestName,
        quantity, 
        instructions 
      });
    }

    if (resolvedRestId) {
      setRestaurantId(resolvedRestId);
    }
    setCartItems(updatedItems);
  };

  const removeFromCart = (itemId, specificRestId = null) => {
    if (!itemId) return;
    let updatedItems = cartItems.map(item => {
      const match = (item._id && item._id === itemId) || (item.id && item.id === itemId);
      const restMatch = !specificRestId || (item.restaurantId || item.restId) === specificRestId;
      if (match && restMatch) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCartItems(updatedItems);
    if (updatedItems.length === 0) {
      setRestaurantId(null);
    } else if (specificRestId && restaurantId === specificRestId) {
      const remainingRest = updatedItems.find(i => (i.restaurantId || i.restId) === specificRestId);
      if (!remainingRest) {
        setRestaurantId(updatedItems[0].restaurantId || updatedItems[0].restId || null);
      }
    }
  };

  const deleteFromCart = (itemId, specificRestId = null) => {
    if (!itemId) return;
    const updatedItems = cartItems.filter(item => {
      const match = (item._id && item._id === itemId) || (item.id && item.id === itemId);
      const restMatch = !specificRestId || (item.restaurantId || item.restId) === specificRestId;
      return !(match && restMatch);
    });

    setCartItems(updatedItems);
    if (updatedItems.length === 0) {
      setRestaurantId(null);
    } else if (specificRestId && restaurantId === specificRestId) {
      const remainingRest = updatedItems.find(i => (i.restaurantId || i.restId) === specificRestId);
      if (!remainingRest) {
        setRestaurantId(updatedItems[0].restaurantId || updatedItems[0].restId || null);
      }
    }
  };

  const clearCart = (specificRestId = null) => {
    if (specificRestId) {
      const remainingItems = cartItems.filter(item => (item.restaurantId || item.restId) !== specificRestId);
      setCartItems(remainingItems);
      if (remainingItems.length === 0) {
        setRestaurantId(null);
      } else {
        setRestaurantId(remainingItems[0]?.restaurantId || remainingItems[0]?.restId || null);
      }
    } else {
      setCartItems([]);
      setRestaurantId(null);
    }
  };

  const getTotal = (specificRestId = null) => {
    const itemsToSum = specificRestId 
      ? cartItems.filter(item => (item.restaurantId || item.restId) === specificRestId)
      : cartItems;
    return itemsToSum.reduce((acc, item) => {
      let price = item.price;
      if (typeof price === 'string') {
        price = parseFloat(price.replace(/,/g, '')) || 0;
      } else if (typeof price !== 'number') {
        price = 0;
      }
      return acc + (price * item.quantity);
    }, 0);
  };

  const getOrdersByRestaurant = () => {
    const ordersMap = {};
    cartItems.forEach(item => {
      const restKey = item.restaurantId || item.restId || restaurantId || 'default';
      const restName = item.restaurantName || (item.vendorId && (item.vendorId.businessName || item.vendorId.name)) || 'Restaurant Order';
      if (!ordersMap[restKey]) {
        ordersMap[restKey] = {
          restaurantId: restKey,
          restaurantName: restName,
          items: []
        };
      }
      ordersMap[restKey].items.push(item);
    });
    return Object.values(ordersMap);
  };

  return (
    <CartContext.Provider value={{ cartItems, restaurantId, setRestaurantId, addToCart, removeFromCart, deleteFromCart, clearCart, getTotal, getOrdersByRestaurant, isLoaded, platformSettings, fetchPlatformSettings }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
