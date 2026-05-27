import django_filters
from .models import Transport


class TransportFilter(django_filters.FilterSet):
    class Meta:
        model = Transport
        fields = {
            'transport_type': ['exact'],
            'is_available': ['exact'],
            'year': ['exact', 'gte', 'lte'],
            'capacity_kg': ['gte', 'lte'],
        }
