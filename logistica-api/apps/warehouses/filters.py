import django_filters
from .models import Warehouse


class WarehouseFilter(django_filters.FilterSet):
    class Meta:
        model = Warehouse
        fields = {
            'city': ['exact', 'icontains'],
            'country': ['exact'],
            'is_active': ['exact'],
            'capacity_m3': ['exact', 'gte', 'lte'],
        }
