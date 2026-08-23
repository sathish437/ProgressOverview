import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { pdfReportService } from '../services/pdfReport';
import { getDemoProductivityData } from '../data/demoData';
import { format } from 'date-fns';

const DataContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000
});

// Axios Interceptor for JWT
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('authToken');
    if (token && token !== 'demo-session-token') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export function DataProvider({ children }) {
    const { user, token, isDemo } = useAuth();
    const [data, setData] = useState(() => isDemo ? getDemoProductivityData() : {
        habits: [],
        goals: [],
        tasks: [],
        learning: [],
        settings: {},
        weeklyStats: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!token) return;

        // If Demo Mode, load the rich Alex Rivers demo dataset in memory
        if (isDemo) {
            setData(getDemoProductivityData());
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [habitsRes, goalsRes, tasksRes, learningRes, settingsRes, weeklyStatsRes] = await Promise.all([
                api.get('/habits'),
                api.get('/goals'),
                api.get('/tasks'),
                api.get('/learning'),
                api.get('/settings'),
                api.get('/dashboard/weekly')
            ]);

            setData({
                habits: habitsRes?.data || [],
                goals: goalsRes?.data || [],
                tasks: tasksRes?.data || [],
                learning: learningRes?.data || [],
                settings: settingsRes?.data || {},
                weeklyStats: weeklyStatsRes?.data || []
            });
        } catch (err) {
            console.error('Error fetching data from Neon PostgreSQL backend:', err);
            setError(err.message || 'Failed to load data from backend');
        } finally {
            setLoading(false);
        }
    }, [token, isDemo]);

    useEffect(() => {
        if (isDemo) {
            setData(getDemoProductivityData());
        } else if (token) {
            fetchData();
        } else {
            setData({
                habits: [],
                goals: [],
                tasks: [],
                learning: [],
                settings: {},
                weeklyStats: []
            });
        }
    }, [token, isDemo, fetchData]);

    // Add Item backed by Neon PostgreSQL (or Demo Memory)
    const addItem = async (type, item) => {
        const newItem = {
            ...item,
            id: item.id || `${type.slice(0, -1)}-${Date.now()}`,
            createdAt: item.createdAt || new Date().toISOString()
        };

        if (isDemo) {
            setData(prev => ({
                ...prev,
                [type]: [newItem, ...(prev[type] || [])]
            }));
            return newItem;
        }

        try {
            const res = await api.post(`/${type}`, item);
            const savedItem = res.data || newItem;
            setData(prev => ({
                ...prev,
                [type]: [savedItem, ...(prev[type] || [])]
            }));
            return savedItem;
        } catch (err) {
            console.error(`Failed to add ${type} to backend:`, err);
            throw err;
        }
    };

    // Update Item backed by Neon PostgreSQL (or Demo Memory)
    const updateItem = async (type, id, updates) => {
        setData(prev => {
            const list = prev[type] || [];
            const nextList = list.map(item => {
                const isMatch = String(item.id) === String(id) || item.id === id;
                return isMatch ? { ...item, ...updates } : item;
            });
            return {
                ...prev,
                [type]: nextList
            };
        });

        if (isDemo) return;

        try {
            await api.patch(`/${type}/${id}`, updates);
        } catch (err) {
            console.error(`Failed to update ${type} in backend:`, err);
            fetchData();
        }
    };

    // Delete Item backed by Neon PostgreSQL (or Demo Memory)
    const deleteItem = async (type, id) => {
        setData(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter(item => String(item.id) !== String(id) && item.id !== id)
        }));

        if (isDemo) return;

        try {
            await api.delete(`/${type}/${id}`);
        } catch (err) {
            console.error(`Failed to delete ${type} from backend:`, err);
            fetchData();
        }
    };

    // Update Settings backed by Neon PostgreSQL (or Demo Memory)
    const updateSettings = async (newSettings) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));

        if (isDemo) return;

        try {
            await api.put('/settings', newSettings);
        } catch (err) {
            console.error('Failed to sync settings to backend:', err);
            fetchData();
        }
    };

    // Habit check-in backed by Neon PostgreSQL (or Demo Memory)
    const checkHabit = async (id, dateStr) => {
        const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');

        setData(prev => {
            const habits = (prev.habits || []).map(habit => {
                const isMatch = String(habit.id) === String(id) || habit.id === id;
                if (!isMatch) return habit;

                const history = habit.history || [];
                const alreadyChecked = history.some(h => h.date === targetDate);

                let updatedHistory;
                let newStreak = habit.streak || 0;

                if (alreadyChecked) {
                    updatedHistory = history.filter(h => h.date !== targetDate);
                    newStreak = Math.max(0, newStreak - 1);
                } else {
                    updatedHistory = [...history, { date: targetDate, value: 1 }];
                    newStreak = (habit.streak || 0) + 1;
                }

                const bestStreak = Math.max(habit.bestStreak || 0, newStreak);

                return {
                    ...habit,
                    history: updatedHistory,
                    streak: newStreak,
                    bestStreak
                };
            });

            return { ...prev, habits };
        });

        if (isDemo) return;

        try {
            await api.post(`/habits/${id}/checkin`, { date: targetDate, value: 1 });
        } catch (err) {
            console.error('Could not sync habit check-in to backend:', err);
            fetchData();
        }
    };

    // Reset Productivity Data
    const resetProductivityData = async () => {
        setLoading(true);

        if (isDemo) {
            const emptyData = {
                habits: [],
                tasks: [],
                goals: [],
                learning: [],
                settings: data.settings || {},
                weeklyStats: []
            };
            setData(emptyData);
            setLoading(false);
            return emptyData;
        }

        try {
            const res = await api.post('/productivity/reset');
            const emptyData = {
                habits: [],
                tasks: [],
                goals: [],
                learning: [],
                settings: res.data?.settings || data.settings || {},
                weeklyStats: []
            };
            setData(emptyData);
            await fetchData();
            return emptyData;
        } catch (err) {
            console.error('Failed to reset productivity data on Neon backend:', err);
            setError('Failed to reset productivity data on server');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        pdfReportService.exportDataPDF(data, user);
    };

    return (
        <DataContext.Provider value={{
            habits: data.habits || [],
            goals: data.goals || [],
            tasks: data.tasks || [],
            learning: data.learning || [],
            settings: data.settings || {},
            weeklyStats: data.weeklyStats || [],
            data,
            addItem,
            updateItem,
            deleteItem,
            checkHabit,
            updateSettings,
            resetProductivityData,
            resetData: resetProductivityData,
            resetToTemplate: resetProductivityData,
            exportPDF,
            loading,
            error,
            refreshData: fetchData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
