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
          plugins: ["babel-plugin-react-compiler"], // ✅ correct usage
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
      chunkSizeWarningLimit: 700,
    },
  };
});
