import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Plus, Clock, CheckCircle2, Circle, AlertCircle, ChevronRight, Edit2, Trash2, LayoutGrid, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isToday, isPast, isThisWeek, addWeeks } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

const TaskCard = React.forwardRef(({ task, updateItem, deleteItem, onEdit }, ref) => {
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'DONE';
    const isDueToday = task.dueDate && isToday(new Date(task.dueDate)) && task.status !== 'DONE';

    const cycleStatus = () => {
        const isDone = task.status === 'DONE';
        const nextStatus = isDone ? 'TODO' : 'DONE';
        const today = format(new Date(), 'yyyy-MM-dd');

        updateItem('tasks', task.id, {
            status: nextStatus,
            completedAt: nextStatus === 'DONE' ? today : null
        });
    };

    const getTimelineInfo = () => {
        if (!task.dueDate) return null;
        const date = new Date(task.dueDate);
        if (isToday(date)) return { label: 'Today', class: 'bg-amber-500/10 text-amber-500' };
        if (isThisWeek(date)) return { label: 'This Week', class: 'bg-blue-500/10 text-blue-500' };
        return { label: format(date, 'MMM d'), class: 'bg-white/5 text-muted/80' };
    };

    const timelineInfo = getTimelineInfo();

    return (
        <motion.div
            ref={ref}
            layout
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative"
        >
            <Card className="p-5 hover:border-primary/50 transition-all border-l-4 border-l-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] bg-surface/40 backdrop-blur-md group">
                <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                        "text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest",
                        task.status === 'DONE' ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted"
                    )}>
                        {task.status === 'DONE' ? 'DONE' : 'NOT DONE'}
                    </div>
                    {timelineInfo && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg",
                            timelineInfo.class
                        )}>
                            <Clock size={12} />
                            <span>{timelineInfo.label}</span>
                        </div>
                    )}
                </div>

                <h4 className={cn("text-base font-bold text-white mb-3 leading-tight group-hover:text-primary transition-colors", task.status === 'DONE' && "text-muted/60 line-through")}>
                    {task.title}
                </h4>

                {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {task.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] bg-white/5 border border-white/5 text-muted/80 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                        <button
                            onClick={cycleStatus}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                task.status === 'DONE' ? "text-green-500 bg-green-500/10" : "text-muted hover:text-white hover:bg-white/10"
                            )}
                        >
                            {task.status === 'DONE' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <button
                            onClick={onEdit}
                            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => deleteItem('tasks', task.id)}
                        className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </Card>
        </motion.div>
    );
});

