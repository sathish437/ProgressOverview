import sequelize from './config/database.js';
import { Habit } from './models/index.js';

async function listHabits() {
    try {
        await sequelize.authenticate();
        console.log('--- DATABASE HABITS ---');
        const habits = await Habit.findAll();
        console.table(habits.map(h => ({
            id: h.id,
            title: h.title,
            userId: h.userId
        })));
        console.log('--- END ---');
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

listHabits();
