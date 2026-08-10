import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";

  if (isProd && !env.VITE_API_URL) {
    throw new Error("Missing VITE_API_URL");
  }

  return {
    plugins: [
      react({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    define: {
      __DEV__: JSON.stringify(!isProd),
    },

    build: {
      target: "es2022",
      minify: "esbuild",
      sourcemap: !isProd,
      cssCodeSplit: true,

      // Keep warnings useful while we analyze the actual bundle.
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            // React runtime
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/scheduler/")
            ) {
              return "react-vendor";
            }

            // Routing
            if (id.includes("/react-router")) {
              return "router";
            }

            // Animation libraries.
            // Keep them separate so we can see exactly how much
            // animation code is being shipped.
            if (
              id.includes("/gsap/") ||
              id.includes("/framer-motion/") ||
              id.includes("/motion/") ||
              id.includes("/lenis/")
            ) {
              return "animation";
            }

            // Radix/UI libraries
            if (
              id.includes("/@radix-ui/") ||
              id.includes("/radix-ui/") ||
              id.includes("/@radix-ui")
            ) {
              return "radix";
            }

            // Data fetching / HTTP
            if (id.includes("/@tanstack/react-query/") || id.includes("/axios/")) {
              return "data";
            }

            // Forms / validation
            if (
              id.includes("/react-hook-form/") ||
              id.includes("/@hookform/") ||
              id.includes("/zod/")
            ) {
              return "forms";
            }

            // State management
            if (id.includes("/zustand/")) {
              return "state";
            }

            // Icon libraries
            if (
              id.includes("/lucide-react/") ||
              id.includes("/react-icons/") ||
              id.includes("/@radix-ui/react-icons/")
            ) {
              return "icons";
            }

            // Remaining third-party dependencies.
            return "vendor";
          },
        },
      },
    },
  };
});
