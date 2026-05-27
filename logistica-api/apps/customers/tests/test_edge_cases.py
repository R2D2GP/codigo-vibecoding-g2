from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer


class CustomerModelEdgeCaseTest(APITestCase):
    """Casos límite para Customer."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='edgeuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_name_max_length(self):
        name = 'A' * 255
        customer = Customer.objects.create(
            name=name, email='maxlen@test.com', phone='123',
            address='Calle', city='City',
        )
        self.assertEqual(len(customer.name), 255)

    def test_email_max_length(self):
        email = 'a' * 245 + '@test.com'
        customer = Customer.objects.create(
            name='Test', email=email, phone='123',
            address='Calle', city='City',
        )
        self.assertEqual(len(customer.email), 254)

    def test_address_max_length(self):
        address = 'A' * 500
        customer = Customer.objects.create(
            name='Test', email='addr@test.com', phone='123',
            address=address, city='City',
        )
        self.assertEqual(len(customer.address), 500)

    def test_phone_max_length(self):
        phone = '5' * 20
        customer = Customer.objects.create(
            name='Test', email='phone@test.com', phone=phone,
            address='Calle', city='City',
        )
        self.assertEqual(len(customer.phone), 20)

    def test_unique_tax_id(self):
        Customer.objects.create(
            name='Uno', email='uno@test.com', phone='123',
            address='Calle 1', city='City', tax_id='RUC-001',
        )
        with self.assertRaises(IntegrityError):
            Customer.objects.create(
                name='Dos', email='dos@test.com', phone='456',
                address='Calle 2', city='City', tax_id='RUC-001',
            )

    def test_individual_type_choice(self):
        customer = Customer.objects.create(
            name='Persona', email='persona@test.com', phone='123',
            address='Calle', city='City',
            customer_type=Customer.INDIVIDUAL,
        )
        self.assertEqual(customer.customer_type, Customer.INDIVIDUAL)
        self.assertIn(customer.customer_type, dict(Customer.TYPE_CHOICES))

    def test_soft_delete_excludes_inactive(self):
        Customer.objects.create(
            name='Inactivo', email='inactivo@test.com', phone='123',
            address='Calle', city='City', is_active=False,
        )
        response = self.client.get(reverse('customer-list'))
        for c in response.data['results']:
            self.assertTrue(c['is_active'])

    def test_update_inactive_customer_not_found(self):
        customer = Customer.objects.create(
            name='Temp', email='temp@test.com', phone='123',
            address='Calle', city='City',
        )
        url = reverse('customer-detail', kwargs={'pk': customer.pk})
        self.client.patch(url, {'is_active': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
