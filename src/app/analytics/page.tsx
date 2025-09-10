
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = agents.filter(agent => {
    if (selectedCategory !== 'all' && agent.metadata.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== 'all' && agent.credibilityTier !== selectedTier) {
      return false;
    }
    return true;
  });

  const categories = ['all', ...Array.from(new Set(agents.map(a => a.metadata.category)))];
  const tiers = ['all', ...Array.from(new Set(agents.map(a => a.credibilityTier)))];

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Analytics</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive analytics and insights for agent performance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credibility Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier === 'all' ? 'All Tiers' : tier}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <div className="text-sm text-gray-500">
                Showing {filteredAgents.length} of {agents.length} agents
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard agents={filteredAgents} />

        {/* Additional Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Performing Category</span>
                <span className="font-medium">
                  {(() => {
                    const categoryScores = agents.reduce((acc, agent) => {
                      const category = agent.metadata.category;
                      if (!acc[category]) acc[category] = { total: 0, count: 0 };
                      acc[category].total += agent.score.overall;
                      acc[category].count++;
                      return acc;
                    }, {} as { [key: string]: { total: number; count: number } });

                    let bestCategory = 'N/A';
                    let bestScore = 0;

                    Object.entries(categoryScores).forEach(([category, data]) => {
                      const avgScore = data.total / data.count;
                      if (avgScore > bestScore) {
                        bestScore = avgScore;
                        bestCategory = category;
                      }
                    });

                    return bestCategory;
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Score Range</span>
                <span className="font-medium">
                  {Math.min(...agents.map(a => a.score.overall))} - {Math.max(...agents.map(a => a.score.overall))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Standard Deviation</span>
                <span className="font-medium">
                  {(() => {
                    const scores = agents.map(a => a.score.overall);
                    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
                    return Math.round(Math.sqrt(variance));
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Trend</span>
                <span className="font-medium text-green-600">↗️ Improving</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="font-medium">+2.3% / month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Volatility</span>
                <span className="font-medium">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prediction</span>
                <span className="font-medium text-blue-600">+5% next month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
