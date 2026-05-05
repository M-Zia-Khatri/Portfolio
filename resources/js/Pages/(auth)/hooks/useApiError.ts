import { useCallback, useState } from 'react';

export function useApiError() {
  const [error, setError] = useState('');

  const handleError = useCallback((err: unknown, fallback: string) => {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    setError(axiosErr?.response?.data?.message ?? axiosErr?.message ?? fallback);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { error, setError, handleError, clearError };
}
