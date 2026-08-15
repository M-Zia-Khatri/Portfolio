import { type ComponentType, lazy, Suspense } from "react";
import { Navigate, type RouteObject } from "react-router";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import Home from "@/features/home/Home";
import AppLayout from "@/shared/components/layout/AppLayout";
import { AppNavigation } from "@/shared/constants/navigation.constants";

// Admin & Non-critical routes (Split into separate chunks)
const Auth = lazy(() => import("@/features/auth/Auth"));
const ContactPage = lazy(() => import("@/features/contact/admin/ContactPage"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
const DashboardLayout = lazy(() => import("@/features/dashboard/layout/DashboardLayout"));
const Analytics = lazy(() => import("@/features/dashboard/pages/analytics/Analytics"));
const Portfolio = lazy(() => import("@/features/dashboard/pages/portfolio/Portfolio"));
const Skills = lazy(() => import("@/features/dashboard/pages/skills/Skills"));

const RouteLoader = () => (
  <div id="initial-loader">
    <div className="loader">
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </div>
  </div>
);

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

const AppRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: AppNavigation.AUTH,
    element: <AuthProvider>{withSuspense(Auth)}</AuthProvider>,
  },
  {
    path: "/login",
    element: <Navigate to={AppNavigation.AUTH} />,
  },
  {
    path: "/admin",
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
        path: AppNavigation.A_ANALYTICS,
        element: withSuspense(Analytics),
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
    path: "*",
    element: <Navigate to="/" />,
  },
];

export default AppRoutes;
