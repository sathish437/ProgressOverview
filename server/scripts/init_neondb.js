import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const formatDate = (d) => d.toISOString().split('T')[0];
const subDays = (d, days) => {
    const result = new Date(d);
    result.setDate(result.getDate() - days);
    return result;
};

async function initNeonDb() {
    console.log('==============================================');
    console.log('🚀 INITIALIZING NEON POSTGRESQL (PUBLIC SCHEMA)');
    console.log('==============================================\n');

    try {
        await sequelize.authenticate();
        const [dbInfo] = await sequelize.query('SELECT current_database() as db_name, current_schema() as schema_name;');
        console.log(`Connected to Database: "${dbInfo[0].db_name}", Schema: "${dbInfo[0].schema_name}"`);

        // 1. Sync all tables in public schema
        console.log('Creating / syncing all application tables in public schema...');
        await sequelize.sync({ alter: true });
        console.log('✅ Tables created and synced successfully.\n');

        // 2. Seed default users & templates if not already present
        let user = await User.findOne({ where: { email: 'alex.rivers@productivity.com' } });
        if (!user) {
            console.log('Seeding default user profile...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);
            user = await User.create({
                fullName: 'Alex Rivers',
                email: 'alex.rivers@productivity.com',
                passwordHash,
                phone: '+1 (555) 019-2834',
                college: 'Stanford University',
                department: 'Computer Science & Engineering',
                year: 'Senior (Year 4)',
                avatarUrl: ''
            });
            console.log(`✅ Default user created (ID: ${user.id})`);
        }

        const userId = user.id;

        // Ensure settings
        let settings = await Setting.findOne({ where: { userId } });
        if (!settings) {
            settings = await Setting.create({
                userId,
                weightsHabits: 40,
                weightsTasks: 40,
                weightsLearning: 20,
                learningDailyTargetMinutes: 60,
                theme: 'dark',
                accentColor: 'blue',
                showHabits: true,
                showTasks: true,
                showLearning: true,
                showGoals: true,
                overdueAlerts: true,
                lowProgressAlerts: true,
                lowProgressThreshold: 50
            });
            console.log('✅ Default settings created');
        }

        const today = new Date();
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(subDays(today, 1));
        const twoDaysAgoStr = formatDate(subDays(today, 2));
        const threeDaysAgoStr = formatDate(subDays(today, 3));
        const tomorrowStr = formatDate(subDays(today, -1));
        const inTwoDaysStr = formatDate(subDays(today, -2));
        const inThreeDaysStr = formatDate(subDays(today, -3));
        const inFourDaysStr = formatDate(subDays(today, -4));

        // Seed Habits if empty
        const habitCount = await Habit.count({ where: { userId } });
        if (habitCount === 0) {
            console.log('Seeding default habits...');
            const defaultHabits = [
                {
                    title: 'Morning Deep Focus (45m)',
                    category: 'Productivity',
                    targetPerDay: 1,
                    streak: 5,
                    bestStreak: 14,
                    history: [
                        { date: threeDaysAgoStr, value: 1 },
                        { date: twoDaysAgoStr, value: 1 },
                        { date: yesterdayStr, value: 1 },
                        { date: todayStr, value: 1 }
                    ]
                },
                {
                    title: 'Read Tech / Architecture Books',
                    category: 'Learning',
                    targetPerDay: 1,
                    streak: 3,
                    bestStreak: 9,
                    history: [
                        { date: twoDaysAgoStr, value: 1 },
                        { date: yesterdayStr, value: 1 },
                        { date: todayStr, value: 1 }
                    ]
                },
                {
                    title: 'Hydration & Daily Workout',
                    category: 'Health',
                    targetPerDay: 1,
                    streak: 4,
                    bestStreak: 12,
                    history: [
                        { date: threeDaysAgoStr, value: 1 },
                        { date: twoDaysAgoStr, value: 1 },
                        { date: yesterdayStr, value: 1 }
                    ]
                },
                {
                    title: 'Code Refactoring & Clean Up',
                    category: 'Engineering',
                    targetPerDay: 1,
                    streak: 2,
                    bestStreak: 7,
                    history: [
                        { date: yesterdayStr, value: 1 }
                    ]
                }
            ];

            for (const h of defaultHabits) {
                const habit = await Habit.create({
                    title: h.title,
                    category: h.category,
                    targetPerDay: h.targetPerDay,
                    streak: h.streak,
                    bestStreak: h.bestStreak,
                    userId
                });
                for (const hist of h.history) {
                    await HabitHistory.create({
                        habitId: habit.id,
                        date: hist.date,
                        value: hist.value
                    });
                }
            }
            console.log('✅ Default habits seeded');
        }

        // Seed Tasks if empty
        const taskCount = await Task.count({ where: { userId } });
        if (taskCount === 0) {
            console.log('Seeding default tasks...');
            const defaultTasks = [
                {
                    title: 'Architect Kanban Drag-and-Drop Task Flow',
                    status: 'DONE',
                    priority: 'HIGH',
                    dueDate: todayStr,
                    completedAt: todayStr,
                    tags: ['Frontend', 'React', 'Kanban'],
                    description: 'Implement intuitive drag-and-drop status transitions across all workflow stages.',
                    userId
                },
                {
                    title: 'Design Daily Productivity Scoring Engine',
                    status: 'IN_PROGRESS',
                    priority: 'HIGH',
                    dueDate: todayStr,
                    completedAt: null,
                    tags: ['Core', 'Analytics'],
                    description: 'Calculate weighted scores across habits, tasks, and focused learning sessions.',
                    userId
                },
                {
                    title: 'Integrate Pomodoro Focus Timer with Session Logs',
                    status: 'IN_PROGRESS',
                    priority: 'MED',
                    dueDate: tomorrowStr,
                    completedAt: null,
                    tags: ['Focus', 'UX'],
                    description: 'Enable audio alerts, timer presets, and seamless logging to the learning log.',
                    userId
                },
                {
                    title: 'Review System Metrics & Overdue Task Alerts',
                    status: 'REVIEW',
                    priority: 'MED',
                    dueDate: inTwoDaysStr,
                    completedAt: null,
                    tags: ['Quality', 'Alerts'],
                    description: 'Verify warning indicators on dashboard when tasks are past their due dates.',
                    userId
                },
                {
                    title: 'Optimize Responsive Mobile Drawer Navigation',
                    status: 'TODO',
                    priority: 'LOW',
                    dueDate: inThreeDaysStr,
                    completedAt: null,
                    tags: ['Mobile', 'UI'],
                    description: 'Polish sidebar animations and touch transitions for smaller screens.',
                    userId
                },
                {
                    title: 'Prepare Growth Milestones for Q3 Roadmap',
                    status: 'TODO',
                    priority: 'HIGH',
                    dueDate: inFourDaysStr,
                    completedAt: null,
                    tags: ['Planning', 'Goals'],
                    description: 'Define target metrics and break down high-level milestones.',
                    userId
                }
            ];

            for (const t of defaultTasks) {
                await Task.create(t);
            }
            console.log('✅ Default tasks seeded');
        }

        // Seed Goals & Milestones if empty
        const goalCount = await Goal.count({ where: { userId } });
        if (goalCount === 0) {
            console.log('Seeding default goals & milestones...');
            const defaultGoals = [
                {
                    title: 'Master Full-Stack Cloud & System Architecture',
                    targetValue: 100,
                    category: 'Career',
                    deadline: '2026-12-31',
                    milestones: [
                        { title: 'Complete Advanced Distributed Systems Course', value: 20, done: true },
                        { title: 'Build Event-Driven Microservices Architecture', value: 20, done: true },
                        { title: 'Deploy Scalable Database Clusters with Replication', value: 20, done: true },
                        { title: 'Implement End-to-End Observability & Tracing', value: 20, done: false },
                        { title: 'Publish Comprehensive System Design Case Study', value: 20, done: false }
                    ]
                },
                {
                    title: 'Ship High-Impact Open Source Developer Tools',
                    targetValue: 100,
                    category: 'Open Source',
                    deadline: '2026-11-15',
                    milestones: [
                        { title: 'Initial Prototype & Developer Feedback', value: 20, done: true },
                        { title: 'Comprehensive Unit & Integration Test Suite', value: 20, done: true },
                        { title: 'Interactive Documentation & Live Playground', value: 20, done: false },
                        { title: 'Package Publishing & GitHub Releases', value: 20, done: false },
                        { title: 'Reach 1,000 Active Community Users', value: 20, done: false }
                    ]
                },
                {
                    title: 'Maintain 30-Day Consecutive Daily Growth Streak',
                    targetValue: 100,
                    category: 'Personal',
                    deadline: '2026-09-30',
                    milestones: [
                        { title: '7 Days Consistent Habits & Tasks', value: 25, done: true },
                        { title: '14 Days Focus & Daily Performance > 80%', value: 25, done: true },
                        { title: '21 Days Continuous Milestone Progress', value: 25, done: false },
                        { title: '30 Days Unbroken Growth Achievement', value: 25, done: false }
                    ]
                }
            ];

            for (const g of defaultGoals) {
                const currentVal = g.milestones.reduce((sum, m) => sum + (m.done ? m.value : 0), 0);
                const goal = await Goal.create({
                    title: g.title,
                    targetValue: g.targetValue,
                    currentValue: currentVal,
                    category: g.category,
                    deadline: g.deadline,
                    userId
                });
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
            console.log('✅ Default goals seeded');
        }

        // Seed Learning if empty
        const learningCount = await Learning.count({ where: { userId } });
        if (learningCount === 0) {
            console.log('Seeding default learning sessions...');
            const defaultLearning = [
                {
                    topic: 'TypeScript Advanced Generics & Utility Types',
                    minutes: 45,
                    date: todayStr,
                    notes: 'Mastered conditional types, infer keyword, and mapped type transformations.',
                    userId
                },
                {
                    topic: 'High-Performance State Management & Context Optimization',
                    minutes: 60,
                    date: yesterdayStr,
                    notes: 'Explored granular selectors, memoization boundaries, and React 18 concurrency.',
                    userId
                },
                {
                    topic: 'Database Indexing Strategies & Query Optimization',
                    minutes: 50,
                    date: twoDaysAgoStr,
                    notes: 'Covered B-tree vs GIN indexes, composite indexing rules, and EXPLAIN ANALYZE.',
                    userId
                },
                {
                    topic: 'UI/UX Motion Design & Micro-Interactions',
                    minutes: 35,
                    date: threeDaysAgoStr,
                    notes: 'Practiced physics-based spring animations with Framer Motion.',
                    userId
                }
            ];

            for (const l of defaultLearning) {
                await Learning.create(l);
            }
            console.log('✅ Default learning sessions seeded');
        }

        // Verify final tables
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        console.log(`\n📋 Verified Public Schema Tables in "${dbInfo[0].db_name}" (${tables.length}):`);
        tables.forEach(t => console.log(`   ✨ ${t.table_name}`));

    } catch (err) {
        console.error('Initialization error:', err);
    } finally {
        process.exit(0);
    }
}

initNeonDb();
