import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isSSRBuild = process.env.npm_lifecycle_script?.includes('--ssr');
  
  return {
    server: {
      host: "::",
      port: 5173,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      manifest: !isSSRBuild,
      ssrManifest: !isSSRBuild,
      rollupOptions: {
        input: !isSSRBuild ? {
          main: path.resolve(__dirname, 'index.html'),
        } : undefined,
        output: !isSSRBuild ? {
          manualChunks: {
            // Code splitting for better caching and performance
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-popover',
            ],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
          },
        } : undefined,
      },
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    ssr: {
      noExternal: ['react-router-dom', '@supabase/supabase-js', 'react-helmet-async'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
