import { format, subDays } from 'date-fns';

export const getDemoUser = () => ({
    id: 'demo-alex-rivers',
    fullName: 'Alex Rivers',
    email: 'alex.rivers@productivity.com',
    role: 'Productivity Explorer',
    college: 'Stanford University',
    department: 'Computer Science & Engineering',
    year: 'Senior (Year 4)',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    isDemo: true
});

export const getDemoProductivityData = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    const twoDaysAgoStr = format(subDays(today, 2), 'yyyy-MM-dd');
    const threeDaysAgoStr = format(subDays(today, 3), 'yyyy-MM-dd');
    const fourDaysAgoStr = format(subDays(today, 4), 'yyyy-MM-dd');
    const fiveDaysAgoStr = format(subDays(today, 5), 'yyyy-MM-dd');
    const sixDaysAgoStr = format(subDays(today, 6), 'yyyy-MM-dd');
    const tomorrowStr = format(subDays(today, -1), 'yyyy-MM-dd');
    const inTwoDaysStr = format(subDays(today, -2), 'yyyy-MM-dd');
    const inThreeDaysStr = format(subDays(today, -3), 'yyyy-MM-dd');
    const inFourDaysStr = format(subDays(today, -4), 'yyyy-MM-dd');

    return {
        habits: [
            {
                id: 'demo-habit-1',
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
                id: 'demo-habit-2',
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
                id: 'demo-habit-3',
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
                id: 'demo-habit-4',
                title: 'Code Refactoring & Clean Up',
                category: 'Engineering',
                targetPerDay: 1,
                streak: 2,
                bestStreak: 7,
                history: [
                    { date: yesterdayStr, value: 1 }
                ]
            }
        ],
        tasks: [
            {
                id: 'demo-task-1',
                title: 'Architect Kanban Drag-and-Drop Task Flow',
                status: 'DONE',
                priority: 'HIGH',
                dueDate: todayStr,
                completedAt: todayStr,
                tags: ['Frontend', 'React', 'Kanban'],
                description: 'Implement intuitive drag-and-drop status transitions across all workflow stages.'
            },
            {
                id: 'demo-task-2',
                title: 'Design Daily Productivity Scoring Engine',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                dueDate: todayStr,
                completedAt: null,
                tags: ['Core', 'Analytics'],
                description: 'Calculate weighted scores across habits, tasks, and focused learning sessions.'
            },
            {
                id: 'demo-task-3',
                title: 'Integrate Pomodoro Focus Timer with Session Logs',
                status: 'IN_PROGRESS',
                priority: 'MED',
                dueDate: tomorrowStr,
                completedAt: null,
                tags: ['Focus', 'UX'],
                description: 'Enable audio alerts, timer presets, and seamless logging to the learning log.'
            },
            {
                id: 'demo-task-4',
                title: 'Review System Metrics & Overdue Task Alerts',
                status: 'REVIEW',
                priority: 'MED',
                dueDate: inTwoDaysStr,
                completedAt: null,
                tags: ['Quality', 'Alerts'],
                description: 'Verify warning indicators on dashboard when tasks are past their due dates.'
            },
            {
                id: 'demo-task-5',
                title: 'Optimize Responsive Mobile Drawer Navigation',
                status: 'TODO',
                priority: 'LOW',
                dueDate: inThreeDaysStr,
                completedAt: null,
                tags: ['Mobile', 'UI'],
                description: 'Polish sidebar animations and touch transitions for smaller screens.'
            },
            {
                id: 'demo-task-6',
                title: 'Prepare Growth Milestones for Q3 Roadmap',
                status: 'TODO',
                priority: 'HIGH',
                dueDate: inFourDaysStr,
                completedAt: null,
                tags: ['Planning', 'Goals'],
                description: 'Define target metrics and break down high-level milestones.'
            }
        ],
        goals: [
            {
                id: 'demo-goal-1',
                title: 'Master Full-Stack Cloud & System Architecture',
                targetValue: 100,
                currentValue: 60,
                category: 'Career',
                deadline: '2026-12-31',
                milestones: [
                    { id: 'demo-ms-1', title: 'Complete Advanced Distributed Systems Course', value: 20, done: true },
                    { id: 'demo-ms-2', title: 'Build Event-Driven Microservices Architecture', value: 20, done: true },
                    { id: 'demo-ms-3', title: 'Deploy Scalable Database Clusters with Replication', value: 20, done: true },
                    { id: 'demo-ms-4', title: 'Implement End-to-End Observability & Tracing', value: 20, done: false },
                    { id: 'demo-ms-5', title: 'Publish Comprehensive System Design Case Study', value: 20, done: false }
                ]
            },
            {
                id: 'demo-goal-2',
                title: 'Ship High-Impact Open Source Developer Tools',
                targetValue: 100,
                currentValue: 40,
                category: 'Open Source',
                deadline: '2026-11-15',
                milestones: [
                    { id: 'demo-ms-6', title: 'Initial Prototype & Developer Feedback', value: 20, done: true },
                    { id: 'demo-ms-7', title: 'Comprehensive Unit & Integration Test Suite', value: 20, done: true },
                    { id: 'demo-ms-8', title: 'Interactive Documentation & Live Playground', value: 20, done: false },
                    { id: 'demo-ms-9', title: 'Package Publishing & GitHub Releases', value: 20, done: false },
                    { id: 'demo-ms-10', title: 'Reach 1,000 Active Community Users', value: 20, done: false }
                ]
            },
            {
                id: 'demo-goal-3',
                title: 'Maintain 30-Day Consecutive Daily Growth Streak',
                targetValue: 100,
                currentValue: 50,
                category: 'Personal',
                deadline: '2026-09-30',
                milestones: [
                    { id: 'demo-ms-11', title: '7 Days Consistent Habits & Tasks', value: 25, done: true },
                    { id: 'demo-ms-12', title: '14 Days Focus & Daily Performance > 80%', value: 25, done: true },
                    { id: 'demo-ms-13', title: '21 Days Continuous Milestone Progress', value: 25, done: false },
                    { id: 'demo-ms-14', title: '30 Days Unbroken Growth Achievement', value: 25, done: false }
                ]
            }
        ],
        learning: [
            {
                id: 'demo-learn-1',
                topic: 'TypeScript Advanced Generics & Utility Types',
                minutes: 45,
                date: todayStr,
                notes: 'Mastered conditional types, infer keyword, and mapped type transformations.'
            },
            {
                id: 'demo-learn-2',
                topic: 'High-Performance State Management & Context Optimization',
                minutes: 60,
                date: yesterdayStr,
                notes: 'Explored granular selectors, memoization boundaries, and React concurrency.'
            },
            {
                id: 'demo-learn-3',
                topic: 'Database Indexing Strategies & Query Optimization',
                minutes: 50,
                date: twoDaysAgoStr,
                notes: 'Covered B-tree vs GIN indexes, composite indexing rules, and EXPLAIN ANALYZE.'
            },
            {
                id: 'demo-learn-4',
                topic: 'UI/UX Motion Design & Micro-Interactions',
                minutes: 35,
                date: threeDaysAgoStr,
                notes: 'Practiced physics-based spring animations with Framer Motion.'
            }
        ],
        settings: {
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
        },
        weeklyStats: [
            { date: sixDaysAgoStr, score: 85, habits: 3, tasks: 2, learning: 1 },
            { date: fiveDaysAgoStr, score: 78, habits: 2, tasks: 3, learning: 1 },
            { date: fourDaysAgoStr, score: 92, habits: 4, tasks: 4, learning: 2 },
            { date: threeDaysAgoStr, score: 88, habits: 3, tasks: 3, learning: 1 },
            { date: twoDaysAgoStr, score: 75, habits: 2, tasks: 2, learning: 1 },
            { date: yesterdayStr, score: 90, habits: 4, tasks: 3, learning: 2 },
            { date: todayStr, score: 82, habits: 2, tasks: 1, learning: 1 }
        ]
    };
};
