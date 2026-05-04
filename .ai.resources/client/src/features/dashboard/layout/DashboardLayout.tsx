import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';
import Topbar from './topbar/Topbar';

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo={AppNavigation.AUTH}>
      <div className="flex min-h-screen flex-col bg-(--color-background)">
        {/* Topbar stays OUTSIDE the animated div */}
        <Topbar />

        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
