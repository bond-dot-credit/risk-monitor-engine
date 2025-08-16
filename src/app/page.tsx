import { AgentDashboard } from '@/components/AgentDashboard';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            bond.credit
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            Credit layer for the agentic economy
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Agent scoring, reputation tracking, and dynamic credit lines
          </p>
        </div>
        
        <AgentDashboard />
      </main>
    </div>
  );
}
