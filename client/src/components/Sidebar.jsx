import React from 'react';
import { LayoutDashboard, CheckSquare, Target, ListTodo, GraduationCap, Settings as SettingsIcon, X, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks', badgeKey: 'tasks' },
    { icon: CheckSquare, label: 'Habits', path: '/habits', badgeKey: 'habits' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: GraduationCap, label: 'Learning', path: '/learning' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen, onClose }) {
    const { tasks, habits } = useData();
    const { isDemo, user } = useAuth();

    const pendingTasksCount = (tasks || []).filter(t => t.status !== 'DONE').length;
    const pendingHabitsCount = (habits || []).filter(h => {
        const todayStr = new Date().toISOString().split('T')[0];
        return !(h.history || []).some(entry => entry.date === todayStr);
    }).length;

    const getBadge = (key) => {
        if (key === 'tasks' && pendingTasksCount > 0) return pendingTasksCount;
        if (key === 'habits' && pendingHabitsCount > 0) return pendingHabitsCount;
        return null;
    };

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#141416]/98 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Header / Brand */}
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">
                            Productivity
                        </h1>
                        <p className="text-[9px] text-muted font-medium tracking-wider uppercase">Growth Engine</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/5 lg:hidden transition-colors"
                    aria-label="Close Sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
                <div className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest text-muted/60">
                    Core Modules
                </div>
                {navItems.map((item) => {
                    const badge = item.badgeKey ? getBadge(item.badgeKey) : null;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-xs sm:text-sm font-medium",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold"
                                        : "text-muted hover:text-white hover:bg-white/5"
                                )
                            }
                        >
                            <div className="flex items-center gap-2.5">
                                <item.icon size={17} className="transition-transform duration-200 group-hover:scale-110 shrink-0" />
                                <span>{item.label}</span>
                            </div>
                            {badge !== null && (
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors",
                                    "bg-white/10 text-white group-hover:bg-white/20"
                                )}>
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer / Status */}
            <div className="p-3.5 border-t border-white/5 bg-black/20">
                {isDemo ? (
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-amber-300 truncate">Demo Mode Active</p>
                            <p className="text-[8px] text-amber-200/70 truncate">{user?.fullName || 'Alex Rivers'} (Preview)</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-emerald-300 truncate">Neon PostgreSQL Connected</p>
                            <p className="text-[8px] text-emerald-200/70 truncate">{user?.email || 'Cloud Persistent'}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
