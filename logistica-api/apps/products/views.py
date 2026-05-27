from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar productos', tags=['Productos']),
    create=extend_schema(summary='Crear producto', tags=['Productos']),
    retrieve=extend_schema(summary='Obtener producto', tags=['Productos']),
    update=extend_schema(summary='Actualizar producto completamente', tags=['Productos']),
    partial_update=extend_schema(summary='Actualizar producto parcialmente', tags=['Productos']),
    destroy=extend_schema(summary='Eliminar producto', tags=['Productos']),
)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    filterset_fields = ['category', 'supplier', 'warehouse', 'is_active']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'unit_price', 'created_at']
