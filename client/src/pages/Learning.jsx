import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
    BookOpen,
    Plus,
    Trash2,
    Clock,
    Calendar,
    Timer,
    Search,
    GraduationCap,
    TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FocusModal } from '../components/modals/FocusModal';
import { cn } from '../lib/utils';

export default function Learning() {
    const { learning, addItem, deleteItem, settings } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [newSession, setNewSession] = useState({
        topic: '',
        minutes: 45,
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const stats = useMemo(() => {
        const totalSessions = learning.length;
        const totalMinutes = learning.reduce((sum, l) => sum + (Number(l.minutes) || 30), 0);
        const todayMinutes = learning
            .filter(l => l.date === todayStr)
            .reduce((sum, l) => sum + (Number(l.minutes) || 30), 0);
        const dailyTarget = settings?.learningDailyTargetMinutes || 45;
        const targetPercent = Math.min(100, Math.round((todayMinutes / dailyTarget) * 100));

        return {
            totalSessions,
            totalHours: (totalMinutes / 60).toFixed(1),
            todayMinutes,
            dailyTarget,
            targetPercent
        };
    }, [learning, todayStr, settings]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newSession.topic.trim()) return;

        addItem('learning', {
            topic: newSession.topic.trim(),
            minutes: Number(newSession.minutes) || 30,
            notes: newSession.notes.trim(),
            date: newSession.date || todayStr
        });

        setNewSession({
            topic: '',
            minutes: 45,
            notes: '',
            date: todayStr
        });
        setIsModalOpen(false);
    };

    // Filter & Sort by date descending
    const filteredLearning = useMemo(() => {
        return [...learning]
            .filter(l => {
                const query = searchQuery.toLowerCase();
                const matchesTopic = (l.topic || '').toLowerCase().includes(query);
                const matchesNotes = (l.notes || '').toLowerCase().includes(query);
                return matchesTopic || matchesNotes;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [learning, searchQuery]);

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 pb-12">
            {/* Top Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                    { label: 'Total Learning Time', value: `${stats.totalHours} Hours`, icon: Clock, color: 'text-orange-400' },
                    { label: 'Sessions Completed', value: stats.totalSessions, icon: BookOpen, color: 'text-blue-400' },
                    { label: "Today's Study Time", value: `${stats.todayMinutes} / ${stats.dailyTarget}m`, icon: Timer, color: 'text-emerald-400' },
                    { label: 'Daily Target Progress', value: `${stats.targetPercent}%`, icon: TrendingUp, color: 'text-cyan-400' }
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

            {/* Header Toolbar & Focus Launch */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#17171C]/90 border border-white/5">
                <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <GraduationCap size={18} className="text-orange-400" />
                        <span>Focused Learning & Study Sessions</span>
                    </h1>
                    <p className="text-xs text-muted">
                        Log key takeaways, track focused study duration, and reinforce long-term mastery.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsFocusModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-bold transition-all"
                    >
                        <Timer size={15} />
                        <span>Launch Focus Mode</span>
                    </button>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-600 text-white px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/25 transition-all"
                    >
                        <Plus size={15} />
                        <span>Log Session</span>
                    </Button>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search learning topics, concepts, or notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#17171C] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-muted focus:outline-none focus:border-primary transition-colors shadow-sm"
                />
            </div>

            {/* Learning Sessions Timeline Cards */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredLearning.map(item => (
                        <Card
                            key={item.id}
                            className="p-3.5 sm:p-5 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-start md:items-center bg-[#17171C]/90 border-white/5 hover:border-white/20 transition-all shadow-md group"
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                        >
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className="p-2.5 sm:p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 shrink-0">
                                    <BookOpen size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <span className="text-[11px] sm:text-xs text-muted flex items-center gap-1">
                                            <Calendar size={11} /> {item.date}
                                        </span>
                                        <span className="text-[11px] sm:text-xs text-muted flex items-center gap-1 font-mono font-semibold">
                                            <Clock size={11} /> {item.minutes || 30} mins
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug truncate">{item.topic}</h3>
                                    {item.notes && (
                                        <p className="text-[11px] sm:text-xs text-muted/90 mt-1 leading-relaxed bg-white/[0.02] p-2 sm:p-2.5 rounded-xl border border-white/5">
                                            "{item.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (window.confirm(`Delete log "${item.topic}"?`)) deleteItem('learning', item.id);
                                }}
                                className="p-1.5 text-muted hover:text-red-400 rounded-xl hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all self-end md:self-center shrink-0"
                                title="Delete Log"
                            >
                                <Trash2 size={15} />
                            </button>
                        </Card>
                    ))}
                </AnimatePresence>

                {filteredLearning.length === 0 && (
                    <div className="text-center py-12 text-muted border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <BookOpen size={36} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs sm:text-sm font-semibold text-white">No learning sessions found.</p>
                        <p className="text-[11px] sm:text-xs text-muted mt-0.5">Log a study session or launch Focus Mode to record your learning.</p>
                    </div>
                )}
            </div>

            {/* Log Session Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Learning Session">
                <form onSubmit={handleAdd} className="space-y-3.5">
                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Topic / Concept *
                        </label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newSession.topic}
                            onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Advanced Generics & System Design"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="360"
                                value={newSession.minutes}
                                onChange={e => setNewSession({ ...newSession, minutes: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Date
                            </label>
                            <input
                                type="date"
                                value={newSession.date}
                                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Key Takeaways / Notes (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={newSession.notes}
                            onChange={e => setNewSession({ ...newSession, notes: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                            placeholder="Summarize the core learnings and insights..."
                        />
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-bold mt-2 shadow-lg shadow-primary/25 text-xs">
                        Save Learning Log
                    </Button>
                </form>
            </Modal>

            <FocusModal isOpen={isFocusModalOpen} onClose={() => setIsFocusModalOpen(false)} />
        </MotionWrapper>
    );
}
