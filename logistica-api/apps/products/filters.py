import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            'category': ['exact', 'icontains'],
            'supplier': ['exact'],
            'warehouse': ['exact'],
            'is_active': ['exact'],
            'unit_price': ['gte', 'lte'],
            'stock_quantity': ['gte', 'lte'],
        }
