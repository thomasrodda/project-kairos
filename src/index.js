// Import required modules and components
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserProvider } from './UserContext';
import reportWebVitals from './reportWebVitals';

// Entry point for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component wrapped in UserProvider and StrictMode
root.render(
  <React.StrictMode>
    <UserProvider> {/* Makes user context available to App and its children */}
      <App />
    </UserProvider>
  </React.StrictMode>
);

// Optional: For measuring performance metrics
reportWebVitals();
