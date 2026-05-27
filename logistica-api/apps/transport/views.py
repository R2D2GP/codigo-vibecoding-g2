from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Transport
from .serializers import TransportSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar transportes', tags=['Transporte']),
    create=extend_schema(summary='Crear transporte', tags=['Transporte']),
    retrieve=extend_schema(summary='Obtener transporte', tags=['Transporte']),
    update=extend_schema(summary='Actualizar transporte completamente', tags=['Transporte']),
    partial_update=extend_schema(summary='Actualizar transporte parcialmente', tags=['Transporte']),
    destroy=extend_schema(summary='Eliminar transporte', tags=['Transporte']),
)
class TransportViewSet(viewsets.ModelViewSet):
    queryset = Transport.objects.filter(is_available=True)
    serializer_class = TransportSerializer
    filterset_fields = ['transport_type', 'is_available']
    search_fields = ['plate_number', 'brand', 'model']
    ordering_fields = ['plate_number', 'year', 'capacity_kg']
