# Development Guide

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Development

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # Windows
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure .env**
   ```bash
   cp ../.env.example ../.env
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

7. **Start Celery worker (in another terminal)**
   ```bash
   celery -A config worker -l info
   ```

8. **Start Celery beat (in another terminal)**
   ```bash
   celery -A config beat -l info
   ```

### Frontend Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Common Commands

### Backend
```bash
# Create new migration
python manage.py makemigrations

# Run specific migration
python manage.py migrate [app_name]

# Create superuser
python manage.py createsuperuser

# Run shell
python manage.py shell

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

### Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access shell
docker-compose exec backend python manage.py shell
docker-compose exec backend bash
```

## Architecture

### Backend Architecture
- **Django** - Web framework with DRF for REST API
- **PostgreSQL** - Primary database
- **Redis** - Caching and task queue broker
- **Celery** - Async task processing
- **OpenAI** - AI categorization

### Frontend Architecture
- **React 18** - UI framework
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Chart.js** - Data visualization

## API Structure

All API endpoints are under `/api/v1/`:

- `/auth/` - Authentication endpoints
- `/expenses/` - Expense CRUD
- `/budgets/` - Budget management
- `/analytics/` - Analytics data
- `/tasks/` - Task status tracking

## Authentication Flow

1. User registers or logs in
2. Server returns JWT access and refresh tokens
3. Client stores tokens in localStorage
4. Client includes access token in `Authorization` header
5. If access token expires, client uses refresh token to get new access token
6. If refresh token expires, user must log in again

## Database Schema

### User Model
- Extends Django's User model
- Related UserProfile for additional data

### Expense Model
- user (FK to User)
- description
- amount
- category
- date
- receipt (image)
- ai_insights
- ai_confidence
- tags

### Budget Model
- user (FK to User)
- category
- amount
- period (daily/weekly/monthly/yearly)
- alert_threshold
- is_active

## Performance Optimization

### Backend
- Database query optimization with select_related/prefetch_related
- Caching with Redis for expensive operations
- Pagination for list endpoints
- Celery for long-running tasks

### Frontend
- Code splitting with React lazy loading
- Image optimization
- Lazy loading components
- Memoization of expensive calculations
- Virtual scrolling for long lists (future enhancement)

## Deployment Checklist

- [ ] Set DEBUG=False in production
- [ ] Update ALLOWED_HOSTS with production domain
- [ ] Configure secure HTTPS
- [ ] Enable CSRF protection
- [ ] Set secure cookies
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure error logging
- [ ] Set up database backups
- [ ] Test all features
- [ ] Load test the application

## Troubleshooting

### Common Issues

**PostgreSQL connection error**
- Check if PostgreSQL service is running
- Verify connection string in .env
- Ensure database exists

**Redis connection error**
- Check if Redis service is running
- Verify Redis URL in .env
- Restart Redis service

**Celery tasks not running**
- Check if Celery worker is running
- Verify Redis connection
- Check Celery logs for errors

**Frontend not connecting to backend**
- Verify API URL in frontend/.env
- Check CORS configuration
- Ensure backend is running

**OpenAI API errors**
- Verify OpenAI API key is correct
- Check API quota and billing
- Ensure API key has required permissions

## Next Steps

1. Add more advanced analytics features
2. Implement recurring expenses
3. Add multi-currency support
4. Implement email notifications
5. Add mobile app using React Native
6. Implement social features (sharing budgets)
7. Add data export functionality
8. Implement advanced filtering and search

---

For more information, see the main README.md
