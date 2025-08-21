'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedDarkMode || savedTheme === 'dark' || (!savedTheme && !localStorage.getItem('darkMode') && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    localStorage.setItem('darkMode', newDarkMode.toString());
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm sm:text-lg">B</span>
            </div>
            <span className="font-bold text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">bond.credit</span>
              <span className="sm:hidden">bond</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex xl:space-x-8 lg:space-x-6">
            <Link href="/" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/agents" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Agents
            </Link>
            <Link href="/risk" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Risk
            </Link>
            <Link href="/credit" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Credit
            </Link>
            <Link href="/verification" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Verify
            </Link>
            <Link href="/analytics" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Analytics
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
              aria-label="Toggle dark mode"
            >
              <span className="text-sm sm:text-base">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>

            {/* Connect Wallet Button */}
            <button className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base">
              Connect Wallet
            </button>

            {/* Mobile Connect Button */}
            <button className="sm:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs">
              Connect
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <nav className="grid grid-cols-2 gap-2 pt-4">
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/">
                Dashboard
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/agents">
                Agents
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/risk">
                Risk Monitor
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/credit">
                Credit Vaults
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/verification">
                Verification
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center" href="/analytics">
                Analytics
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
