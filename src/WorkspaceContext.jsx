// Import required modules
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create WorkspaceContext to manage workspace's state across the app
export const WorkspaceContext = createContext();

// Custom hook for easy access to WorkspaceContext
export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

// WorkspaceProvider component to wrap around components needing workspace state
export const WorkspaceProvider = ({ children }) => {
  // Define state variable for current workspace
  const [workspace, setWorkspace] = useState(null);

  // Log current workspace for debugging purposes
  useEffect(() => {
    console.log("Current Workspace in WorkspaceProvider:", workspace);
  }, [workspace]);  

  // Provide the WorkspaceContext to child components
  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
