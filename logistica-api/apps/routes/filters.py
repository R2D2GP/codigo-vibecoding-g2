import django_filters
from .models import Route, RouteStop


class RouteFilter(django_filters.FilterSet):
    class Meta:
        model = Route
        fields = {
            'origin_warehouse': ['exact'],
            'is_active': ['exact'],
            'estimated_duration_hours': ['gte', 'lte'],
        }


class RouteStopFilter(django_filters.FilterSet):
    class Meta:
        model = RouteStop
        fields = {
            'stop_order': ['exact', 'gte'],
            'city': ['exact', 'icontains'],
        }
