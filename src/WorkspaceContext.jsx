import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Context to hold the workspace state
export const WorkspaceContext = createContext();

// Create a hook for easy use of WorkspaceContext
export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

// Create a Provider component to wrap around components that need access to the workspace state
export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    console.log("Current Workspace in WorkspaceProvider:", workspace);
  }, [workspace]);  

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
