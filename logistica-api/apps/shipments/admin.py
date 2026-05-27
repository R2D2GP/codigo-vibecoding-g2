from django.contrib import admin
from .models import Shipment, ShipmentItem


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'tracking_number', 'customer', 'status', 'destination_city', 'calculated_cost', 'created_at']
    list_filter = ['status', 'destination_city', 'destination_country']
    search_fields = ['tracking_number', 'destination_city', 'destination_address']


@admin.register(ShipmentItem)
class ShipmentItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'shipment', 'product', 'quantity', 'unit_price_at_time', 'subtotal']
    list_filter = ['product']
