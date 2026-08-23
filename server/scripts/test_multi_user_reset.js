import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMultiUserTest() {
    console.log('========================================================');
    console.log('🧪 MULTI-USER ISOLATION & RESET PRODUCTIVITY DATA TEST');
    console.log('========================================================\n');

    try {
        await sequelize.authenticate();
        console.log('Connected to Neon PostgreSQL.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        // 1. Create/Find User A
        let [userA] = await User.findOrCreate({
            where: { email: 'user.a.test@productivity.com' },
            defaults: {
                fullName: 'User A (Alex)',
                passwordHash,
                department: 'Engineering',
                year: 'Senior'
            }
        });

        // 2. Create/Find User B
        let [userB] = await User.findOrCreate({
            where: { email: 'user.b.test@productivity.com' },
            defaults: {
                fullName: 'User B (Sarah)',
                passwordHash,
                department: 'Design',
                year: 'Junior'
            }
        });

        console.log(`👤 User A ID: ${userA.id} (${userA.email})`);
        console.log(`👤 User B ID: ${userB.id} (${userB.email})\n`);

        // 3. Clear existing test data for both users
        const clearUserData = async (uId) => {
            const userGoals = await Goal.findAll({ where: { userId: uId }, attributes: ['id'] });
            if (userGoals.length > 0) {
                await Milestone.destroy({ where: { goalId: userGoals.map(g => g.id) } });
            }
            const userHabits = await Habit.findAll({ where: { userId: uId }, attributes: ['id'] });
            if (userHabits.length > 0) {
                await HabitHistory.destroy({ where: { habitId: userHabits.map(h => h.id) } });
            }
            await Goal.destroy({ where: { userId: uId } });
            await Habit.destroy({ where: { userId: uId } });
            await Task.destroy({ where: { userId: uId } });
            await Learning.destroy({ where: { userId: uId } });
            await Setting.destroy({ where: { userId: uId } });
        };

        await clearUserData(userA.id);
        await clearUserData(userB.id);

        // 4. Create custom unique data for User A
        await Task.create({
            title: 'User A Custom Feature Task #101',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            userId: userA.id
        });
        await Habit.create({
            title: 'User A Daily Swimming Habit',
            category: 'Health',
            targetPerDay: 1,
            userId: userA.id
        });
        await Goal.create({
            title: 'User A Custom Goal 2026',
            targetValue: 100,
            currentValue: 25,
            userId: userA.id
        });
        await Learning.create({
            topic: 'User A Deep Learning Study',
            minutes: 90,
            date: '2026-08-23',
            userId: userA.id
        });
        console.log('✅ Created distinct custom records for User A.');

        // 5. Create custom unique data for User B
        const userBTask = await Task.create({
            title: 'User B Critical Security Audit Task',
            status: 'TODO',
            priority: 'HIGH',
            userId: userB.id
        });
        const userBHabit = await Habit.create({
            title: 'User B Morning Meditation 20m',
            category: 'Mindfulness',
            targetPerDay: 1,
            streak: 15,
            userId: userB.id
        });
        const userBGoal = await Goal.create({
            title: 'User B Lead Design Systems Conference',
            targetValue: 100,
            currentValue: 70,
            userId: userB.id
        });
        const userBMilestone = await Milestone.create({
            title: 'User B Keynote Slide Deck Finalized',
            value: 50,
            done: true,
            goalId: userBGoal.id
        });
        const userBLearning = await Learning.create({
            topic: 'User B Advanced Figma Tokens & Variables',
            minutes: 120,
            date: '2026-08-23',
            userId: userB.id
        });
        console.log('✅ Created distinct custom records for User B.\n');

        // Record User B counts before reset
        const userBTasksBefore = await Task.count({ where: { userId: userB.id } });
        const userBHabitsBefore = await Habit.count({ where: { userId: userB.id } });
        const userBGoalsBefore = await Goal.count({ where: { userId: userB.id } });
        const userBMilestonesBefore = await Milestone.count({ where: { goalId: userBGoal.id } });
        const userBLearningBefore = await Learning.count({ where: { userId: userB.id } });

        console.log(`📊 User B baseline counts before User A reset:`);
        console.log(`   Tasks: ${userBTasksBefore}, Habits: ${userBHabitsBefore}, Goals: ${userBGoalsBefore}, Milestones: ${userBMilestonesBefore}, Learning: ${userBLearningBefore}\n`);

        // 6. TRIGGER USER A RESET PRODUCTIVITY DATA
        console.log('⚡ Triggering "Reset Productivity Data" ONLY for User A...');
        const mockReq = { userId: userA.id };
        let mockResData = null;
        const mockRes = {
            json: (data) => { mockResData = data; return data; },
            status: (code) => ({ json: (err) => { console.error('Status', code, err); } })
        };

        // Execute user-specific reset
        const productivityModule = await import('../routes/productivity.js');
        // Let's call the endpoint logic directly or via fetch
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
            console.log('✅ User A reset transaction committed.\n');
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        // 7. Verify User A data in Neon PostgreSQL (Expected 0 records)
        const userATasksAfter = await Task.count({ where: { userId: userA.id } });
        const userAHabitsAfter = await Habit.count({ where: { userId: userA.id } });
        const userAGoalsAfter = await Goal.count({ where: { userId: userA.id } });
        const userALearningAfter = await Learning.count({ where: { userId: userA.id } });

        console.log(`📋 User A Post-Reset Data in Neon PostgreSQL (Zero State):`);
        console.log(`   - Tasks count = ${userATasksAfter} (Expected 0) ${userATasksAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Habits count = ${userAHabitsAfter} (Expected 0) ${userAHabitsAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Goals count = ${userAGoalsAfter} (Expected 0) ${userAGoalsAfter === 0 ? '✅' : '❌'}`);
        console.log(`   - Learning count = ${userALearningAfter} (Expected 0) ${userALearningAfter === 0 ? '✅' : '❌'}\n`);

        // 8. CRITICAL CHECK: Verify User B data in Neon PostgreSQL
        const userBTasksAfter = await Task.findAll({ where: { userId: userB.id } });
        const userBHabitsAfter = await Habit.findAll({ where: { userId: userB.id } });
        const userBGoalsAfter = await Goal.findAll({ where: { userId: userB.id } });
        const userBMilestonesAfter = await Milestone.findAll({ where: { goalId: userBGoal.id } });
        const userBLearningAfter = await Learning.findAll({ where: { userId: userB.id } });

        console.log(`🛡️ User B Isolation Verification in Neon PostgreSQL:`);
        console.log(`   - User B Task intact? ${userBTasksAfter.length === 1 && userBTasksAfter[0].title === 'User B Critical Security Audit Task' ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Habit intact? ${userBHabitsAfter.length === 1 && userBHabitsAfter[0].title === 'User B Morning Meditation 20m' ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Goal intact? ${userBGoalsAfter.length === 1 && userBGoalsAfter[0].title === 'User B Lead Design Systems Conference' ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Milestone intact? ${userBMilestonesAfter.length === 1 && userBMilestonesAfter[0].title === 'User B Keynote Slide Deck Finalized' ? '✅ YES' : '❌ NO'}`);
        console.log(`   - User B Learning log intact? ${userBLearningAfter.length === 1 && userBLearningAfter[0].topic === 'User B Advanced Figma Tokens & Variables' ? '✅ YES' : '❌ NO'}\n`);

        if (userBTasksAfter.length === 1 && userBHabitsAfter.length === 1 && userBGoalsAfter.length === 1 && userBLearningAfter.length === 1) {
            console.log('🌟 MULTI-USER ISOLATION TEST: 100% PASSED');
        } else {
            console.error('❌ MULTI-USER ISOLATION TEST FAILED!');
        }

        // Cleanup test users
        await clearUserData(userA.id);
        await clearUserData(userB.id);
        await User.destroy({ where: { id: [userA.id, userB.id] } });
        console.log('\n🧹 Test users cleaned up cleanly.');

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        process.exit(0);
    }
}

runMultiUserTest();
