import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CredibilityTiersDashboard } from '../components/CredibilityTiersDashboard';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';

// Mock the credibility tiers library
vi.mock('../lib/credibility-tiers', () => ({
  CREDIBILITY_TIERS: {
    [CredibilityTier.BRONZE]: {
      name: 'Bronze',
      emoji: '🥉',
      maxLTV: 40,
      minScore: 0,
      maxScore: 59,
      description: 'Basic tier for new agents',
      requirements: ['New agent registration', 'Basic verification'],
      benefits: ['Access to basic lending', 'Standard rates'],
      upgradeRequirements: ['Score 60+', '30 days active', '2+ successful transactions']
    },
    [CredibilityTier.SILVER]: {
      name: 'Silver',
      emoji: '🥈',
      maxLTV: 50,
      minScore: 60,
      maxScore: 69,
      description: 'Established agents with proven track record',
      requirements: ['Score 60+', '30 days active', '2+ successful transactions'],
      benefits: ['Higher LTV limits', 'Better rates', 'Priority support'],
      upgradeRequirements: ['Score 70+', '90 days active', '10+ successful transactions', 'No critical alerts']
    },
    [CredibilityTier.GOLD]: {
      name: 'Gold',
      emoji: '🥇',
      maxLTV: 60,
      minScore: 70,
      maxScore: 79,
      description: 'High-performing agents with strong reputation',
      requirements: ['Score 70+', '90 days active', '10+ successful transactions', 'No critical alerts'],
      benefits: ['Premium LTV limits', 'Best rates', 'VIP support', 'Early access to new features'],
      upgradeRequirements: ['Score 80+', '180 days active', '25+ successful transactions', 'No alerts in 30 days']
    },
    [CredibilityTier.PLATINUM]: {
      name: 'Platinum',
      emoji: '🏆',
      maxLTV: 70,
      minScore: 80,
      maxScore: 89,
      description: 'Elite agents with exceptional scores',
      requirements: ['Score 80+', '180 days active', '25+ successful transactions', 'No alerts in 30 days'],
      benefits: ['Elite LTV limits', 'Premium rates', 'Dedicated support', 'Exclusive features', 'Governance rights'],
      upgradeRequirements: ['Score 90+', '365 days active', '50+ successful transactions', 'Perfect compliance record']
    },
    [CredibilityTier.DIAMOND]: {
      name: 'Diamond',
      emoji: '💎',
      maxLTV: 80,
      minScore: 90,
      maxScore: 100,
      description: 'Top-tier agents with maximum trust',
      requirements: ['Score 90+', '365 days active', '50+ successful transactions', 'Perfect compliance record'],
      benefits: ['Maximum LTV limits', 'Elite rates', '24/7 dedicated support', 'All features access', 'Governance voting', 'Revenue sharing'],
      upgradeRequirements: ['Maintain score 90+', 'Continue excellent performance']
    }
  },
  calculateTierBenefits: vi.fn(),
  compareAgentTiers: vi.fn()
}));

