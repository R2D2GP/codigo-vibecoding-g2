from rest_framework import serializers
from .models import Route, RouteStop


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = '__all__'
        read_only_fields = ['id']


class RouteSerializer(serializers.ModelSerializer):
    origin_warehouse_name = serializers.CharField(source='origin_warehouse.name', read_only=True, help_text='Nombre del almacén de origen')
    stops = RouteStopSerializer(many=True, read_only=True, help_text='Paradas de la ruta')

    class Meta:
        model = Route
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
