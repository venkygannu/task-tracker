import React from 'react';
import './App.css';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

function App() {


  return (
    <AuthProvider>
      <AppProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
