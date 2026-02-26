import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Button({ children, className, onClick, ...props }) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
