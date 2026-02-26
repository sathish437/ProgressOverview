import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Axios Interceptor for JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.debug('Axios Interceptor: Token attached');
    } else {
        // console.warn('Axios Interceptor: No token found');
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export function DataProvider({ children }) {
    const { user } = useAuth();
    const [data, setData] = useState({
        habits: [],
        goals: [],
        tasks: [],
        learning: [],
        settings: { weightsHabits: 40, weightsTasks: 40, weightsLearning: 20 },
        weeklyStats: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        const token = localStorage.getItem('authToken');
        if (!user || !token) {
            setData({
                habits: [],
                goals: [],
                tasks: [],
                learning: [],
                settings: { weightsHabits: 40, weightsTasks: 40, weightsLearning: 20 },
                weeklyStats: []
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [habits, goals, tasks, learning, settings, weeklyStats] = await Promise.all([
                api.get('/habits'),
                api.get('/goals'),
                api.get('/tasks'),
                api.get('/learning'),
                api.get('/settings'),
                api.get('/dashboard/weekly')
            ]);

            setData({
                habits: habits.data,
                goals: goals.data,
                tasks: tasks.data,
                learning: learning.data,
                settings: settings.data,
                weeklyStats: weeklyStats.data
            });
        } catch (err) {
            console.error("Failed to fetch data from server", err);
            setError("Could not connect to the server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // Refresh data when user changes
    useEffect(() => {
        fetchData();
    }, [user]);

    // Generic CRUD
    const addItem = async (type, item) => {
        if (!user) return;
        try {
            const res = await api.post(`/${type}`, item);
            setData(prev => ({
                ...prev,
                [type]: [...prev[type], res.data]
            }));
            fetchData(); // Simplified refresh
        } catch (err) {
            setError(`Failed to add ${type}`);
        }
    };

    const updateItem = async (type, id, updates) => {
        try {
            const res = await api.patch(`/${type}/${id}`, updates);
            setData(prev => ({
                ...prev,
                [type]: prev[type].map(item => item.id === id ? res.data : item)
            }));
            fetchData();
        } catch (err) {
            setError(`Failed to update ${type}`);
        }
    };

    const deleteItem = async (type, id) => {
        try {
            await api.delete(`/${type}/${id}`);
            setData(prev => ({
                ...prev,
                [type]: prev[type].filter(item => item.id !== id)
            }));
            fetchData();
        } catch (err) {
            setError(`Failed to delete ${type}`);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const res = await api.put('/settings', newSettings);
            setData(prev => ({
                ...prev,
                settings: res.data
            }));
        } catch (err) {
            setError("Failed to update settings");
        }
    };

    // Specific Helpers
    const checkHabit = async (id, dateStr) => {
        try {
            await api.post(`/habits/${id}/checkin`, { date: dateStr, value: 1 });
            fetchData();
        } catch (err) {
            setError("Failed to checkin habit");
        }
    };

    const logActivity = async (activity) => {
        // Activity log could be another endpoint or merged into notifications
    };

    const resetData = async () => {
        // Disabled for MySQL for now
        alert("Reset feature is restricted in MySQL mode.");
    };

    return (
        <DataContext.Provider value={{
            ...data,
            addItem,
            updateItem,
            deleteItem,
            checkHabit,
            updateSettings,
            resetData,
            logActivity,
            loading,
            error,
            refreshData: fetchData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
