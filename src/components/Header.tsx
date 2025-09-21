'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useResponsive } from '@/hooks/useResponsive';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();

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

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop, isMobileMenuOpen]);

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
              isMobile ? 'w-8 h-8' : isTablet ? 'w-10 h-10' : 'w-12 h-12'
            }`}>
              <span className={`text-white font-bold ${
                isMobile ? 'text-sm' : isTablet ? 'text-lg' : 'text-xl'
              }`}>B</span>
            </div>
            <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`}>
              <span className="hidden sm:inline">bond.credit</span>
              <span className="sm:hidden">bond</span>
            </span>
          </div>
 
          {/* Tablet Navigation */}
          <nav className="hidden md:flex lg:hidden items-center space-x-1">
            <Link href="/" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/agents" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Agents
            </Link>
            <Link href="/risk" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Risk
            </Link>
            <Link href="/analytics" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Analytics
            </Link>
          </nav>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link href="/" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/agents" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Agents
            </Link>
            <Link href="/risk" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Risk
            </Link>
            <Link href="/credit" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Credit
            </Link>
            <Link href="/verification" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Verify
            </Link>
            <Link href="/analytics" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              Analytics
            </Link>
            <Link href="/near-intents" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              NEAR Intents
            </Link>
            <Link href="/vault" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
              🏦 Vault
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isMobile ? 'p-1.5' : 'p-2'
              }`}
              aria-label="Toggle dark mode"
            >
              <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Connect Wallet Button - Desktop */}
            <button className={`hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isTablet ? 'px-4 py-2 rounded-lg text-sm' : 'px-6 py-2.5 rounded-lg text-base'
            }`}>
              <span className="hidden lg:inline">Connect Wallet</span>
              <span className="lg:hidden">Connect</span>
            </button>

            {/* Connect Wallet Button - Mobile */}
            <button className={`md:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isMobile ? 'px-2 py-1.5 rounded-lg text-xs' : 'px-3 py-2 rounded-lg text-sm'
            }`}>
              Connect
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isMobile ? 'p-1.5' : 'p-2'
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>


        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-4">
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/agents"
                onClick={closeMobileMenu}
              >
                Agents
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/risk"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Risk Monitor</span>
                <span className="sm:hidden">Risk</span>
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/credit"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Credit Vaults</span>
                <span className="sm:hidden">Credit</span>
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/verification"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Verification</span>
                <span className="sm:hidden">Verify</span>
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/analytics"
                onClick={closeMobileMenu}
              >
                Analytics
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/near-intents"
                onClick={closeMobileMenu}
              >
                NEAR Intents
              </Link>
              <Link 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                href="/vault"
                onClick={closeMobileMenu}
              >
                🏦 Vault
              </Link>
            </nav>
          </div>
        )}
        
      </div>
    </header>
  );
}