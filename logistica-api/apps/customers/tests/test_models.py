from django.test import TestCase
from django.db import IntegrityError
from apps.customers.models import Customer


class CustomerModelTest(TestCase):
    """Tests para el modelo Customer."""

    def setUp(self):
        self.data = {
            'name': 'TechCorp S.A.S.',
            'customer_type': Customer.COMPANY,
            'email': 'contacto@techcorp.com',
            'phone': '+57 300 123 4567',
            'address': 'Cra 15 #88-66',
            'city': 'Bogotá',
        }
        self.customer = Customer.objects.create(**self.data)

    def test_create_customer_success(self):
        """Verifica creación exitosa con todos los campos requeridos."""
        self.assertEqual(self.customer.name, 'TechCorp S.A.S.')
        self.assertEqual(self.customer.customer_type, Customer.COMPANY)
        self.assertEqual(self.customer.email, 'contacto@techcorp.com')
        self.assertEqual(self.customer.phone, '+57 300 123 4567')
        self.assertEqual(self.customer.city, 'Bogotá')
        self.assertTrue(self.customer.is_active)

    def test_default_customer_type(self):
        """Verifica que customer_type por defecto sea COMPANY."""
        customer = Customer.objects.create(
            name='Test',
            email='test@test.com',
            phone='123',
            address='Calle 1',
            city='City',
        )
        self.assertEqual(customer.customer_type, Customer.COMPANY)

    def test_default_country(self):
        """Verifica que el país por defecto sea Colombia."""
        self.assertEqual(self.customer.country, 'Colombia')

    def test_default_is_active(self):
        """Verifica que is_active sea True por defecto."""
        self.assertTrue(self.customer.is_active)

    def test_string_representation(self):
        """Verifica que __str__ retorne el nombre."""
        self.assertEqual(str(self.customer), 'TechCorp S.A.S.')

    def test_auto_timestamps(self):
        """Verifica que created_at y updated_at se asignen automáticamente."""
        self.assertIsNotNone(self.customer.created_at)
        self.assertIsNotNone(self.customer.updated_at)

    def test_unique_email(self):
        """Verifica que el email sea único."""
        with self.assertRaises(IntegrityError):
            Customer.objects.create(
                name='Otra Empresa',
                email='contacto@techcorp.com',
                phone='+57 311 999 8888',
                address='Av Siempre Viva',
                city='Cali',
            )

    def test_create_individual_customer(self):
        """Verifica creación de cliente tipo INDIVIDUAL."""
        customer = Customer.objects.create(
            name='Juan Pérez',
            customer_type=Customer.INDIVIDUAL,
            email='juan@email.com',
            phone='+57 300 111 2233',
            address='Calle 50 #20-10',
            city='Medellín',
            tax_id='123456789',
        )
        self.assertEqual(customer.customer_type, Customer.INDIVIDUAL)
        self.assertEqual(customer.tax_id, '123456789')

    def test_create_customer_with_null_tax_id(self):
        """Verifica creación con tax_id nulo."""
        customer = Customer.objects.create(
            name='Sin RUC',
            email='sinruc@email.com',
            phone='123',
            address='Calle Falsa',
            city='City',
        )
        self.assertIsNone(customer.tax_id)
