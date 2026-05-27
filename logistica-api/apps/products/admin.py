from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'sku', 'category', 'unit_price', 'stock_quantity', 'is_active']
    list_filter = ['category', 'supplier', 'is_active']
    search_fields = ['name', 'sku']
