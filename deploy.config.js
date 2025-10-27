/**
 * Deployment Configuration for OSC Pelesenan Frontend
 * 
 * This file contains deployment-specific configurations for different environments.
 */

const deployConfig = {
  // Development environment
  development: {
    buildCommand: 'npm run build:dev',
    outputDir: 'public/build',
    assetsDir: 'assets',
    sourcemap: true,
    minify: false,
    optimization: {
      splitChunks: false,
      treeshaking: false,
    },
    server: {
      port: 5173,
      host: 'localhost',
    },
  },

  // Staging environment
  staging: {
    buildCommand: 'npm run build:staging',
    outputDir: 'public/build',
    assetsDir: 'assets',
    sourcemap: 'hidden',
    minify: true,
    optimization: {
      splitChunks: true,
      treeshaking: true,
      compression: 'gzip',
    },
    server: {
      port: 4173,
      host: '0.0.0.0',
    },
    deployment: {
      target: 'staging.osc-pelesenan.gov.my',
      path: '/var/www/osc-pelesenan-staging',
      user: 'deploy',
      beforeDeploy: [
        'npm ci',
        'npm run type-check',
        'npm run lint',
      ],
      afterDeploy: [
        'php artisan config:cache',
        'php artisan route:cache',
        'php artisan view:cache',
        'php artisan queue:restart',
      ],
    },
  },

  // Production environment
  production: {
    buildCommand: 'npm run build:production',
    outputDir: 'public/build',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    optimization: {
      splitChunks: true,
      treeshaking: true,
      compression: 'brotli',
      imageOptimization: true,
    },
    server: {
      port: 4173,
      host: '0.0.0.0',
    },
    deployment: {
      target: 'osc-pelesenan.gov.my',
      path: '/var/www/osc-pelesenan-production',
      user: 'deploy',
      beforeDeploy: [
        'npm ci --production',
        'npm run type-check',
        'npm run lint',
        'npm audit --audit-level=high',
      ],
      afterDeploy: [
        'php artisan config:cache',
        'php artisan route:cache',
        'php artisan view:cache',
        'php artisan optimize',
        'php artisan queue:restart',
        'php artisan horizon:terminate', // If using Laravel Horizon
      ],
    },
    monitoring: {
      enablePerformanceMonitoring: false,
      enableErrorReporting: true,
      enableAnalytics: true,
    },
    security: {
      enableCSP: true,
      enableHSTS: true,
      enableSecurityHeaders: true,
    },
  },
};

// Asset optimization settings
const assetOptimization = {
  images: {
    formats: ['webp', 'avif', 'jpg', 'png'],
    quality: {
      webp: 80,
      avif: 75,
      jpg: 85,
      png: 90,
    },
    sizes: [320, 640, 768, 1024, 1280, 1920],
  },
  fonts: {
    preload: ['Inter-Regular.woff2', 'Inter-Bold.woff2'],
    display: 'swap',
  },
  css: {
    purge: true,
    minify: true,
    autoprefixer: true,
  },
  js: {
    minify: true,
    treeshake: true,
    splitChunks: true,
  },
};

// Performance budgets
const performanceBudgets = {
  development: {
    maxBundleSize: '5MB',
    maxChunkSize: '2MB',
  },
  staging: {
    maxBundleSize: '2MB',
    maxChunkSize: '500KB',
  },
  production: {
    maxBundleSize: '1MB',
    maxChunkSize: '250KB',
    maxImageSize: '100KB',
    maxFontSize: '50KB',
  },
};

// Export configuration
export { deployConfig, assetOptimization, performanceBudgets };

// Default export for current environment
export default deployConfig[process.env.NODE_ENV || 'development'];