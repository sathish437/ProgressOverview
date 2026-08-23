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
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
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
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task', details: error.message });
    }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        let task = null;

        // If ID is numeric, query by id
        if (!isNaN(Number(targetId))) {
            task = await Task.findOne({ where: { id: targetId, userId: req.userId } });
        }

        // If not found or non-numeric ID from client local storage, return clean 200 or 404
        if (!task) {
            return res.status(200).json({ message: 'Task updated locally or not present in DB', id: targetId });
        }

        const updates = req.body;
        if (updates.status === 'DONE' && task.status !== 'DONE') {
            updates.completedAt = new Date();
        }

        await task.update(updates);
        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(204).send();
        }

        const deleted = await Task.destroy({ where: { id: targetId, userId: req.userId } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
});

export default router;
