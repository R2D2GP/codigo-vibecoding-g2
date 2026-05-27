from drf_spectacular.utils import extend_schema_view, extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


@extend_schema_view(
    post=extend_schema(
        summary='Iniciar sesión',
        description='Obtiene un par de tokens JWT (access + refresh) usando username y password.',
        tags=['Autenticación'],
    ),
)
class CustomTokenObtainPairView(TokenObtainPairView):
    pass


@extend_schema_view(
    post=extend_schema(
        summary='Refrescar token',
        description='Obtiene un nuevo access token usando el refresh token.',
        tags=['Autenticación'],
    ),
)
class CustomTokenRefreshView(TokenRefreshView):
    pass
