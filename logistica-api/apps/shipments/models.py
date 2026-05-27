import uuid
from django.db import models
from apps.customers.models import Customer
from apps.drivers.models import Driver
from apps.transport.models import Transport
from apps.routes.models import Route
from apps.warehouses.models import Warehouse
from apps.products.models import Product


class Shipment(models.Model):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    IN_TRANSIT = 'IN_TRANSIT'
    DELIVERED = 'DELIVERED'
    CANCELLED = 'CANCELLED'
    RETURNED = 'RETURNED'
    STATUS_CHOICES = [
        (PENDING, 'Pendiente'),
        (CONFIRMED, 'Confirmado'),
        (IN_TRANSIT, 'En tránsito'),
        (DELIVERED, 'Entregado'),
        (CANCELLED, 'Cancelado'),
        (RETURNED, 'Devuelto'),
    ]

    tracking_number = models.CharField(max_length=50, unique=True, help_text='Código de rastreo público')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, help_text='Cliente que genera el envío')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, help_text='Conductor asignado')
    transport = models.ForeignKey(Transport, on_delete=models.SET_NULL, null=True, blank=True, help_text='Vehículo asignado')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, help_text='Ruta asignada')
    origin_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, help_text='Almacén de origen')
    destination_address = models.CharField(max_length=500, help_text='Dirección de entrega')
    destination_city = models.CharField(max_length=100, help_text='Ciudad de destino')
    destination_country = models.CharField(max_length=100, default='Colombia', help_text='País de destino')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING, help_text='Estado del envío: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED')
    estimated_delivery_date = models.DateField(null=True, blank=True, help_text='Fecha estimada de entrega')
    actual_delivery_date = models.DateTimeField(null=True, blank=True, help_text='Fecha y hora real de entrega')
    weight_total_kg = models.DecimalField(max_digits=10, decimal_places=3, default=0, help_text='Peso total calculado del envío')
    base_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Costo base antes de ajustes')
    calculated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Costo final al cliente')
    notes = models.TextField(null=True, blank=True, help_text='Instrucciones especiales de entrega')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'shipments'

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            self.tracking_number = f'SHP-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.tracking_number


class ShipmentItem(models.Model):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='items', help_text='Envío al que pertenece')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, help_text='Producto incluido')
    quantity = models.IntegerField(help_text='Cantidad de unidades')
    unit_price_at_time = models.DecimalField(max_digits=12, decimal_places=2, help_text='Precio unitario snapshot al momento del envío')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, help_text='quantity × unit_price_at_time')

    class Meta:
        db_table = 'shipment_items'
        unique_together = ('shipment', 'product')

    def __str__(self):
        return f'{self.shipment.tracking_number} - {self.product.name} x{self.quantity}'
