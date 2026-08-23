import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
    Bell,
    Menu,
    User,
    LogOut,
    ChevronDown,
    Flame,
    Timer,
    Settings as SettingsIcon,
    AlertTriangle,
    RotateCcw,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusModal } from './modals/FocusModal';
import defaultAvatar from '../pages/img/photo1.jpg';

export function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { tasks, habits, resetProductivityData, exportPDF } = useData();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Overdue tasks calculation
    const overdueTasks = useMemo(() => {
        return (tasks || []).filter(t => t.dueDate && t.status !== 'DONE' && t.dueDate < todayStr);
    }, [tasks, todayStr]);

    const activeStreaksCount = useMemo(() => {
        return (habits || []).reduce((max, h) => Math.max(max, h.streak || 0), 0);
    }, [habits]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset all your productivity data? This will permanently remove your habits, tasks, goals, and learning logs.")) {
            await resetProductivityData();
            setIsProfileOpen(false);
        }
    };

    const handleExportPDF = () => {
        exportPDF();
        setIsProfileOpen(false);
    };

    return (
        <>
            <header className="h-14 sm:h-16 border-b border-white/5 bg-[#121214]/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 md:px-8 transition-all">
                {/* Left: Mobile Menu & Current Date */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={onMenuClick}
                        className="p-1.5 sm:p-2 text-muted hover:text-white rounded-lg hover:bg-white/5 lg:hidden transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-xs font-semibold text-white/90 truncate">
                            {format(new Date(), 'EEE, MMM d, yyyy')}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted font-medium truncate hidden xs:block">
                            Productivity & Focus Hub
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Quick Focus Button */}
                    <button
                        onClick={() => setIsFocusModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-xs font-bold active:scale-95"
                    >
                        <Timer size={14} className="animate-pulse" />
                        <span className="hidden sm:inline">Focus Timer</span>
                    </button>

                    {/* Streak Indicator */}
                    {activeStreaksCount > 0 && (
                        <div
                            onClick={() => navigate('/habits')}
                            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold cursor-pointer hover:bg-orange-500/20 transition-all"
                            title="Highest Active Streak"
                        >
                            <Flame size={13} className="fill-orange-400" />
                            <span>{activeStreaksCount}d</span>
                        </div>
                    )}

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-1.5 sm:p-2 text-muted hover:text-white transition-colors relative rounded-xl hover:bg-white/5"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            {overdueTasks.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 bg-[#1A1A1E] border border-white/10 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-2xl"
                                    >
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h4>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted font-bold">
                                                {overdueTasks.length} Alerts
                                            </span>
                                        </div>

                                        {overdueTasks.length > 0 ? (
                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                {overdueTasks.map(t => (
                                                    <div
                                                        key={t.id}
                                                        onClick={() => { navigate('/tasks'); setIsNotificationsOpen(false); }}
                                                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-0.5">
                                                            <AlertTriangle size={12} />
                                                            <span>Overdue Task</span>
                                                        </div>
                                                        <p className="text-xs text-white font-medium truncate">{t.title}</p>
                                                        <p className="text-[10px] text-red-300/70 mt-0.5">Due: {t.dueDate}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-5 text-center text-muted">
                                                <p className="text-xs font-medium">All caught up! No overdue items.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-1.5 p-1 pl-1 pr-1.5 sm:pr-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user?.fullName || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={defaultAvatar} alt="User avatar" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-bold text-white leading-none mb-0.5 truncate max-w-[110px]">
                                    {user?.fullName || user?.username || 'Alex Rivers'}
                                </p>
                                <p className="text-[9px] text-muted leading-none uppercase tracking-wider font-semibold">
                                    {user?.role || 'Pro Member'}
                                </p>
                            </div>
                            <ChevronDown size={13} className={isProfileOpen ? "rotate-180 text-muted transition-transform" : "text-muted transition-transform"} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-60 bg-[#1A1A1E] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl"
                                    >
                                        <div className="p-2.5 border-b border-white/5 mb-1">
                                            <p className="text-[9px] text-muted uppercase font-bold tracking-wider mb-0.5">Signed In As</p>
                                            <p className="text-xs font-semibold text-white truncate">{user?.email || 'alex.rivers@productivity.com'}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            <User size={14} />
                                            <span>User Profile</span>
                                        </Link>

                                        <Link
                                            to="/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            <SettingsIcon size={14} />
                                            <span>Settings & Preferences</span>
                                        </Link>

                                        <button
                                            onClick={handleExportPDF}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-xl transition-all w-full text-left"
                                        >
                                            <FileText size={14} />
                                            <span>Export PDF Report</span>
                                        </button>

                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition-all w-full text-left"
                                        >
                                            <RotateCcw size={14} />
                                            <span>Reset Productivity Data</span>
                                        </button>

                                        <div className="h-px bg-white/5 my-1 mx-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all w-full text-left"
                                        >
                                            <LogOut size={14} />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Global Focus Modal */}
            <FocusModal isOpen={isFocusModalOpen} onClose={() => setIsFocusModalOpen(false)} />
        </>
    );
}
