import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import {
    Save,
    RotateCcw,
    Bell,
    Layers,
    Scale,
    AlertTriangle,
    Database,
    Flame,
    ListTodo,
    BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Toast } from '../components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

export default function Settings() {
    const { settings, updateSettings, resetProductivityData } = useData();
    const [localSettings, setLocalSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                weightsHabits: Number(settings.weightsHabits ?? 40),
                weightsTasks: Number(settings.weightsTasks ?? 40),
                weightsLearning: Number(settings.weightsLearning ?? 20),
                learningDailyTargetMinutes: Number(settings.learningDailyTargetMinutes ?? 60),
                theme: settings.theme || 'dark',
                accentColor: settings.accentColor || 'blue',
                showHabits: settings.showHabits !== false,
                showTasks: settings.showTasks !== false,
                showLearning: settings.showLearning !== false,
                showGoals: settings.showGoals !== false,
                overdueAlerts: settings.overdueAlerts !== false,
                lowProgressAlerts: settings.lowProgressAlerts !== false,
                lowProgressThreshold: Number(settings.lowProgressThreshold ?? 50)
            });
        }
    }, [settings]);

    if (!localSettings) return null;

    const totalWeight = Number(localSettings.weightsHabits) +
        Number(localSettings.weightsTasks) +
        Number(localSettings.weightsLearning);

    const handleSaveSettings = async () => {
        if (totalWeight !== 100) {
            setToast({ message: `Total weight must equal 100% (Current total: ${totalWeight}%)`, type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await updateSettings(localSettings);
            setToast({ message: "Settings and preferences saved successfully!", type: 'success' });
        } catch (err) {
            setToast({ message: "Failed to save settings.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleResetProductivityData = async () => {
        if (window.confirm("Are you sure you want to reset all your productivity data? This will permanently remove your habits, tasks, goals, and learning logs.")) {
            try {
                await resetProductivityData();
                setToast({ message: "Productivity data reset successfully! All records cleared.", type: 'success' });
            } catch (err) {
                setToast({ message: "Failed to reset productivity data.", type: 'error' });
            }
        }
    };

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 md:space-y-8 pb-16">
            {/* Header */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#17171C]/90 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">Customizable Settings & Preferences</h1>
                    <p className="text-xs text-muted mt-0.5">
                        Configure daily score formula weights, dashboard modules, notification alerts, and manage productivity data.
                    </p>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Neon PostgreSQL Persistent
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                {/* 1. Daily Scoring Weights Split */}
                <Card className="flex flex-col p-4 sm:p-6 bg-[#17171C]/90 border-white/5 md:col-span-2">
                    <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="p-2 sm:p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                                <Scale size={17} />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold text-white">Daily Score Formula Weights</h3>
                                <p className="text-[11px] sm:text-xs text-muted">Adjust contribution of each module to total daily score</p>
                            </div>
                        </div>
                        <span className={cn(
                            "text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0",
                            totalWeight === 100 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse"
                        )}>
                            Total: {totalWeight}%
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-white flex items-center gap-1.5">
                                    <Flame size={14} className="text-orange-400" /> Habits Completion
                                </span>
                                <span className="font-mono text-orange-400 font-bold">{localSettings.weightsHabits}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={localSettings.weightsHabits}
                                onChange={(e) => setLocalSettings(s => ({ ...s, weightsHabits: Number(e.target.value) || 0 }))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-white flex items-center gap-1.5">
                                    <ListTodo size={14} className="text-blue-400" /> Tasks Completion
                                </span>
                                <span className="font-mono text-blue-400 font-bold">{localSettings.weightsTasks}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={localSettings.weightsTasks}
                                onChange={(e) => setLocalSettings(s => ({ ...s, weightsTasks: Number(e.target.value) || 0 }))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-white flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-purple-400" /> Learning Focus
                                </span>
                                <span className="font-mono text-purple-400 font-bold">{localSettings.weightsLearning}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={localSettings.weightsLearning}
                                onChange={(e) => setLocalSettings(s => ({ ...s, weightsLearning: Number(e.target.value) || 0 }))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>

                    {/* Split Bar Preview */}
                    <div className="space-y-1.5 pt-4 mt-4 border-t border-white/5">
                        <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Formula Split Preview</span>
                        <div className="h-2.5 sm:h-3 w-full flex rounded-full overflow-hidden border border-white/10 bg-black/40">
                            <div className="bg-orange-500 transition-all duration-300" style={{ width: `${localSettings.weightsHabits}%` }} title={`Habits: ${localSettings.weightsHabits}%`} />
                            <div className="bg-blue-500 transition-all duration-300" style={{ width: `${localSettings.weightsTasks}%` }} title={`Tasks: ${localSettings.weightsTasks}%`} />
                            <div className="bg-purple-500 transition-all duration-300" style={{ width: `${localSettings.weightsLearning}%` }} title={`Learning: ${localSettings.weightsLearning}%`} />
                        </div>
                    </div>
                </Card>

                {/* 2. Dashboard Modules Visibility */}
                <Card className="flex flex-col p-4 sm:p-6 bg-[#17171C]/90 border-white/5">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b border-white/5">
                        <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                            <Layers size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">Module Display Toggles</h3>
                            <p className="text-[11px] sm:text-xs text-muted">Show or hide specific sections on your dashboard</p>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <span className="text-xs font-semibold text-white">Habit Tracker Section</span>
                            <input
                                type="checkbox"
                                checked={localSettings.showHabits ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, showHabits: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>

                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <span className="text-xs font-semibold text-white">Task Management Section</span>
                            <input
                                type="checkbox"
                                checked={localSettings.showTasks ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, showTasks: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>

                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <span className="text-xs font-semibold text-white">Learning Sessions Section</span>
                            <input
                                type="checkbox"
                                checked={localSettings.showLearning ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, showLearning: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>

                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <span className="text-xs font-semibold text-white">Goal Roadmaps Section</span>
                            <input
                                type="checkbox"
                                checked={localSettings.showGoals ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, showGoals: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>
                    </div>
                </Card>

                {/* 3. Alerts & Notifications */}
                <Card className="flex flex-col p-4 sm:p-6 bg-[#17171C]/90 border-white/5">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b border-white/5">
                        <div className="p-2 sm:p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
                            <Bell size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">Alerts & Warning Thresholds</h3>
                            <p className="text-[11px] sm:text-xs text-muted">Configure proactive reminders and health banners</p>
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 flex-1">
                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <div>
                                <div className="text-xs font-semibold text-white">Overdue Task Alerts</div>
                                <div className="text-[10px] text-muted">Show warning indicators on tasks past due date</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={localSettings.overdueAlerts ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, overdueAlerts: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>

                        <label className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                            <div>
                                <div className="text-xs font-semibold text-white">Low Daily Score Warning</div>
                                <div className="text-[10px] text-muted">Display banner when score drops below threshold</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={localSettings.lowProgressAlerts ?? true}
                                onChange={(e) => setLocalSettings(s => ({ ...s, lowProgressAlerts: e.target.checked }))}
                                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary/20"
                            />
                        </label>

                        {localSettings.lowProgressAlerts && (
                            <div className="pt-2">
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-muted">Score Threshold Warning</span>
                                    <span className="font-mono text-amber-400 font-bold">&lt; {localSettings.lowProgressThreshold || 50}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="30"
                                    max="70"
                                    step="5"
                                    value={localSettings.lowProgressThreshold || 50}
                                    onChange={(e) => setLocalSettings(s => ({ ...s, lowProgressThreshold: Number(e.target.value) || 50 }))}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Save Changes Button */}
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>{saving ? 'Saving Preferences...' : 'Save Settings & Preferences'}</span>
                    </button>
                </div>

                {/* 4. Reset Productivity Data Card */}
                <Card className="md:col-span-2 p-4 sm:p-6 bg-gradient-to-r from-red-950/20 via-[#17171C] to-red-950/10 border-red-500/20">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b border-red-500/20">
                        <div className="p-2 sm:p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/30 shrink-0">
                            <Database size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                                Reset Productivity Data
                            </h3>
                            <p className="text-[11px] sm:text-xs text-muted">
                                Permanently clear your habits, tasks, goals, and learning sessions.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">Reset Productivity Data</h4>
                            <p className="text-[11px] sm:text-xs text-muted">
                                Clear all records in Neon PostgreSQL and reset dashboard to zero
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleResetProductivityData}
                            className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/10 shrink-0 group active:scale-95"
                        >
                            <RotateCcw size={15} className="group-hover:-rotate-45 transition-transform" />
                            <span>Reset Productivity Data</span>
                        </button>
                    </div>

                    <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 flex items-start gap-2.5 text-[10px] sm:text-[11px] text-red-300/80">
                        <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-red-300">Note:</strong> Resetting permanently removes all your productivity records from Neon PostgreSQL and resets your dashboard to a clean zero state without inserting sample data.
                        </div>
                    </div>
                </Card>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </MotionWrapper>
    );
}
