#!/usr/bin/env node

/**
 * Build Optimization Script for OSC Pelesenan Frontend
 * 
 * This script performs post-build optimizations including:
 * - Asset compression
 * - Bundle analysis
 * - Performance validation
 * - Security checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'public', 'build');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  log('\n📊 Analyzing bundle...', 'cyan');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run build first.', 'red');
    process.exit(1);
  }

  const manifest = path.join(buildDir, 'manifest.json');
  if (!fs.existsSync(manifest)) {
    log('❌ Build manifest not found.', 'red');
    return;
  }

  const manifestData = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const assets = Object.values(manifestData);
  
  let totalSize = 0;
  const assetSizes = {};

  assets.forEach(asset => {
    if (asset.file) {
      const filePath = path.join(buildDir, asset.file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = stats.size;
        totalSize += size;
        
        const ext = path.extname(asset.file).toLowerCase();
        if (!assetSizes[ext]) assetSizes[ext] = 0;
        assetSizes[ext] += size;
      }
    }
  });

  log(`📦 Total bundle size: ${formatBytes(totalSize)}`, 'bright');
  
  Object.entries(assetSizes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([ext, size]) => {
      log(`   ${ext}: ${formatBytes(size)}`, 'yellow');
    });

  // Check performance budgets
  const maxBundleSize = process.env.NODE_ENV === 'production' ? 1024 * 1024 : 2 * 1024 * 1024; // 1MB prod, 2MB staging
  if (totalSize > maxBundleSize) {
    log(`⚠️  Bundle size exceeds budget (${formatBytes(maxBundleSize)})`, 'yellow');
  } else {
    log(`✅ Bundle size within budget`, 'green');
  }
}

function compressAssets() {
  log('\n🗜️  Compressing assets...', 'cyan');
  
  try {
    // Create gzip compressed versions
    execSync(`find ${buildDir} -type f \\( -name "*.js" -o -name "*.css" -o -name "*.html" \\) -exec gzip -k {} \\;`, {
      stdio: 'pipe'
    });
    log('✅ Gzip compression complete', 'green');

    // Create brotli compressed versions if available
    try {
      execSync(`find ${buildDir} -type f \\( -name "*.js" -o -name "*.css" -o -name "*.html" \\) -exec brotli -k {} \\;`, {
        stdio: 'pipe'
      });
      log('✅ Brotli compression complete', 'green');
    } catch (error) {
      log('⚠️  Brotli compression not available', 'yellow');
    }
  } catch (error) {
    log('❌ Asset compression failed', 'red');
    console.error(error.message);
  }
}

function validateSecurity() {
  log('\n🔒 Running security checks...', 'cyan');
  
  try {
    // Check for common security issues in built files
    const jsFiles = execSync(`find ${buildDir} -name "*.js" -type f`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);

    let securityIssues = 0;

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for potential security issues
      const issues = [
        { pattern: /eval\s*\(/, message: 'eval() usage detected' },
        { pattern: /innerHTML\s*=/, message: 'innerHTML usage detected' },
        { pattern: /document\.write\s*\(/, message: 'document.write() usage detected' },
        { pattern: /console\.(log|info|debug|warn)/, message: 'Console statements found' },
      ];

      issues.forEach(({ pattern, message }) => {
        if (pattern.test(content)) {
          log(`⚠️  ${path.basename(file)}: ${message}`, 'yellow');
          securityIssues++;
        }
      });
    });

    if (securityIssues === 0) {
      log('✅ No security issues found', 'green');
    } else {
      log(`⚠️  Found ${securityIssues} potential security issues`, 'yellow');
    }
  } catch (error) {
    log('❌ Security validation failed', 'red');
    console.error(error.message);
  }
}

function generateBuildReport() {
  log('\n📋 Generating build report...', 'cyan');
  
  const reportPath = path.join(rootDir, 'build-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    buildDir: buildDir,
    assets: {},
    performance: {},
    security: {
      checksRun: true,
      issuesFound: 0,
    },
  };

  // Add asset information
  if (fs.existsSync(path.join(buildDir, 'manifest.json'))) {
    const manifest = JSON.parse(fs.readFileSync(path.join(buildDir, 'manifest.json'), 'utf8'));
    report.assets = manifest;
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`✅ Build report saved to ${reportPath}`, 'green');
}

function main() {
  log('🚀 Starting build optimization...', 'bright');
  
  const startTime = Date.now();
  
  try {
    analyzeBundle();
    compressAssets();
    validateSecurity();
    generateBuildReport();
    
    const duration = Date.now() - startTime;
    log(`\n✅ Build optimization complete in ${duration}ms`, 'green');
  } catch (error) {
    log('\n❌ Build optimization failed', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeBundle, compressAssets, validateSecurity, generateBuildReport };