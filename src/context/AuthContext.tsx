import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  login as apiLogin,
  getMe,
  setAuthToken,
  clearAuthToken,
  loadStoredToken,
  ApiClientError,
} from '../api/client';
import { User, LoginCredentials } from '../types';
import queryClient from '../api/queryClient';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isGuest: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isInitialized: false,
    isGuest: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await loadStoredToken();

        if (token) {
          try {
            const user = await getMe();
            setState({
              user,
              isLoading: false,
              isInitialized: true,
              isGuest: false,
            });
          } catch {
            console.log('Stored token invalid, clearing...');
            await clearAuthToken();
            setState({
              user: null,
              isLoading: false,
              isInitialized: true,
              isGuest: false,
            });
          }
        } else {
          setState({
            user: null,
            isLoading: false,
            isInitialized: true,
            isGuest: false,
          });
        }
      } catch {
        console.error('Error initializing auth');
        setState({
          user: null,
          isLoading: false,
          isInitialized: true,
          isGuest: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const loginResponse = await apiLogin(credentials);
      await setAuthToken(loginResponse.token);
      const user = await getMe();

      setState({
        user,
        isLoading: false,
        isInitialized: true,
        isGuest: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));

      if (error instanceof ApiClientError) {
        if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
          throw new Error('Invalid email or password. Please try again.');
        }
        if (error.code === '[jwt_auth] invalid_username') {
          throw new Error('Invalid email or password. Please try again.');
        }
        if (error.code === '[jwt_auth] incorrect_password') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw new Error(error.message);
      }

      throw new Error('Unable to log in. Please check your connection and try again.');
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await clearAuthToken();
      queryClient.clear();
    } catch {
      console.error('Error clearing token');
    } finally {
      setState({
        user: null,
        isLoading: false,
        isInitialized: true,
        isGuest: false,
      });
    }
  }, []);

  const continueAsGuest = useCallback((): void => {
    setState({
      user: null,
      isLoading: false,
      isInitialized: true,
      isGuest: true,
    });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
