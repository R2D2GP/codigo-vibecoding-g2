from django.db import models


class Warehouse(models.Model):
    name = models.CharField(max_length=255, help_text='Nombre del almacén')
    address = models.CharField(max_length=500, help_text='Dirección completa')
    city = models.CharField(max_length=100, help_text='Ciudad')
    country = models.CharField(max_length=100, default='Colombia', help_text='País')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Coordenada geográfica (latitud)')
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Coordenada geográfica (longitud)')
    capacity_m3 = models.DecimalField(max_digits=10, decimal_places=2, help_text='Capacidad total en metros cúbicos')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'warehouses'

    def __str__(self):
        return self.name
