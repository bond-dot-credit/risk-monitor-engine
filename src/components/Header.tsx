'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
 
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Agents', href: '/agents', icon: '🤖' },
  { name: 'Risk', href: '/risk', icon: '⚠️' },
  { name: 'Credit', href: '/credit', icon: '🏦' },
  { name: 'Verify', href: '/verification', icon: '✅' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Scoring', href: '/scoring', icon: '🎯' },
  { name: 'Performance', href: '/performance', icon: '⚡' },
];


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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-xs sm:text-sm md:text-lg lg:text-xl">B</span>
            </div>
            <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">bond.credit</span>
              <span className="sm:hidden">bond</span>
            </span>
          </div>
 
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex xl:space-x-8 lg:space-x-6 2xl:space-x-10">
            <Link href="/" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/agents" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Agents
            </Link>
            <Link href="/risk" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Risk
            </Link>
            <Link href="/credit" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Credit
            </Link>
            <Link href="/verification" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Verify
            </Link>
            <Link href="/analytics" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 rounded-lg xl:rounded-xl text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap">
              Analytics
            </Link>

          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Toggle dark mode"
            >
              <span className="text-sm sm:text-base md:text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>

            {/* Connect Wallet Button */}
            <button className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 md:px-4 lg:px-6 xl:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="hidden lg:inline">Connect Wallet</span>
              <span className="lg:hidden">Connect</span>
            </button>

            {/* Mobile Connect Button */}
            <button className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Connect
 
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}

              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
 
            </button>
          </div>
        </div>


        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/">
                Dashboard
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/agents">
                Agents
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/risk">
                <span className="hidden sm:inline">Risk Monitor</span>
                <span className="sm:hidden">Risk</span>
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/credit">
                <span className="hidden sm:inline">Credit Vaults</span>
                <span className="sm:hidden">Credit</span>
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/verification">
                <span className="hidden sm:inline">Verification</span>
                <span className="sm:hidden">Verify</span>
              </Link>
              <Link className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" href="/analytics">
                Analytics
              </Link>
            </nav>
          </div>
        )}
        
      </div>
    </header>
  );
}