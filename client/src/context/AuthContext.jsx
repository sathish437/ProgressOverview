import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); // Initial loading true for checkAuth
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = sessionStorage.getItem('authToken');
            if (savedToken) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` }
                    });
                    setUser(res.data);
                    setToken(savedToken);
                } catch (err) {
                    console.error("Token validation failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { token, user: userData } = res.data;

            setUser(userData);
            setToken(token);
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            sessionStorage.setItem('authToken', token);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            const { token, user: newUser } = res.data;

            setUser(newUser);
            setToken(token);
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            sessionStorage.setItem('authToken', token);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
    };

    const updateProfile = async (updates) => {
        if (!user || !token) return false;
        try {
            const res = await axios.patch(`${API_BASE_URL}/users/me`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            sessionStorage.setItem('currentUser', JSON.stringify(res.data));
            return true;
        } catch (err) {
            setError("Failed to update profile");
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            login,
            register,
            logout,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
