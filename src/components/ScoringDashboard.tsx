'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { 
  calculateEnhancedAgentScore, 
  calculateProvenanceScore, 
  calculatePerformanceScore 
} from '@/lib/enhanced-scoring';

interface ScoringDashboardProps {
  agents: Agent[];
}

interface ScoringBreakdown {
  provenance: number;
  performance: number;
  perception: number;
  verification: number;
  overall: number;
  confidence: number;
}

export function ScoringDashboard({ agents }: ScoringDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [scoringBreakdown, setScoringBreakdown] = useState<ScoringBreakdown | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      calculateScoringBreakdown();
      generateHistoricalData();
    }
  }, [selectedAgent]);

  const calculateScoringBreakdown = () => {
    if (!selectedAgent) return;

    // Calculate enhanced scores
    const provenanceScore = calculateProvenanceScore(selectedAgent);
    const performanceScore = calculatePerformanceScore(selectedAgent, historicalData);
    const perceptionScore = selectedAgent.score.perception;
    const verificationScore = selectedAgent.score.verification;

    // Calculate overall score with enhanced algorithm
    const enhancedScore = calculateEnhancedAgentScore(
      provenanceScore,
      performanceScore,
      perceptionScore,
      verificationScore
    );

    setScoringBreakdown({
      provenance: provenanceScore,
      performance: performanceScore,
      perception: perceptionScore,
      verification: verificationScore,
      overall: enhancedScore.overall,
      confidence: enhancedScore.confidence
    });
  };

  const generateHistoricalData = () => {
    if (!selectedAgent) return;

    // Generate mock historical performance data
    const data = [];
    const basePerformance = selectedAgent.score.performance;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 10;
      const performance = Math.max(0, Math.min(100, basePerformance + variation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        performance: Math.round(performance),
        timestamp: date
      });
    }
    
    setHistoricalData(data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-yellow-50';
    if (score >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return 'Very High';
    if (confidence >= 80) return 'High';
    if (confidence >= 70) return 'Medium';
    if (confidence >= 60) return 'Low';
    return 'Very Low';
  };

  if (!selectedAgent || !scoringBreakdown) {
    return <div className="p-6 text-center text-gray-500">Select an agent to view scoring details</div>;
  }

  const recentPerformance = historicalData.slice(-7);
  const performanceTrend = recentPerformance.length >= 2 
    ? recentPerformance[recentPerformance.length - 1].performance - recentPerformance[0].performance
    : 0;

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedAgent.name}</h2>
            <p className="text-sm text-gray-600">{selectedAgent.metadata.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scoringBreakdown.overall)}`}>
              {scoringBreakdown.overall}
            </div>
            <div className="text-sm text-gray-500">Enhanced Overall Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-3 rounded-lg ${getScoreBackground(scoringBreakdown.provenance)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(scoringBreakdown.provenance)}`}>
              {scoringBreakdown.provenance}
            </div>
            <div className="text-sm text-gray-600">Provenance</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getScoreBackground(scoringBreakdown.performance)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(scoringBreakdown.performance)}`}>
              {scoringBreakdown.performance}
            </div>
            <div className="text-sm text-gray-600">Performance</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getScoreBackground(scoringBreakdown.perception)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(scoringBreakdown.perception)}`}>
              {scoringBreakdown.perception}
            </div>
            <div className="text-sm text-gray-600">Perception</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getScoreBackground(scoringBreakdown.verification)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(scoringBreakdown.verification)}`}>
              {scoringBreakdown.verification}
            </div>
            <div className="text-sm text-gray-600">Verification</div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Scoring Confidence</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">{scoringBreakdown.confidence}%</div>
            <div className="text-sm text-gray-600">Confidence Level: {getConfidenceLevel(scoringBreakdown.confidence)}</div>
          </div>
          <div className="w-32 h-32 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${scoringBreakdown.confidence}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">{scoringBreakdown.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trend (Last 7 Days)</h3>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-lg font-medium">Performance Chart</div>
            <div className="text-sm">Showing 7-day trend</div>
            <div className={`text-sm mt-2 font-medium ${
              performanceTrend > 0 ? 'text-green-600' : performanceTrend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              Trend: {performanceTrend > 0 ? '+' : ''}{performanceTrend.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Scoring Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-medium text-gray-900">Provenance Score</div>
                <div className="text-sm text-gray-600">Code verification, audit history, deployment</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(scoringBreakdown.provenance)}`}>
                {scoringBreakdown.provenance}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-gray-900">Performance Score</div>
                <div className="text-sm text-gray-600">Historical consistency, risk-adjusted returns</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(scoringBreakdown.performance)}`}>
                {scoringBreakdown.performance}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-medium text-gray-900">Perception Score</div>
                <div className="text-sm text-gray-600">Community trust, reputation metrics</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(scoringBreakdown.perception)}`}>
                {scoringBreakdown.perception}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-medium text-gray-900">Verification Score</div>
                <div className="text-sm text-gray-600">Multi-factor verification methods</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(scoringBreakdown.verification)}`}>
                {scoringBreakdown.verification}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Score Comparison</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enhanced vs Original Overall</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Original: {selectedAgent.score.overall}</span>
              <span className="text-sm font-medium text-blue-600">Enhanced: {scoringBreakdown.overall}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                scoringBreakdown.overall > selectedAgent.score.overall 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {scoringBreakdown.overall > selectedAgent.score.overall ? '+' : ''}
                {scoringBreakdown.overall - selectedAgent.score.overall}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scoringBreakdown.overall}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
