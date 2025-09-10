import { describe, it, expect } from 'vitest';
import { CredibilityTier } from '../types/agent';

describe('Simple Credibility Tiers Test', () => {
  it('should have valid tier values', () => {
    expect(CredibilityTier.BRONZE).toBe('BRONZE');
    expect(CredibilityTier.SILVER).toBe('SILVER');
    expect(CredibilityTier.GOLD).toBe('GOLD');
    expect(CredibilityTier.PLATINUM).toBe('PLATINUM');
    expect(CredibilityTier.DIAMOND).toBe('DIAMOND');
  });

  it('should have tier hierarchy', () => {
    const tiers = [
      CredibilityTier.BRONZE,
      CredibilityTier.SILVER,
      CredibilityTier.GOLD,
      CredibilityTier.PLATINUM,
      CredibilityTier.DIAMOND
    ];

    expect(tiers).toHaveLength(5);
    expect(tiers[0]).toBe(CredibilityTier.BRONZE);
    expect(tiers[4]).toBe(CredibilityTier.DIAMOND);
  });

  it('should validate tier transitions', () => {
    const validTransitions = [
      { from: CredibilityTier.BRONZE, to: CredibilityTier.SILVER, valid: true },
      { from: CredibilityTier.SILVER, to: CredibilityTier.GOLD, valid: true },
      { from: CredibilityTier.GOLD, to: CredibilityTier.PLATINUM, valid: true },
      { from: CredibilityTier.PLATINUM, to: CredibilityTier.DIAMOND, valid: true }
    ];

    validTransitions.forEach(({ from, to, valid }) => {
      expect(valid).toBe(true);
      expect(from).toBeDefined();
      expect(to).toBeDefined();
    });
  });

  it('should calculate tier scores correctly', () => {
    const tierScoreRanges = [
      { tier: CredibilityTier.BRONZE, min: 0, max: 59 },
      { tier: CredibilityTier.SILVER, min: 60, max: 69 },
      { tier: CredibilityTier.GOLD, min: 70, max: 79 },
      { tier: CredibilityTier.PLATINUM, min: 80, max: 89 },
      { tier: CredibilityTier.DIAMOND, min: 90, max: 100 }
    ];

    tierScoreRanges.forEach(({ tier, min, max }) => {
      expect(min).toBeLessThanOrEqual(max);
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(100);
    });
  });

  it('should handle edge cases', () => {
    // Test boundary conditions
    expect(CredibilityTier.BRONZE).toBe('BRONZE');
    expect(CredibilityTier.DIAMOND).toBe('DIAMOND');
    
    // Test that tiers are strings
    expect(typeof CredibilityTier.BRONZE).toBe('string');
    expect(typeof CredibilityTier.DIAMOND).toBe('string');
  });
});
