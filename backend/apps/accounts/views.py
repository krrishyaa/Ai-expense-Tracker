from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import (
    RegisterSerializer, UserSerializer,
    SupabaseRegisterSerializer, SupabaseLoginSerializer,
    SupabaseTokenRefreshSerializer, SupabaseUserSerializer
)
from .models import UserProfile
from .supabase_service import supabase_service
import logging

logger = logging.getLogger(__name__)

class SupabaseAuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user with Supabase"""
        serializer = SupabaseRegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                first_name = serializer.validated_data.get('first_name', '')
                last_name = serializer.validated_data.get('last_name', '')
                
                # Register with Supabase
                response = supabase_service.register(email, password)
                user_data = response.user
                session = response.session
                
                # Create or update local user profile
                local_user, created = User.objects.get_or_create(
                    username=email,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': last_name,
                    }
                )
                
                if created:
                    UserProfile.objects.create(user=local_user)
                
                return Response({
                    'user': {
                        'id': user_data.id,
                        'email': user_data.email,
                        'first_name': first_name,
                        'last_name': last_name,
                    },
                    'access_token': session.access_token,
                    'refresh_token': session.refresh_token,
                    'session': {
                        'access_token': session.access_token,
                        'refresh_token': session.refresh_token,
                        'expires_in': session.expires_in,
                        'expires_at': session.expires_at,
                        'token_type': session.token_type,
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user with Supabase"""
        serializer = SupabaseLoginSerializer(data=request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                
                # Login with Supabase
                response = supabase_service.login(email, password)
                user_data = response.user
                session = response.session
                
                # Create or update local user profile
                local_user, created = User.objects.get_or_create(
                    username=email,
                    defaults={
                        'email': email,
                    }
                )
                
                if created:
                    UserProfile.objects.create(user=local_user)
                
                return Response({
                    'user': {
                        'id': user_data.id,
                        'email': user_data.email,
                        'first_name': local_user.first_name,
                        'last_name': local_user.last_name,
                    },
                    'access_token': session.access_token,
                    'refresh_token': session.refresh_token,
                    'session': {
                        'access_token': session.access_token,
                        'refresh_token': session.refresh_token,
                        'expires_in': session.expires_in,
                        'expires_at': session.expires_at,
                        'token_type': session.token_type,
                    }
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Login error: {str(e)}")
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Refresh the access token using refresh token"""
        serializer = SupabaseTokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data['refresh_token']
                
                # Refresh with Supabase
                response = supabase_service.refresh_session(refresh_token)
                session = response.session
                
                return Response({
                    'access_token': session.access_token,
                    'refresh_token': session.refresh_token,
                    'session': {
                        'access_token': session.access_token,
                        'refresh_token': session.refresh_token,
                        'expires_in': session.expires_in,
                        'expires_at': session.expires_at,
                        'token_type': session.token_type,
                    }
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Token refresh error: {str(e)}")
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user information"""
        try:
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return Response(
                    {'detail': 'Missing or invalid authorization header'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            token = auth_header[7:]  # Remove 'Bearer '
            user_data = supabase_service.get_user(token)
            
            return Response({
                'id': user_data.id,
                'email': user_data.email,
                'email_confirmed_at': user_data.email_confirmed_at,
                'user_metadata': user_data.user_metadata or {},
                'created_at': user_data.created_at,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Get user error: {str(e)}")
            return Response(
                {'detail': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

