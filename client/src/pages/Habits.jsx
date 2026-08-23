import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Flame, Trash2, Check, Plus, Award, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, subDays } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

const HabitCard = React.forwardRef(({ habit, onCheckIn, onDelete, ...props }, ref) => {
    const history = habit.history || [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isCheckedToday = history.some(h => h.date === todayStr);

    // Last 7 days visual
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const checked = history.some(h => h.date === dateStr);
        return {
            date: dateStr,
            dayLabel: format(d, 'EEE'),
            checked,
            isToday: dateStr === todayStr
        };
    });

    return (
        <Card
            ref={ref}
            className="flex flex-col justify-between h-full p-4 sm:p-5 bg-[#17171C]/90 border-white/5 hover:border-white/20 transition-all shadow-md group"
            {...props}
        >
            <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-2.5 sm:mb-3">
                    <div className="min-w-0 flex-1 pr-2">
                        {habit.category && (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 inline-block mb-1">
                                {habit.category}
                            </span>
                        )}
                        <h3 className="font-bold text-white text-sm sm:text-base leading-snug truncate">{habit.title}</h3>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm(`Delete habit "${habit.title}"?`)) onDelete(habit.id);
                        }}
                        className="text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete habit"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>

                {/* Streak Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold border",
                        habit.streak > 0
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-white/5 border-white/5 text-muted"
                    )}>
                        <Flame size={13} className={habit.streak > 0 ? "fill-orange-400 animate-pulse" : ""} />
                        <span>{habit.streak || 0} Day Streak</span>
                    </div>

                    {habit.bestStreak > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-muted px-2 py-1 rounded-lg bg-white/[0.02]">
                            <Award size={12} className="text-amber-400" />
                            <span>Best: {habit.bestStreak}d</span>
                        </div>
                    )}
                </div>

                {/* 7-Day Matrix */}
                <div className="space-y-1.5 mb-5 sm:mb-6">
                    <span className="text-[9px] sm:text-[10px] text-muted uppercase font-bold tracking-wider block">7-Day Consistency</span>
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {last7Days.map(day => (
                            <div key={day.date} className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <div
                                    title={`${day.date}: ${day.checked ? 'Completed' : 'Missed'}`}
                                    className={cn(
                                        "w-full h-7 sm:h-8 rounded-md sm:rounded-lg transition-all flex items-center justify-center border",
                                        day.checked
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/20"
                                            : "bg-white/[0.02] text-transparent border-white/5",
                                        day.isToday && !day.checked && "border-primary ring-1 ring-primary/40"
                                    )}
                                >
                                    {day.checked && <Check size={13} strokeWidth={3} />}
                                </div>
                                <span className="text-[8px] sm:text-[9px] font-semibold text-muted text-center">
                                    {day.dayLabel.slice(0, 1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Check in Action Button */}
            <Button
                onClick={() => onCheckIn(habit.id, todayStr)}
                className={cn(
                    "w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg",
                    isCheckedToday
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-primary hover:bg-blue-600 text-white shadow-primary/25 active:scale-95"
                )}
            >
                {isCheckedToday ? (
                    <>
                        <CheckCircle2 size={15} /> Completed Today
                    </>
                ) : (
                    <>
                        <Check size={15} /> Check In Today
                    </>
                )}
            </Button>
        </Card>
    );
});

export default function Habits() {
    const { habits, addItem, deleteItem, checkHabit } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHabit, setNewHabit] = useState({ title: '', category: 'Productivity', targetPerDay: 1 });

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const stats = useMemo(() => {
        const total = habits.length;
        const checkedToday = habits.filter(h => (h.history || []).some(entry => entry.date === todayStr)).length;
        const totalStreaks = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
        const avgStreak = total > 0 ? Math.round(totalStreaks / total) : 0;
        const rate = total > 0 ? Math.round((checkedToday / total) * 100) : 0;

        return { total, checkedToday, avgStreak, rate };
    }, [habits, todayStr]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newHabit.title.trim()) return;

        addItem('habits', {
            title: newHabit.title.trim(),
            category: newHabit.category,
            targetPerDay: Number(newHabit.targetPerDay) || 1,
            streak: 0,
            bestStreak: 0,
            history: []
        });

        setNewHabit({ title: '', category: 'Productivity', targetPerDay: 1 });
        setIsModalOpen(false);
    };

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 pb-12">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                    { label: 'Total Habits', value: stats.total, icon: Sparkles, color: 'text-primary' },
                    { label: 'Checked In Today', value: `${stats.checkedToday}/${stats.total}`, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Completion Rate', value: `${stats.rate}%`, icon: TrendingUp, color: 'text-blue-400' },
                    { label: 'Average Streak', value: `${stats.avgStreak} Days`, icon: Flame, color: 'text-orange-400' }
                ].map((s, i) => (
                    <Card key={i} className="p-3.5 sm:p-4 bg-[#17171C]/90 border-white/5 flex items-center gap-3">
                        <div className={cn("p-2 sm:p-2.5 rounded-xl bg-white/5", s.color)}>
                            <s.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-muted tracking-wider">{s.label}</p>
                            <p className="text-lg sm:text-xl font-mono font-extrabold text-white">{s.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#17171C]/90 border border-white/5">
                <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Habit Tracker & Consistency</h1>
                    <p className="text-xs text-muted">Build sustainable daily routines, maintain streaks, and monitor progress.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/25 transition-all"
                >
                    <Plus size={16} />
                    <span>Create Habit</span>
                </Button>
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                <AnimatePresence mode="popLayout">
                    {habits.map(habit => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            onCheckIn={checkHabit}
                            onDelete={(id) => deleteItem('habits', id)}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        />
                    ))}
                </AnimatePresence>

                {/* Add New Habit Button Tile */}
                <motion.button
                    layout
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[260px] border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all group text-muted hover:text-white p-5"
                >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                        <Plus size={22} />
                    </div>
                    <span className="font-bold text-xs sm:text-sm">Add New Habit</span>
                    <p className="text-[11px] sm:text-xs text-muted/60 mt-0.5 text-center">Track a routine you want to build consistently</p>
                </motion.button>
            </div>

            {/* New Habit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Habit">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Habit Title *
                        </label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newHabit.title}
                            onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Read technical articles for 20m"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Category
                            </label>
                            <select
                                value={newHabit.category}
                                onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            >
                                <option value="Productivity">Productivity</option>
                                <option value="Learning">Learning & Study</option>
                                <option value="Health">Health & Fitness</option>
                                <option value="Engineering">Engineering & Code</option>
                                <option value="Mindset">Mindset & Mindfulness</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Target / Day
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={newHabit.targetPerDay}
                                onChange={e => setNewHabit({ ...newHabit, targetPerDay: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold mt-2 shadow-lg shadow-primary/25">
                        Start Tracking Habit
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
