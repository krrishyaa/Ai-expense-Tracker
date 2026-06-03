from supabase import create_client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = None
        return cls._instance
    
    @property
    def client(self):
        if self._client is None:
            try:
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                raise
        return self._client
    
    def register(self, email: str, password: str):
        """Register a new user with Supabase Auth"""
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
            })
            return response
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            raise
    
    def login(self, email: str, password: str):
        """Login user with Supabase Auth"""
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password,
            })
            return response
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise
    
    def get_user(self, token: str):
        """Get user information from token"""
        try:
            # Set the session with the token
            self.client.auth.set_session(token, "")
            user = self.client.auth.get_user(token)
            return user
        except Exception as e:
            logger.error(f"Get user failed: {str(e)}")
            raise
    
    def refresh_session(self, refresh_token: str):
        """Refresh the user session"""
        try:
            response = self.client.auth.refresh_session(refresh_token)
            return response
        except Exception as e:
            logger.error(f"Refresh session failed: {str(e)}")
            raise
    
    def sign_out(self):
        """Sign out the user"""
        try:
            return self.client.auth.sign_out()
        except Exception as e:
            logger.error(f"Sign out failed: {str(e)}")
            raise


supabase_service = SupabaseService()