describe('Credibility Tiers Dashboard', () => {
  let mockAgents: Agent[];
  let mockTierBenefits: any;
  let mockTierComparison: any;

  beforeEach(() => {
    mockAgents = [
      {
        id: 'test-agent-1',
        name: 'Test Platinum Agent',
        operator: '0x1234567890abcdef',
        metadata: {
          description: 'A test agent for credibility tiers',
          category: 'Trading',
          version: '2.0.0',
          tags: ['test', 'tiers', 'platinum'],
          provenance: {
            sourceCode: 'https://github.com/test-org/tier-agent',
            verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
            deploymentChain: 'Ethereum',
            lastAudit: new Date('2024-01-15'),
            auditScore: 88,
            auditReport: 'https://audit-reports.com/test-tier-agent'
          },
          verificationMethods: [
            {
              id: 'verif_1',
              type: VerificationType.CODE_AUDIT,
              status: VerificationStatus.PASSED,
              score: 88,
              lastVerified: new Date('2024-01-15'),
              nextVerificationDue: new Date('2024-07-15'),
              details: {}
            }
          ]
        },
        score: {
          overall: 85,
          provenance: 88,
          performance: 82,
          perception: 80,
          verification: 88,
          confidence: 85,
          lastUpdated: new Date()
        },
        credibilityTier: CredibilityTier.PLATINUM,
        status: AgentStatus.ACTIVE,
        verification: VerificationStatus.PASSED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'test-agent-2',
        name: 'Test Gold Agent',
        operator: '0xabcdef1234567890abcdef1234567890abcdef12',
        metadata: {
          description: 'A test gold tier agent',
          category: 'Lending',
          version: '1.5.0',
          tags: ['test', 'tiers', 'gold'],
          provenance: {
            sourceCode: 'https://github.com/test-org/gold-agent',
            verificationHash: '0x1234567890abcdef1234567890abcdef12345678',
            deploymentChain: 'Polygon',
            lastAudit: new Date('2024-01-10'),
            auditScore: 75,
            auditReport: 'https://audit-reports.com/test-gold-agent'
          },
          verificationMethods: []
        },
        score: {
          overall: 75,
          provenance: 75,
          performance: 78,
          perception: 72,
          verification: 80,
          confidence: 76,
          lastUpdated: new Date()
        },
        credibilityTier: CredibilityTier.GOLD,
        status: AgentStatus.ACTIVE,
        verification: VerificationStatus.PASSED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
    ];

    mockTierBenefits = {
      currentTier: CredibilityTier.PLATINUM,
      tierInfo: {
        name: 'Platinum',
        emoji: '🏆',
        maxLTV: 70,
        requirements: ['Score 80+', '180 days active', '25+ successful transactions', 'No alerts in 30 days'],
        benefits: ['Elite LTV limits', 'Premium rates', 'Dedicated support', 'Exclusive features', 'Governance rights']
      },
      maxLTV: 75,
      benefits: ['Elite LTV limits', 'Premium rates', 'Dedicated support', 'Exclusive features', 'Governance rights'],
      upgradePath: {
        nextTier: CredibilityTier.DIAMOND,
        requirements: ['Score 90+', '365 days active', '50+ successful transactions', 'Perfect compliance record'],
        estimatedTime: '2-4 weeks'
      }
    };

    mockTierComparison = {
      tierDistribution: {
        [CredibilityTier.BRONZE]: 0,
        [CredibilityTier.SILVER]: 0,
        [CredibilityTier.GOLD]: 1,
        [CredibilityTier.PLATINUM]: 1,
        [CredibilityTier.DIAMOND]: 0
      },
      averageScores: {
        [CredibilityTier.BRONZE]: 0,
        [CredibilityTier.SILVER]: 0,
        [CredibilityTier.GOLD]: 75,
        [CredibilityTier.PLATINUM]: 85,
        [CredibilityTier.DIAMOND]: 0
      },
      tierPerformance: {
        [CredibilityTier.BRONZE]: { avgLTV: 0, avgScore: 0 },
        [CredibilityTier.SILVER]: { avgLTV: 0, avgScore: 0 },
        [CredibilityTier.GOLD]: { avgLTV: 65, avgScore: 75 },
        [CredibilityTier.PLATINUM]: { avgLTV: 75, avgScore: 85 },
        [CredibilityTier.DIAMOND]: { avgLTV: 0, avgScore: 0 }
      }
    };

    // Mock the imported functions
    const { calculateTierBenefits, compareAgentTiers } = require('../lib/credibility-tiers');
    calculateTierBenefits.mockReturnValue(mockTierBenefits);
    compareAgentTiers.mockReturnValue(mockTierComparison);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the dashboard with agent information', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Test Platinum Agent')).toBeInTheDocument();
      expect(screen.getByText('A test agent for credibility tiers')).toBeInTheDocument();
      expect(screen.getByText('Platinum')).toBeInTheDocument();
    });

    it('should display current tier information', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('Platinum')).toBeInTheDocument();
      expect(screen.getByText('Current Tier')).toBeInTheDocument();
    });

    it('should show tier metrics', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument(); // Max LTV
      expect(screen.getByText('85')).toBeInTheDocument(); // Overall Score
      expect(screen.getByText('Available')).toBeInTheDocument(); // Upgrade Status
    });
  });

  describe('Tier Benefits Display', () => {
    it('should display current tier requirements', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Requirements Met')).toBeInTheDocument();
      expect(screen.getByText('Score 80+')).toBeInTheDocument();
      expect(screen.getByText('180 days active')).toBeInTheDocument();
      expect(screen.getByText('25+ successful transactions')).toBeInTheDocument();
    });

    it('should display current tier benefits', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Benefits')).toBeInTheDocument();
      expect(screen.getByText('Elite LTV limits')).toBeInTheDocument();
      expect(screen.getByText('Premium rates')).toBeInTheDocument();
      expect(screen.getByText('Dedicated support')).toBeInTheDocument();
    });
  });

  describe('Upgrade Path Display', () => {
    it('should show upgrade path when available', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Upgrade to Diamond')).toBeInTheDocument();
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Timeline')).toBeInTheDocument();
      expect(screen.getByText('2-4 weeks')).toBeInTheDocument();
    });

    it('should display upgrade requirements', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Score 90+')).toBeInTheDocument();
      expect(screen.getByText('365 days active')).toBeInTheDocument();
      expect(screen.getByText('50+ successful transactions')).toBeInTheDocument();
    });
  });

  describe('Tier Distribution', () => {
    it('should display tier distribution chart', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Tier Distribution')).toBeInTheDocument();
      expect(screen.getByText('🥇 Gold')).toBeInTheDocument();
      expect(screen.getByText('🏆 Platinum')).toBeInTheDocument();
    });

    it('should show tier counts and percentages', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Gold count
      expect(screen.getByText('1')).toBeInTheDocument(); // Platinum count
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // Gold percentage
      expect(screen.getByText('50.0%')).toBeInTheDocument()); // Platinum percentage
    });

    it('should allow tier selection for detailed view', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      const goldTier = screen.getByText('🥇 Gold');
      fireEvent.click(goldTier);
      
      // Should show detailed tier information
      expect(screen.getByText('Tier Stats')).toBeInTheDocument();
      expect(screen.getByText('Max LTV: 60%')).toBeInTheDocument();
      expect(screen.getByText('Score Range: 70-79')).toBeInTheDocument();
    });
  });

  describe('Tier Comparison Table', () => {
    it('should display tier comparison table', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Tier Comparison')).toBeInTheDocument();
      expect(screen.getByText('Max LTV')).toBeInTheDocument();
      expect(screen.getByText('Score Range')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
      expect(screen.getByText('Avg Score')).toBeInTheDocument();
      expect(screen.getByText('Avg LTV')).toBeInTheDocument();
    });

    it('should highlight current agent tier in table', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      // The Platinum tier row should have special styling
      const platinumRow = screen.getByText('🏆 Platinum').closest('tr');
      expect(platinumRow).toHaveClass('bg-blue-50');
    });

    it('should display correct tier data in table', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('60%')).toBeInTheDocument(); // Gold max LTV
      expect(screen.getByText('70%')).toBeInTheDocument(); // Platinum max LTV
      expect(screen.getByText('70-79')).toBeInTheDocument(); // Gold score range
      expect(screen.getByText('80-89')).toBeInTheDocument(); // Platinum score range
    });
  });

  describe('Interactive Features', () => {
    it('should toggle tier details on click', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      const goldTier = screen.getByText('🥇 Gold');
      
      // Initially no detailed view
      expect(screen.queryByText('Tier Stats')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(goldTier);
      expect(screen.getByText('Tier Stats')).toBeInTheDocument();
      
      // Click again to collapse
      fireEvent.click(goldTier);
      expect(screen.queryByText('Tier Stats')).not.toBeInTheDocument();
    });

    it('should handle multiple tier selections', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      const goldTier = screen.getByText('🥇 Gold');
      const platinumTier = screen.getByText('🏆 Platinum');
      
      // Select Gold tier
      fireEvent.click(goldTier);
      expect(screen.getByText('Tier Stats')).toBeInTheDocument();
      
      // Select Platinum tier (should deselect Gold)
      fireEvent.click(platinumTier);
      expect(screen.getByText('Tier Stats')).toBeInTheDocument();
      
      // Gold tier details should no longer be visible
      expect(screen.queryByText('Max LTV: 60%')).not.toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle empty agents array', () => {
      const { calculateTierBenefits, compareAgentTiers } = require('../lib/credibility-tiers');
      calculateTierBenefits.mockReturnValue(null);
      compareAgentTiers.mockReturnValue(null);
      
      render(<CredibilityTiersDashboard agents={[]} />);
      
      expect(screen.getByText('Loading credibility tiers data...')).toBeInTheDocument();
    });

    it('should handle missing tier comparison data', () => {
      const { compareAgentTiers } = require('../lib/credibility-tiers');
      compareAgentTiers.mockReturnValue(null);
      
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Loading credibility tiers data...')).toBeInTheDocument();
    });

    it('should handle missing tier benefits data', () => {
      const { calculateTierBenefits } = require('../lib/credibility-tiers');
      calculateTierBenefits.mockReturnValue(null);
      
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('Loading credibility tiers data...')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should apply correct tier colors', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      const platinumBadge = screen.getByText('🏆 Platinum').closest('div');
      expect(platinumBadge).toHaveClass('bg-slate-100', 'text-slate-800', 'border-slate-200');
    });

    it('should display tier emojis correctly', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      expect(screen.getByText('🥉')).toBeInTheDocument(); // Bronze
      expect(screen.getByText('🥈')).toBeInTheDocument(); // Silver
      expect(screen.getByText('🥇')).toBeInTheDocument(); // Gold
      expect(screen.getByText('🏆')).toBeInTheDocument(); // Platinum
      expect(screen.getByText('💎')).toBeInTheDocument(); // Diamond
    });

    it('should show progress bars for tier distribution', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      // Progress bars should be present for each tier
      const progressBars = document.querySelectorAll('.bg-gradient-to-r');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should handle grid layout changes', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      // Should have responsive grid classes
      const gridElements = document.querySelectorAll('.grid-cols-1.md\\:grid-cols-2, .grid-cols-1.md\\:grid-cols-3');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should handle table overflow', () => {
      render(<CredibilityTiersDashboard agents={mockAgents} />);
      
      const tableContainer = document.querySelector('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
    });
  });
});
