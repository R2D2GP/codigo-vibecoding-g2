from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Route, RouteStop
from .serializers import RouteSerializer, RouteStopSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar rutas', tags=['Rutas']),
    create=extend_schema(summary='Crear ruta', tags=['Rutas']),
    retrieve=extend_schema(summary='Obtener ruta', tags=['Rutas']),
    update=extend_schema(summary='Actualizar ruta completamente', tags=['Rutas']),
    partial_update=extend_schema(summary='Actualizar ruta parcialmente', tags=['Rutas']),
    destroy=extend_schema(summary='Eliminar ruta', tags=['Rutas']),
)
class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.filter(is_active=True)
    serializer_class = RouteSerializer
    filterset_fields = ['origin_warehouse', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'estimated_duration_hours', 'estimated_distance_km']


@extend_schema_view(
    list=extend_schema(
        summary='Listar paradas de una ruta',
        tags=['Rutas - Paradas'],
        parameters=[],
    ),
    create=extend_schema(
        summary='Crear parada en una ruta',
        tags=['Rutas - Paradas'],
        parameters=[],
    ),
    retrieve=extend_schema(summary='Obtener parada de ruta', tags=['Rutas - Paradas']),
    update=extend_schema(summary='Actualizar parada completamente', tags=['Rutas - Paradas']),
    partial_update=extend_schema(summary='Actualizar parada parcialmente', tags=['Rutas - Paradas']),
    destroy=extend_schema(summary='Eliminar parada de ruta', tags=['Rutas - Paradas']),
)
class RouteStopViewSet(viewsets.ModelViewSet):
    serializer_class = RouteStopSerializer
    queryset = RouteStop.objects.none()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return RouteStop.objects.none()
        return RouteStop.objects.filter(route_id=self.kwargs['route_pk'])

    def perform_create(self, serializer):
        serializer.save(route_id=self.kwargs['route_pk'])
