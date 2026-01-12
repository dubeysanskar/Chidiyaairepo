"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null); // 'buyer' or 'supplier'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('user');
        const storedType = localStorage.getItem('userType');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setUserType(storedType);
        }
        setLoading(false);
    }, []);

    const login = (userData, type) => {
        setUser(userData);
        setUserType(type);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', type);
        localStorage.setItem('authToken', userData.token);
    };

    const logout = () => {
        setUser(null);
        setUserType(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
    };

    const value = {
        user,
        userType,
        loading,
        isAuthenticated: !!user,
        isBuyer: userType === 'buyer',
        isSupplier: userType === 'supplier',
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
