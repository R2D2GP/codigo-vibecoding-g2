from django.contrib.auth.models import Group, Permission, User
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .permissions import IsSuperAdmin
from .serializers import (
    CustomTokenObtainPairSerializer,
    GroupSerializer,
    PermissionSerializer,
    ProfileSerializer,
    UserCreateSerializer,
    UserSerializer,
)


@extend_schema_view(
    post=extend_schema(
        summary='Iniciar sesión',
        description='Obtiene un par de tokens JWT (access + refresh) usando username y password.',
        tags=['Autenticación'],
    ),
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema_view(
    post=extend_schema(
        summary='Refrescar token',
        description='Obtiene un nuevo access token usando el refresh token.',
        tags=['Autenticación'],
    ),
)
class CustomTokenRefreshView(TokenRefreshView):
    pass


@extend_schema_view(
    get=extend_schema(summary='Obtener usuario actual', tags=['Autenticación']),
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema_view(
    get=extend_schema(summary='Obtener perfil propio', tags=['Autenticación']),
    patch=extend_schema(summary='Actualizar perfil propio', tags=['Autenticación']),
)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    serializer = ProfileSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(request.user).data)


@extend_schema_view(
    get=extend_schema(summary='Listar usuarios', tags=['Usuarios']),
    post=extend_schema(summary='Crear usuario', tags=['Usuarios']),
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsSuperAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'date_joined', 'is_active']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_serializer(self, *args, **kwargs):
        if self.action == 'partial_update':
            kwargs['partial'] = True
        return super().get_serializer(*args, **kwargs)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


@extend_schema_view(
    get=extend_schema(summary='Listar grupos', tags=['Usuarios']),
    post=extend_schema(summary='Crear grupo', tags=['Usuarios']),
)
class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [IsSuperAdmin]
    search_fields = ['name']
    ordering_fields = ['name']


@extend_schema_view(
    get=extend_schema(summary='Listar permisos', tags=['Usuarios']),
)
class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by('content_type__app_label', 'codename')
    serializer_class = PermissionSerializer
    permission_classes = [IsSuperAdmin]
    search_fields = ['name', 'codename']
    ordering_fields = ['name', 'codename']
