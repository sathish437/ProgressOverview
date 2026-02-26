import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { token, user: userData } = res.data;

            setUser(userData);
            setToken(token);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
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
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('authToken', token);
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
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    const updateProfile = async (updates) => {
        if (!user || !token) return false;
        try {
            const res = await axios.patch(`${API_BASE_URL}/users/me`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            localStorage.setItem('currentUser', JSON.stringify(res.data));
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
