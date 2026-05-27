import django_filters
from .models import Driver


class DriverFilter(django_filters.FilterSet):
    class Meta:
        model = Driver
        fields = {
            'is_active': ['exact'],
            'license_expiry': ['gte', 'lte'],
        }
