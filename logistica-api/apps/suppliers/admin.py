from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'contact_name', 'email', 'city', 'is_active']
    list_filter = ['city', 'country', 'is_active']
    search_fields = ['name', 'email', 'tax_id']
