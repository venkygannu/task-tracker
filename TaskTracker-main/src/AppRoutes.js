import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './compoents/authComponents/login/Login';
import Home from './Home';
// import { AppProvider } from './contexts/AppContext';

function AppRoutes() {
    const { userLoggedIn, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <AuthProvider>
                {/* <AppProvider> */}

                    <Router>
                        <Routes>
                            <Route path='/login' element={<Login />} />
                            <Route path='/' element={userLoggedIn ? <Home /> : <Navigate to='/login' />} />                  </Routes>
                    </Router>
                {/* </AppProvider> */}
            </AuthProvider>
        </>
    )
}

export default AppRoutes