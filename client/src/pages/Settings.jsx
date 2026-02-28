import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import {
    Save,
    RotateCcw,
    Download,
    Trash2,
    Palette,
    Bell,
    Layout as LayoutIcon,
    Scale,
    Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Toast } from '../components/ui/Toast';

const ACCENT_COLORS = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
];

export default function Settings() {
    const { settings, updateSettings, resetData, data } = useData();
    const [localSettings, setLocalSettings] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    if (!localSettings) return null;

    const handleSave = async (section) => {
        try {
            // Validation for weights
            if (section === 'weights') {
                const total = Number(localSettings.weightsHabits) +
                    Number(localSettings.weightsTasks) +
                    Number(localSettings.weightsLearning);
                if (total !== 100) {
                    setToast({ message: `Total weight must be 100% (Current: ${total}%)`, type: 'error' });
                    return;
                }
            }

            await updateSettings(localSettings);
            setToast({ message: "Settings saved successfully!", type: 'success' });
        } catch (err) {
            setToast({ message: "Failed to save settings", type: 'error' });
        }
    };

    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'progress-data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setToast({ message: "Data exported successfully!", type: 'success' });
    };

    const clearActivityLog = async () => {
        if (window.confirm("Are you sure you want to clear the activity log?")) {
            // In a real app, this would be an API call. For now we just mock or update local.
            setToast({ message: "Activity log cleared (Mock)", type: 'success' });
        }
    };

    return (
        <MotionWrapper className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-muted">Personalize your experience and manage your data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Progress Weights */}
                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Scale size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Daily Score Split</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        {[
                            { key: 'weightsHabits', label: 'Habits' },
                            { key: 'weightsTasks', label: 'Tasks' },
                            { key: 'weightsLearning', label: 'Learning' }
                        ].map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <label className="text-white capitalize font-medium">{label}</label>
                                    <span className="text-muted font-mono">{localSettings[key]}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localSettings[key]}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        [key]: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        ))}

                        {/* Split Preview */}
                        <div className="h-4 w-full flex rounded-full overflow-hidden border border-gray-800">
                            <div className="bg-blue-500 transition-all duration-500" style={{ width: `${localSettings.weightsHabits}%` }}></div>
                            <div className="bg-purple-500 transition-all duration-500" style={{ width: `${localSettings.weightsTasks}%` }}></div>
                            <div className="bg-orange-500 transition-all duration-500" style={{ width: `${localSettings.weightsLearning}%` }}></div>
                        </div>
                    </div>

                    <Button onClick={() => handleSave('weights')} className="mt-8 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save Weights
                    </Button>
                </Card>

                {/* 2. Theme & UI */}
                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                            <Palette size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Theme & UI</h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted">Accent Color</label>
                            <div className="flex gap-4">
                                {ACCENT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setLocalSettings({
                                            ...localSettings,
                                            accentColor: color.value
                                        })}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                            color.class,
                                            localSettings.accentColor === color.value ? "ring-4 ring-white/20 scale-110" : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        {localSettings.accentColor === color.value && <Check size={20} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-gray-800">
                            <div>
                                <h4 className="font-medium text-white">Theme Mode</h4>
                                <p className="text-xs text-muted">Toggle between dark and light</p>
                            </div>
                            <select
                                value={localSettings.theme}
                                onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value })}
                                className="bg-surface border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                    </div>

                    <Button onClick={() => handleSave('ui')} className="mt-8 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save UI Preferences
                    </Button>
                </Card>

                {/* 3. Display Modules */}
                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                            <LayoutIcon size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Dashboard Layout</h3>
                    </div>

                    <div className="space-y-3 flex-1">
                        {[
                            { id: 'showHabits', label: 'Habits Module', desc: 'Display progress on your habits' },
                            { id: 'showTasks', label: 'Tasks Module', desc: 'Display your pending tasks' },
                            { id: 'showLearning', label: 'Learning Module', desc: 'Display tracker for learning' },
                            { id: 'showActivity', label: 'Activity Log', desc: 'Display recent user logs' }
                        ].map((module) => (
                            <div key={module.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => setLocalSettings({
                                    ...localSettings,
                                    [module.id]: !localSettings[module.id]
                                })}
                            >
                                <div>
                                    <h4 className="text-sm font-medium text-white">{module.label}</h4>
                                    <p className="text-[11px] text-muted">{module.desc}</p>
                                </div>
                                <div className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                                    localSettings[module.id] ? "bg-primary" : "bg-gray-700"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                        localSettings[module.id] ? "left-6" : "left-1"
                                    )}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={() => handleSave('ui')} className="mt-8 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save Layout
                    </Button>
                </Card>

                {/* 4. Notifications */}
                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Notifications</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">Overdue Task Alerts</h4>
                            <input
                                type="checkbox"
                                checked={localSettings.overdueAlerts}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    overdueAlerts: e.target.checked
                                })}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">Low Progress Alerts</h4>
                            <input
                                type="checkbox"
                                checked={localSettings.lowProgressAlerts}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    lowProgressAlerts: e.target.checked
                                })}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted">Progress Threshold</span>
                                <span className="text-white font-mono">{localSettings.lowProgressThreshold}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                step="5"
                                value={localSettings.lowProgressThreshold}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    lowProgressThreshold: parseInt(e.target.value)
                                })}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    <Button onClick={() => handleSave('notifications')} className="mt-8 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save Alerts
                    </Button>
                </Card>

                {/* 5. Data Management */}
                <Card className="md:col-span-2 border-red-900/30 bg-red-900/5">
                    <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                        <Trash2 size={24} />
                        Data Management
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button
                            onClick={exportData}
                            className="bg-background border border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-white flex items-center justify-center gap-2 py-4 rounded-xl transition-all"
                        >
                            <Download size={18} />
                            Export Data
                        </Button>

                        <Button
                            onClick={clearActivityLog}
                            className="bg-background border border-gray-800 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-white flex items-center justify-center gap-2 py-4 rounded-xl transition-all"
                        >
                            <Trash2 size={18} />
                            Clear Activity Log
                        </Button>

                        <Button
                            onClick={resetData}
                            className="bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center gap-2 py-4 rounded-xl transition-all"
                        >
                            <RotateCcw size={18} />
                            Reset to Default
                        </Button>
                    </div>

                    <p className="text-[11px] text-red-400/50 mt-4 text-center italic">
                        Warning: Resetting will clear all your progress and restore the original template.
                    </p>
                </Card>
            </div>

            {/* Notification Toasts */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </MotionWrapper>
    );
}
