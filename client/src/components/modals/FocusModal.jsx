import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Play, Pause, Square, CheckCircle2, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';

export function FocusModal({ isOpen, onClose }) {
    const { addItem, tasks, updateItem } = useData();
    const [duration, setDuration] = useState(25); // minutes
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('SETUP'); // SETUP, RUNNING, FINISHED
    const [logType, setLogType] = useState('LEARNING'); // LEARNING or TASK
    const [logDetails, setLogDetails] = useState({ topic: '', notes: '', taskId: '' });

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setMode('FINISHED');
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'); // Simple sound? Browser might block.
            audio.play().catch(() => { });
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleStart = () => {
        setTimeLeft(duration * 60);
        setMode('RUNNING');
        setIsActive(true);
    };

    const handleStop = () => {
        setIsActive(false);
        setMode('SETUP');
    };

    const handleComplete = () => {
        if (logType === 'LEARNING') {
            addItem('learning', {
                topic: logDetails.topic || 'Focus Session',
                minutes: duration,
                date: format(new Date(), 'yyyy-MM-dd'),
                notes: logDetails.notes
            });
        } else if (logType === 'TASK' && logDetails.taskId) {
            updateItem('tasks', logDetails.taskId, { status: 'DONE' });
        }
        onClose();
        setMode('SETUP');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const eligibleTasks = tasks.filter(t => t.status !== 'DONE');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Smart Focus Mode">
            {mode === 'SETUP' && (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setDuration(25)}
                            className={`px-6 py-4 rounded-xl border-2 ${duration === 25 ? 'border-primary bg-primary/20 text-white' : 'border-gray-700 text-muted hover:border-gray-600'}`}
                        >
                            <span className="text-2xl font-bold block">25</span>
                            <span className="text-xs uppercase">Minutes</span>
                        </button>
                        <button
                            onClick={() => setDuration(50)}
                            className={`px-6 py-4 rounded-xl border-2 ${duration === 50 ? 'border-primary bg-primary/20 text-white' : 'border-gray-700 text-muted hover:border-gray-600'}`}
                        >
                            <span className="text-2xl font-bold block">50</span>
                            <span className="text-xs uppercase">Minutes</span>
                        </button>
                    </div>
                    <button onClick={handleStart} className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                        <Play size={20} fill="currentColor" />
                        Start Focus
                    </button>
                </div>
            )}

            {mode === 'RUNNING' && (
                <div className="text-center space-y-8 py-8">
                    <div className="text-7xl font-mono font-bold text-white tracking-widest">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setIsActive(!isActive)} className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700">
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={handleStop} className="p-4 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20">
                            <Square size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-muted animate-pulse">Stay focused. You got this.</p>
                </div>
            )}

            {mode === 'FINISHED' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Session Complete!</h3>
                        <p className="text-muted">What did you accomplish?</p>
                    </div>

                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                        <button
                            onClick={() => setLogType('LEARNING')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${logType === 'LEARNING' ? 'bg-gray-800 text-white shadow' : 'text-muted hover:text-gray-300'}`}
                        >
                            I Learned Something
                        </button>
                        <button
                            onClick={() => setLogType('TASK')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${logType === 'TASK' ? 'bg-gray-800 text-white shadow' : 'text-muted hover:text-gray-300'}`}
                        >
                            I Finished a Task
                        </button>
                    </div>

                    {logType === 'LEARNING' ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Topic (e.g., React Context)"
                                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white"
                                value={logDetails.topic}
                                onChange={e => setLogDetails({ ...logDetails, topic: e.target.value })}
                            />
                            <textarea
                                rows={2}
                                placeholder="Any notes?"
                                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white"
                                value={logDetails.notes}
                                onChange={e => setLogDetails({ ...logDetails, notes: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <select
                                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white"
                                value={logDetails.taskId}
                                onChange={e => setLogDetails({ ...logDetails, taskId: e.target.value })}
                            >
                                <option value="">Select a task...</option>
                                {eligibleTasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                            {eligibleTasks.length === 0 && <p className="text-xs text-orange-400">No active tasks found!</p>}
                        </div>
                    )}

                    <button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
                        Log Progress
                    </button>
                </div>
            )}
        </Modal>
    );
}
