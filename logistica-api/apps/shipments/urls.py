from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'shipments', views.ShipmentViewSet)

urlpatterns = [
    path('shipments/<int:shipment_pk>/items/', views.ShipmentItemViewSet.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('shipments/<int:shipment_pk>/items/<int:pk>/', views.ShipmentItemViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    })),
] + router.urls
