import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const { loading, error } = useData();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-background text-text font-sans flex overflow-x-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen relative w-full lg:pl-64 max-w-full">
                <Topbar onMenuClick={toggleSidebar} />
                <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto">
                    {loading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#17171C] border border-white/10 shadow-2xl"
                            >
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <span className="text-sm font-semibold text-white">Synchronizing workspace...</span>
                            </motion.div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 sm:p-4 rounded-xl mb-4 sm:mb-6 flex items-center gap-3 text-xs sm:text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <Outlet key={location.pathname} />
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
