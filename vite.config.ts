
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    electron({
      entry: 'electron/main.ts',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': '{}',
    'process.version': '"v16.0.0"',
    'process.platform': '"browser"',
    'process.stdout': '{}',
    'process.stderr': '{}',
    'global': 'globalThis',
    'process': '{"env": {}, "version": "v16.0.0", "platform": "browser", "stdout": {}, "stderr": {}}',
    'Buffer': ['buffer', 'Buffer'],
    '__filename': '"browser-only"',
    '__dirname': '"browser-only"',
    'setImmediate': 'setTimeout',
    'clearImmediate': 'clearTimeout'
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    rollupOptions: {
      external: ['https://cdn.gpteng.co/gptengineer.js']
    }
  }
}));
