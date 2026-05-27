from django.test import TestCase
from django.db import IntegrityError
from decimal import Decimal
from apps.suppliers.models import Supplier
from apps.warehouses.models import Warehouse
from apps.products.models import Product


class ProductModelTest(TestCase):
    """Tests para el modelo Product."""

    def setUp(self):
        self.supplier = Supplier.objects.create(
            name='Proveedor Test', contact_name='Contacto',
            email='prov@test.com', phone='123',
            address='Calle 1', city='City',
        )
        self.warehouse = Warehouse.objects.create(
            name='Almacén Test', address='Av 1',
            city='City', capacity_m3=Decimal('5000.00'),
        )
        self.data = {
            'supplier': self.supplier,
            'warehouse': self.warehouse,
            'name': 'Laptop Pro',
            'sku': 'LPT-001',
            'category': 'laptop',
            'weight_kg': Decimal('2.500'),
            'width_cm': Decimal('35.00'),
            'height_cm': Decimal('25.00'),
            'depth_cm': Decimal('2.00'),
            'unit_price': Decimal('4999.99'),
            'stock_quantity': 10,
        }
        self.product = Product.objects.create(**self.data)

    def test_create_product_success(self):
        self.assertEqual(self.product.name, 'Laptop Pro')
        self.assertEqual(self.product.sku, 'LPT-001')
        self.assertEqual(self.product.category, 'laptop')
        self.assertEqual(self.product.unit_price, Decimal('4999.99'))
        self.assertEqual(self.product.stock_quantity, 10)
        self.assertEqual(self.product.supplier, self.supplier)
        self.assertEqual(self.product.warehouse, self.warehouse)
        self.assertTrue(self.product.is_active)

    def test_default_stock_quantity(self):
        product = Product.objects.create(
            supplier=self.supplier, warehouse=self.warehouse,
            name='Producto Sin Stock', sku='STK-000',
            category='accesorio',
            weight_kg=Decimal('0.100'), width_cm=Decimal('10.00'),
            height_cm=Decimal('5.00'), depth_cm=Decimal('1.00'),
            unit_price=Decimal('100.00'),
        )
        self.assertEqual(product.stock_quantity, 0)

    def test_default_is_active(self):
        self.assertTrue(self.product.is_active)

    def test_string_representation(self):
        self.assertEqual(str(self.product), 'LPT-001 - Laptop Pro')

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.product.created_at)
        self.assertIsNotNone(self.product.updated_at)

    def test_unique_sku(self):
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                supplier=self.supplier, warehouse=self.warehouse,
                name='Otra Laptop', sku='LPT-001',
                category='laptop',
                weight_kg=Decimal('2.000'), width_cm=Decimal('30.00'),
                height_cm=Decimal('20.00'), depth_cm=Decimal('2.00'),
                unit_price=Decimal('3999.99'),
            )

    def test_nullable_description(self):
        product = Product.objects.create(
            supplier=self.supplier, warehouse=self.warehouse,
            name='Sin Desc', sku='DESC-001',
            category='accesorio',
            weight_kg=Decimal('0.100'), width_cm=Decimal('10.00'),
            height_cm=Decimal('5.00'), depth_cm=Decimal('1.00'),
            unit_price=Decimal('50.00'),
        )
        self.assertIsNone(product.description)

    def test_cascade_delete_supplier(self):
        supplier_pk = self.supplier.pk
        self.supplier.delete()
        with self.assertRaises(Product.DoesNotExist):
            Product.objects.get(pk=self.product.pk)

    def test_cascade_delete_warehouse(self):
        warehouse_pk = self.warehouse.pk
        self.warehouse.delete()
        with self.assertRaises(Product.DoesNotExist):
            Product.objects.get(pk=self.product.pk)
