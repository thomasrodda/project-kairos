import React, { createContext, useContext, useState } from 'react';

// Create a Context to hold the user state
export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

// Create a Provider component to wrap around components that need access to the user state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};