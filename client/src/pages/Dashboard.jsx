import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CheckCircle2, TrendingUp, BookOpen, Target, ArrowRight, AlertTriangle } from 'lucide-react';
import { format, isSameDay, parseISO, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
    const { habits, tasks, learning, settings, weeklyStats } = useData();
    const navigate = useNavigate();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // --- Scoring Logic ---
    const scores = useMemo(() => {
        const weights = {
            habits: settings?.weightsHabits || 40,
            tasks: settings?.weightsTasks || 40,
            learning: settings?.weightsLearning || 20
        };
        const learningTarget = settings?.learningDailyTargetMinutes || 60;

        const calculateScoresForDate = (dateStr) => {
            // 1. Habits Score
            const habitsTotal = habits.length;
            const habitsDone = habits.filter(h =>
                h.HabitHistories && h.HabitHistories.some(entry => entry.date === dateStr)
            ).length;
            const habitScore = habitsTotal > 0 ? (habitsDone / habitsTotal) * 100 : 0;

            // 2. Tasks Score (completedAt rule)
            const tasksTotalCount = tasks.length;
            // Sequelize DATEONLY or DATE might return ISO strings
            const tasksDoneOnDay = tasks.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length;
            const taskScore = tasksTotalCount > 0 ? (tasksDoneOnDay / tasksTotalCount) * 100 : 0;

            // 3. Learning Score (Session-based: Target is 1 session per day by default)
            const sessionsDone = learning.filter(l => l.date === dateStr).length;
            const sessionTarget = 1; // Simplified target: 1 session = 100%
            const learningScore = Math.min((sessionsDone / sessionTarget) * 100, 100);

            // 4. Daily Score (Weighted)
            const dailyScore = Math.round(
                (habitScore * (weights.habits / 100)) +
                (taskScore * (weights.tasks / 100)) +
                (learningScore * (weights.learning / 100))
            );

            return { habitScore, habitDoneCount: habitsDone, taskScore, taskDoneCount: tasksDoneOnDay, learningScore, sessionsDone, dailyScore };
        };

        const todayScores = calculateScoresForDate(todayStr);

        // Special case for today's summary display (total done tasks regardless of day)
        const totalTasksDone = tasks.filter(t => t.status === 'DONE').length;
        const totalTasksCount = tasks.length;
        const overallTaskScore = totalTasksCount > 0 ? (totalTasksDone / totalTasksCount) * 100 : 0;

        return {
            ...todayScores,
            totalTasksDone,
            totalTasksCount,
            overallTaskScore,
            calculateScoresForDate // Expose for 7-day chart
        };
    }, [habits, tasks, learning, settings, todayStr]);

    const {
        habitScore, habitDoneCount, habitsTotal,
        overallTaskScore, totalTasksDone, totalTasksCount,
        learningScore, sessionsDone,
        dailyScore, calculateScoresForDate
    } = scores;

    // --- Data for Chart - Use backend weeklyStats if available ---
    const data = useMemo(() => {
        if (weeklyStats && weeklyStats.length > 0) {
            return weeklyStats.map(s => ({
                name: format(parseISO(s.date), 'EEE'),
                ...s,
                score: Math.round(
                    (s.habits * (settings?.weightsHabits || 40)) +
                    (s.tasks * (settings?.weightsTasks || 40)) +
                    (s.learning * (settings?.weightsLearning || 20))
                )
            }));
        }

        // Fallback to local computation
        return Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(today, 6 - i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayScores = calculateScoresForDate(dateStr);
            return {
                name: format(d, 'EEE'),
                date: dateStr,
                score: dayScores.dailyScore,
                habits: Math.round(dayScores.habitScore),
                tasks: Math.round(dayScores.taskScore),
                learning: Math.round(dayScores.learningScore)
            };
        });
    }, [calculateScoresForDate, today, weeklyStats, settings]);

    const risks = useMemo(() => {
        const list = [];
        if (dailyScore < 50) list.push("Daily score is critically low.");
        const overdue = tasks.filter(t => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date(todayStr));
        if (overdue.length > 0) list.push(`${overdue.length} overdue tasks.`);
        return list;
    }, [dailyScore, tasks, todayStr]);


    return (
        <MotionWrapper className="space-y-8">

            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hello, User</h1>
                    <p className="text-muted">Here is your daily briefing.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Daily Score</span>
                    <div className={cn("text-3xl font-bold px-4 py-1 rounded-lg bg-surface border border-gray-800",
                        dailyScore >= 80 ? "text-green-400" : dailyScore >= 50 ? "text-yellow-400" : "text-red-400"
                    )}>
                        {dailyScore}
                    </div>
                </div>
            </div>

            {risks.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/20 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <AlertTriangle className="text-red-500 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-500">Attention Needed</h3>
                        <ul className="list-disc list-inside text-sm text-red-200/70">
                            {risks.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                </Card>
            )}

            {/* Main Grid: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {/* Habits Card */}
                    {settings?.showHabits !== false && (
                        <motion.div
                            key="habits-card"
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card onClick={() => navigate('/habits')} className="items-center justify-between group h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-gray-700 text-muted">
                                        {Math.round(habitScore)}%
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">Habits</h3>
                                <p className="text-muted text-sm mb-4">{habitDoneCount}/{habitsTotal} Completed</p>
                                <ProgressBar value={habitScore} colorClass="bg-blue-500" />
                            </Card>
                        </motion.div>
                    )}

                    {/* Tasks Card */}
                    {settings?.showTasks !== false && (
                        <motion.div
                            key="tasks-card"
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card onClick={() => navigate('/tasks')} className="items-center justify-between group h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                        <Target size={24} />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-gray-700 text-muted">
                                        {Math.round(overallTaskScore)}%
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">Tasks</h3>
                                <p className="text-muted text-sm mb-4">{totalTasksDone} Done / {totalTasksCount - totalTasksDone} Left</p>
                                <ProgressBar value={overallTaskScore} colorClass="bg-purple-500" />
                            </Card>
                        </motion.div>
                    )}

                    {/* Learning Card */}
                    {settings?.showLearning !== false && (
                        <motion.div
                            key="learning-card"
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card onClick={() => navigate('/learning')} className="items-center justify-between group h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-gray-700 text-muted">
                                        {Math.round(learningScore)}%
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">Learning</h3>
                                <p className="text-muted text-sm mb-4">{sessionsDone} {sessionsDone === 1 ? 'Session' : 'Sessions'} Logged</p>
                                <ProgressBar value={learningScore} colorClass="bg-orange-500" />
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Middle Section: Chart + Focus Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Weekly Chart */}
                <Card className="lg:col-span-3 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
                        <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

        </MotionWrapper>
    );
}
