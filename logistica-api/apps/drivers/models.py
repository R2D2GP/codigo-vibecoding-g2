from django.conf import settings
from django.db import models
from apps.transport.models import Transport


class Driver(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, help_text='Cuenta del sistema (login, nombre, email)')
    transport = models.ForeignKey(Transport, on_delete=models.SET_NULL, null=True, blank=True, help_text='Vehículo asignado actualmente')
    license_number = models.CharField(max_length=50, unique=True, help_text='Número de licencia de conducción')
    license_expiry = models.DateField(help_text='Fecha de vencimiento de la licencia')
    phone = models.CharField(max_length=20, help_text='Teléfono del conductor')
    is_active = models.BooleanField(default=True, help_text='Soft delete')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, help_text='Última actualización')

    class Meta:
        db_table = 'drivers'

    def __str__(self):
        return self.user.get_full_name() or self.user.username
