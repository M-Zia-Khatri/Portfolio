import { createBrowserRouter } from "react-router";
import AppRoutes from "./AppRoutes";
import { analytics } from "@/shared/analytics";

export const AppRouter = createBrowserRouter(AppRoutes);

// Initialize analytics and track the initial load
analytics.start();
analytics.page(window.location.pathname);

let lastPathname = window.location.pathname;

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
