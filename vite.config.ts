import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import removeConsole from "vite-plugin-remove-console";
import svgr from "vite-plugin-svgr";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    sourcemap: true,
  },
  define: {
    bridgeVersion: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react({
      fastRefresh: false,
    }),
    svgr(),
    checker({
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      overlay: false,
      typescript: true,
    }),
    removeConsole(),
  ],
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__dirname, "src") }],
  },
  server: {
    open: true,
  },
});
