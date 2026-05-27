from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Supplier
from .serializers import SupplierSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar proveedores', tags=['Proveedores']),
    create=extend_schema(summary='Crear proveedor', tags=['Proveedores']),
    retrieve=extend_schema(summary='Obtener proveedor', tags=['Proveedores']),
    update=extend_schema(summary='Actualizar proveedor completamente', tags=['Proveedores']),
    partial_update=extend_schema(summary='Actualizar proveedor parcialmente', tags=['Proveedores']),
    destroy=extend_schema(summary='Eliminar proveedor', tags=['Proveedores']),
)
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.filter(is_active=True)
    serializer_class = SupplierSerializer
    filterset_fields = ['city', 'country', 'is_active']
    search_fields = ['name', 'email', 'tax_id', 'contact_name']
    ordering_fields = ['name', 'created_at']
