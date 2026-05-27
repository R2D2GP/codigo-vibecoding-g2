from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'routes', views.RouteViewSet)

urlpatterns = [
    path('routes/<int:route_pk>/stops/', views.RouteStopViewSet.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('routes/<int:route_pk>/stops/<int:pk>/', views.RouteStopViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    })),
] + router.urls
