import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'denish_customer_cart_data';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const addToCart = (item, restId, quantity = 1, instructions = '') => {
    let updatedItems = [...cartItems];
    if (restaurantId && restaurantId !== restId) {
      updatedItems = [];
    }

    // Check for existing item with SAME instructions
    const existingIndex = updatedItems.findIndex(i => i._id === item._id && i.instructions === instructions);
    
    if (existingIndex > -1) {
      const clonedItems = [...updatedItems];
      clonedItems[existingIndex].quantity += quantity;
      updatedItems = clonedItems;
    } else {
      updatedItems.push({ ...item, quantity, instructions });
    }

    setRestaurantId(restId);
    setCartItems(updatedItems);
  };

  const removeFromCart = (itemId) => {
    let updatedItems = cartItems.map(item => {
      if (item._id === itemId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCartItems(updatedItems);
    if (updatedItems.length === 0) {
      setRestaurantId(null);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const getTotal = () => {
    return cartItems.reduce((acc, item) => {
      let price = item.price;
      if (typeof price === 'string') {
        price = parseFloat(price.replace(/,/g, '')) || 0;
      } else if (typeof price !== 'number') {
        price = 0;
      }
      return acc + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart, getTotal, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
