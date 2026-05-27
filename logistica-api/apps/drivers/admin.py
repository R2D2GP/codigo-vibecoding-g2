from django.contrib import admin
from .models import Driver


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'transport', 'license_number', 'license_expiry', 'is_active']
    list_filter = ['is_active']
    search_fields = ['license_number', 'user__email', 'phone']
