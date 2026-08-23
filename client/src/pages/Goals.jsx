import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Edit2,
    Target,
    Calendar,
    Award,
    Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function Goals() {
    const { goals, addItem, updateItem, deleteItem } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        category: 'Career',
        deadline: '',
        targetValue: 100
    });

    const rebalanceMilestones = (milestones, targetValue = 100) => {
        if (!milestones || milestones.length === 0) return [];

        const customMilestones = milestones.filter(m => m.isCustom);
        const autoMilestones = milestones.filter(m => !m.isCustom);

        if (autoMilestones.length === 0) return milestones;

        const totalCustomValue = customMilestones.reduce((sum, m) => sum + (parseInt(m.value, 10) || 0), 0);
        const remainingValue = Math.max(0, targetValue - totalCustomValue);

        const baseValue = Math.floor(remainingValue / autoMilestones.length);
        const remainder = remainingValue - baseValue * autoMilestones.length;

        const updatedAutoMilestones = autoMilestones.map((m, idx) => {
            const val = idx < remainder ? baseValue + 1 : baseValue;
            return { ...m, value: val };
        });

        return milestones.map(m => {
            const updated = updatedAutoMilestones.find(um => um.id === m.id);
            return updated ? updated : m;
        });
    };

    const computeCurrentValue = (milestones) => {
        if (!milestones || milestones.length === 0) return 0;
        return parseFloat(milestones.reduce((sum, ms) => sum + (ms.done ? parseFloat(ms.value || 0) : 0), 0).toFixed(2));
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;

        const initialMilestones = [
            { id: `ms-${Date.now()}-1`, title: 'Define scope & target milestones', value: 25, done: false, isCustom: false },
            { id: `ms-${Date.now()}-2`, title: 'Execute key deliverables', value: 25, done: false, isCustom: false },
            { id: `ms-${Date.now()}-3`, title: 'Review & optimize results', value: 25, done: false, isCustom: false },
            { id: `ms-${Date.now()}-4`, title: 'Achieve finalized target metric', value: 25, done: false, isCustom: false }
        ];

        addItem('goals', {
            title: newGoal.title.trim(),
            category: newGoal.category,
            deadline: newGoal.deadline || null,
            targetValue: Number(newGoal.targetValue) || 100,
            currentValue: 0,
            milestones: initialMilestones
        });

        setNewGoal({ title: '', category: 'Career', deadline: '', targetValue: 100 });
        setIsModalOpen(false);
    };

    const toggleMilestone = (goal, milestoneIndex) => {
        const updatedMilestones = [...(goal.milestones || [])];
        updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            done: !updatedMilestones[milestoneIndex].done
        };

        const newCurrentVal = computeCurrentValue(updatedMilestones);
        updateItem('goals', goal.id, {
            milestones: updatedMilestones,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const addMilestone = (goalId) => {
        const title = prompt("Enter new milestone title:");
        if (!title || !title.trim()) return;

        const goal = goals.find(g => g.id === goalId);
        const newMs = {
            id: `ms-${Date.now()}`,
            title: title.trim(),
            value: 0,
            done: false,
            isCustom: false
        };

        const updatedList = [...(goal.milestones || []), newMs];
        const rebalanced = rebalanceMilestones(updatedList, goal.targetValue);
        const newCurrentVal = computeCurrentValue(rebalanced);

        updateItem('goals', goalId, {
            milestones: rebalanced,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const deleteMilestone = (goal, index) => {
        if (!window.confirm("Delete this milestone?")) return;
        const remaining = (goal.milestones || []).filter((_, i) => i !== index);
        const rebalanced = rebalanceMilestones(remaining, goal.targetValue);
        const newCurrentVal = computeCurrentValue(rebalanced);

        updateItem('goals', goal.id, {
            milestones: rebalanced,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const editMilestone = (goal, index) => {
        const ms = goal.milestones[index];
        const newTitle = prompt("Edit Milestone Title:", ms.title);
        if (!newTitle) return;

        const customVal = prompt("Custom Point Value (leave empty for auto-balance):", ms.isCustom ? ms.value : "");
        const isCustom = customVal !== null && customVal.trim() !== "" && !isNaN(parseFloat(customVal));
        const value = isCustom ? Math.round(parseFloat(customVal)) : 0;

        const updatedMilestones = [...goal.milestones];
        updatedMilestones[index] = { ...ms, title: newTitle.trim(), value, isCustom };

        const rebalanced = rebalanceMilestones(updatedMilestones, goal.targetValue);
        const newCurrentVal = computeCurrentValue(rebalanced);

        updateItem('goals', goal.id, {
            milestones: rebalanced,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const stats = useMemo(() => {
        const total = goals.length;
        const completed = goals.filter(g => (g.currentValue || 0) >= (g.targetValue || 100)).length;
        const totalMilestones = goals.reduce((sum, g) => sum + (g.milestones || []).length, 0);
        const completedMilestones = goals.reduce((sum, g) => sum + (g.milestones || []).filter(m => m.done).length, 0);
        const avgProgress = total > 0
            ? Math.round(goals.reduce((sum, g) => sum + ((g.currentValue || 0) / (g.targetValue || 100)) * 100, 0) / total)
            : 0;

        return { total, completed, totalMilestones, completedMilestones, avgProgress };
    }, [goals]);

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 pb-12">
            {/* Top Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                    { label: 'Active Goals', value: stats.total, icon: Target, color: 'text-cyan-400' },
                    { label: 'Goals Completed', value: `${stats.completed}/${stats.total}`, icon: Award, color: 'text-emerald-400' },
                    { label: 'Average Progress', value: `${stats.avgProgress}%`, icon: CheckCircle2, color: 'text-blue-400' },
                    { label: 'Milestones Completed', value: `${stats.completedMilestones}/${stats.totalMilestones}`, icon: Check, color: 'text-amber-400' }
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
                    <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Goal Milestones & Roadmaps</h1>
                    <p className="text-xs text-muted">Set ambitious targets, break them down into actionable milestones, and track completion.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/25 transition-all"
                >
                    <Plus size={16} />
                    <span>Set New Goal</span>
                </Button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                    {goals.map(goal => {
                        const progressPercent = Math.min(100, Math.round(((goal.currentValue || 0) / (goal.targetValue || 100)) * 100));
                        const isCompleted = progressPercent >= 100;
                        const milestones = goal.milestones || [];
                        const completedMsCount = milestones.filter(m => m.done).length;
                        const nextMilestone = milestones.find(m => !m.done);

                        return (
                            <Card
                                key={goal.id}
                                className={cn(
                                    "p-4 sm:p-6 flex flex-col justify-between bg-[#17171C]/90 border-white/5 hover:border-white/20 transition-all shadow-lg",
                                    isCompleted && "border-emerald-500/30"
                                )}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            >
                                <div className="space-y-3.5 sm:space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                {goal.category && (
                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                                        {goal.category}
                                                    </span>
                                                )}
                                                {goal.deadline && (
                                                    <span className="text-[9px] sm:text-[10px] text-muted flex items-center gap-1 font-medium">
                                                        <Calendar size={10} /> Target: {goal.deadline}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-base sm:text-lg font-bold text-white leading-snug truncate">{goal.title}</h3>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Delete goal "${goal.title}"?`)) deleteItem('goals', goal.id);
                                            }}
                                            className="text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                                            title="Delete Goal"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    {/* Progress Bar & Percentage */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="text-muted font-semibold text-[11px] sm:text-xs">
                                                {completedMsCount} of {milestones.length} Milestones Done
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {isCompleted && (
                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        Completed
                                                    </span>
                                                )}
                                                <span className="font-mono font-bold text-white text-xs sm:text-sm">{progressPercent}%</span>
                                            </div>
                                        </div>
                                        <ProgressBar
                                            value={progressPercent}
                                            colorClass={isCompleted ? "bg-emerald-500" : "bg-cyan-500"}
                                        />
                                    </div>

                                    {/* Next Step Banner */}
                                    {nextMilestone && (
                                        <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                            <p className="text-[9px] sm:text-[10px] text-cyan-400 uppercase font-bold tracking-wider mb-0.5">Next Active Milestone</p>
                                            <p className="text-xs text-white font-medium truncate">{nextMilestone.title}</p>
                                        </div>
                                    )}

                                    {/* Milestones List */}
                                    <div className="pt-2 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] sm:text-[10px] text-muted uppercase font-bold tracking-wider">Milestones Checklist</span>
                                            <button
                                                onClick={() => addMilestone(goal.id)}
                                                className="text-[9px] sm:text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={11} /> Add Milestone
                                            </button>
                                        </div>

                                        <div className="space-y-1 max-h-48 sm:max-h-52 overflow-y-auto pr-1">
                                            {milestones.map((ms, idx) => (
                                                <div
                                                    key={ms.id || idx}
                                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                                                >
                                                    <div
                                                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                                        onClick={() => toggleMilestone(goal, idx)}
                                                    >
                                                        {ms.done ? (
                                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                                        ) : (
                                                            <Circle size={15} className="text-muted/60 shrink-0" />
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className={cn("text-xs font-medium truncate", ms.done ? "text-muted line-through" : "text-white/90")}>
                                                                {ms.title}
                                                            </p>
                                                            <p className="text-[8px] sm:text-[9px] text-muted flex items-center gap-1">
                                                                {ms.value} pts {ms.isCustom && <span className="px-1 rounded bg-white/10 text-[7px]">CUSTOM</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); editMilestone(goal, idx); }}
                                                            className="p-1 text-muted hover:text-primary rounded-md hover:bg-white/5"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteMilestone(goal, idx); }}
                                                            className="p-1 text-muted hover:text-red-400 rounded-md hover:bg-white/5"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Create Goal Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set a New Goal">
                <form onSubmit={handleAddGoal} className="space-y-3.5">
                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Goal Title *
                        </label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newGoal.title}
                            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Publish Open Source React Library"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Category
                            </label>
                            <select
                                value={newGoal.category}
                                onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            >
                                <option value="Career">Career & Business</option>
                                <option value="Open Source">Open Source & Dev</option>
                                <option value="Education">Education & Skills</option>
                                <option value="Personal">Personal Growth</option>
                                <option value="Health">Health & Wellness</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Target Date
                            </label>
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-bold mt-2 shadow-lg shadow-primary/25 text-xs">
                        Create Goal with Auto Milestones
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
