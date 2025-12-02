import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UseApiOptions {
  immediate?: boolean;
  deps?: unknown[];
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { immediate = true, deps = [] } = options;
  const { logout } = useAuth();

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    isRefreshing: false,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        isLoading: !isRefresh,
        isRefreshing: isRefresh,
        error: null,
      }));

      try {
        const data = await fetcher();

        if (!isMounted.current) return;

        setState({
          data,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
      } catch (err) {
        if (!isMounted.current) return;

        if (err instanceof ApiClientError && err.isSessionExpired()) {
          await logout();
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    },
    [fetcher, logout]
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  const refetch = useCallback(() => fetchData(false), [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    ...state,
    refetch,
    refresh,
  };
}

export default useApi;