export default function Tasks() {
    const { tasks, addItem, updateItem, deleteItem } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH, LATER, DONE, NOT_DONE
    const [activeLane, setActiveLane] = useState('HIGH');

    // Modal State
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', priority: 'MED', dueDate: format(new Date(), 'yyyy-MM-dd'), timeline: 'TODAY' });

    const stats = useMemo(() => ({
        total: tasks.length,
        done: tasks.filter(t => t.status === 'DONE').length,
        notDone: tasks.filter(t => t.status !== 'DONE').length
    }), [tasks]);

    const filteredTasksByTime = useMemo(() => {
        return tasks.filter(t => {
            if (timeFilter === 'ALL') return true;
            if (timeFilter === 'DONE') return t.status === 'DONE';
            if (timeFilter === 'NOT_DONE') return t.status !== 'DONE';
            if (!t.dueDate) return timeFilter === 'LATER';

            const date = new Date(t.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDate = new Date(date);
            taskDate.setHours(0, 0, 0, 0);

            if (timeFilter === 'TODAY') return taskDate <= today;
            if (timeFilter === 'WEEK') return taskDate > today && taskDate <= addWeeks(today, 1);
            if (timeFilter === 'MONTH') return taskDate > addWeeks(today, 1) && taskDate <= addWeeks(today, 4);
            if (timeFilter === 'LATER') return taskDate > addWeeks(today, 4);
            return true;
        }).sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }, [tasks, timeFilter]);

    const mapTimelineToDate = (timeline) => {
        const today = new Date();
        if (timeline === 'TODAY') return format(today, 'yyyy-MM-dd');
        if (timeline === 'THIS_WEEK') return format(new Date(today.setDate(today.getDate() + 3)), 'yyyy-MM-dd');
        if (timeline === 'THIS_MONTH') return format(new Date(today.setDate(today.getDate() + 15)), 'yyyy-MM-dd');
        if (timeline === 'LATER') return format(new Date(today.setDate(today.getDate() + 60)), 'yyyy-MM-dd');
        return format(new Date(), 'yyyy-MM-dd');
    };

    const mapDateToTimeline = (dateStr) => {
        if (!dateStr) return 'LATER';
        const date = new Date(dateStr);
        if (isToday(date) || isPast(date)) return 'TODAY';
        if (isThisWeek(date)) return 'THIS_WEEK';
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        if (date <= nextMonth) return 'THIS_MONTH';
        return 'LATER';
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const taskData = { ...newTask };
        delete taskData.timeline; // Backend doesn't know about 'timeline'

        if (editingTask) {
            updateItem('tasks', editingTask.id, taskData);
            setEditingTask(null);
        } else {
            addItem('tasks', { ...taskData, status: 'TODO', tags: [] });
        }
        setNewTask({ title: '', priority: 'MED', dueDate: format(new Date(), 'yyyy-MM-dd'), timeline: 'TODAY' });
        setIsModalOpen(false);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate || format(new Date(), 'yyyy-MM-dd'),
            timeline: mapDateToTimeline(task.dueDate)
        });
        setIsModalOpen(true);
    };

    const priorities = [
        { id: 'HIGH', label: 'High Priority', color: 'text-red-400', border: 'border-red-500/20' },
        { id: 'MED', label: 'Medium', color: 'text-amber-400', border: 'border-amber-500/20' },
        { id: 'LOW', label: 'Low', color: 'text-green-400', border: 'border-green-500/20' }
    ];

    return (
        <MotionWrapper className="space-y-6">
            {/* Top Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: LayoutGrid, color: 'text-primary' },
                    { label: 'Not Done', value: stats.notDone, icon: Circle, color: 'text-amber-400' },
                    { label: 'Done', value: stats.done, icon: CheckCircle2, color: 'text-green-400' }
                ].map((stat, i) => (
                    <Card key={i} className="flex items-center gap-4 p-4 bg-surface/30 border-white/5">
                        <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted uppercase font-bold tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Header & Filter Strip */}
            <div className="flex flex-col gap-6 bg-surface/20 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Focus Lane</h2>
                        <p className="text-xs text-muted">Filter tasks by timeline or manage priorities.</p>
                    </div>
                    <Button
                        onClick={() => { setEditingTask(null); setNewTask({ title: '', priority: 'MED', dueDate: '' }); setIsModalOpen(true); }}
                        className="bg-primary hover:bg-blue-600 text-white rounded-xl"
                    >
                        <Plus size={18} className="mr-2" /> New Task
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-muted uppercase font-bold mr-4 flex items-center gap-1.5">
                        <Calendar size={14} className="text-primary" /> Multi Filter
                    </span>
                    {[
                        { id: 'ALL', label: 'All' },
                        { id: 'TODAY', label: 'Today' },
                        { id: 'WEEK', label: 'Week' },
                        { id: 'MONTH', label: 'Month' },
                        { id: 'LATER', label: 'Later' },
                        { id: 'NOT_DONE', label: 'Not Done' },
                        { id: 'DONE', label: 'Done' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setTimeFilter(f.id)}
                            className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold transition-all border border-transparent",
                                timeFilter === f.id
                                    ? "bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    : "bg-white/5 text-muted hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Priority Lanes */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                {priorities.map(lane => (
                    <div key={lane.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h3 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", lane.color)}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", lane.id === 'HIGH' ? "bg-red-500" : lane.id === 'MED' ? "bg-amber-500" : "bg-green-500")} />
                                {lane.label}
                            </h3>
                            <span className="text-[10px] bg-white/5 text-muted px-2 py-0.5 rounded-full">
                                {filteredTasksByTime.filter(t => t.priority === lane.id).length}
                            </span>
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            <AnimatePresence mode="popLayout">
                                {filteredTasksByTime
                                    .filter(t => t.priority === lane.id)
                                    .map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            updateItem={updateItem}
                                            deleteItem={deleteItem}
                                            onEdit={() => openEdit(task)}
                                        />
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Tabbed Lanes */}
            <div className="lg:hidden">
                <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                    {priorities.map(lane => (
                        <button
                            key={lane.id}
                            onClick={() => setActiveLane(lane.id)}
                            className={cn(
                                "flex-1 py-3 text-xs font-bold rounded-lg transition-all",
                                activeLane === lane.id ? "bg-surface text-white shadow-xl" : "text-muted"
                            )}
                        >
                            {lane.id}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 min-h-[300px]">
                    <AnimatePresence mode="popLayout">
                        {filteredTasksByTime
                            .filter(t => t.priority === activeLane)
                            .map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    updateItem={updateItem}
                                    deleteItem={deleteItem}
                                    onEdit={() => openEdit(task)}
                                />
                            ))}
                    </AnimatePresence>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} title={editingTask ? "Edit Task" : "Create New Task"}>
                <form onSubmit={handleAdd} className="space-y-5">
                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1.5 tracking-wider">Task Title</label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            placeholder="e.g., Complete project report"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1.5 tracking-wider">Timeline</label>
                            <select
                                value={newTask.timeline}
                                onChange={e => {
                                    const timeline = e.target.value;
                                    setNewTask({
                                        ...newTask,
                                        timeline,
                                        dueDate: mapTimelineToDate(timeline)
                                    });
                                }}
                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all appearance-none"
                            >
                                <option value="TODAY">Today</option>
                                <option value="THIS_WEEK">This Week</option>
                                <option value="THIS_MONTH">This Month</option>
                                <option value="LATER">Later</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1.5 tracking-wider">Priority</label>
                            <select
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all appearance-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="MED">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1.5 tracking-wider">Exact Due Date (Optional)</label>
                        <input
                            type="date"
                            value={newTask.dueDate}
                            onChange={e => {
                                const date = e.target.value;
                                setNewTask({
                                    ...newTask,
                                    dueDate: date,
                                    timeline: mapDateToTimeline(date)
                                });
                            }}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        {editingTask ? "Save Changes" : "Create Task"}
                    </button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
