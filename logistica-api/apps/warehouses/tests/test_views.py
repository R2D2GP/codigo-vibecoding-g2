from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.warehouses.models import Warehouse


class WarehouseAPITest(APITestCase):
    """Tests para los endpoints de Warehouse."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.warehouse_data = {
            'name': 'Almacén Central',
            'address': 'Cra 50 #123-45',
            'city': 'Bogotá',
            'country': 'Colombia',
            'capacity_m3': '5000.00',
        }
        self.warehouse = Warehouse.objects.create(
            name='Almacén Norte',
            address='Calle 10 #20-30',
            city='Medellín',
            country='Colombia',
            capacity_m3=Decimal('3000.00'),
        )
        self.list_url = reverse('warehouse-list')

    def test_list_warehouses_returns_200(self):
        """GET /api/v1/warehouses/ → 200 OK."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_warehouses_returns_paginated_results(self):
        """GET /api/v1/warehouses/ retorna resultados paginados."""
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)

    def test_create_warehouse_returns_201(self):
        """POST /api/v1/warehouses/ → 201 Created."""
        response = self.client.post(self.list_url, self.warehouse_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Almacén Central')

    def test_retrieve_warehouse_returns_200(self):
        """GET /api/v1/warehouses/{id}/ → 200 OK."""
        url = reverse('warehouse-detail', kwargs={'pk': self.warehouse.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Almacén Norte')

    def test_update_warehouse_returns_200(self):
        """PUT /api/v1/warehouses/{id}/ → 200 OK."""
        url = reverse('warehouse-detail', kwargs={'pk': self.warehouse.pk})
        data = {**self.warehouse_data, 'name': 'Almacén Actualizado'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Almacén Actualizado')

    def test_partial_update_warehouse_returns_200(self):
        """PATCH /api/v1/warehouses/{id}/ → 200 OK."""
        url = reverse('warehouse-detail', kwargs={'pk': self.warehouse.pk})
        response = self.client.patch(url, {'name': 'Almacén Modificado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Almacén Modificado')

    def test_delete_warehouse_returns_204(self):
        """DELETE /api/v1/warehouses/{id}/ → 204 No Content."""
        url = reverse('warehouse-detail', kwargs={'pk': self.warehouse.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_warehouses_by_city(self):
        """GET /api/v1/warehouses/?city=Bogotá → resultados filtrados."""
        Warehouse.objects.create(
            name='Almacén Sur',
            address='Av 1 #2-3',
            city='Bogotá',
            country='Colombia',
            capacity_m3=Decimal('2000.00'),
        )
        response = self.client.get(self.list_url, {'city': 'Bogotá'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        for w in results:
            self.assertEqual(w['city'], 'Bogotá')

    def test_search_warehouses_by_name(self):
        """GET /api/v1/warehouses/?search=Central → resultados filtrados."""
        Warehouse.objects.create(
            name='Almacén Central',
            address='Av Siempre Viva',
            city='Cali',
            country='Colombia',
            capacity_m3=Decimal('4000.00'),
        )
        response = self.client.get(self.list_url, {'search': 'Central'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertTrue(any('Central' in w['name'] for w in results))

    def test_order_warehouses_by_name(self):
        """GET /api/v1/warehouses/?ordering=name → resultados ordenados."""
        response = self.client.get(self.list_url, {'ordering': 'name'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_warehouse_with_invalid_data_returns_400(self):
        """POST /api/v1/warehouses/ con datos inválidos → 400."""
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        """GET /api/v1/warehouses/ sin token → 401."""
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
