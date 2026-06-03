# Production Deployment Guide

## Pre-Deployment Checklist

### Backend
- [ ] Set `DEBUG=False` in production
- [ ] Generate a strong `SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS` with production domain(s)
- [ ] Configure PostgreSQL with strong credentials
- [ ] Set up Redis with authentication
- [ ] Configure OpenAI API key
- [ ] Set up SSL/HTTPS certificate
- [ ] Enable CORS only for your frontend domain
- [ ] Configure secure session cookies
- [ ] Set up error logging and monitoring
- [ ] Configure email backend for notifications
- [ ] Set up database backups
- [ ] Test all authentication flows
- [ ] Load test the application
- [ ] Set up database replication/failover

### Frontend
- [ ] Build optimized production bundle
- [ ] Test all features in production build
- [ ] Configure API URL for production
- [ ] Set up analytics tracking
- [ ] Configure error reporting
- [ ] Optimize images and assets
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Configure PWA (Progressive Web App)
- [ ] Set up CDN for static assets

### Infrastructure
- [ ] Configure firewall rules
- [ ] Set up DDoS protection
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Configure disaster recovery
- [ ] Set up CI/CD pipeline
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure auto-scaling (if using cloud)
- [ ] Test failover procedures

## Deployment on Render

### Step 1: Prepare Repository
```bash
# Ensure .gitignore is configured
# Ensure .env is in .gitignore (never commit secrets)
# Commit all changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create PostgreSQL Database on Render
1. Go to Render Dashboard
2. Click "New +" → PostgreSQL
3. Name: `ai-expense-tracker-db`
4. Database: `expense_tracker`
5. Save connection string for later

### Step 3: Create Redis Service on Render
1. Go to Render Dashboard
2. Click "New +" → Redis
3. Name: `ai-expense-tracker-redis`
4. Save connection string for later

### Step 4: Deploy Backend
1. Go to Render Dashboard
2. Click "New +" → Web Service
3. Connect GitHub repository
4. Name: `ai-expense-tracker-backend`
5. Runtime: Python 3.11
6. Build Command: 
   ```
   pip install -r backend/requirements.txt && python backend/manage.py migrate && python backend/manage.py collectstatic --noinput
   ```
7. Start Command: 
   ```
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```
8. Add environment variables:
   ```
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   ALLOWED_HOSTS=.onrender.com
   DATABASE_URL=<from-step-2>
   REDIS_URL=<from-step-3>
   OPENAI_API_KEY=<your-api-key>
   JWT_SECRET=<generate-strong-key>
   FRONTEND_URL=https://<frontend-render-url>
   CORS_ALLOWED_ORIGINS=https://<frontend-render-url>
   ```
9. Deploy

### Step 5: Deploy Frontend
1. Go to Render Dashboard
2. Click "New +" → Static Site
3. Connect GitHub repository
4. Name: `ai-expense-tracker-frontend`
5. Build Command: `cd frontend && npm install && npm run build`
6. Publish Directory: `frontend/dist`
7. Add environment variable:
   ```
   VITE_API_URL=https://<backend-render-url>/api/v1
   ```
8. Deploy

### Step 6: Deploy Celery Worker
1. Go to Render Dashboard
2. Click "New +" → Background Worker
3. Connect GitHub repository
4. Name: `ai-expense-tracker-celery`
5. Runtime: Python 3.11
6. Build Command: `pip install -r backend/requirements.txt`
7. Start Command: `celery -A config worker -l info`
8. Add same environment variables as backend
9. Deploy

## Alternative: AWS Deployment

### Step 1: Setup AWS Services
- **RDS**: PostgreSQL 14
- **ElastiCache**: Redis
- **EC2**: Backend and Celery worker
- **CloudFront**: Frontend CDN

### Step 2: Deploy Backend on EC2
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Update system
sudo yum update -y

# Install dependencies
sudo yum install python3.11 postgresql git -y

# Clone repository
git clone <repo-url>
cd ai-expense-tracker

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Configure .env
nano .env

# Run migrations
cd backend
python manage.py migrate

# Start with gunicorn (using systemd or supervisor)
```

### Step 3: Deploy Frontend on S3 + CloudFront
```bash
# Build frontend
cd frontend
npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Alternative: DigitalOcean Deployment

### Step 1: Create Droplet
- Select Ubuntu 22.04 LTS
- Choose appropriate size (2GB RAM minimum)
- Enable monitoring

### Step 2: Setup Environment
```bash
# SSH into droplet
ssh root@<droplet-ip>

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone <repo-url>
cd ai-expense-tracker

# Create .env file
cp .env.example .env
nano .env

# Start services
docker-compose up -d
```

### Step 3: Setup Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/default

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site and restart
sudo systemctl restart nginx
```

### Step 4: Setup SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Update Nginx configuration to use SSL
```

## Monitoring and Maintenance

### Setup Monitoring
1. **Datadog** or **New Relic** for application monitoring
2. **Sentry** for error tracking
3. **Grafana** for dashboards
4. **AlertManager** for alerts

### Backup Strategy
- Daily automated PostgreSQL backups
- Weekly full system backups
- Monthly backup archival
- Tested restore procedures

### Update Strategy
- Regular security patches
- Dependency updates (Django, libraries)
- Python version updates
- Database version updates

### Performance Optimization
- Database indexing
- Query optimization
- Caching strategy review
- CDN usage for static assets
- API rate limiting

## Scaling Considerations

### Horizontal Scaling
- Load balancer in front of backend instances
- Multiple Celery workers
- Database read replicas
- Redis cluster for caching

### Vertical Scaling
- Increase server resources
- Database optimization
- Code optimization

### Cost Optimization
- Use appropriate service tiers
- Reserved instances where applicable
- Auto-scaling based on demand
- Consolidate services where possible

## Rollback Procedures

### If Frontend Deployment Fails
1. Revert to previous commit
2. Re-run build and deployment
3. Check browser cache

### If Backend Deployment Fails
1. Revert to previous commit
2. Check database migrations
3. Verify environment variables
4. Check logs for errors

### Database Rollback
1. Stop application
2. Restore from backup
3. Verify data integrity
4. Restart application

## Post-Deployment

1. **Smoke Testing**
   - Login with test account
   - Create test expense
   - Generate PDF
   - Check analytics

2. **Performance Testing**
   - Load test API endpoints
   - Test with real user data
   - Monitor resource usage

3. **Security Testing**
   - OWASP Top 10 checks
   - SQL injection tests
   - XSS tests
   - CSRF validation

4. **Documentation**
   - Update deployment docs
   - Document any customizations
   - Record configuration changes
   - Update runbooks

---

For questions or issues during deployment, refer to service-specific documentation or contact your hosting provider's support.
