import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const seed = async () => {
    try {
        console.log('Seeding data from seed.json...');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const dataPath = path.resolve(__dirname, '../../seed.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Clear existing data (CAUTION: deletes everything)
        await sequelize.sync({ force: true });

        const salt = await bcrypt.genSalt(10);

        // Seed Users
        const userMap = new Map();
        for (const u of data.users) {
            const user = await User.create({
                fullName: u.fullName,
                email: u.email,
                passwordHash: await bcrypt.hash(u.password || '123456', salt),
                phone: u.phone,
                college: u.college,
                department: u.department,
                year: u.year,
                avatarUrl: u.avatarUrl
            });
            userMap.set(u.id, user.id);
            // Create default settings for each user
            await Setting.create({ userId: user.id });
        }

        // Seed Tasks
        for (const t of data.tasks) {
            await Task.create({
                title: t.title,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate,
                tags: t.tags || [],
                completedAt: t.completedAt,
                userId: userMap.get(t.userId)
            });
        }

        // Seed Goals & Milestones
        for (const g of data.goals) {
            const goal = await Goal.create({
                title: g.title,
                targetValue: g.targetValue,
                userId: userMap.get(g.userId)
            });

            if (g.milestones) {
                for (const m of g.milestones) {
                    await Milestone.create({
                        title: m.title,
                        value: m.value,
                        done: m.done,
                        completedAt: m.done ? new Date() : null,
                        goalId: goal.id
                    });
                }
            }
        }

        // Seed Habits & History
        for (const h of data.habits) {
            const habit = await Habit.create({
                title: h.title,
                targetPerDay: h.targetPerDay,
                streak: h.streak,
                userId: userMap.get(h.userId)
            });

            if (h.history) {
                for (const entry of h.history) {
                    await HabitHistory.create({
                        date: entry.date,
                        value: entry.value,
                        habitId: habit.id
                    });
                }
            }
        }

        // Seed Learning
        for (const l of data.learning) {
            await Learning.create({
                topic: l.topic,
                minutes: l.minutes,
                date: l.date,
                notes: l.notes,
                userId: userMap.get(l.userId)
            });
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed data:', error);
        process.exit(1);
    }
};

seed();
