from django.db import models
from apps.suppliers.models import Supplier
from apps.warehouses.models import Warehouse


class Product(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, help_text='Proveedor del producto')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, help_text='Almacén donde está guardado')
    name = models.CharField(max_length=255, help_text='Nombre del producto')
    sku = models.CharField(max_length=100, unique=True, help_text='Código único del producto')
    description = models.TextField(null=True, blank=True, help_text='Descripción detallada')
    category = models.CharField(max_length=100, help_text='Categoría (laptop, celular, etc.)')
    weight_kg = models.DecimalField(max_digits=8, decimal_places=3, help_text='Peso en kilogramos')
    width_cm = models.DecimalField(max_digits=8, decimal_places=2, help_text='Ancho en centímetros')
    height_cm = models.DecimalField(max_digits=8, decimal_places=2, help_text='Alto en centímetros')
    depth_cm = models.DecimalField(max_digits=8, decimal_places=2, help_text='Profundidad en centímetros')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, help_text='Precio unitario de venta')
    stock_quantity = models.IntegerField(default=0, help_text='Unidades disponibles en almacén')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'products'

    def __str__(self):
        return f'{self.sku} - {self.name}'
