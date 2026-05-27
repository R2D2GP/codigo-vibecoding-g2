from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.warehouses.models import Warehouse
from apps.routes.models import Route, RouteStop


class RouteAPITest(APITestCase):
    """Tests para los endpoints de Route."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='routeuser', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'routeuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.warehouse = Warehouse.objects.create(
            name='Almacén Central', address='Calle 1 #2-3',
            city='Bogotá', capacity_m3=Decimal('1000.00'),
        )
        self.route_data = {
            'name': 'Ruta Norte',
            'origin_warehouse': self.warehouse.pk,
            'estimated_duration_hours': '4.50',
            'estimated_distance_km': '120.00',
        }
        self.route = Route.objects.create(
            name='Ruta Existente',
            origin_warehouse=self.warehouse,
            estimated_duration_hours=Decimal('2.00'),
            estimated_distance_km=Decimal('50.00'),
        )
        self.list_url = reverse('route-list')

    def test_list_routes_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_routes_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)

    def test_create_route_returns_201(self):
        response = self.client.post(self.list_url, self.route_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Ruta Norte')
        self.assertIn('origin_warehouse_name', response.data)

    def test_retrieve_route_returns_200(self):
        url = reverse('route-detail', kwargs={'pk': self.route.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stops', response.data)

    def test_update_route_returns_200(self):
        url = reverse('route-detail', kwargs={'pk': self.route.pk})
        data = {**self.route_data, 'name': 'Ruta Actualizada', 'origin_warehouse': self.warehouse.pk}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_route_returns_200(self):
        url = reverse('route-detail', kwargs={'pk': self.route.pk})
        response = self.client.patch(url, {'name': 'Ruta Parcial'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Ruta Parcial')

    def test_delete_route_returns_204(self):
        url = reverse('route-detail', kwargs={'pk': self.route.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_route_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_route_by_name(self):
        response = self.client.get(self.list_url, {'search': 'Existente'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_filter_by_warehouse(self):
        response = self.client.get(self.list_url, {'origin_warehouse': self.warehouse.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RouteStopAPITest(APITestCase):
    """Tests para los endpoints anidados de RouteStop."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='stopuser', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'stopuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        warehouse = Warehouse.objects.create(
            name='Almacén Central', address='Calle 1 #2-3',
            city='Bogotá', capacity_m3=Decimal('1000.00'),
        )
        self.route = Route.objects.create(
            name='Ruta Norte',
            origin_warehouse=warehouse,
            estimated_duration_hours=Decimal('4.50'),
            estimated_distance_km=Decimal('120.00'),
        )
        self.stop = RouteStop.objects.create(
            route=self.route,
            stop_order=1,
            address='Calle 10 #20-30',
            city='Bogotá',
            latitude=Decimal('4.711000'),
            longitude=Decimal('-74.072000'),
            estimated_offset_hours=Decimal('1.00'),
        )
        self.stop_base = f'/api/v1/routes/{self.route.pk}/stops'

    def test_list_stops_returns_200(self):
        response = self.client.get(f'{self.stop_base}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_stop_returns_201(self):
        data = {
            'route': self.route.pk,
            'stop_order': 2,
            'address': 'Calle 50 #60-70',
            'city': 'Medellín',
            'estimated_offset_hours': '3.50',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['stop_order'], 2)

    def test_retrieve_stop_returns_200(self):
        url = f'{self.stop_base}/{self.stop.pk}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_stop_returns_200(self):
        url = f'{self.stop_base}/{self.stop.pk}/'
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Calle 10 #20-30 Actualizada',
            'city': 'Bogotá',
            'estimated_offset_hours': '2.00',
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_stop_returns_200(self):
        url = f'{self.stop_base}/{self.stop.pk}/'
        response = self.client.patch(url, {'address': 'Dir Modificada'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['address'], 'Dir Modificada')

    def test_delete_stop_returns_204(self):
        url = f'{self.stop_base}/{self.stop.pk}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_stops_for_different_route_returns_empty(self):
        other_warehouse = Warehouse.objects.create(
            name='Almacén Sur', address='Calle 5 #6-7',
            city='Cali', capacity_m3=Decimal('500.00'),
        )
        other_route = Route.objects.create(
            name='Ruta Sur',
            origin_warehouse=other_warehouse,
            estimated_duration_hours=Decimal('3.00'),
            estimated_distance_km=Decimal('80.00'),
        )
        response = self.client.get(f'/api/v1/routes/{other_route.pk}/stops/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
