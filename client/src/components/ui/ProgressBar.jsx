import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function ProgressBar({ value, max = 100, colorClass = "bg-primary", className }) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn("h-2 bg-gray-800 rounded-full overflow-hidden", className)}>
            <motion.div
                className={cn("h-full", colorClass)}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
}
