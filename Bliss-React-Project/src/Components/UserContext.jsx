/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const UserContext = createContext();

function getInitialUser() {
  const saved = localStorage.getItem('user');
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}
function getInitialCart() {
  const saved = localStorage.getItem('cart');
  if (!saved) return { items: [], restaurant: null };
  try {
    const parsed = JSON.parse(saved);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      restaurant: parsed.restaurant || null
    };
  } catch {
    return { items: [], restaurant: null };
  }
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getInitialUser());
  const [bookmarkedRestaurants, setBookmarkedRestaurants] = useState([]);
  const [hiddenRestaurants, setHiddenRestaurants] = useState([]);
  const [cart, setCart] = useState(() => getInitialCart());
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const addToEatlist = (restaurant) => {
    setBookmarkedRestaurants((prev) => [...prev, restaurant]);
  };

  const removeFromEatlist = (id) => {
    setBookmarkedRestaurants((prev) =>
      prev.filter((restaurant) => restaurant.id !== id)
    );
  };

  const hideRestaurant = (id) => {
    setHiddenRestaurants((prev) => [...new Set([...prev, id])]);
  };

  const unhideRestaurant = (id) => {
    setHiddenRestaurants((prev) => prev.filter((restId) => restId !== id));
  };

const addToCart = (item, restaurantInfo) => {
  setCart(prev => {
    const existingItemIndex = prev.items.findIndex(i => i.id === item.id);
    let newItems = [...prev.items];

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
    } else {
      newItems = [...newItems, { ...item, quantity: 1 }];
    }

    const newRestaurant = prev.restaurant || restaurantInfo || null;

    return {
      items: newItems,
      restaurant: newRestaurant
    };
  });
};

const removeFromCart = (id, removeCompletely = false) => {
  setCart(prev => {
    const existingItemIndex = prev.items.findIndex(i => i.id === id);

    if (existingItemIndex < 0) return prev;

    const newItems = [...prev.items];
    const existingItem = newItems[existingItemIndex];

    if (removeCompletely || existingItem.quantity <= 1) {
      newItems.splice(existingItemIndex, 1);
    } else {
      newItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity - 1
      };
    }

    return {
      ...prev,
      items: newItems
    };
  });
};

const clearCart = () => {
  setCart({ items: [], restaurant: null });
};

  const contextValue = useMemo(() => ({
    user,
    setUser,
    login,
    logout,
    bookmarkedRestaurants,
    addToEatlist,
    removeFromEatlist,
    hiddenRestaurants,
    hideRestaurant,
    unhideRestaurant,
    theme,
    toggleTheme,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  }), [user, bookmarkedRestaurants, hiddenRestaurants, theme, cart]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };