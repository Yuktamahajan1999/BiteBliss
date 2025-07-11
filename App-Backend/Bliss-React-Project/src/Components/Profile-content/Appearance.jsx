/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { UserContext } from '../UserContext';

const Appearance = () => {
  const { theme, toggleTheme } = useContext(UserContext);
  const oppositeTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className={`appearance ${theme}`}>
      <h2>Appearance</h2>
      <button onClick={toggleTheme}>
        Switch to {oppositeTheme} mode
      </button>
    </div>
  );
};

export default Appearance;