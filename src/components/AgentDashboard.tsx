'use client';

import { useState, useEffect } from 'react';

export function AgentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const response = await fetch('/api/agents');
        const result = await response.json();
        console.log('API result:', result);
        
        // Validate the data structure
        if (result && typeof result === 'object') {
          setData(result);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch agents');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading... Please wait</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Defensive check for data structure
  if (!data || !data.success || !Array.isArray(data.data)) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Invalid data structure</div>
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Agent Dashboard with Data Fetching</h2>
        <p>Data loaded successfully!</p>
        <p>Total agents: {data.data.length}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Agents ({data.data.length})</h2>
        <div className="space-y-4">
          {data.data.map((agent: any, index: number) => (
            <div key={agent?.id || index} className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold">{agent?.name || 'Unknown Agent'}</h3>
              <p className="text-sm text-gray-600">{agent?.metadata?.category || 'No Category'}</p>
              <p className="text-sm text-gray-600">Score: {agent?.score?.overall || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
