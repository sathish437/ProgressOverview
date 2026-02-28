import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx'
import Layout from './layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tasks from './pages/Tasks.jsx'
import Habits from './pages/Habits.jsx'

import Goals from './pages/Goals.jsx'
import Learning from './pages/Learning.jsx'

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <div className="min-h-screen bg-background text-text font-sans">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected App Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/habits" element={<Habits />} />
                                <Route path="/goals" element={<Goals />} />
                                <Route path="/learning" element={<Learning />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </DataProvider>
        </AuthProvider>
    );
}

export default App;
