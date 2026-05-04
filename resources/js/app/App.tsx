import { AuthProvider } from '@/features/auth/context/AuthContext';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AppRouter } from './routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 7.5, // 7.5 min
      gcTime: 1000 * 60 * 15, // 15 min
      retry: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    const root = document.getElementById('root');
    const loader = document.getElementById('initial-loader');

    if (root) {
      root.style.visibility = 'visible';
      root.style.opacity = '1';
    }

    if (loader) {
      loader.style.opacity = '0';
      window.setTimeout(() => loader.remove(), 300);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Theme
        appearance="dark"
        accentColor="blue"
        grayColor="gray"
        radius="small"
        scaling="100%"
        className="bg-(--color-background)"
      >
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </Theme>
    </QueryClientProvider>
  );
}
