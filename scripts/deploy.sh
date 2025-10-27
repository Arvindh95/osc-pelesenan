#!/bin/bash

# OSC Pelesenan Frontend Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, staging, production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-staging}

# Configuration
PROJECT_NAME="osc-pelesenan-frontend"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    exit 1
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            log "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use: development, staging, or production"
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check if PHP is installed (for Laravel commands)
    if ! command -v php &> /dev/null; then
        error "PHP is not installed"
    fi
    
    # Check if composer is installed
    if ! command -v composer &> /dev/null; then
        error "Composer is not installed"
    fi
    
    success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install PHP dependencies
    if [ "$ENVIRONMENT" = "production" ]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --optimize-autoloader --no-interaction
    fi
    
    # Install Node.js dependencies
    if [ "$ENVIRONMENT" = "production" ]; then
        npm ci --production
    else
        npm ci
    fi
    
    success "Dependencies installed"
}

# Run quality checks
run_quality_checks() {
    log "Running quality checks..."
    
    # Type checking
    npm run type-check
    
    # Linting
    npm run lint
    
    # Format checking
    npm run format:check
    
    success "Quality checks passed"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."
    
    # Set environment variables
    export NODE_ENV=$ENVIRONMENT
    
    # Copy environment file
    if [ -f ".env.$ENVIRONMENT" ]; then
        cp ".env.$ENVIRONMENT" .env
        log "Environment file copied: .env.$ENVIRONMENT -> .env"
    else
        warning "Environment file .env.$ENVIRONMENT not found, using existing .env"
    fi
    
    # Build frontend
    case $ENVIRONMENT in
        development)
            npm run build:dev
            ;;
        staging)
            npm run build:staging
            ;;
        production)
            npm run build:production
            ;;
    esac
    
    success "Application built successfully"
}

# Optimize Laravel
optimize_laravel() {
    log "Optimizing Laravel..."
    
    # Generate application key if not exists
    php artisan key:generate --no-interaction
    
    # Cache configuration
    php artisan config:cache
    
    # Cache routes
    php artisan route:cache
    
    # Cache views
    php artisan view:cache
    
    # Run database migrations (staging and production only)
    if [ "$ENVIRONMENT" != "development" ]; then
        php artisan migrate --force --no-interaction
    fi
    
    # Clear and cache everything
    php artisan optimize
    
    success "Laravel optimization complete"
}

# Create backup
create_backup() {
    if [ "$ENVIRONMENT" != "development" ]; then
        log "Creating backup..."
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR"
        
        # Backup current build
        if [ -d "public/build" ]; then
            tar -czf "$BACKUP_DIR/build_backup_$TIMESTAMP.tar.gz" public/build/
            log "Build backup created: $BACKUP_DIR/build_backup_$TIMESTAMP.tar.gz"
        fi
        
        # Backup database (if configured)
        if [ "$ENVIRONMENT" = "production" ] && command -v mysqldump &> /dev/null; then
            # This would need proper database credentials
            # mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
            log "Database backup would be created here (configure with proper credentials)"
        fi
        
        success "Backup created"
    fi
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Restart queue workers
    if command -v supervisorctl &> /dev/null; then
        supervisorctl restart laravel-worker:* || warning "Could not restart queue workers"
    fi
    
    # Clear application cache
    php artisan cache:clear
    
    # Restart PHP-FPM (if available)
    if command -v systemctl &> /dev/null; then
        sudo systemctl reload php-fpm || warning "Could not reload PHP-FPM"
    fi
    
    # Run post-build optimization
    if [ -f "scripts/build-optimize.js" ]; then
        node scripts/build-optimize.js
    fi
    
    success "Post-deployment tasks completed"
}

# Health check
health_check() {
    log "Running health check..."
    
    # Check if build files exist
    if [ ! -d "public/build" ]; then
        error "Build directory not found"
    fi
    
    # Check if manifest exists
    if [ ! -f "public/build/manifest.json" ]; then
        error "Build manifest not found"
    fi
    
    # Check Laravel application
    php artisan about --only=environment || error "Laravel health check failed"
    
    success "Health check passed"
}

# Cleanup old builds
cleanup() {
    log "Cleaning up old builds..."
    
    # Keep only last 5 backups
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "build_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
        log "Old backups cleaned up"
    fi
    
    # Clean npm cache
    npm cache clean --force
    
    success "Cleanup completed"
}

# Main deployment function
deploy() {
    log "Starting deployment of $PROJECT_NAME to $ENVIRONMENT"
    
    validate_environment
    check_prerequisites
    create_backup
    install_dependencies
    run_quality_checks
    build_application
    optimize_laravel
    post_deployment
    health_check
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"
    log "Build location: public/build/"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "build_backup_*.tar.gz" -type f | sort -r | head -n 1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring from backup: $LATEST_BACKUP"
        rm -rf public/build/
        tar -xzf "$LATEST_BACKUP" -C .
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Script execution
case "${2:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "Usage: $0 [environment] [action]"
        echo "Environments: development, staging, production"
        echo "Actions: deploy (default), rollback"
        exit 1
        ;;
esac