from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    GroupViewSet,
    PermissionViewSet,
    UserViewSet,
    current_user,
    profile,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'groups', GroupViewSet, basename='groups')
router.register(r'permissions', PermissionViewSet, basename='permissions')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='auth_me'),
    path('profile/', profile, name='auth_profile'),
    path('', include(router.urls)),
]
