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
  build: {
    sourcemap: false,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: 8192, // Inline assets smaller than 8kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // State Management & Data Fetching
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // UI Libraries - Split by size
          'ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-alert-dialog'
          ],
          'ui-extended': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],
          
          // Charts & Visualization
          'charts-vendor': ['recharts'],
          
          // AI & Voice
          'ai-vendor': ['@11labs/react'],
          
          // Icons & Graphics
          'icons-vendor': ['lucide-react'],
          
          // Date & Utilities
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority'],
          
          // Form Handling
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Advanced Features
          'advanced-vendor': ['framer-motion', 'gsap', '@react-three/fiber', '@react-three/drei']
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId && facadeModuleId.includes('pages/')) {
            const pageName = facadeModuleId.split('pages/')[1].split('.')[0];
            return `pages/${pageName}-[hash].js`;
          }
          return 'chunks/[name]-[hash].js';
        },
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
}));
