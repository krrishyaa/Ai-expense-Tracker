# AI Expense Tracker - Production Full-Stack Web Application

## Project Overview
Full-stack financial intelligence platform built with Django 4.2, React 18, OpenAI API, PostgreSQL, Celery + Redis, Docker, and deployed on Render.

## Technology Stack
- **Backend**: Django 4.2, Django REST Framework, Celery, Redis
- **Frontend**: React 18, TypeScript, Tailwind CSS, Chart.js, Framer Motion
- **Database**: PostgreSQL
- **AI**: OpenAI API (GPT-4o)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Async Tasks**: Celery + Redis
- **Containerization**: Docker & Docker Compose
- **Deployment**: Render.com
- **Export**: WeasyPrint (PDF), Python CSV

## Key Features
1. **JWT Authentication** - Secure multi-user architecture with token-based auth
2. **Expense CRUD** - Create, read, update, delete with filtering and pagination
3. **AI Categorization** - OpenAI API auto-categorizes expenses and generates insights
4. **Budget Management** - Set budgets with real-time tracking and alerts
5. **Analytics & Forecasting** - Monthly/yearly charts, trends, and ML predictions
6. **PDF/CSV Export** - Async background generation via Celery
7. **Voice Command Input** - Web Speech API for hands-free expense entry
8. **Docker + Render Deploy** - Full containerization and live deployment

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Full Stack (Docker)
```bash
docker-compose up -d
```

## Project Structure
```
ai-expense-tracker/
├── backend/
│   ├── config/          # Django settings
│   ├── apps/
│   │   ├── auth/        # JWT authentication
│   │   ├── expenses/    # Expense CRUD
│   │   ├── budgets/     # Budget management
│   │   ├── analytics/   # Analytics & forecasting
│   │   └── tasks/       # Celery async tasks
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API client
│   │   ├── styles/      # Global styles
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Environment Variables
Create `.env` file in root directory:
```
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
REDIS_URL=redis://localhost:6379/0

OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o

JWT_SECRET=your-jwt-secret

FRONTEND_URL=http://localhost:5173
```

## Common Commands

### Backend
- `python manage.py runserver` - Run dev server
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin user
- `celery -A config worker -l info` - Start Celery worker
- `celery -A config beat -l info` - Start Celery beat scheduler

### Frontend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm run type-check` - TypeScript check

### Docker
- `docker-compose up -d` - Start all services
- `docker-compose down` - Stop all services
- `docker-compose logs -f` - View logs
- `docker-compose exec backend bash` - Shell into backend

## Deployment

### Render Deployment
1. Connect GitHub repository to Render
2. Create PostgreSQL database on Render
3. Create Redis service on Render
4. Set environment variables in Render dashboard
5. Deploy frontend and backend services

### Production Checklist
- [ ] Set DEBUG=False in production
- [ ] Update ALLOWED_HOSTS
- [ ] Configure CORS properly
- [ ] Set secure HTTPS
- [ ] Enable HTTPS redirects
- [ ] Configure email backend
- [ ] Set up monitoring/logging
- [ ] Enable rate limiting
- [ ] Test payment integration
- [ ] Review security headers

## Performance Considerations
- Frontend: Code splitting, lazy loading, image optimization
- Backend: Database query optimization, caching with Redis
- API: Pagination, filtering, compression
- Async: Heavy tasks delegated to Celery

## Security Considerations
- JWT token refresh flow
- CSRF protection
- Rate limiting on auth endpoints
- Input validation and sanitization
- Row-level data isolation (users can only access own expenses)
- SQL injection prevention via ORM
- XSS protection via React
