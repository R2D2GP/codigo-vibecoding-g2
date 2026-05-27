from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from .models import Shipment, ShipmentItem
from .serializers import ShipmentSerializer, ShipmentItemSerializer


@extend_schema_view(
    list=extend_schema(summary='Listar envíos', tags=['Envíos']),
    create=extend_schema(summary='Crear envío', tags=['Envíos']),
    retrieve=extend_schema(summary='Obtener envío', tags=['Envíos']),
    update=extend_schema(summary='Actualizar envío completamente', tags=['Envíos']),
    partial_update=extend_schema(summary='Actualizar envío parcialmente', tags=['Envíos']),
    destroy=extend_schema(summary='Eliminar envío', tags=['Envíos']),
)
class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    filterset_fields = ['status', 'customer', 'driver', 'destination_city', 'destination_country']
    search_fields = ['tracking_number', 'destination_city', 'destination_address']
    ordering_fields = ['created_at', 'estimated_delivery_date', 'calculated_cost']


@extend_schema_view(
    list=extend_schema(summary='Listar ítems de un envío', tags=['Envíos - Ítems']),
    create=extend_schema(summary='Agregar ítem a un envío', tags=['Envíos - Ítems']),
    retrieve=extend_schema(summary='Obtener ítem de envío', tags=['Envíos - Ítems']),
    update=extend_schema(summary='Actualizar ítem completamente', tags=['Envíos - Ítems']),
    partial_update=extend_schema(summary='Actualizar ítem parcialmente', tags=['Envíos - Ítems']),
    destroy=extend_schema(summary='Eliminar ítem de envío', tags=['Envíos - Ítems']),
)
class ShipmentItemViewSet(viewsets.ModelViewSet):
    serializer_class = ShipmentItemSerializer
    queryset = ShipmentItem.objects.none()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ShipmentItem.objects.none()
        return ShipmentItem.objects.filter(shipment_id=self.kwargs['shipment_pk'])

    def perform_create(self, serializer):
        serializer.save(shipment_id=self.kwargs['shipment_pk'])
