from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SupabaseAuthViewSet, RegisterViewSet, UserViewSet

# Create router instances
router = DefaultRouter()
router.register(r'auth', SupabaseAuthViewSet, basename='supabase-auth')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Legacy endpoints (optional, for backward compatibility)
    path('register/', RegisterViewSet.as_view({'post': 'register'}), name='register'),
] + router.urls

