from django.db import models


class Customer(models.Model):
    COMPANY = 'COMPANY'
    INDIVIDUAL = 'INDIVIDUAL'
    TYPE_CHOICES = [(COMPANY, 'Company'), (INDIVIDUAL, 'Individual')]

    name = models.CharField(max_length=255, help_text='Nombre de la empresa o persona')
    customer_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=COMPANY, help_text='Tipo de cliente: COMPANY (empresa) o INDIVIDUAL (persona)')
    tax_id = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text='RUC/NIT/identificación fiscal')
    email = models.EmailField(max_length=254, unique=True, help_text='Correo de contacto principal')
    phone = models.CharField(max_length=20, help_text='Teléfono de contacto')
    address = models.CharField(max_length=500, help_text='Dirección completa')
    city = models.CharField(max_length=100, help_text='Ciudad')
    country = models.CharField(max_length=100, default='Colombia', help_text='País')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.name
