@echo off
REM AI Expense Tracker - Quick Start Script for Windows

echo.
echo 🚀 AI Expense Tracker - Quick Start
echo ==================================
echo.

REM Check prerequisites
echo ✓ Checking prerequisites...

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

echo ✓ Docker and Docker Compose found
echo.

REM Setup environment
echo 📝 Setting up environment...

if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file from .env.example
    echo ⚠️  Please update .env with your OpenAI API key
    echo.
    pause
)

echo.
echo 🐳 Starting Docker services...

REM Start services
docker-compose up -d

echo ✓ Services started
echo.

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10

echo.
echo 🔄 Running migrations...

docker-compose exec backend python manage.py migrate

echo ✓ Migrations completed
echo.

echo 👤 Creating superuser...

docker-compose exec backend python manage.py createsuperuser

echo.
echo ✓ Setup complete!
echo.
echo 📱 Your application is ready:
echo    - Frontend: http://localhost:5173
echo    - Backend: http://localhost:8000
echo    - Admin: http://localhost:8000/admin
echo.
echo 📚 Next steps:
echo    - Open http://localhost:5173 in your browser
echo    - Register a new account or use your admin account
echo    - Add your first expense!
echo.
echo 🛑 To stop services: docker-compose down
echo 📊 To view logs: docker-compose logs -f
echo.
pause
