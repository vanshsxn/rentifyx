import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", 
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    historyApiFallback: true, 
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ADD THIS SECTION TO FIX THE "E.USE" ERROR
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true // This forces Vite to re-scan dependencies
  },
  build: {
    outDir: "dist", 
    sourcemap: mode === "development",
    // Ensures commonjs modules are handled correctly in React 19
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
}));