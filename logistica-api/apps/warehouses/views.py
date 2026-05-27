from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Warehouse
from .serializers import WarehouseSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar almacenes', tags=['Almacenes']),
    create=extend_schema(summary='Crear almacén', tags=['Almacenes']),
    retrieve=extend_schema(summary='Obtener almacén', tags=['Almacenes']),
    update=extend_schema(summary='Actualizar almacén completamente', tags=['Almacenes']),
    partial_update=extend_schema(summary='Actualizar almacén parcialmente', tags=['Almacenes']),
    destroy=extend_schema(summary='Eliminar almacén', tags=['Almacenes']),
)
class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.filter(is_active=True)
    serializer_class = WarehouseSerializer
    filterset_fields = ['city', 'country', 'is_active']
    search_fields = ['name', 'address', 'city']
    ordering_fields = ['name', 'created_at', 'capacity_m3']
