# AI Expense Tracker

A production-grade full-stack financial intelligence platform with AI-powered expense categorization, real-time analytics, and async task processing.

## 🚀 Features

- **JWT Authentication** - Secure multi-user architecture with token-based authentication
- **Expense Management** - Full CRUD operations with filtering, sorting, and pagination
- **AI Categorization** - OpenAI API automatically categorizes expenses and generates insights
- **Budget Tracking** - Set budgets with real-time spending alerts and status tracking
- **Advanced Analytics** - Monthly/yearly charts, category breakdowns, and ML-powered forecasting
- **PDF/CSV Export** - Background generation via Celery + Redis (zero UI blocking)
- **Voice Input** - Web Speech API for hands-free expense entry
- **Real-time Sync** - Zustand state management with instant UI updates
- **Docker Deployment** - Full containerization for easy deployment on Render or any cloud platform
- **Production UI** - Smooth animations, dark theme, responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API layer
- **PostgreSQL** - Primary database
- **Celery + Redis** - Async task queue
- **OpenAI API** - AI categorization
- **JWT** - Secure authentication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with dark theme
- **Framer Motion** - Smooth animations
- **Chart.js** - Data visualization
- **Zustand** - State management
- **Vite** - Fast build tool

### DevOps
- **Docker & Docker Compose** - Containerization
- **Render** - Cloud deployment
- **PostgreSQL** - Production database

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (for local development without Docker)
- Redis 7+ (for local development without Docker)

## 🔧 Local Development Setup

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd ai-expense-tracker

# Create .env file
cp .env.example .env

# Add your OpenAI API key
echo "OPENAI_API_KEY=sk-..." >> .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Django Admin: http://localhost:8000/admin
```

### Manual Setup (Without Docker)

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure database
psql -U postgres -d expense_tracker

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# In another terminal, start Celery worker
celery -A config worker -l info

# In another terminal, start Celery beat
celery -A config beat -l info
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

## 📚 Project Structure

```
ai-expense-tracker/
├── backend/
│   ├── config/              # Django settings & URLs
│   ├── apps/
│   │   ├── accounts/        # User authentication & profiles
│   │   ├── expenses/        # Expense CRUD operations
│   │   ├── budgets/         # Budget management
│   │   ├── analytics/       # Analytics & forecasting
│   │   └── tasks/           # Celery async tasks
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client & services
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   ├── styles/          # Global styles
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔑 Environment Variables

Create `.env` file in the root directory:

```env
# Django
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o

# JWT
JWT_SECRET=your-jwt-secret-key

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🚀 Deployment on Render

### Prerequisites
- GitHub repository connected to Render
- OpenAI API key
- Render account

### Steps

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → Create New → PostgreSQL
   - Configure and note the connection string

2. **Create Redis Service**
   - Go to Render Dashboard → Create New → Redis
   - Configure and note the connection string

3. **Deploy Backend Service**
   - Create New → Web Service
   - Connect GitHub repository
   - Runtime: Python 3.11
   - Build Command: `pip install -r backend/requirements.txt && python backend/manage.py migrate && python backend/manage.py collectstatic --noinput`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:8000`
   - Add environment variables from `.env`

4. **Deploy Frontend Service**
   - Create New → Web Service
   - Connect GitHub repository
   - Runtime: Node
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm run preview`
   - Set `VITE_API_URL` to your backend URL

5. **Configure Environment Variables**
   - Set all environment variables in Render dashboard
   - Add database and Redis URLs from steps 1-2

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Configure CORS for your frontend URL
- [ ] Enable HTTPS redirects
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review security headers
- [ ] Test JWT token refresh flow
- [ ] Backup PostgreSQL database

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/token/` - Login
- `POST /api/v1/auth/token/refresh/` - Refresh access token
- `GET /api/v1/auth/me/` - Get current user

### Expenses
- `GET /api/v1/expenses/` - List expenses (paginated)
- `POST /api/v1/expenses/` - Create expense
- `GET /api/v1/expenses/{id}/` - Get expense
- `PATCH /api/v1/expenses/{id}/` - Update expense
- `DELETE /api/v1/expenses/{id}/` - Delete expense
- `GET /api/v1/expenses/summary/` - Get spending summary
- `POST /api/v1/expenses/export_pdf/` - Generate PDF report

### Budgets
- `GET /api/v1/budgets/` - List budgets
- `POST /api/v1/budgets/` - Create budget
- `GET /api/v1/budgets/spending_status/` - Get budget status

### Analytics
- `GET /api/v1/analytics/monthly_trends/` - Monthly spending trends
- `GET /api/v1/analytics/category_breakdown/` - Category breakdown
- `GET /api/v1/analytics/forecast/` - Spending forecast
- `GET /api/v1/analytics/summary/` - Overall summary

## 🎨 Key Features Deep Dive

### AI Categorization
Expenses are automatically categorized using OpenAI API with prompt engineering. The system learns from user behavior and provides confidence scores.

### Async Task Processing
PDF generation and heavy API calls are handled by Celery workers to prevent UI blocking. Users can track task status in real-time.

### Analytics Pipeline
- Monthly/yearly trend analysis
- Category-based spending breakdown
- ML-powered forecasting using historical data
- Budget alerts when thresholds are exceeded

### Security
- JWT token-based authentication
- Row-level data isolation (users only see their expenses)
- CSRF protection
- SQL injection prevention via ORM
- XSS protection via React

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL service
docker-compose logs postgres

# Verify connection string in .env
```

### Celery Tasks Not Running
```bash
# Restart Celery worker
docker-compose restart celery

# Check Redis connection
redis-cli ping
```

### Frontend Not Connecting to Backend
```bash
# Verify API URL in frontend/.env
# Check CORS settings in Django settings.py
# Ensure backend is running on http://localhost:8000
```

## 📞 Support

For issues and questions, please create an issue on GitHub or contact the development team.

---

Built with ❤️ using Django, React, and AI
