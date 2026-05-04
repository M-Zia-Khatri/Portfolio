import { motion } from 'motion/react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

const AuthLoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-background)">
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 1.4, repeat: Infinity }}
      className="size-12 rounded-full bg-(--blue-8) opacity-60"
    />
  </div>
);

export const ProtectedRoute = ({ allowedRoles, redirectTo = '/', children }: any) => {
  const { isAuthenticated, isLoading, hasRole } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/" replace />;

  // logic only: return children directly
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
