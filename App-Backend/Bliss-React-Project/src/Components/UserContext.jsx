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

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getInitialUser());
  const [bookmarkedRestaurants, setBookmarkedRestaurants] = useState([]);
  const [hiddenRestaurants, setHiddenRestaurants] = useState([]);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
  }), [user, bookmarkedRestaurants, hiddenRestaurants, theme]);

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