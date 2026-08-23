import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
    CheckCircle2,
    TrendingUp,
    BookOpen,
    Target,
    ListTodo,
    Flame,
    AlertTriangle,
    ArrowRight,
    Play,
    Sparkles
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { FocusModal } from '../components/modals/FocusModal';

export default function Dashboard() {
    const { habits, tasks, learning, goals, settings, checkHabit } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [chartMetric, setChartMetric] = useState('score'); // 'score', 'habits', 'tasks', 'learning'

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // --- Daily Performance Scoring Engine ---
    const scores = useMemo(() => {
        const weights = {
            habits: Number(settings?.weightsHabits ?? 40),
            tasks: Number(settings?.weightsTasks ?? 40),
            learning: Number(settings?.weightsLearning ?? 20)
        };

        const calculateScoresForDate = (dateStr) => {
            // 1. Habits Score
            const habitsTotal = (habits || []).length;
            const habitsDone = (habits || []).filter(h =>
                (h.history || []).some(entry => entry.date === dateStr)
            ).length;
            const habitScore = habitsTotal > 0 ? (habitsDone / habitsTotal) * 100 : 0;

            // 2. Tasks Score
            const tasksTotalCount = (tasks || []).length;
            const tasksDoneOnDay = (tasks || []).filter(t =>
                t.status === 'DONE' && (t.completedAt ? t.completedAt.startsWith(dateStr) : true)
            ).length;
            const taskScore = tasksTotalCount > 0 ? (tasksDoneOnDay / tasksTotalCount) * 100 : 0;

            // 3. Learning Score
            const sessionsDone = (learning || []).filter(l => l.date === dateStr).length;
            const minutesDone = (learning || []).filter(l => l.date === dateStr).reduce((sum, l) => sum + (Number(l.minutes) || 30), 0);
            const targetMins = settings?.learningDailyTargetMinutes || 45;
            const learningScore = Math.min((minutesDone / targetMins) * 100, 100);

            // 4. Daily Weighted Score
            const totalWeight = (weights.habits + weights.tasks + weights.learning) || 100;
            const dailyScore = Math.round(
                ((habitScore * weights.habits) +
                (taskScore * weights.tasks) +
                (learningScore * weights.learning)) / totalWeight
            );

            return {
                habitScore,
                habitDoneCount: habitsDone,
                habitsTotal,
                taskScore,
                taskDoneCount: tasksDoneOnDay,
                learningScore,
                sessionsDone,
                minutesDone,
                dailyScore
            };
        };

        const todayScores = calculateScoresForDate(todayStr);

        // Overall Task Status
        const totalTasksDone = (tasks || []).filter(t => t.status === 'DONE').length;
        const totalTasksCount = (tasks || []).length;
        const overallTaskScore = totalTasksCount > 0 ? (totalTasksDone / totalTasksCount) * 100 : 0;

        // Goals Progress
        const goalsTotalCount = (goals || []).length;
        const goalsCompletedCount = (goals || []).filter(g => g.currentValue >= g.targetValue).length;
        const goalsScore = goalsTotalCount > 0
            ? Math.round((goals || []).reduce((sum, g) => {
                const ratio = g.targetValue > 0 ? Math.min((g.currentValue || 0) / g.targetValue, 1) : 0;
                return sum + (ratio * 100);
            }, 0) / goalsTotalCount)
            : 0;

        return {
            ...todayScores,
            totalTasksDone,
            totalTasksCount,
            overallTaskScore,
            goalsScore,
            goalsCompletedCount,
            goalsTotalCount,
            calculateScoresForDate
        };
    }, [habits, tasks, learning, goals, settings, todayStr]);

    const {
        habitScore, habitDoneCount, habitsTotal,
        overallTaskScore, totalTasksDone, totalTasksCount,
        learningScore, sessionsDone, minutesDone,
        dailyScore, calculateScoresForDate,
        goalsScore, goalsCompletedCount, goalsTotalCount
    } = scores;

    // --- Chart Data (7 Days) ---
    const chartData = useMemo(() => {
        const dateRange = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

        return dateRange.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayScores = calculateScoresForDate(dateStr);
            return {
                name: format(d, 'EEE'),
                fullDate: format(d, 'MMM d'),
                score: dayScores.dailyScore,
                habits: Math.round(dayScores.habitScore),
                tasks: Math.round(dayScores.taskScore),
                learning: Math.round(dayScores.learningScore)
            };
        });
    }, [calculateScoresForDate, today]);

    // Overdue Tasks Warning
    const overdueTasks = useMemo(() => {
        return (tasks || []).filter(t => t.dueDate && t.status !== 'DONE' && t.dueDate < todayStr);
    }, [tasks, todayStr]);

    const getScoreTier = (score) => {
        if (score >= 85) return { grade: 'A+', label: 'Exceptional Flow', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (score >= 70) return { grade: 'A', label: 'Strong Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        if (score >= 50) return { grade: 'B', label: 'Steady Pace', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
        return { grade: 'C', label: 'Action Needed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    };

    const tier = getScoreTier(dailyScore);

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 md:space-y-8 pb-10">
            {/* Header Hero Section */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1E1E24] via-[#16161A] to-[#121214] p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold text-primary">
                            <Sparkles size={13} />
                            <span>Unified Productivity Dashboard</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">{user?.fullName || 'Alex'}</span> 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
                            You're currently in <strong className="text-white">{tier.label}</strong> mode with <strong className="text-white">{habitDoneCount}/{habitsTotal}</strong> habits and <strong className="text-white">{totalTasksDone}</strong> tasks completed today.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* Daily Performance Score Gauge */}
                        <div className={cn("flex items-center gap-3 sm:gap-4 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border backdrop-blur-xl shrink-0", tier.bg, tier.border)}>
                            <div className="text-center">
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted font-bold block">Daily Score</span>
                                <span className={cn("text-2xl sm:text-3xl font-black font-mono", tier.color)}>{dailyScore}%</span>
                            </div>
                            <div className="h-7 sm:h-8 w-px bg-white/10" />
                            <div>
                                <span className={cn("text-[10px] sm:text-xs font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-white/10 block mb-0.5", tier.color)}>
                                    {tier.grade} Grade
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-white/80 font-medium">{tier.label}</span>
                            </div>
                        </div>

                        {/* Focus Launcher Button */}
                        <button
                            onClick={() => setIsFocusModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 active:scale-95 transition-all"
                        >
                            <Play size={15} fill="currentColor" />
                            <span>Start Focus Mode</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overdue Tasks Alert Warning Banner */}
            {settings?.overdueAlerts !== false && overdueTasks.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-red-400">
                                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Require Attention
                            </h4>
                            <p className="text-[11px] sm:text-xs text-red-300/80">
                                Keep your momentum going by completing or rescheduling overdue action items.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/tasks')}
                        className="w-full sm:w-auto text-center px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 shrink-0"
                    >
                        View Kanban Board →
                    </button>
                </div>
            )}

            {/* Quick Habit Check-in Strip */}
            {settings?.showHabits !== false && habits.length > 0 && (
                <Card className="p-4 sm:p-5 bg-[#17171C]/90 border-white/5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                            <Flame size={16} className="text-orange-400" />
                            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Quick Habit Check-in</h3>
                        </div>
                        <button
                            onClick={() => navigate('/habits')}
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                            Manage Habits <ArrowRight size={13} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        {habits.map((habit) => {
                            const isChecked = (habit.history || []).some(h => h.date === todayStr);
                            return (
                                <div
                                    key={habit.id}
                                    onClick={() => checkHabit(habit.id, todayStr)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none",
                                        isChecked
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-white/[0.02] border-white/5 text-muted hover:border-white/20 hover:text-white"
                                    )}
                                >
                                    <div className="min-w-0 flex-1 pr-2">
                                        <p className={cn("text-xs font-bold truncate", isChecked ? "text-white line-through" : "text-white/90")}>
                                            {habit.title}
                                        </p>
                                        <span className="text-[10px] text-muted flex items-center gap-1">
                                            <Flame size={11} className={habit.streak > 0 ? "text-orange-400" : "text-muted"} />
                                            {habit.streak || 0}d streak
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                                        isChecked ? "bg-emerald-500 text-white" : "bg-white/5 border border-white/10"
                                    )}>
                                        {isChecked && <CheckCircle2 size={15} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* 4 Unified Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {/* 1. Habits Module */}
                <Card
                    onClick={() => navigate('/habits')}
                    className="p-4 sm:p-5 cursor-pointer hover:border-primary/40 hover:-translate-y-1 transition-all group bg-[#17171C]/90 border-white/5"
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <CheckCircle2 size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-blue-400">
                            {Math.round(habitScore)}%
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">Habits</h3>
                    <p className="text-[11px] sm:text-xs text-muted mb-3 sm:mb-4">{habitDoneCount} of {habitsTotal} checked in today</p>
                    <ProgressBar value={habitScore} colorClass="bg-blue-500" />
                </Card>

                {/* 2. Tasks Module */}
                <Card
                    onClick={() => navigate('/tasks')}
                    className="p-4 sm:p-5 cursor-pointer hover:border-purple-500/40 hover:-translate-y-1 transition-all group bg-[#17171C]/90 border-white/5"
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            <ListTodo size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-purple-400">
                            {Math.round(overallTaskScore)}%
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">Task Management</h3>
                    <p className="text-[11px] sm:text-xs text-muted mb-3 sm:mb-4">{totalTasksDone} Done / {totalTasksCount - totalTasksDone} Remaining</p>
                    <ProgressBar value={overallTaskScore} colorClass="bg-purple-500" />
                </Card>

                {/* 3. Goal Tracking */}
                <Card
                    onClick={() => navigate('/goals')}
                    className="p-4 sm:p-5 cursor-pointer hover:border-cyan-500/40 hover:-translate-y-1 transition-all group bg-[#17171C]/90 border-white/5"
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                            <Target size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-cyan-400">
                            {Math.round(goalsScore)}%
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">Goal Milestones</h3>
                    <p className="text-[11px] sm:text-xs text-muted mb-3 sm:mb-4">{goalsCompletedCount} of {goalsTotalCount} goals achieved</p>
                    <ProgressBar value={goalsScore} colorClass="bg-cyan-500" />
                </Card>

                {/* 4. Learning Sessions */}
                <Card
                    onClick={() => navigate('/learning')}
                    className="p-4 sm:p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-1 transition-all group bg-[#17171C]/90 border-white/5"
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-orange-400">
                            {Math.round(learningScore)}%
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">Learning & Study</h3>
                    <p className="text-[11px] sm:text-xs text-muted mb-3 sm:mb-4">{sessionsDone} session ({minutesDone}m logged)</p>
                    <ProgressBar value={learningScore} colorClass="bg-orange-500" />
                </Card>
            </div>

            {/* Weekly Productivity Trends Chart */}
            <Card className="p-4 sm:p-6 bg-[#17171C]/90 border-white/5 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={17} className="text-emerald-400" />
                            <h3 className="text-sm sm:text-base font-bold text-white">Weekly Productivity Trends</h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted mt-0.5">Historical daily score and performance metrics over 7 days.</p>
                    </div>

                    {/* Metric Selector */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-full sm:w-auto">
                        {[
                            { id: 'score', label: 'Overall Score' },
                            { id: 'habits', label: 'Habits' },
                            { id: 'tasks', label: 'Tasks' },
                            { id: 'learning', label: 'Learning' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setChartMetric(m.id)}
                                className={cn(
                                    "flex-1 sm:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center",
                                    chartMetric === m.id
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted hover:text-white"
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-56 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradientScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="gradientHabits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="gradientTasks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="gradientLearning" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#6B7280"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                stroke="#6B7280"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={v => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E1E24',
                                    borderColor: '#374151',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    fontSize: '11px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                }}
                                formatter={(value) => [`${value}%`, chartMetric.toUpperCase()]}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                            />
                            <Area
                                type="monotone"
                                dataKey={chartMetric}
                                stroke={
                                    chartMetric === 'habits' ? '#10B981' :
                                    chartMetric === 'tasks' ? '#A855F7' :
                                    chartMetric === 'learning' ? '#F97316' : '#3B82F6'
                                }
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill={
                                    chartMetric === 'habits' ? "url(#gradientHabits)" :
                                    chartMetric === 'tasks' ? "url(#gradientTasks)" :
                                    chartMetric === 'learning' ? "url(#gradientLearning)" : "url(#gradientScore)"
                                }
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <FocusModal isOpen={isFocusModalOpen} onClose={() => setIsFocusModalOpen(false)} />
        </MotionWrapper>
    );
}
