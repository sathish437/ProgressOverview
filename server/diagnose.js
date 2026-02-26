import sequelize from './config/database.js';
import { User, Task, Goal, Habit, HabitHistory, Learning, Setting } from './models/index.js';

async function diagnose() {
    console.log('--- DATABASE DIAGNOSIS ---');
    try {
        await sequelize.authenticate();
        console.log('✅ Connection: OK');

        const userCount = await User.count();
        console.log(`✅ Users table exists. Count: ${userCount}`);

        const taskCount = await Task.count();
        console.log(`✅ Tasks table exists. Count: ${taskCount}`);

        const habitCount = await Habit.count();
        console.log(`✅ Habits table exists. Count: ${habitCount}`);

        const historyCount = await HabitHistory.count();
        console.log(`✅ HabitHistory table exists. Count: ${historyCount}`);

        const learningCount = await Learning.count();
        console.log(`✅ Learning table exists. Count: ${learningCount}`);

        const settingCount = await Setting.count();
        console.log(`✅ Settings table exists. Count: ${settingCount}`);

        console.log('\n--- SYSTEM CHECK COMPLETE ---');
    } catch (error) {
        console.error('❌ DIAGNOSIS FAILED:');
        console.error(error);
    } finally {
        process.exit();
    }
}

diagnose();
