import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Split, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function Goals() {
    const { goals, addItem, updateItem, deleteItem } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '' });
    const [editingMilestone, setEditingMilestone] = useState(null);

    const rebalanceMilestones = (milestones, targetValue) => {
        if (milestones.length === 0) return [];

        const customMilestones = milestones.filter(m => m.isCustom);
        const autoMilestones = milestones.filter(m => !m.isCustom);

        if (autoMilestones.length === 0) return milestones;

        const totalCustomValue = customMilestones.reduce((sum, m) => sum + (parseFloat(m.value) || 0), 0);
        const remainingValue = Math.max(0, targetValue - totalCustomValue);

        const baseValue = parseFloat((remainingValue / autoMilestones.length).toFixed(2));
        let runningSum = 0;

        const updatedAutoMilestones = autoMilestones.map((m, idx) => {
            let val = baseValue;
            if (idx === autoMilestones.length - 1) {
                // Adjust last one to ensure exact sum
                val = parseFloat((remainingValue - runningSum).toFixed(2));
            } else {
                runningSum += val;
            }
            return { ...m, value: val };
        });

        // Reassemble milestones in original order if possible, or just concat
        // Since we want to maintain order, we map the original array
        return milestones.map(m => {
            const updated = updatedAutoMilestones.find(um => um.id === m.id);
            return updated ? updated : m;
        });
    };

    const computeCurrentValue = (milestones) => {
        if (!milestones || milestones.length === 0) return 0;
        return parseFloat(milestones.reduce((sum, ms) => sum + (ms.done ? parseFloat(ms.value || 0) : 0), 0).toFixed(2));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        addItem('goals', { ...newGoal, targetValue: 100, currentValue: 0, milestones: [] });
        setNewGoal({ title: '' });
        setIsModalOpen(false);
    };

    const toggleMilestone = (goal, milestoneIndex) => {
        const updatedMilestones = [...goal.milestones];
        updatedMilestones[milestoneIndex].done = !updatedMilestones[milestoneIndex].done;

        const newCurrentVal = computeCurrentValue(updatedMilestones);
        updateItem('goals', goal.id, {
            milestones: updatedMilestones,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const addMilestone = (goalId) => {
        const title = prompt("Milestone Title:");
        if (!title) return;

        const goal = goals.find(g => g.id === goalId);
        const newMs = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            value: 0,
            done: false,
            isCustom: false
        };

        const rebalanced = rebalanceMilestones([...goal.milestones, newMs], goal.targetValue);
        const newCurrentVal = computeCurrentValue(rebalanced);

        updateItem('goals', goalId, {
            milestones: rebalanced,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const deleteMilestone = (goal, index) => {
        if (!confirm("Delete milestone?")) return;
        const remaining = goal.milestones.filter((_, i) => i !== index);
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

        const customVal = prompt("Custom Value (leave empty for auto-balance):", ms.isCustom ? ms.value : "");
        const isCustom = customVal !== "" && !isNaN(parseFloat(customVal));
        const value = isCustom ? parseFloat(customVal) : 0;

        const updatedMilestones = [...goal.milestones];
        updatedMilestones[index] = { ...ms, title: newTitle, value, isCustom };

        const rebalanced = rebalanceMilestones(updatedMilestones, goal.targetValue);
        const newCurrentVal = computeCurrentValue(rebalanced);

        updateItem('goals', goal.id, {
            milestones: rebalanced,
            currentValue: Math.min(newCurrentVal, goal.targetValue)
        });
    };

    const generateMilestones = (goal) => {
        const count = parseInt(prompt("How many milestones to generate?", "5")) || 5;
        const newMilestones = Array.from({ length: count }).map((_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: `Milestone ${i + 1}`,
            value: 0,
            done: false,
            isCustom: false
        }));

        const rebalanced = rebalanceMilestones(newMilestones, goal.targetValue);
        updateItem('goals', goal.id, {
            milestones: rebalanced,
            currentValue: 0
        });
    };

    const updateProgress = (goalId, val) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal?.milestones?.length > 0) return; // Strict rule
        const newVal = parseInt(val) || 0;
        updateItem('goals', goalId, { currentValue: newVal });
    }

    return (
        <MotionWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Goals</h1>
                    <p className="text-muted">Track your long-term ambitions.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    <span>New Goal</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {goals.map(goal => (
                        <Card
                            key={goal.id}
                            className="flex flex-col gap-4"
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                                <button onClick={() => deleteItem('goals', goal.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm text-muted mb-2">
                                    <div className="flex items-center gap-1">
                                        <span>Progress</span>
                                        {(goal.milestones || []).length > 0 && (
                                            <div className="group relative">
                                                <Info size={12} className="text-primary cursor-help" />
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-[10px] p-2 rounded border border-gray-700 w-32 z-10">
                                                    Auto-calculated from milestones
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {goal.currentValue >= goal.targetValue && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase tracking-wider">
                                                Completed
                                            </span>
                                        )}
                                        <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                                    </div>
                                </div>
                                <ProgressBar
                                    value={(goal.currentValue / goal.targetValue) * 100}
                                    colorClass={goal.currentValue >= goal.targetValue ? "bg-green-500" : "bg-primary"}
                                />
                                {(goal.milestones || []).length > 0 && (
                                    <div className="flex justify-end mt-2">
                                        <span className="text-[10px] text-muted italic">
                                            {goal.milestones.filter(m => m.done).length}/{(goal.milestones || []).length} Milestones
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-800 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-muted uppercase tracking-wider text-[10px]">Milestones</h4>
                                    <div className="flex gap-2">
                                        {(goal.milestones || []).length === 0 && (
                                            <button
                                                onClick={() => generateMilestones(goal)}
                                                className="text-[10px] text-muted hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                <Split size={10} /> Auto-Split
                                            </button>
                                        )}
                                        <button onClick={() => addMilestone(goal.id)} className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1">
                                            <Plus size={10} /> ADD
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                                    {(goal.milestones || []).map((ms, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group transition-colors"
                                        >
                                            <div
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                                onClick={() => toggleMilestone(goal, idx)}
                                            >
                                                {ms.done ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-600" />}
                                                <div>
                                                    <p className={cn("text-sm", ms.done && "text-muted line-through")}>{ms.title}</p>
                                                    <p className="text-[10px] text-muted flex items-center gap-1">
                                                        {ms.value.toFixed(2)} pts
                                                        {ms.isCustom && <span className="text-[8px] bg-gray-800 px-1 rounded">MANUAL</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); editMilestone(goal, idx); }}
                                                    className="text-gray-700 hover:text-primary p-1"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteMilestone(goal, idx); }}
                                                    className="text-gray-700 hover:text-red-400 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(goal.milestones || []).length === 0 && (
                                        <div className="p-4 text-center border-2 border-dashed border-gray-800/50 rounded-xl">
                                            <p className="text-[10px] text-gray-700 italic">No milestones yet.</p>
                                        </div>
                                    )}
                                </div>

                                {(goal.milestones || []).length > 0 && goal.milestones.some(m => !m.done) && (
                                    <div className="mt-4 p-2 bg-primary/5 rounded-lg border border-primary/10">
                                        <p className="text-[10px] text-primary/70 uppercase font-bold mb-1">Next up</p>
                                        <p className="text-xs text-white font-medium">{goal.milestones.find(m => !m.done).title}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </AnimatePresence>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set a New Goal">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">Goal Title</label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newGoal.title}
                            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="What do you want to achieve?"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium mt-4">
                        Create Goal
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
