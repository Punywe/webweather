import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.error('Failed to set theme:', e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'slate-100' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] flex items-center justify-center rounded-full w-14 h-14 md:w-16 md:h-16 shadow-2xl border transition-all duration-500 hover:scale-110 active:scale-95 cursor-pointer select-none theme-toggle-btn group"
            aria-label="Toggle theme"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {theme === 'dark' ? (
                    <Moon className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 group-hover:rotate-12 transition-transform duration-500 theme-icon-spin" />
                ) : (
                    <Sun className="w-6 h-6 md:w-7 md:h-7 text-amber-600 group-hover:rotate-45 transition-transform duration-500 theme-icon-spin" />
                )}
            </div>
        </button>
    );
};
