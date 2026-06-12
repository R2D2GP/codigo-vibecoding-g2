from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.warehouses.urls')),
    path('api/v1/', include('apps.suppliers.urls')),
    path('api/v1/', include('apps.customers.urls')),
    path('api/v1/', include('apps.transport.urls')),
    path('api/v1/', include('apps.products.urls')),
    path('api/v1/', include('apps.routes.urls')),
    path('api/v1/', include('apps.drivers.urls')),
    path('api/v1/', include('apps.shipments.urls')),
    path('api/v1/auth/', include('apps.auth.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
