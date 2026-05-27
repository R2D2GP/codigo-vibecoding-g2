from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Customer
from .serializers import CustomerSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar clientes', tags=['Clientes']),
    create=extend_schema(summary='Crear cliente', tags=['Clientes']),
    retrieve=extend_schema(summary='Obtener cliente', tags=['Clientes']),
    update=extend_schema(summary='Actualizar cliente completamente', tags=['Clientes']),
    partial_update=extend_schema(summary='Actualizar cliente parcialmente', tags=['Clientes']),
    destroy=extend_schema(summary='Eliminar cliente', tags=['Clientes']),
)
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True)
    serializer_class = CustomerSerializer
    filterset_fields = ['customer_type', 'city', 'country', 'is_active']
    search_fields = ['name', 'email', 'tax_id']
    ordering_fields = ['name', 'created_at']
