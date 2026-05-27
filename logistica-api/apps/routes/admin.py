from django.contrib import admin
from .models import Route, RouteStop


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'origin_warehouse', 'estimated_duration_hours', 'estimated_distance_km', 'is_active']
    list_filter = ['origin_warehouse', 'is_active']
    search_fields = ['name']


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ['id', 'route', 'stop_order', 'address', 'city']
    list_filter = ['city']
    search_fields = ['address', 'city']
