import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

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
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart, getTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
