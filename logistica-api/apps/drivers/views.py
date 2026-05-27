from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Driver
from .serializers import DriverSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar conductores', tags=['Conductores']),
    create=extend_schema(summary='Crear conductor', tags=['Conductores']),
    retrieve=extend_schema(summary='Obtener conductor', tags=['Conductores']),
    update=extend_schema(summary='Actualizar conductor completamente', tags=['Conductores']),
    partial_update=extend_schema(summary='Actualizar conductor parcialmente', tags=['Conductores']),
    destroy=extend_schema(summary='Eliminar conductor', tags=['Conductores']),
)
class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.filter(is_active=True)
    serializer_class = DriverSerializer
    filterset_fields = ['is_active']
    search_fields = ['license_number', 'phone', 'user__email']
    ordering_fields = ['created_at']
