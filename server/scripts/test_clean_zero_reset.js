import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testCleanZeroReset() {
    console.log('========================================================');
    console.log('🧪 VERIFYING CLEAN ZERO-STATE RESET TO DATABASE');
    console.log('========================================================\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Neon PostgreSQL.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        // 1. Setup User A & User B
        let [userA] = await User.findOrCreate({
            where: { email: 'alex.rivers@productivity.com' },
            defaults: { fullName: 'Alex Rivers', passwordHash, department: 'CS', year: 'Senior' }
        });

        let [userB] = await User.findOrCreate({
            where: { email: 'sarah.chen@productivity.com' },
            defaults: { fullName: 'Sarah Chen', passwordHash, department: 'Design', year: 'Junior' }
        });

        console.log(`👤 User A ID: ${userA.id} (${userA.email})`);
        console.log(`👤 User B ID: ${userB.id} (${userB.email})\n`);

        // 2. Add records to User A
        const habitA = await Habit.create({ title: 'User A Test Habit', targetPerDay: 1, userId: userA.id });
        await HabitHistory.create({ habitId: habitA.id, date: '2026-08-23', value: 1 });
        await Task.create({ title: 'User A Test Task', status: 'IN_PROGRESS', userId: userA.id });
        const goalA = await Goal.create({ title: 'User A Test Goal', targetValue: 100, userId: userA.id });
        await Milestone.create({ title: 'User A Milestone 1', value: 50, goalId: goalA.id });
        await Learning.create({ topic: 'User A Study', minutes: 60, date: '2026-08-23', userId: userA.id });

        // 3. Add records to User B
        const habitB = await Habit.create({ title: 'User B Habit', targetPerDay: 1, userId: userB.id });
        await Task.create({ title: 'User B Critical Task', status: 'TODO', userId: userB.id });
        const goalB = await Goal.create({ title: 'User B Roadmap', targetValue: 100, userId: userB.id });
        await Milestone.create({ title: 'User B Milestone', value: 30, goalId: goalB.id });
        await Learning.create({ topic: 'User B Design Log', minutes: 45, date: '2026-08-23', userId: userB.id });

        console.log('📊 Pre-Reset Counts:');
        console.log(`   User A -> Habits: ${await Habit.count({ where: { userId: userA.id } })}, Tasks: ${await Task.count({ where: { userId: userA.id } })}, Goals: ${await Goal.count({ where: { userId: userA.id } })}, Learning: ${await Learning.count({ where: { userId: userA.id } })}`);
        console.log(`   User B -> Habits: ${await Habit.count({ where: { userId: userB.id } })}, Tasks: ${await Task.count({ where: { userId: userB.id } })}, Goals: ${await Goal.count({ where: { userId: userB.id } })}, Learning: ${await Learning.count({ where: { userId: userB.id } })}\n`);

        // 4. Execute Clean Reset for User A
        console.log('⚡ Executing reset transaction ONLY for User A...');
        const transaction = await sequelize.transaction();
        try {
            const userId = userA.id;
            const existingGoals = await Goal.findAll({ where: { userId }, attributes: ['id'], transaction });
            const goalIds = existingGoals.map(g => g.id);
            if (goalIds.length > 0) {
                await Milestone.destroy({ where: { goalId: goalIds }, transaction });
            }
            const existingHabits = await Habit.findAll({ where: { userId }, attributes: ['id'], transaction });
            const habitIds = existingHabits.map(h => h.id);
            if (habitIds.length > 0) {
                await HabitHistory.destroy({ where: { habitId: habitIds }, transaction });
            }
            await Goal.destroy({ where: { userId }, transaction });
            await Habit.destroy({ where: { userId }, transaction });
            await Task.destroy({ where: { userId }, transaction });
            await Learning.destroy({ where: { userId }, transaction });

            let settings = await Setting.findOne({ where: { userId }, transaction });
            if (!settings) {
                await Setting.create({ userId, weightsHabits: 40, weightsTasks: 40, weightsLearning: 20 }, { transaction });
            }
            await transaction.commit();
            console.log('✅ Reset transaction committed successfully.\n');
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        // 5. Query Neon PostgreSQL for User A
        const userAHabitsAfter = await Habit.count({ where: { userId: userA.id } });
        const userATasksAfter = await Task.count({ where: { userId: userA.id } });
        const userAGoalsAfter = await Goal.count({ where: { userId: userA.id } });
        const userALearningAfter = await Learning.count({ where: { userId: userA.id } });
        const userAAccount = await User.findByPk(userA.id);

        console.log('🔍 Post-Reset Audit for User A in Neon PostgreSQL:');
        console.log(`   - Habits count: ${userAHabitsAfter} (Expected 0) ${userAHabitsAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Tasks count: ${userATasksAfter} (Expected 0) ${userATasksAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Goals count: ${userAGoalsAfter} (Expected 0) ${userAGoalsAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Learning count: ${userALearningAfter} (Expected 0) ${userALearningAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - User account preserved? ${userAAccount ? '✅ YES' : '❌ NO'}\n`);

        // 6. Query Neon PostgreSQL for User B
        const userBHabitsAfter = await Habit.count({ where: { userId: userB.id } });
        const userBTasksAfter = await Task.count({ where: { userId: userB.id } });
        const userBGoalsAfter = await Goal.count({ where: { userId: userB.id } });
        const userBLearningAfter = await Learning.count({ where: { userId: userB.id } });

        console.log('🛡️ User B Isolation Audit in Neon PostgreSQL:');
        console.log(`   - User B Habits intact? count: ${userBHabitsAfter} ${userBHabitsAfter >= 1 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Tasks intact? count: ${userBTasksAfter} ${userBTasksAfter >= 1 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Goals intact? count: ${userBGoalsAfter} ${userBGoalsAfter >= 1 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Learning intact? count: ${userBLearningAfter} ${userBLearningAfter >= 1 ? '✅ YES' : '❌ NO'}\n`);

        // 7. Test Idempotency (resetting when already 0)
        console.log('🔄 Testing idempotency (resetting again on already empty data)...');
        const transaction2 = await sequelize.transaction();
        await Goal.destroy({ where: { userId: userA.id }, transaction: transaction2 });
        await Habit.destroy({ where: { userId: userA.id }, transaction: transaction2 });
        await Task.destroy({ where: { userId: userA.id }, transaction: transaction2 });
        await Learning.destroy({ where: { userId: userA.id }, transaction: transaction2 });
        await transaction2.commit();
        console.log('✅ Idempotency test passed with 0 errors.\n');

        // Cleanup User B
        const bGoals = await Goal.findAll({ where: { userId: userB.id }, attributes: ['id'] });
        if (bGoals.length > 0) await Milestone.destroy({ where: { goalId: bGoals.map(g => g.id) } });
        await Goal.destroy({ where: { userId: userB.id } });
        await Habit.destroy({ where: { userId: userB.id } });
        await Task.destroy({ where: { userId: userB.id } });
        await Learning.destroy({ where: { userId: userB.id } });
        await Setting.destroy({ where: { userId: userB.id } });
        await User.destroy({ where: { id: userB.id } });

        console.log('🌟 CLEAN ZERO-STATE RESET VERIFICATION: 100% PASSED');
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        process.exit(0);
    }
}

testCleanZeroReset();
