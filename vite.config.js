import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    port: 3000,

    proxy: {
      "/transcribe": {
        target: "http://localhost:8002",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/transcribe/, "/v1/transcribe"),
      },

      "/panacea-claim/api": {
        target: "http://localhost:8002",
        changeOrigin: true,
        secure: false,
      },

      "/apiClient": {
        target: "http://localhost:8300",
        changeOrigin: true,
        secure: false,
      },
          "/api": {
      // ของเดิมของคุณ ถ้ายังมี API อื่นใช้อยู่
      target: "http://localhost:8002",
      changeOrigin: true,
      secure: false,
    },
    },

    watch: {
      usePolling: true,
    },
  },
});