import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin allows you to import SVGs as React components,
    // which will fix your current SVG import errors.
    svgr(),
  ],
  resolve: {
    alias: {
      // This replicates your tsconfig.json path alias for "@/*"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Specifies the output directory for build files, matching your old setup.
    outDir: 'dist',
  },
  server: {
    // You can specify a port for the dev server.
    port: 3000,
  },
})
