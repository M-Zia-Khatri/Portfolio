import { AppNavigation } from '@/shared/constants/navigation.constants';
import { Spinner } from '@radix-ui/themes';
import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router';

const Auth = lazy(() => import('@/features/auth/Auth'));
const ContactPage = lazy(() => import('@/features/contact/admin/ContactPage'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const DashboardLayout = lazy(() => import('@/features/dashboard/layout/DashboardLayout'));
const Portfolio = lazy(() => import('@/features/dashboard/pages/portfolio/Portfolio'));
const Skills = lazy(() => import('@/features/dashboard/pages/skills/Skills'));
const Home = lazy(() => import('@/features/home/Home'));
const AppLayout = lazy(() => import('@/shared/components/layout/AppLayout'));

const RouteLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <Spinner size="3" />
  </div>
);

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

const AppRoutes: RouteObject[] = [
  {
    path: '/',
    element: withSuspense(AppLayout),
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
    ],
  },
  {
    path: AppNavigation.AUTH,
    element: withSuspense(Auth),
  },
  { path: '/login', element: <Navigate to={AppNavigation.AUTH} /> },
  {
    path: '/admin',
    element: <Navigate to={AppNavigation.DASHBOARD} />,
  },
  {
    path: AppNavigation.DASHBOARD,
    element: withSuspense(DashboardLayout),
    children: [
      {
        index: true,
        element: withSuspense(Dashboard),
      },
      {
        path: AppNavigation.A_SKILLS,
        element: withSuspense(Skills),
      },
      {
        path: AppNavigation.A_PORTFOLIO,
        element: withSuspense(Portfolio),
      },
      {
        path: AppNavigation.A_CONTACT,
        element: withSuspense(ContactPage),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
];

export default AppRoutes;
