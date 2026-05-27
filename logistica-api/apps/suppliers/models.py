from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=255, help_text='Nombre del proveedor')
    tax_id = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text='Identificación fiscal (RUC/NIT)')
    contact_name = models.CharField(max_length=255, help_text='Nombre del contacto')
    email = models.EmailField(max_length=254, help_text='Correo de contacto')
    phone = models.CharField(max_length=20, help_text='Teléfono de contacto')
    address = models.CharField(max_length=500, help_text='Dirección del proveedor')
    city = models.CharField(max_length=100, help_text='Ciudad')
    country = models.CharField(max_length=100, default='Colombia', help_text='País')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'suppliers'

    def __str__(self):
        return self.name
