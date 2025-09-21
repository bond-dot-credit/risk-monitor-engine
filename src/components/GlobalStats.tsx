'use client';

export function GlobalStats() {
  // Mock data - will be fetched from contracts
  const stats = [
    {
      title: "Total Value Locked",
      value: "$2.4M",
      change: "+12.5%",
      changeType: "positive",
      icon: "💰"
    },
    {
      title: "Active Users",
      value: "1,247",
      change: "+8.2%",
      changeType: "positive",
      icon: "👥"
    },
    {
      title: "Active Strategies",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: "⚡"
    },
    {
      title: "Avg APY",
      value: "11.2%",
      change: "+0.8%",
      changeType: "positive",
      icon: "📈"
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Platform Overview
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Real-time statistics from our vault and registry contracts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
