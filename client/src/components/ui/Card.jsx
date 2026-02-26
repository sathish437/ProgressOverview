import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ children, className, onClick, ...props }, ref) => {
    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "bg-surface border border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-200",
                onClick && "cursor-pointer hover:border-gray-700 hover:bg-surface/80",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});
