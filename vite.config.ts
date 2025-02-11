
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Add Node.js global polyfills
    'process.env': {},
    'process.version': '"v16.0.0"',
    'process.platform': '"browser"',
    'process.stdout': '{ isTTY: false }',
    'process.stderr': '{ isTTY: false }',
    'global': 'globalThis',
    'process': {
      env: {},
      version: '"v16.0.0"',
      platform: '"browser"',
      stdout: { isTTY: false },
      stderr: { isTTY: false }
    }
  }
}));
