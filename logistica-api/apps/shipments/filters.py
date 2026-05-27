import django_filters
from .models import Shipment, ShipmentItem


class ShipmentFilter(django_filters.FilterSet):
    class Meta:
        model = Shipment
        fields = {
            'status': ['exact'],
            'customer': ['exact'],
            'driver': ['exact', 'isnull'],
            'transport': ['exact', 'isnull'],
            'destination_city': ['exact', 'icontains'],
            'destination_country': ['exact'],
            'estimated_delivery_date': ['gte', 'lte'],
            'calculated_cost': ['gte', 'lte'],
        }


class ShipmentItemFilter(django_filters.FilterSet):
    class Meta:
        model = ShipmentItem
        fields = {
            'product': ['exact'],
            'quantity': ['gte', 'lte'],
        }
