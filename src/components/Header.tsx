'use client';

import { useState } from 'react';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd persist this to localStorage and update the document class
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl">bond.credit</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Dashboard
              </a>
              <a href="/agents" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Agents
              </a>
              <a href="/risk" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Risk Monitor
              </a>
              <a href="#analytics" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Analytics
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
