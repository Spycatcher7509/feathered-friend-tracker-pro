
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // ensures relative asset paths for production
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
  },
  plugins: [
    react({
      tsDecorators: true,
      plugins: []
    }),
    mode === "development" && componentTagger(),
    electron([
      {
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            sourcemap: true,
            minify: false,
            rollupOptions: {
              external: ["electron", "electron-devtools-installer"]
            }
          }
        }
      }
    ]),
    renderer()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"]
  },
  define: {
    "process.env": "{}",
    "process.version": '"v16.0.0"',
    "process.platform": '"browser"',
    "process.stdout": "{}",
    "process.stderr": "{}",
    global: "globalThis",
    process: '{"env": {}, "version": "v16.0.0", "platform": "browser", "stdout": {}, "stderr": {}}',
    Buffer: ["buffer", "Buffer"],
    setImmediate: "setTimeout",
    clearImmediate: "clearTimeout"
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    exclude: ["electron"]
  }
}));
