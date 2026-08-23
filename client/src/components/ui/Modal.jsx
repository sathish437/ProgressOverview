import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export function Modal({ title, children, onClose, isOpen }) {
    // Prevent background scrolling while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="bg-[#18181D] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 sm:mb-5 pb-2.5 border-b border-white/5">
                    <h3 className="text-base sm:text-lg font-extrabold text-white truncate pr-2">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl shrink-0"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
