from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.suppliers.models import Supplier


class SupplierAPITest(APITestCase):
    """Tests para los endpoints de Supplier."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.supplier_data = {
            'name': 'TecnoSur S.A.S.',
            'contact_name': 'Carlos Méndez',
            'email': 'carlos@tecnosur.com',
            'phone': '+57 300 987 6543',
            'address': 'Cra 20 #45-67',
            'city': 'Bogotá',
            'country': 'Colombia',
        }
        self.supplier = Supplier.objects.create(
            name='Otro Proveedor', contact_name='Ana López',
            email='ana@otro.com', phone='+57 311 222 3344',
            address='Av 68 #90-10', city='Cali',
        )
        self.list_url = reverse('supplier-list')

    def test_list_suppliers_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_suppliers_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)

    def test_create_supplier_returns_201(self):
        response = self.client.post(self.list_url, self.supplier_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'TecnoSur S.A.S.')

    def test_retrieve_supplier_returns_200(self):
        url = reverse('supplier-detail', kwargs={'pk': self.supplier.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Otro Proveedor')

    def test_update_supplier_returns_200(self):
        url = reverse('supplier-detail', kwargs={'pk': self.supplier.pk})
        data = {**self.supplier_data, 'name': 'TecnoSur Actualizada'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'TecnoSur Actualizada')

    def test_partial_update_supplier_returns_200(self):
        url = reverse('supplier-detail', kwargs={'pk': self.supplier.pk})
        response = self.client.patch(url, {'name': 'Solo Nombre'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Solo Nombre')

    def test_delete_supplier_returns_204(self):
        url = reverse('supplier-detail', kwargs={'pk': self.supplier.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_suppliers_by_city(self):
        Supplier.objects.create(
            name='Filtrado', contact_name='Contacto',
            email='filt@test.com', phone='123',
            address='Calle', city='Bogotá',
        )
        response = self.client.get(self.list_url, {'city': 'Bogotá'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for s in response.data['results']:
            self.assertEqual(s['city'], 'Bogotá')

    def test_search_suppliers_by_contact_name(self):
        response = self.client.get(self.list_url, {'search': 'Ana'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [s['contact_name'] for s in response.data['results']]
        self.assertTrue(any('Ana' in n for n in names))

    def test_create_supplier_with_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
