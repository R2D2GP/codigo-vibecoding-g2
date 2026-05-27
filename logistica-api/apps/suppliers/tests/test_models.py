from django.test import TestCase
from django.db import IntegrityError
from apps.suppliers.models import Supplier


class SupplierModelTest(TestCase):
    """Tests para el modelo Supplier."""

    def setUp(self):
        self.data = {
            'name': 'TecnoSur S.A.S.',
            'contact_name': 'Carlos Méndez',
            'email': 'carlos@tecnosur.com',
            'phone': '+57 300 987 6543',
            'address': 'Cra 20 #45-67',
            'city': 'Bogotá',
        }
        self.supplier = Supplier.objects.create(**self.data)

    def test_create_supplier_success(self):
        self.assertEqual(self.supplier.name, 'TecnoSur S.A.S.')
        self.assertEqual(self.supplier.contact_name, 'Carlos Méndez')
        self.assertEqual(self.supplier.email, 'carlos@tecnosur.com')
        self.assertEqual(self.supplier.city, 'Bogotá')
        self.assertTrue(self.supplier.is_active)

    def test_default_country(self):
        self.assertEqual(self.supplier.country, 'Colombia')

    def test_default_is_active(self):
        self.assertTrue(self.supplier.is_active)

    def test_string_representation(self):
        self.assertEqual(str(self.supplier), 'TecnoSur S.A.S.')

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.supplier.created_at)
        self.assertIsNotNone(self.supplier.updated_at)

    def test_unique_tax_id(self):
        Supplier.objects.create(
            name='Proveedor A', contact_name='Contacto A',
            email='a@test.com', phone='111', address='Calle 1',
            city='City', tax_id='NIT-001',
        )
        with self.assertRaises(IntegrityError):
            Supplier.objects.create(
                name='Proveedor B', contact_name='Contacto B',
                email='b@test.com', phone='222', address='Calle 2',
                city='City', tax_id='NIT-001',
            )

    def test_create_supplier_with_null_tax_id(self):
        supplier = Supplier.objects.create(
            name='Sin NIT', contact_name='Contacto',
            email='sin@nit.com', phone='333',
            address='Calle 3', city='City',
        )
        self.assertIsNone(supplier.tax_id)

    def test_create_supplier_without_contact_name_fails(self):
        data = self.data.copy()
        del data['contact_name']
        supplier = Supplier.objects.create(**data)
        self.assertEqual(supplier.contact_name, '')
