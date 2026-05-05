import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { refreshTokenApi } from '../services/auth.api';
import { setAccessToken } from './tokenManager';

const REFRESH_INTERVAL_MS = 14 * 60 * 1000; // Refresh 1 min before 15m expiry

export function useAutoRefresh() {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const performRefresh = async () => {
      try {
        const data = await refreshTokenApi();
        // FIX: Only set the Access Token.
        // The Refresh Token is an HttpOnly cookie updated by the server in the Set-Cookie header.
        setAccessToken(data.accessToken);
      } catch (err) {
        console.error('Auto-refresh failed, logging out...', err);
        logout();
      }
    };

    timerRef.current = setInterval(performRefresh, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, logout]);
}
