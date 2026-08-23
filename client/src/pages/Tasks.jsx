import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
    Plus,
    Clock,
    CheckCircle2,
    Circle,
    Edit2,
    Trash2,
    Calendar,
    Kanban as KanbanIcon,
    List,
    GripVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isThisWeek } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

const KANBAN_COLUMNS = [
    { id: 'TODO', label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'REVIEW', label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'DONE', label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
];

const TaskCard = React.forwardRef(({ task, updateItem, deleteItem, onEdit, onDragStart, onDragEnd, isBeingDragged }, ref) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'DONE';
    const isDueToday = task.dueDate && task.dueDate === todayStr && task.status !== 'DONE';

    const cycleStatus = (e) => {
        e.stopPropagation();
        const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        updateItem('tasks', task.id, {
            status: nextStatus,
            completedAt: nextStatus === 'DONE' ? todayStr : null
        });
    };

    const handleQuickMove = (e, newStatus) => {
        e.stopPropagation();
        updateItem('tasks', task.id, {
            status: newStatus,
            completedAt: newStatus === 'DONE' ? todayStr : null
        });
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'HIGH':
                return { label: 'High', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
            case 'MED':
                return { label: 'Med', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
            case 'LOW':
            default:
                return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        }
    };

    const prio = getPriorityBadge(task.priority);

    return (
        <div
            ref={ref}
            draggable="true"
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragEnd={onDragEnd}
            className={cn(
                "group relative cursor-grab active:cursor-grabbing select-none transition-all duration-200",
                isBeingDragged && "opacity-40 scale-95"
            )}
        >
            <Card className={cn(
                "p-3.5 sm:p-4 transition-all duration-200 bg-[#1A1A20]/95 backdrop-blur-md border border-white/5 hover:border-white/20 shadow-md",
                task.status === 'DONE' && "opacity-75 bg-[#141418]",
                isOverdue && "border-red-500/40 bg-red-500/[0.03]"
            )}>
                {/* Header: Priority & Due Date */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className={cn("text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border", prio.color)}>
                        {prio.label}
                    </span>

                    {task.dueDate && (
                        <div className={cn(
                            "flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-lg border",
                            isOverdue
                                ? "bg-red-500/15 text-red-400 border-red-500/30 font-bold animate-pulse"
                                : isDueToday
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-white/5 text-muted border-white/5"
                        )}>
                            <Clock size={10} />
                            <span>{isOverdue ? `Overdue: ${task.dueDate}` : isDueToday ? 'Today' : task.dueDate}</span>
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <h4 className={cn(
                    "text-xs sm:text-sm font-bold text-white mb-1 leading-snug group-hover:text-primary transition-colors",
                    task.status === 'DONE' && "line-through text-muted/60"
                )}>
                    {task.title}
                </h4>

                {task.description && (
                    <p className="text-[11px] sm:text-xs text-muted line-clamp-2 mb-2.5 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                        {task.tags.map((tag, i) => (
                            <span key={i} className="text-[8px] sm:text-[9px] font-medium bg-white/5 text-muted/90 px-1.5 py-0.5 rounded-md border border-white/5">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Quick Status Move Strip */}
                <div className="flex items-center gap-1 mb-2 pt-2 border-t border-white/5 overflow-x-auto">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-muted/60 mr-0.5 shrink-0">Move:</span>
                    {KANBAN_COLUMNS.map(col => {
                        if (col.id === task.status) return null;
                        return (
                            <button
                                key={col.id}
                                onClick={(e) => handleQuickMove(e, col.id)}
                                title={`Move to ${col.label}`}
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border transition-colors whitespace-nowrap shrink-0",
                                    col.bg, col.color, col.border, "hover:brightness-125"
                                )}
                            >
                                → {col.label}
                            </button>
                        );
                    })}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={cycleStatus}
                            title={task.status === 'DONE' ? "Mark as Incomplete" : "Mark as Done"}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                task.status === 'DONE' ? "text-emerald-400 bg-emerald-500/10" : "text-muted hover:text-white hover:bg-white/5"
                            )}
                        >
                            {task.status === 'DONE' ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            title="Edit Task"
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Edit2 size={13} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete this task?")) deleteItem('tasks', task.id);
                            }}
                            title="Delete Task"
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                            <Trash2 size={13} />
                        </button>
                        <div className="p-1 text-muted/40 group-hover:text-muted cursor-grab">
                            <GripVertical size={13} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
});

export default function Tasks() {
    const { tasks, addItem, updateItem, deleteItem } = useData();
    const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN', 'TIMELINE'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [timeFilter, setTimeFilter] = useState('ALL');
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const draggedTaskIdRef = useRef(null);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MED',
        status: 'TODO',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        tagsInput: ''
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Stats
    const stats = useMemo(() => ({
        total: tasks.length,
        todo: tasks.filter(t => (t.status || 'TODO') === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        review: tasks.filter(t => t.status === 'REVIEW').length,
        done: tasks.filter(t => t.status === 'DONE').length,
        overdue: tasks.filter(t => t.dueDate && t.status !== 'DONE' && t.dueDate < todayStr).length
    }), [tasks, todayStr]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (timeFilter === 'ALL') return true;
            if (timeFilter === 'DONE') return t.status === 'DONE';
            if (timeFilter === 'OVERDUE') return t.dueDate && t.dueDate < todayStr && t.status !== 'DONE';
            if (timeFilter === 'TODAY') return t.dueDate === todayStr;
            if (timeFilter === 'WEEK') {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return isThisWeek(d);
            }
            return true;
        });
    }, [tasks, timeFilter, todayStr]);

    // Drag and Drop handlers
    const handleDragStart = (e, taskId) => {
        draggedTaskIdRef.current = taskId;
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', String(taskId));
        e.dataTransfer.setData('taskId', String(taskId));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
        draggedTaskIdRef.current = null;
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDragEnter = (e, columnId) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = (e, columnId) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        if (dragOverColumn === columnId) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverColumn(null);

        const rawTaskId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('taskId') || draggedTaskIdRef.current || draggedTaskId;
        if (!rawTaskId) return;

        const matchedTask = tasks.find(t => String(t.id) === String(rawTaskId) || t.id === rawTaskId);
        const finalId = matchedTask ? matchedTask.id : rawTaskId;

        updateItem('tasks', finalId, {
            status: columnId,
            completedAt: columnId === 'DONE' ? todayStr : null
        });

        setDraggedTaskId(null);
        draggedTaskIdRef.current = null;
    };

    // Modal Handlers
    const openCreateModal = (defaultStatus = 'TODO') => {
        setEditingTask(null);
        setNewTask({
            title: '',
            description: '',
            priority: 'MED',
            status: defaultStatus,
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            tagsInput: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'MED',
            status: task.status || 'TODO',
            dueDate: task.dueDate || format(new Date(), 'yyyy-MM-dd'),
            tagsInput: (task.tags || []).join(', ')
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        const tags = newTask.tagsInput
            ? newTask.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
            : [];

        const taskPayload = {
            title: newTask.title.trim(),
            description: newTask.description.trim(),
            priority: newTask.priority,
            status: newTask.status,
            dueDate: newTask.dueDate || null,
            completedAt: newTask.status === 'DONE' ? (editingTask?.completedAt || todayStr) : null,
            tags
        };

        if (editingTask) {
            updateItem('tasks', editingTask.id, taskPayload);
        } else {
            addItem('tasks', taskPayload);
        }

        setIsModalOpen(false);
    };

    return (
        <MotionWrapper className="space-y-4 sm:space-y-6 pb-12">
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {[
                    { label: 'Total Tasks', value: stats.total, color: 'text-white' },
                    { label: 'To Do', value: stats.todo, color: 'text-slate-400' },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-400' },
                    { label: 'In Review', value: stats.review, color: 'text-amber-400' },
                    { label: 'Completed', value: stats.done, color: 'text-emerald-400' },
                    { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? 'text-red-400 animate-pulse' : 'text-muted' }
                ].map((s, i) => (
                    <Card key={i} className="p-3 bg-[#17171C]/90 border-white/5 text-center">
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-muted tracking-wider mb-0.5">{s.label}</p>
                        <p className={cn("text-lg sm:text-xl font-mono font-extrabold", s.color)}>{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Header & Controls Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#17171C]/90 border border-white/5">
                <div className="space-y-0.5">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <KanbanIcon size={18} className="text-primary" />
                        <span>Task Management & Kanban Board</span>
                    </h2>
                    <p className="text-xs text-muted">
                        Drag and drop cards across columns or use quick buttons to update workflow status.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 flex-1 sm:flex-none">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={cn(
                                "flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                viewMode === 'KANBAN' ? "bg-primary text-white shadow-md" : "text-muted hover:text-white"
                            )}
                        >
                            <KanbanIcon size={13} /> Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('TIMELINE')}
                            className={cn(
                                "flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                viewMode === 'TIMELINE' ? "bg-primary text-white shadow-md" : "text-muted hover:text-white"
                            )}
                        >
                            <List size={13} /> List
                        </button>
                    </div>

                    <Button
                        onClick={() => openCreateModal('TODO')}
                        className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5"
                    >
                        <Plus size={15} /> Add Task
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted tracking-wider mr-1 flex items-center gap-1 shrink-0">
                    <Calendar size={12} className="text-primary" /> Filter:
                </span>
                {[
                    { id: 'ALL', label: 'All Tasks' },
                    { id: 'TODAY', label: 'Due Today' },
                    { id: 'WEEK', label: 'This Week' },
                    { id: 'OVERDUE', label: `Overdue (${stats.overdue})` },
                    { id: 'DONE', label: 'Completed' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setTimeFilter(f.id)}
                        className={cn(
                            "px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 whitespace-nowrap",
                            timeFilter === f.id
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                : "bg-white/[0.03] text-muted border-white/5 hover:border-white/20 hover:text-white"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* KANBAN BOARD VIEW */}
            {viewMode === 'KANBAN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {KANBAN_COLUMNS.map((col) => {
                        const columnTasks = filteredTasks.filter(t => (t.status || 'TODO') === col.id);
                        const isOver = dragOverColumn === col.id;

                        return (
                            <div
                                key={col.id}
                                onDragOver={(e) => handleDragOver(e, col.id)}
                                onDragEnter={(e) => handleDragEnter(e, col.id)}
                                onDragLeave={(e) => handleDragLeave(e, col.id)}
                                onDrop={(e) => handleDrop(e, col.id)}
                                className={cn(
                                    "flex flex-col rounded-2xl bg-[#141418] border p-3.5 sm:p-4 transition-all min-h-[400px] sm:min-h-[500px]",
                                    isOver
                                        ? "border-primary ring-2 ring-primary/30 bg-primary/[0.05] shadow-lg shadow-primary/10"
                                        : "border-white/5"
                                )}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-extrabold uppercase tracking-wider", col.color)}>
                                            {col.label}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted">
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openCreateModal(col.id)}
                                        title={`Add task to ${col.label}`}
                                        className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>

                                {/* Task Cards List */}
                                <div className="space-y-2.5 flex-1">
                                    <AnimatePresence mode="popLayout">
                                        {columnTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                updateItem={updateItem}
                                                deleteItem={deleteItem}
                                                onEdit={() => openEditModal(task)}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                isBeingDragged={draggedTaskId === task.id}
                                            />
                                        ))}
                                    </AnimatePresence>

                                    {/* Drop Zone Indicator */}
                                    {isOver && (
                                        <div className="border-2 border-dashed border-primary/50 bg-primary/10 rounded-xl p-3.5 text-center animate-pulse">
                                            <p className="text-xs font-bold text-primary">Drop to move to {col.label}</p>
                                        </div>
                                    )}

                                    {columnTasks.length === 0 && !isOver && (
                                        <div className="h-28 sm:h-36 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-3">
                                            <KanbanIcon size={20} className="text-muted/20 mb-1" />
                                            <p className="text-xs text-muted/60 font-medium">Drag tasks here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TIMELINE / LIST VIEW */}
            {viewMode === 'TIMELINE' && (
                <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                updateItem={updateItem}
                                deleteItem={deleteItem}
                                onEdit={() => openEditModal(task)}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                isBeingDragged={draggedTaskId === task.id}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredTasks.length === 0 && (
                        <div className="text-center py-12 text-muted">
                            <List size={36} className="mx-auto mb-2 opacity-20" />
                            <p className="text-xs sm:text-sm font-medium">No tasks found matching current filter.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Task Creation & Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
                title={editingTask ? "Edit Task" : "Create New Task"}
            >
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Task Title *
                        </label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Implement dark mode color palette"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={newTask.description}
                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            placeholder="Add helpful details, subtasks, or links..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Workflow Status
                            </label>
                            <select
                                value={newTask.status}
                                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Priority Level
                            </label>
                            <select
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-medium"
                            >
                                <option value="HIGH">High Priority</option>
                                <option value="MED">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={newTask.dueDate}
                                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">
                                Tags (Comma separated)
                            </label>
                            <input
                                type="text"
                                value={newTask.tagsInput}
                                onChange={e => setNewTask({ ...newTask, tagsInput: e.target.value })}
                                placeholder="Dev, UI, Core"
                                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-bold mt-2 shadow-lg shadow-primary/20 transition-all text-xs"
                    >
                        {editingTask ? "Save Changes" : "Create Task"}
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
