from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, help_text='Nombre del proveedor')
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, help_text='Nombre del almacén')

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
