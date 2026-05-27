from django.db import models
from apps.warehouses.models import Warehouse


class Route(models.Model):
    name = models.CharField(max_length=255, help_text='Nombre descriptivo de la ruta')
    origin_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, help_text='Almacén de salida')
    estimated_duration_hours = models.DecimalField(max_digits=6, decimal_places=2, help_text='Duración estimada total en horas')
    estimated_distance_km = models.DecimalField(max_digits=10, decimal_places=2, help_text='Distancia total estimada en kilómetros')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'routes'

    def __str__(self):
        return self.name


class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops', help_text='Ruta a la que pertenece')
    stop_order = models.IntegerField(help_text='Orden de la parada (1, 2, 3...)')
    address = models.CharField(max_length=500, help_text='Dirección de la parada')
    city = models.CharField(max_length=100, help_text='Ciudad de la parada')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Coordenada geográfica (latitud)')
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Coordenada geográfica (longitud)')
    estimated_offset_hours = models.DecimalField(max_digits=6, decimal_places=2, help_text='Horas desde el inicio de la ruta')

    class Meta:
        db_table = 'route_stops'
        unique_together = ('route', 'stop_order')

    def __str__(self):
        return f'{self.route.name} - Stop {self.stop_order}'
