import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { BookOpen, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function Learning() {
    const { learning, addItem, deleteItem } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({ topic: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') });

    const handleAdd = (e) => {
        e.preventDefault();
        addItem('learning', newSession);
        setNewSession({ topic: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') });
        setIsModalOpen(false);
    };

    // Sort by date desc
    const sortedLearning = [...learning].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <MotionWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Learning Log</h1>
                    <p className="text-muted">Keep track of your study sessions.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    <span>Log Session</span>
                </Button>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {sortedLearning.map(item => (
                        <Card
                            key={item.id}
                            className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-gray-700 transition-colors"
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.topic}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted mt-1">
                                        <div className="flex items-center gap-1">
                                            <BookOpen size={14} />
                                            <span>Session</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                    {item.notes && <p className="text-sm text-gray-500 mt-2 italic">"{item.notes}"</p>}
                                </div>
                            </div>
                            <button
                                onClick={() => confirm('Delete entry?') && deleteItem('learning', item.id)}
                                className="text-gray-600 hover:text-red-400 p-2 md:self-center self-end"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Card>
                    ))}
                </AnimatePresence>

                {learning.length === 0 && (
                    <div className="text-center py-12 text-muted">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No learning sessions logged yet. Start today!</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Learning Session">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">Topic</label>
                        <input
                            autoFocus
                            type="text"
                            required
                            value={newSession.topic}
                            onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
                            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="e.g., Advanced React Hooks"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={newSession.date}
                                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-muted mb-1">Notes (Optional)</label>
                        <textarea
                            rows={3}
                            value={newSession.notes}
                            onChange={e => setNewSession({ ...newSession, notes: e.target.value })}
                            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Key takeaways..."
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium mt-4">
                        Save Log
                    </Button>
                </form>
            </Modal>
        </MotionWrapper>
    );
}
