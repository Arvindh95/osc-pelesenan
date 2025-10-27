import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
    // Load environment variables
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';
    const isDevelopment = mode === 'development';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx', 'resources/js/simple-react-app.tsx'],
                refresh: isDevelopment,
            }),
            react({
                // Enable React Fast Refresh in development
                fastRefresh: isDevelopment,
            }),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                '@': '/resources/js',
            },
        },
        define: {
            // Define environment variables for the frontend
            __APP_ENV__: JSON.stringify(env.APP_ENV || 'production'),
            __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'OSC Pelesenan'),
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
        },
        build: {
            // Optimize build output
            target: 'es2020',
            minify: isProduction ? 'terser' : false,
            terserOptions: isProduction ? {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.debug'],
                },
                mangle: {
                    safari10: true,
                },
                format: {
                    safari10: true,
                },
            } : {},
            // Code splitting configuration
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Vendor chunk for React and related libraries
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        // UI components chunk
                        ui: ['@headlessui/react', '@heroicons/react'],
                        // Utilities chunk
                        utils: ['axios', 'react-hook-form'],
                    },
                    // Optimize chunk file names for caching
                    chunkFileNames: (chunkInfo) => {
                        const facadeModuleId = chunkInfo.facadeModuleId 
                            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.(tsx?|jsx?)$/, '') 
                            : 'chunk';
                        return `js/${facadeModuleId}-[hash].js`;
                    },
                    entryFileNames: 'js/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const info = assetInfo.name.split('.');
                        const ext = info[info.length - 1];
                        if (/\.(css)$/.test(assetInfo.name)) {
                            return `css/[name]-[hash].${ext}`;
                        }
                        if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                            return `images/[name]-[hash].${ext}`;
                        }
                        return `assets/[name]-[hash].${ext}`;
                    },
                },
            },
            // Increase chunk size warning limit
            chunkSizeWarningLimit: 1000,
            // Enable source maps based on environment
            sourcemap: isDevelopment ? true : 'hidden',
            // Asset inlining threshold
            assetsInlineLimit: 4096,
            // CSS code splitting
            cssCodeSplit: true,
        },
        // Optimize dependencies
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                'axios',
                'react-hook-form',
                '@headlessui/react',
                '@heroicons/react',
            ],
            exclude: [
                // Exclude large dependencies that should be loaded on demand
            ],
        },
        // Development server optimizations
        server: {
            // Enable HTTP/2
            https: false,
            // Optimize HMR
            hmr: {
                overlay: true,
            },
            // CORS configuration for API integration
            cors: true,
            // Proxy API requests in development
            proxy: isDevelopment ? {
                '/api': {
                    target: env.APP_URL || 'http://localhost:8000',
                    changeOrigin: true,
                    secure: false,
                },
            } : undefined,
        },
        // Preview server configuration for production testing
        preview: {
            port: 4173,
            strictPort: true,
            cors: true,
        },
        // Environment-specific optimizations
        esbuild: {
            // Remove console logs in production
            drop: isProduction ? ['console', 'debugger'] : [],
        },
    };
});
