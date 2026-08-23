import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Play, Pause, RotateCcw, CheckCircle2, BookOpen, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export function FocusModal({ isOpen, onClose }) {
    const { addItem, tasks, updateItem } = useData();
    const [duration, setDuration] = useState(25); // minutes
    const [customMinutes, setCustomMinutes] = useState(30);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('SETUP'); // SETUP, RUNNING, FINISHED
    const [sessionType, setSessionType] = useState('WORK'); // WORK, BREAK
    const [logType, setLogType] = useState('LEARNING'); // LEARNING or TASK
    const [logDetails, setLogDetails] = useState({ topic: '', notes: '', taskId: '' });
    const timerRef = useRef(null);

    // Audio chime using Web Audio API
    const playChime = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) { }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsActive(false);
                        setMode('FINISHED');
                        playChime();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleSelectDuration = (mins, type = 'WORK') => {
        setDuration(mins);
        setTimeLeft(mins * 60);
        setSessionType(type);
    };

    const handleStart = () => {
        setTimeLeft(duration * 60);
        setMode('RUNNING');
        setIsActive(true);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    const handleStop = () => {
        setIsActive(false);
        setMode('SETUP');
    };

    const handleComplete = () => {
        if (logType === 'LEARNING') {
            addItem('learning', {
                topic: logDetails.topic.trim() || 'Deep Focus Learning Session',
                minutes: duration,
                date: format(new Date(), 'yyyy-MM-dd'),
                notes: logDetails.notes.trim() || `Completed ${duration} min focused study session.`
            });
        } else if (logType === 'TASK' && logDetails.taskId) {
            updateItem('tasks', logDetails.taskId, {
                status: 'DONE',
                completedAt: format(new Date(), 'yyyy-MM-dd')
            });
        }

        setMode('SETUP');
        setIsActive(false);
        setLogDetails({ topic: '', notes: '', taskId: '' });
        onClose();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalSeconds = duration * 60;
    const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
    const eligibleTasks = (tasks || []).filter(t => t.status !== 'DONE');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Focus Mode & Study Timer">
            {mode === 'SETUP' && (
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-[10px] sm:text-[11px] text-muted uppercase font-bold tracking-wider mb-1.5 sm:mb-2">
                            Select Focus Mode Preset
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                            {[
                                { label: 'Pomodoro', mins: 25, type: 'WORK', desc: 'Standard focus' },
                                { label: 'Extended', mins: 50, type: 'WORK', desc: 'Deep flow' },
                                { label: 'Short Break', mins: 5, type: 'BREAK', desc: 'Rest & hydrate' },
                                { label: 'Long Break', mins: 15, type: 'BREAK', desc: 'Refresh mind' }
                            ].map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handleSelectDuration(preset.mins, preset.type)}
                                    className={cn(
                                        "p-2.5 sm:p-3 rounded-xl border text-left transition-all",
                                        duration === preset.mins && sessionType === preset.type
                                            ? "border-primary bg-primary/10 text-white shadow-lg shadow-primary/20"
                                            : "border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-lg sm:text-xl font-bold text-white">{preset.mins}m</span>
                                        {duration === preset.mins && <Check size={13} className="text-primary" />}
                                    </div>
                                    <p className="text-[11px] sm:text-xs font-semibold text-white/90 truncate">{preset.label}</p>
                                    <p className="text-[9px] text-muted leading-tight mt-0.5">{preset.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-white">Custom Duration</span>
                            <p className="text-[9px] sm:text-[10px] text-muted">Set specific focus minutes</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={customMinutes}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setCustomMinutes(val);
                                    handleSelectDuration(val, 'WORK');
                                }}
                                className="w-14 bg-background border border-white/10 rounded-lg px-2 py-1 text-xs sm:text-sm text-center text-white focus:outline-none focus:border-primary font-bold"
                            />
                            <span className="text-xs text-muted">min</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                        <Play size={16} fill="currentColor" />
                        Start {duration} Minute Session
                    </button>
                </div>
            )}

            {mode === 'RUNNING' && (
                <div className="text-center py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Visual Countdown with Progress Bar */}
                    <div className="relative inline-flex items-center justify-center">
                        <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-white/10 flex flex-col items-center justify-center relative overflow-hidden bg-white/[0.02] shadow-2xl">
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-1000"
                                style={{ height: `${progressPercent}%` }}
                            />
                            <div className="relative z-10 px-2">
                                <p className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-widest drop-shadow-md">
                                    {formatTime(timeLeft)}
                                </p>
                                <p className="text-[10px] sm:text-xs font-semibold text-primary mt-1 uppercase tracking-wider">
                                    {sessionType === 'WORK' ? 'Deep Focus Session' : 'Resting Break'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2.5">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-blue-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/25 transition-all"
                        >
                            {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} fill="currentColor" /> Resume</>}
                        </button>
                        <button
                            onClick={handleReset}
                            title="Reset Timer"
                            className="p-2.5 rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={handleStop}
                            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-colors text-xs sm:text-sm"
                        >
                            End
                        </button>
                    </div>

                    <p className="text-[11px] sm:text-xs text-muted animate-pulse">
                        💡 Eliminate distractions and focus on your active goal.
                    </p>
                </div>
            )}

            {mode === 'FINISHED' && (
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2.5 border border-emerald-500/30">
                            <CheckCircle2 size={26} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white">Focus Session Complete! 🎉</h3>
                        <p className="text-[11px] sm:text-xs text-muted mt-0.5">Log this progress toward your daily performance score.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                        <button
                            onClick={() => setLogType('LEARNING')}
                            className={cn(
                                "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                                logType === 'LEARNING' ? "bg-primary text-white shadow-md" : "text-muted hover:text-white"
                            )}
                        >
                            <BookOpen size={14} /> Log Learning
                        </button>
                        <button
                            onClick={() => setLogType('TASK')}
                            className={cn(
                                "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                                logType === 'TASK' ? "bg-primary text-white shadow-md" : "text-muted hover:text-white"
                            )}
                        >
                            <CheckCircle2 size={14} /> Complete Task
                        </button>
                    </div>

                    {logType === 'LEARNING' ? (
                        <div className="space-y-2.5">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Topic / Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g., React Concurrent Rendering & Profiling"
                                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                                    value={logDetails.topic}
                                    onChange={e => setLogDetails({ ...logDetails, topic: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Notes / Key Takeaway</label>
                                <textarea
                                    rows={2}
                                    placeholder="Key concepts or insights gained..."
                                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                                    value={logDetails.notes}
                                    onChange={e => setLogDetails({ ...logDetails, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <label className="block text-[10px] uppercase font-bold text-muted mb-1">Select Completed Task</label>
                            <select
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                                value={logDetails.taskId}
                                onChange={e => setLogDetails({ ...logDetails, taskId: e.target.value })}
                            >
                                <option value="">Choose a task...</option>
                                {eligibleTasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                            {eligibleTasks.length === 0 && (
                                <p className="text-xs text-amber-400">All tasks are currently completed!</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleComplete}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                        Save & Update Daily Progress
                    </button>
                </div>
            )}
        </Modal>
    );
}
