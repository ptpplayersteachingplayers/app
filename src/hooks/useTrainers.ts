import { getTrainers } from '../api/client';
import { Trainer } from '../types';
import { useApi } from './useApi';

interface UseTrainersReturn {
  trainers: Trainer[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTrainers(): UseTrainersReturn {
  const { data, isLoading, isRefreshing, error, refetch, refresh } = useApi(getTrainers);

  return {
    trainers: data ?? [],
    isLoading,
    isRefreshing,
    error,
    refetch,
    refresh,
  };
}

export default useTrainers;
