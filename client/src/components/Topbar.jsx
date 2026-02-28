import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Plus, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import defaultAvatar from '../pages/img/photo1.jpg';

export function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-gray-800 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-muted hover:text-white lg:hidden"
                >
                    <Menu size={24} />
                </button>
                <p className="text-sm text-muted capitalize hidden sm:block">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>
            <div className="flex items-center gap-4 relative">
                <button className="p-2 text-muted hover:text-white transition-colors relative rounded-full hover:bg-white/5">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl hover:bg-white/5 transition-all active:scale-95 group"
                >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <img src={defaultAvatar} alt={user?.fullName} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-white leading-none mb-0.5">{user?.fullName}</p>
                        <p className="text-[10px] text-muted leading-none">Standard User</p>
                    </div>
                    <ChevronDown size={14} className={isProfileOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>

                <AnimatePresence>
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-surface border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                            >
                                <div className="p-3 border-b border-gray-800 mb-2">
                                    <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Account</p>
                                    <p className="text-sm text-white truncate">{user?.email}</p>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <User size={18} />
                                    <span>View Profile</span>
                                </Link>
                                <div className="h-px bg-gray-800 my-2 mx-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all w-full text-left"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
