from django.test import TestCase
from decimal import Decimal
from apps.warehouses.models import Warehouse


class WarehouseModelTest(TestCase):
    """Tests para el modelo Warehouse."""

    def setUp(self):
        self.data = {
            'name': 'Almacén Central',
            'address': 'Cra 50 #123-45',
            'city': 'Bogotá',
            'country': 'Colombia',
            'capacity_m3': Decimal('5000.00'),
        }
        self.warehouse = Warehouse.objects.create(**self.data)

    def test_create_warehouse_success(self):
        """Verifica creación exitosa con todos los campos requeridos."""
        self.assertEqual(self.warehouse.name, 'Almacén Central')
        self.assertEqual(self.warehouse.address, 'Cra 50 #123-45')
        self.assertEqual(self.warehouse.city, 'Bogotá')
        self.assertEqual(self.warehouse.country, 'Colombia')
        self.assertEqual(self.warehouse.capacity_m3, Decimal('5000.00'))
        self.assertTrue(self.warehouse.is_active)

    def test_create_warehouse_with_nullable_fields(self):
        """Verifica creación con latitude y longitude nulos."""
        warehouse = Warehouse.objects.create(**self.data)
        self.assertIsNone(warehouse.latitude)
        self.assertIsNone(warehouse.longitude)

    def test_create_warehouse_with_coordinates(self):
        """Verifica creación con coordenadas geográficas."""
        data = {**self.data, 'latitude': Decimal('4.711000'), 'longitude': Decimal('-74.072000')}
        warehouse = Warehouse.objects.create(**data)
        self.assertEqual(warehouse.latitude, Decimal('4.711000'))
        self.assertEqual(warehouse.longitude, Decimal('-74.072000'))

    def test_string_representation(self):
        """Verifica que __str__ retorne el nombre."""
        self.assertEqual(str(self.warehouse), 'Almacén Central')

    def test_default_country(self):
        """Verifica que el país por defecto sea Colombia."""
        warehouse = Warehouse.objects.create(
            name='Almacén Norte',
            address='Calle 10 #20-30',
            city='Medellín',
            capacity_m3=Decimal('3000.00'),
        )
        self.assertEqual(warehouse.country, 'Colombia')

    def test_default_is_active(self):
        """Verifica que is_active sea True por defecto."""
        self.assertTrue(self.warehouse.is_active)

    def test_auto_timestamps(self):
        """Verifica que created_at y updated_at se asignen automáticamente."""
        self.assertIsNotNone(self.warehouse.created_at)
        self.assertIsNotNone(self.warehouse.updated_at)

    def test_create_warehouse_without_required_name(self):
        """Verifica que omitir name asigna string vacío (no NULL)."""
        data = self.data.copy()
        del data['name']
        warehouse = Warehouse.objects.create(**data)
        self.assertEqual(warehouse.name, '')
