# OSC Pelesenan Frontend - Deployment Guide

This document provides comprehensive instructions for deploying the OSC Pelesenan Frontend application across different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Methods](#deployment-methods)
5. [Docker Deployment](#docker-deployment)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PHP**: 8.2 or higher
- **Composer**: 2.x
- **MySQL**: 8.0 or higher
- **Redis**: 6.x or higher (optional but recommended)

### Development Tools

- **Git**: For version control
- **Docker**: For containerized deployment (optional)
- **Nginx**: For production web server

## Environment Configuration

### Environment Files

The application supports multiple environment configurations:

- `.env.example` - Template with all available options
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration

### Key Environment Variables

```bash
# Application
APP_NAME="OSC Pelesenan"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://osc-pelesenan.gov.my

# Frontend
VITE_APP_NAME="${APP_NAME}"
VITE_APP_ENV=production
VITE_API_URL="${APP_URL}/api"
VITE_APP_VERSION=1.0.0

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=osc_pelesenan
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Cache & Sessions
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Feature Flags
MODULE_M01=true
MODULE_M02=true
MODULE_M03=true
MODULE_M04=true
MODULE_M05=true
```

## Build Process

### Development Build

```bash
# Install dependencies
npm ci

# Run development build
npm run build:dev

# Start development server
npm run dev
```

### Staging Build

```bash
# Install dependencies
npm ci

# Run staging build
npm run build:staging

# Preview staging build
npm run preview
```

### Production Build

```bash
# Install dependencies (production only)
npm ci --production

# Run production build
npm run build:production

# Analyze bundle size
npm run analyze
```

### Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Full build with quality checks |
| `npm run build:dev` | Development build with source maps |
| `npm run build:staging` | Staging build with optimizations |
| `npm run build:production` | Production build with full optimizations |
| `npm run analyze` | Bundle size analysis |
| `npm run clean` | Clean build artifacts |

## Deployment Methods

### 1. Manual Deployment

#### Staging Deployment

```bash
# Clone repository
git clone https://github.com/your-org/osc-pelesenan-frontend.git
cd osc-pelesenan-frontend

# Checkout staging branch
git checkout staging

# Run deployment script
./scripts/deploy.sh staging
```

#### Production Deployment

```bash
# Clone repository
git clone https://github.com/your-org/osc-pelesenan-frontend.git
cd osc-pelesenan-frontend

# Checkout production branch
git checkout main

# Run deployment script
./scripts/deploy.sh production
```

### 2. Automated Deployment Script

The `scripts/deploy.sh` script provides automated deployment with the following features:

- Environment validation
- Dependency installation
- Quality checks (linting, type checking)
- Build optimization
- Laravel optimization
- Health checks
- Backup creation
- Rollback capability

#### Usage

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Rollback deployment
./scripts/deploy.sh production rollback
```

### 3. CI/CD Pipeline

#### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build:production
      
      - name: Deploy to server
        run: ./scripts/deploy.sh production
```

## Docker Deployment

### Development with Docker

```bash
# Build and start development environment
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Production with Docker

```bash
# Set environment variables
export APP_ENV=production
export DOCKER_TARGET=runtime

# Build and start production environment
docker-compose --profile production up --build -d

# Scale services
docker-compose up --scale queue=3 -d
```

### Docker Commands

```bash
# Build specific service
docker-compose build app

# Run database migrations
docker-compose exec app php artisan migrate

# Clear application cache
docker-compose exec app php artisan cache:clear

# View application logs
docker-compose logs -f app

# Access application shell
docker-compose exec app sh
```

## Production Deployment

### Server Setup

#### 1. System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server redis-server php8.2-fpm php8.2-mysql php8.2-redis nodejs npm composer

# Install PHP extensions
sudo apt install -y php8.2-bcmath php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip
```

#### 2. Web Server Configuration

```bash
# Copy Nginx configuration
sudo cp docker/nginx.conf /etc/nginx/sites-available/osc-pelesenan
sudo ln -s /etc/nginx/sites-available/osc-pelesenan /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d osc-pelesenan.gov.my

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Application Deployment

#### 1. Clone and Setup

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-org/osc-pelesenan-frontend.git osc-pelesenan
cd osc-pelesenan

# Set permissions
sudo chown -R www-data:www-data /var/www/osc-pelesenan
sudo chmod -R 755 /var/www/osc-pelesenan
```

#### 2. Environment Configuration

```bash
# Copy production environment
cp .env.production .env

# Generate application key
php artisan key:generate

# Configure database
php artisan migrate --force
```

#### 3. Build and Optimize

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --production

# Build frontend
npm run build:production

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Process Management

#### Supervisor Configuration

```bash
# Install Supervisor
sudo apt install -y supervisor

# Create queue worker configuration
sudo tee /etc/supervisor/conf.d/osc-pelesenan-worker.conf << EOF
[program:osc-pelesenan-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/osc-pelesenan/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/osc-pelesenan/storage/logs/worker.log
stopwaitsecs=3600
EOF

# Start services
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start osc-pelesenan-worker:*
```

## Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl -f http://localhost/health

# Database connection
php artisan tinker --execute="DB::connection()->getPdo();"

# Queue status
php artisan queue:monitor

# Cache status
php artisan cache:table
```

### Log Monitoring

```bash
# Application logs
tail -f storage/logs/laravel.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log
```

### Performance Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check database performance
mysql -e "SHOW PROCESSLIST;"

# Check Redis performance
redis-cli info stats
```

### Backup Strategy

#### Database Backup

```bash
# Create backup script
sudo tee /usr/local/bin/backup-osc-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/osc-pelesenan"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u root -p osc_pelesenan > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-osc-db.sh

# Schedule daily backup
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-osc-db.sh
```

#### File Backup

```bash
# Backup application files
tar -czf /var/backups/osc-pelesenan/app_backup_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='storage/logs' \
  /var/www/osc-pelesenan
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### 2. Permission Issues

```bash
# Fix Laravel permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### 3. Database Connection Issues

```bash
# Test database connection
php artisan tinker --execute="DB::connection()->getPdo();"

# Check database configuration
php artisan config:show database
```

#### 4. Queue Issues

```bash
# Restart queue workers
sudo supervisorctl restart osc-pelesenan-worker:*

# Clear failed jobs
php artisan queue:flush

# Monitor queue
php artisan queue:monitor
```

#### 5. Cache Issues

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Performance Issues

#### 1. Slow Page Load

```bash
# Enable OPcache
sudo nano /etc/php/8.2/fpm/php.ini
# Set: opcache.enable=1

# Optimize Composer autoloader
composer dump-autoload --optimize

# Check database queries
php artisan telescope:install # For development
```

#### 2. High Memory Usage

```bash
# Check memory usage
free -h

# Optimize PHP-FPM
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
# Adjust: pm.max_children, pm.start_servers, pm.min_spare_servers
```

### Security Issues

#### 1. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect osc-pelesenan.gov.my:443
```

#### 2. Security Headers

```bash
# Test security headers
curl -I https://osc-pelesenan.gov.my

# Check CSP violations
# Monitor browser console for CSP errors
```

### Rollback Procedures

#### 1. Application Rollback

```bash
# Using deployment script
./scripts/deploy.sh production rollback

# Manual rollback
git checkout previous-stable-tag
./scripts/deploy.sh production
```

#### 2. Database Rollback

```bash
# Restore from backup
gunzip /var/backups/osc-pelesenan/db_backup_YYYYMMDD_HHMMSS.sql.gz
mysql -u root -p osc_pelesenan < /var/backups/osc-pelesenan/db_backup_YYYYMMDD_HHMMSS.sql
```

## Support and Maintenance

### Regular Maintenance Tasks

- **Daily**: Monitor logs and performance metrics
- **Weekly**: Review security updates and apply patches
- **Monthly**: Database optimization and cleanup
- **Quarterly**: Full security audit and penetration testing

### Contact Information

- **Development Team**: dev-team@osc-pelesenan.gov.my
- **Operations Team**: ops-team@osc-pelesenan.gov.my
- **Emergency Contact**: +60-3-XXXX-XXXX

### Documentation Updates

This deployment guide should be updated whenever:
- New deployment procedures are introduced
- Environment configurations change
- Security requirements are updated
- Performance optimizations are implemented

---

**Last Updated**: $(date +"%Y-%m-%d")
**Version**: 1.0.0