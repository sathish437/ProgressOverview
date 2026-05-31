import express from 'express';
import { Goal, Milestone } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const router = express.Router();

console.log('--- DBG: goals.js router initialized ---');

// GET /api/goals
router.get('/', async (req, res) => {
    console.log('--- DBG: GET /api/goals hit ---');
    try {
        const goals = await Goal.findAll({
            where: { userId: req.userId },
            include: [{ model: Milestone, as: 'milestones' }]
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals
router.post('/', async (req, res) => {
    try {
        const newGoal = await Goal.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PATCH /api/goals/:id
router.patch('/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.userId },
            include: [{ model: Milestone, as: 'milestones' }],
            transaction
        });

        if (!goal) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Goal not found' });
        }

        const { title, targetValue, currentValue, milestones } = req.body;
        const goalUpdates = {};
        if (title !== undefined) goalUpdates.title = title;
        if (targetValue !== undefined) goalUpdates.targetValue = targetValue;
        if (currentValue !== undefined) goalUpdates.currentValue = currentValue;
        if (Object.keys(goalUpdates).length > 0) {
            await goal.update(goalUpdates, { transaction });
        }

        if (milestones !== undefined) {
            if (!Array.isArray(milestones)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Milestones must be an array.' });
            }

            const parseId = (id) => {
                if (typeof id === 'number' && Number.isInteger(id)) return id;
                if (typeof id === 'string' && /^\d+$/.test(id)) return parseInt(id, 10);
                return null;
            };

            const parseValue = (value) => {
                const parsed = Number(value);
                if (!Number.isFinite(parsed)) return 0;
                return Math.round(parsed);
            };

            const parseDone = (done) => {
                return done === true || done === 'true' || done === 1 || done === '1';
            };

            const parseCompletedAt = (completedAt) => {
                if (!completedAt) return null;
                const parsedDate = new Date(completedAt);
                return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
            };

            const normalizeMilestone = (m) => ({
                id: parseId(m.id),
                title: typeof m.title === 'string' ? m.title.trim() : null,
                value: parseValue(m.value),
                done: parseDone(m.done),
                completedAt: parseCompletedAt(m.completedAt)
            });

            const incoming = milestones.map(normalizeMilestone);

            const invalidMilestone = incoming.find((m) => !m.title);
            if (invalidMilestone) {
                await transaction.rollback();
                return res.status(400).json({ error: 'All milestones require a title.' });
            }

            const incomingIds = incoming
                .filter((m) => m.id !== null)
                .map((m) => m.id);

            console.log('GOAL PATCH DETAILS:', {
                goalId: goal.id,
                incomingMilestoneCount: incoming.length,
                existingMilestoneCount: goal.milestones.length,
                incomingIds
            });

            const deleteWhere = { goalId: goal.id };
            if (incomingIds.length > 0) {
                deleteWhere.id = { [Op.notIn]: incomingIds };
            }
            await Milestone.destroy({ where: deleteWhere, transaction });

            for (const mData of incoming) {
                const { id, ...milestoneAttrs } = mData;
                if (id !== null) {
                    console.log('Updating milestone:', {
                        id,
                        goalId: goal.id,
                        milestoneAttrs
                    });
                    const [updatedCount] = await Milestone.update(
                        milestoneAttrs,
                        {
                            where: { id, goalId: goal.id },
                            transaction,
                            logging: console.log
                        }
                    );
                    if (updatedCount === 0) {
                        await Milestone.create({ ...milestoneAttrs, goalId: goal.id }, { transaction });
                    }
                } else {
                    await Milestone.create({ ...milestoneAttrs, goalId: goal.id }, { transaction });
                }
            }
        }

        await transaction.commit();

        const updatedGoal = await Goal.findByPk(goal.id, {
            include: [{ model: Milestone, as: 'milestones' }]
        });

        res.json(updatedGoal);
    } catch (error) {
        console.error('GOAL UPDATE ERROR:', error.stack || error);
        console.error('ERROR NAME:', error.name);
        console.error('ERROR MESSAGE:', error.message);
        console.error('ERROR STACK:', error.stack);
        if (error.parent) {
            console.error('DB MESSAGE:', error.parent.message);
            console.error('DB DETAIL:', error.parent.detail);
            console.error('DB CODE:', error.parent.code);
            console.error('DB CONSTRAINT:', error.parent.constraint);
        }
        if (error.errors) {
            console.error('ERRORS:', error.errors);
        }
        console.error('REQUEST BODY:', JSON.stringify(req.body, null, 2));
        await transaction.rollback();
        res.status(500).json({ error: error.message || 'Failed to update goal and milestones' });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
    try {
        await Goal.destroy({ where: { id: req.params.id, userId: req.userId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// --- Milestone Routes (Nested) ---
router.post('/:goalId/milestones', async (req, res) => {
    try {
        const goal = await Goal.findOne({ where: { id: req.params.goalId, userId: req.userId } });
        if (!goal) return res.status(404).json({ error: 'Goal not found' });

        const milestone = await Milestone.create({
            ...req.body,
            goalId: goal.id
        });
        res.status(201).json(milestone);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create milestone' });
    }
});

export default router;
