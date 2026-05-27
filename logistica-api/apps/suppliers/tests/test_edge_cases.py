from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.suppliers.models import Supplier


class SupplierEdgeCaseTest(APITestCase):
    """Casos límite para Supplier."""

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
        supplier = Supplier.objects.create(
            name=name, contact_name='C', email='max@test.com',
            phone='123', address='Calle', city='City',
        )
        self.assertEqual(len(supplier.name), 255)

    def test_contact_name_max_length(self):
        name = 'A' * 255
        supplier = Supplier.objects.create(
            name='Test', contact_name=name, email='cnt@test.com',
            phone='123', address='Calle', city='City',
        )
        self.assertEqual(len(supplier.contact_name), 255)

    def test_address_max_length(self):
        address = 'A' * 500
        supplier = Supplier.objects.create(
            name='Test', contact_name='C', email='addr@test.com',
            phone='123', address=address, city='City',
        )
        self.assertEqual(len(supplier.address), 500)

    def test_soft_delete_excludes_inactive(self):
        Supplier.objects.create(
            name='Inactivo', contact_name='C', email='ina@test.com',
            phone='123', address='Calle', city='City', is_active=False,
        )
        response = self.client.get(reverse('supplier-list'))
        for s in response.data['results']:
            self.assertTrue(s['is_active'])

    def test_update_inactive_supplier_not_found(self):
        supplier = Supplier.objects.create(
            name='Temp', contact_name='C', email='temp@test.com',
            phone='123', address='Calle', city='City',
        )
        url = reverse('supplier-detail', kwargs={'pk': supplier.pk})
        self.client.patch(url, {'is_active': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
