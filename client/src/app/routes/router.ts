import { createBrowserRouter } from "react-router";
import { analytics } from "@/shared/analytics";
import AppRoutes from "./AppRoutes";

export const AppRouter = createBrowserRouter(AppRoutes);

let isRouteAnalyticsInitialized = false;
let lastPathname = window.location.pathname;

export function initializeRouteAnalytics() {
  if (isRouteAnalyticsInitialized) return;
  isRouteAnalyticsInitialized = true;

  analytics.start();
  analytics.page(window.location.pathname);

  AppRouter.subscribe((state) => {
    const currentPathname = state.location.pathname;
    // Deduplicate navigations replacing the same URL
    if (currentPathname !== lastPathname) {
      lastPathname = currentPathname;
      // Slight delay to allow document.title to update
      setTimeout(() => {
        analytics.page(currentPathname);
      }, 100);
    }
  });
}
