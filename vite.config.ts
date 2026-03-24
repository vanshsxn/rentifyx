import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // CRITICAL: This ensures all assets are loaded from the root URL
  base: "/", 
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Allows refreshes to work correctly during local development
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
  build: {
    // This is where Render looks for your files
    outDir: "dist", 
    // This helps debug issues by creating a map of your code
    sourcemap: mode === "development", 
  }
}));