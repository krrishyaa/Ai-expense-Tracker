# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the AI Expense Tracker application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start Your Project"
3. Sign up or log in with your account
4. Create a new project:
   - Enter a project name (e.g., "AI Expense Tracker")
   - Set a strong database password
   - Choose a region closest to you
   - Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGc...`)
3. Keep these credentials safe - you'll need them for configuration

## Step 3: Configure Backend Environment Variables

Create or update your `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key

# Other existing configurations...
```

## Step 4: Configure Frontend Environment Variables

Update your `.env.local` or `.env` file in the frontend directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
VITE_API_URL=http://localhost:8000/api/v1
```

## Step 5: Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Step 6: Run the Application

### Terminal 1 - Backend
```bash
cd backend
python manage.py runserver
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 7: Test Authentication

1. Open your browser and go to `http://localhost:5173`
2. Click "Sign up" to create a new account
3. Enter:
   - Email: your-email@example.com
   - Password: (at least 6 characters)
   - First name (optional)
   - Last name (optional)
4. Click "Create Account"
5. You should be logged in and redirected to the dashboard

To test login:
1. Log out by clicking the logout button in the navbar
2. Click "Sign in"
3. Enter your email and password
4. Click "Sign In"

## Step 8: Verify Supabase Configuration

To verify everything is working:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. You should see your test user account listed

## Troubleshooting

### "Supabase credentials not configured"
- Make sure you've set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in your `.env` file
- Restart the frontend development server after adding environment variables

### Registration fails with "Invalid credentials"
- Ensure your Supabase URL and key are correct
- Check that the Supabase project is active in the dashboard

### Backend returns 400/401 errors
- Verify that `SUPABASE_URL` and `SUPABASE_KEY` are set in the backend `.env`
- Check the backend console for detailed error messages

### CORS errors
- Ensure `CORS_ALLOWED_ORIGINS` in your backend `.env` includes your frontend URL
- Default: `http://localhost:5173,http://localhost:3000`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** to version control
2. The `VITE_SUPABASE_KEY` is the **anon public key**, which is safe to expose in frontend code
3. For production:
   - Use environment-specific configurations
   - Enable HTTPS
   - Configure proper CORS policies
   - Set up email verification requirements
   - Enable password reset via email
   - Consider enabling multi-factor authentication (MFA)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

## Features Now Available

✅ User Registration with email
✅ User Login
✅ Automatic session management
✅ Logout functionality
✅ Protected routes
✅ Automatic token refresh
✅ User profile data in metadata
