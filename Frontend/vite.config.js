import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

/**
 * Vite plugin to inject VITE_FIREBASE_* env vars into the Firebase service worker.
 * Service workers live in /public and can't use import.meta.env, so we do token
 * replacement (e.g. __VITE_FIREBASE_API_KEY__ → actual value) at serve/build time.
 */
function firebaseSwPlugin(env) {
  const SW_FILENAME = 'firebase-messaging-sw.js';
  const swSourcePath = path.resolve(__dirname, 'public', SW_FILENAME);

  function getInjectedSwContent() {
    let content = fs.readFileSync(swSourcePath, 'utf-8');
    // Replace all __VITE_*__ tokens with actual env values
    content = content.replace(/__VITE_([A-Z0-9_]+)__/g, (_, key) => {
      return env[`VITE_${key}`] || '';
    });
    return content;
  }

  return {
    name: 'firebase-sw-env-inject',
    // Dev server: intercept requests to the SW and serve the injected version
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === `/${SW_FILENAME}`) {
          try {
            const content = getInjectedSwContent();
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-store');
            res.end(content);
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    },
    // Build: transform the SW file during build output
    generateBundle(options, bundle) {
      if (bundle[SW_FILENAME]) {
        bundle[SW_FILENAME].source = getInjectedSwContent();
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  resolve: {
    // Ensure only one React instance
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  plugins: [
    react(),
    tailwindcss(),
    firebaseSwPlugin(env),
  ],
  server: {
    port: 5173, // Change port to bypass cache
    strictPort: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: http: https: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; font-src 'self' data: https:; connect-src 'self' https: ws: wss: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';",
      // Force no caching in development
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // SAFE STRATEGY: Bundle all dependencies into one vendor file
          // This fixes the "Cannot set properties of undefined (setting 'Activity')" error
          // by ensuring all libraries share the same execution context.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase limit since the vendor chunk will be larger
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
    ],
  },
  }; // end return
}); // end defineConfig