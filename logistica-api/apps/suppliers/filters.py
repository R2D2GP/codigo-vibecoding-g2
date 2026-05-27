import django_filters
from .models import Supplier


class SupplierFilter(django_filters.FilterSet):
    class Meta:
        model = Supplier
        fields = {
            'city': ['exact', 'icontains'],
            'country': ['exact'],
            'is_active': ['exact'],
            'name': ['exact', 'icontains'],
        }
