import { getSessions } from '../api/client';
import { Session } from '../types';
import { useApi } from './useApi';

interface UseSessionsReturn {
  sessions: Session[];
  upcomingSessions: Session[];
  pastSessions: Session[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const { data, isLoading, isRefreshing, error, refetch, refresh } = useApi(getSessions);

  const sessions = data ?? [];
  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  const pastSessions = sessions.filter((s) => s.status !== 'upcoming');

  return {
    sessions,
    upcomingSessions,
    pastSessions,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refresh,
  };
}

export default useSessions;
