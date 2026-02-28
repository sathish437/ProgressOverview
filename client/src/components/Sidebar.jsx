import React from 'react';
import { LayoutDashboard, CheckSquare, Target, ListTodo, GraduationCap, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'Habits', path: '/habits' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { icon: GraduationCap, label: 'Learning', path: '/learning' },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Progress.
                </h1>
                <button
                    onClick={onClose}
                    className="p-2 text-muted hover:text-white lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted hover:text-white hover:bg-white/5"
                            )
                        }
                    >
                        <item.icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800 text-xs text-muted text-center">
                © 2024 Progress App
            </div>
        </aside>
    );
}
