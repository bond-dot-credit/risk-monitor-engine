'use client';

import { useState, useEffect } from 'react';

export function AgentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const response = await fetch('/api/agents');
        const result = await response.json();
        console.log('API result:', result);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading... Please wait</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      {data && data.success && data.data && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Agents ({data.data.length})</h2>
          <div className="space-y-4">
            {data.data.map((agent: any) => (
              <div key={agent.id} className="p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-gray-600">{agent.metadata.category}</p>
                <p className="text-sm text-gray-600">Score: {agent.score.overall}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
