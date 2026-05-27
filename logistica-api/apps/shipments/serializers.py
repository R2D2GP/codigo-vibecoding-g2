from rest_framework import serializers
from .models import Shipment, ShipmentItem


class ShipmentItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, help_text='Nombre del producto')

    class Meta:
        model = ShipmentItem
        fields = '__all__'
        read_only_fields = ['id', 'subtotal']


class ShipmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True, help_text='Nombre del cliente')
    origin_warehouse_name = serializers.CharField(source='origin_warehouse.name', read_only=True, help_text='Nombre del almacén de origen')
    items = ShipmentItemSerializer(many=True, read_only=True, help_text='Ítems incluidos en el envío')
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True, default=None, help_text='Nombre del conductor asignado')
    transport_plate = serializers.CharField(source='transport.plate_number', read_only=True, default=None, help_text='Placa del vehículo asignado')
    route_name = serializers.CharField(source='route.name', read_only=True, default=None, help_text='Nombre de la ruta asignada')

    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'tracking_number', 'created_at', 'updated_at']
