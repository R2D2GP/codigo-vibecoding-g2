from django.contrib import admin
from .models import Transport


@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    list_display = ['id', 'plate_number', 'transport_type', 'brand', 'model', 'year', 'is_available']
    list_filter = ['transport_type', 'is_available']
    search_fields = ['plate_number', 'brand']
