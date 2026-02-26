import express from 'express';
import { Task } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        const where = { userId: req.userId };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }

        const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const newTask = await Task.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const updates = req.body;
        if (updates.status === 'DONE' && task.status !== 'DONE') {
            updates.completedAt = new Date();
        }

        await task.update(updates);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Task.destroy({ where: { id: req.params.id, userId: req.userId } });
        if (!deleted) return res.status(404).json({ error: 'Task not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;
