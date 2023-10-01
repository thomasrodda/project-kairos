// Import required modules and Firebase authentication
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Create UserContext to manage user's state across the app
export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider component to wrap around components needing user state
export const UserProvider = ({ children }) => {
  // Define state variables for user and selected workspace
  const [user, setUser] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  // Setup and teardown Firebase authentication state listener
  useEffect(() => {
    // This effect sets up and tears down Firebase authentication state listener
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

  // Provide the UserContext to children components
  return (
    <UserContext.Provider value={{ user, setUser, selectedWorkspaceId, setSelectedWorkspaceId }}>
      {children}
    </UserContext.Provider>
  );
};