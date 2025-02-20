
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      tsDecorators: true,
      plugins: []
    }),
    mode === 'development' && componentTagger(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
    sourcemap: true,
    rollupOptions: {
      external: ['https://cdn.gpteng.co/gptengineer.js'],
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: { 
        bigint: true 
      },
    }
  }
}));
