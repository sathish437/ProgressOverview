import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Flame, Trash2, Check, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, subDays } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

const HabitCard = React.forwardRef(({ habit, onCheckIn, onDelete, ...props }, ref) => {
    const history = habit.history || [];
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCheckedToday = history.some(h => h.date === today);

    // Last 7 days visual
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const checked = history.some(h => h.date === dateStr);
        return { date: dateStr, checked, isToday: dateStr === today };
    });

    return (
        <Card ref={ref} className="flex flex-col justify-between h-full hover:border-gray-700 transition-colors" {...props}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-white text-lg">{habit.title}</h3>
                    <div className="flex items-center gap-1 text-muted text-sm mt-1">
                        <Flame size={14} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : ""} />
                        <span className={habit.streak > 0 ? "text-orange-400" : ""}>{habit.streak} day streak</span>
                    </div>
                </div>
                <button
                    onClick={() => confirm('Delete habit?') && onDelete(habit.id)}
                    className="text-gray-600 hover:text-red-400 p-1"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {last7Days.map(day => (
                    <div key={day.date} className="flex flex-col items-center gap-1">
                        <div
                            title={day.date}
                            className={cn(
                                "w-8 h-8 rounded-lg transition-all border border-transparent flex items-center justify-center",
                                day.checked ? "bg-green-500 text-white" : "bg-gray-800/50 text-gray-600",
                                day.isToday && !day.checked && "border-primary/50 animate-pulse"
                            )}
                        >
                            {day.checked && <Check size={14} />}
                        </div>
                        <span className="text-[10px] text-gray-600 text-center w-full">
                            {format(new Date(day.date), 'EEEEE')}
                        </span>
                    </div>
                ))}
            </div>

            <Button
                disabled={isCheckedToday}
                onClick={() => onCheckIn(habit.id, today)}
                className={cn(
                    "mt-6 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95",
                    isCheckedToday
                        ? "bg-green-500/10 text-green-500 cursor-default"
                        : "bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                )}
            >
                {isCheckedToday ? <><Check size={18} /> Completed Today</> : "Check In"}
            </Button>
        </Card>
    )
});

export default function Habits() {
    const { habits, addItem, updateItem, deleteItem, checkHabit } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHabit, setNewHabit] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        addItem('habits', { title: newHabit, targetPerDay: 1, streak: 0 });
        setNewHabit('');
        setIsModalOpen(false);
    };

    const filteredHabits = habits;

    return (
        <MotionWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Habits</h1>
                    <p className="text-muted">Build consistency every day.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    <span>New Habit</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredHabits.map(habit => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            onCheckIn={checkHabit}
                            onDelete={(id) => deleteItem('habits', id)}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        />
                    ))}
                </AnimatePresence>

                {/* Add New Placeholder Card */}
                <motion.button
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl hover:border-gray-700 hover:bg-white/5 transition-all group text-muted hover:text-white"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium">Create New Habit</span>
                </motion.button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start a New Habit">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">Habit Title</label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newHabit}
                            onChange={e => setNewHabit(e.target.value)}
                            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Read 10 pages"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium mt-4">
                        Start Habit
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
