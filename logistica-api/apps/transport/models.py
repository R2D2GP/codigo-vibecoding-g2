from django.db import models


class Transport(models.Model):
    TRUCK = 'TRUCK'
    VAN = 'VAN'
    MOTORCYCLE = 'MOTORCYCLE'
    CARGO_BIKE = 'CARGO_BIKE'
    TYPE_CHOICES = [
        (TRUCK, 'Camión'),
        (VAN, 'Camioneta'),
        (MOTORCYCLE, 'Motocicleta'),
        (CARGO_BIKE, 'Bicicleta de carga'),
    ]

    plate_number = models.CharField(max_length=20, unique=True, help_text='Placa del vehículo')
    transport_type = models.CharField(max_length=20, choices=TYPE_CHOICES, help_text='Tipo de vehículo: TRUCK, VAN, MOTORCYCLE, CARGO_BIKE')
    brand = models.CharField(max_length=100, help_text='Marca del vehículo')
    model = models.CharField(max_length=100, help_text='Modelo del vehículo')
    year = models.IntegerField(help_text='Año de fabricación')
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2, help_text='Capacidad máxima en kilogramos')
    capacity_m3 = models.DecimalField(max_digits=8, decimal_places=2, help_text='Capacidad máxima en metros cúbicos')
    is_available = models.BooleanField(default=True, help_text='Disponible para asignación')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'transport'

    def __str__(self):
        return self.plate_number
