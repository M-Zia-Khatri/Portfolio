import "lenis/dist/lenis.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App.tsx";
import { initializeRouteAnalytics } from "./app/routes/router.ts";
import "./assets/styles/index.css";

initializeRouteAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
