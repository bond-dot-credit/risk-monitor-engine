import React from 'react';
import { vi, beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom';

// Make React available globally for JSX
global.React = React;

// Global test setup
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
});

// Mock global fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    getEntries: vi.fn(() => []),
    toJSON: vi.fn(() => ({}))
  } as Record<string, unknown>;
}

// Mock crypto API if not available
if (!global.crypto) {
  global.crypto = {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  } as Record<string, unknown>;
}
