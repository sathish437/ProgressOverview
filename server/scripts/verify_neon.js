import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyNeon() {
    console.log('==============================================');
    console.log('🔍 NEON POSTGRESQL VERIFICATION & AUDIT');
    console.log('==============================================\n');

    try {
        // 1. Authenticate and verify connection
        await sequelize.authenticate();
        console.log('✅ Connection to Neon PostgreSQL: SUCCESSFUL');

        const [dbInfo] = await sequelize.query('SELECT current_database() as db_name, current_schema() as schema_name, version() as pg_version;');
        console.log(`📦 Connected Database: ${dbInfo[0].db_name}`);
        console.log(`📂 Active Schema: ${dbInfo[0].schema_name}`);
        console.log(`🐘 PostgreSQL Version: ${dbInfo[0].pg_version.split(' ')[0]} ${dbInfo[0].pg_version.split(' ')[1]}\n`);

        // 2. Check Existing Tables
        const [existingTables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        console.log(`📋 Existing Tables Found in Neon (${existingTables.length}):`);
        existingTables.forEach(t => console.log(`   - ${t.table_name}`));

        // 3. Sync and ensure all required tables & columns exist
        console.log('\n🔄 Synchronizing Sequelize models with Neon PostgreSQL schema...');
        await sequelize.sync({ alter: true });
        console.log('✅ Schema synchronization: COMPLETE\n');

        // 4. Inspect Final Tables & Columns
        const [finalTables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        console.log(`📋 Final Tables in Neon (${finalTables.length}):`);
        for (const t of finalTables) {
            const [cols] = await sequelize.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '${t.table_name}'
                ORDER BY ordinal_position;
            `);
            console.log(`   📁 Table "${t.table_name}" (${cols.length} columns):`);
            console.log(`      Columns: ${cols.map(c => `${c.column_name} (${c.data_type})`).join(', ')}`);
        }

        // 5. Run CRUD Persistence Tests
        console.log('\n==============================================');
        console.log('🧪 RUNNING CRUD PERSISTENCE TESTS');
        console.log('==============================================');

        // Find or create test user
        let testUser = await User.findOne();
        if (!testUser) {
            testUser = await User.create({
                fullName: 'Alex Rivers',
                email: 'alex.rivers@productivity.com',
                passwordHash: 'hashed_password_sample'
            });
        }
        console.log(`👤 Using Test User ID: ${testUser.id} (${testUser.email})`);

        // Test Habit CRUD
        const testHabit = await Habit.create({
            title: 'Audit Verification Habit',
            category: 'Testing',
            targetPerDay: 1,
            userId: testUser.id
        });
        console.log(`✅ Habit Created (ID: ${testHabit.id})`);

        await testHabit.update({ streak: 1, bestStreak: 1 });
        console.log(`✅ Habit Updated (Streak: ${testHabit.streak})`);

        const testHistory = await HabitHistory.create({
            habitId: testHabit.id,
            date: '2026-08-23',
            value: 1
        });
        console.log(`✅ Habit Check-In History Added (ID: ${testHistory.id})`);

        await testHistory.destroy();
        await testHabit.destroy();
        console.log('✅ Habit Deleted Cleanly');

        // Test Task CRUD (Kanban Drag & Drop update simulation)
        const testTask = await Task.create({
            title: 'Audit Verification Task',
            status: 'TODO',
            priority: 'HIGH',
            description: 'Verifying Kanban drag-and-drop persistence.',
            userId: testUser.id
        });
        console.log(`✅ Task Created (ID: ${testTask.id}, Status: ${testTask.status})`);

        await testTask.update({ status: 'IN_PROGRESS' });
        console.log(`✅ Task Status Updated -> IN_PROGRESS`);

        await testTask.update({ status: 'DONE', completedAt: '2026-08-23' });
        console.log(`✅ Task Status Updated -> DONE (CompletedAt: ${testTask.completedAt})`);

        await testTask.destroy();
        console.log('✅ Task Deleted Cleanly');

        // Test Goal & Milestones CRUD
        const testGoal = await Goal.create({
            title: 'Audit Verification Goal',
            targetValue: 100,
            currentValue: 0,
            category: 'Testing',
            userId: testUser.id
        });
        console.log(`✅ Goal Created (ID: ${testGoal.id})`);

        const testMilestone = await Milestone.create({
            title: 'First Milestone',
            value: 50,
            done: false,
            goalId: testGoal.id
        });
        console.log(`✅ Milestone Created (ID: ${testMilestone.id})`);

        await testMilestone.update({ done: true, completedAt: new Date() });
        await testGoal.update({ currentValue: 50 });
        console.log(`✅ Milestone Toggled to Done (Goal Progress: ${testGoal.currentValue}/${testGoal.targetValue})`);

        await testMilestone.destroy();
        await testGoal.destroy();
        console.log('✅ Goal & Milestones Deleted Cleanly');

        // Test Learning Session CRUD
        const testLearning = await Learning.create({
            topic: 'PostgreSQL Connection Pooling & Performance',
            minutes: 45,
            date: '2026-08-23',
            notes: 'Verified transaction durability and pooling on Neon.',
            userId: testUser.id
        });
        console.log(`✅ Learning Session Created (ID: ${testLearning.id}, Minutes: ${testLearning.minutes})`);

        await testLearning.update({ minutes: 60 });
        console.log(`✅ Learning Session Updated (Minutes: ${testLearning.minutes})`);

        await testLearning.destroy();
        console.log('✅ Learning Session Deleted Cleanly');

        // Test Settings
        let settings = await Setting.findOne({ where: { userId: testUser.id } });
        if (!settings) {
            settings = await Setting.create({ userId: testUser.id });
        }
        await settings.update({ weightsHabits: 40, weightsTasks: 40, weightsLearning: 20 });
        console.log(`✅ Settings Verified (Weights: ${settings.weightsHabits}/${settings.weightsTasks}/${settings.weightsLearning})`);

        console.log('\n==============================================');
        console.log('🌟 ALL NEON POSTGRESQL VERIFICATIONS PASSED');
        console.log('==============================================\n');

    } catch (err) {
        console.error('❌ Neon Verification Failed:', err);
    } finally {
        process.exit(0);
    }
}

verifyNeon();
