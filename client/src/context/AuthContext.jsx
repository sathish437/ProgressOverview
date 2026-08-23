import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getDemoUser } from '../data/demoData';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = sessionStorage.getItem('authToken');
            const isDemo = sessionStorage.getItem('isDemoMode') === 'true' || savedToken === 'demo-session-token';

            if (savedToken && isDemo) {
                // If user explicitly activated Demo Mode in this browser session, restore demo state
                setUser(getDemoUser());
                setToken('demo-session-token');
                setLoading(false);
                return;
            }

            if (savedToken) {
                // If user is genuinely authenticated with JWT, verify and load profile from backend
                try {
                    const res = await axios.get(`${API_BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` },
                        timeout: 4000
                    });
                    setUser(res.data);
                    setToken(savedToken);
                } catch (err) {
                    console.warn("Session token expired or invalid, logging out");
                    sessionStorage.removeItem('authToken');
                    sessionStorage.removeItem('isDemoMode');
                    setToken(null);
                    setUser(null);
                }
            } else {
                // Fresh visit: unauthenticated user must see Login page (NO auto-login)
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { timeout: 5000 });
            const { token: newToken, user: userData } = res.data;

            sessionStorage.removeItem('isDemoMode');
            setUser(userData);
            setToken(newToken);
            sessionStorage.setItem('authToken', newToken);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = () => {
        const demoUser = getDemoUser();
        setUser(demoUser);
        setToken('demo-session-token');
        sessionStorage.setItem('authToken', 'demo-session-token');
        sessionStorage.setItem('isDemoMode', 'true');
        return true;
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/register`, userData, { timeout: 5000 });
            const { token: newToken, user: newUser } = res.data;

            sessionStorage.removeItem('isDemoMode');
            setUser(newUser);
            setToken(newToken);
            sessionStorage.setItem('authToken', newToken);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('isDemoMode');
    };

    const updateProfile = async (updates) => {
        if (!user) return false;

        // In demo mode, update local demo state without touching database
        if (user.isDemo || token === 'demo-session-token') {
            setUser(prev => ({ ...prev, ...updates }));
            return true;
        }

        try {
            const res = await axios.patch(`${API_BASE_URL}/users/me`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data || { ...user, ...updates });
            return true;
        } catch (err) {
            console.error('Failed to update profile on backend:', err);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isDemo: user?.isDemo || token === 'demo-session-token',
            loading,
            error,
            login,
            loginAsGuest,
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
