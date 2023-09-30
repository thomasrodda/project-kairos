import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Create a Context to hold the user state
export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

// Create a Provider component to wrap around components that need access to the user state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  useEffect(() => {
    // Move this logic to UserProvider
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);  // No dependencies, as this effect should run once

  return (
    <UserContext.Provider value={{ user, setUser, selectedWorkspaceId, setSelectedWorkspaceId }}>
      {children}
    </UserContext.Provider>
  );
};