import { useState, useEffect, useRef } from 'react';

interface UseRealTimeDataOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useRealTimeData<T>(
  url: string,
  interval: number = 5000,
  options: UseRealTimeDataOptions = {}
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { enabled = true, onError } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up interval
    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [url, interval, enabled]);

  return { data, error, loading, refetch };
}
