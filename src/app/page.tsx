import { AgentDashboard } from "@/components/AgentDashboard";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl lg:rounded-2xl mb-3 sm:mb-4 lg:mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6 leading-tight px-2 sm:px-4">
              bond.credit
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-700 dark:text-slate-200 mb-2 sm:mb-3 lg:mb-4 font-medium px-2 sm:px-4">
            Credit layer for the agentic economy
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 lg:mb-8 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4 leading-relaxed">
            Advanced agent scoring, reputation tracking, and dynamic credit lines powered by AI and blockchain technology
          </p>
 
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200">
              🚀 AI-Powered
            </span>
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200">
              🔒 Secure
            </span>
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200">
              ⚡ Real-time
            </span>
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-200">
              🌐 Multi-chain
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center px-2 sm:px-4 max-w-xs sm:max-w-md lg:max-w-lg mx-auto">
            <button className="w-full sm:w-auto px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Get Started
            </button>
            <button className="w-full sm:w-auto px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg md:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              <span className="hidden sm:inline">View Documentation</span>
              <span className="sm:hidden">Documentation</span>
            </button>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 lg:mb-4 px-2 sm:px-4 leading-tight">
              Live Agent Dashboard
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4 leading-relaxed">
              Monitor real-time agent performance, credibility scores, and risk metrics across all supported networks
            </p>
          </div>
 
          <AgentDashboard />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 truncate">Total Agents</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-1 sm:mt-2">3,247</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg sm:rounded-xl lg:rounded-2xl flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-5">
              <div className="flex items-center text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                <span className="text-green-500 font-semibold">+12.5%</span>
                <span className="mx-1 hidden sm:inline">from last month</span>
                <span className="mx-1 sm:hidden">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 truncate">Total Volume</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-1 sm:mt-2">$2.4B</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg sm:rounded-xl lg:rounded-2xl flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-5">
              <div className="flex items-center text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                <span className="text-green-500 font-semibold">+8.2%</span>
                <span className="mx-1 hidden sm:inline">from last month</span>
                <span className="mx-1 sm:hidden">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 truncate">Avg Score</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-1 sm:mt-2">87.3</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg sm:rounded-xl lg:rounded-2xl flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-5">
              <div className="flex items-center text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                <span className="text-green-500 font-semibold">+2.1%</span>
                <span className="mx-1 hidden sm:inline">from last month</span>
                <span className="mx-1 sm:hidden">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 truncate">Risk Level</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">Low</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg sm:rounded-xl lg:rounded-2xl flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-5">
              <div className="flex items-center text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                <span className="text-green-500 font-semibold">Stable</span>
                <span className="mx-1">portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
