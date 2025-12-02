import { getCamps } from '../api/client';
import { Camp } from '../types';
import { useApi } from './useApi';

interface UseCampsReturn {
  camps: Camp[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCamps(): UseCampsReturn {
  const { data, isLoading, isRefreshing, error, refetch, refresh } = useApi(getCamps);

  return {
    camps: data ?? [],
    isLoading,
    isRefreshing,
    error,
    refetch,
    refresh,
  };
}

export default useCamps;
