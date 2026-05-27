from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.warehouses.models import Warehouse
from apps.routes.models import Route, RouteStop


class RouteEdgeCaseTest(APITestCase):
    """Casos límite para Route."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='edgeuser', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.warehouse = Warehouse.objects.create(
            name='Almacén Test', address='Test 123',
            city='Bogotá', capacity_m3=Decimal('1000.00'),
        )

    def test_route_name_max_length(self):
        Warehouse.objects.all().delete()
        w = Warehouse.objects.create(
            name='W', address='A', city='C', capacity_m3=Decimal('100.00'),
        )
        data = {
            'name': 'R' * 255,
            'origin_warehouse': w.pk,
            'estimated_duration_hours': '1.00',
            'estimated_distance_km': '10.00',
        }
        response = self.client.post(reverse('route-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_soft_delete_excludes_inactive_route(self):
        route = Route.objects.create(
            name='Temp Route', origin_warehouse=self.warehouse,
            estimated_duration_hours=Decimal('1.00'),
            estimated_distance_km=Decimal('10.00'),
            is_active=False,
        )
        response = self.client.get(reverse('route-list'))
        for r in response.data['results']:
            self.assertNotEqual(r['id'], route.pk)

    def test_delete_route_cascades_to_stops(self):
        route = Route.objects.create(
            name='To Delete', origin_warehouse=self.warehouse,
            estimated_duration_hours=Decimal('1.00'),
            estimated_distance_km=Decimal('10.00'),
        )
        RouteStop.objects.create(
            route=route, stop_order=1,
            address='Addr', city='City',
            estimated_offset_hours=Decimal('0.50'),
        )
        url = reverse('route-detail', kwargs={'pk': route.pk})
        self.client.delete(url)
        response = self.client.get(f'/api/v1/routes/{route.pk}/stops/')
        self.assertEqual(len(response.data['results']), 0)

    def test_warehouse_without_routes_still_listable(self):
        response = self.client.get(reverse('route-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RouteStopEdgeCaseTest(APITestCase):
    """Casos límite para RouteStop."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='edgeuser2', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser2', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        warehouse = Warehouse.objects.create(
            name='Almacén Test', address='Test 123',
            city='Bogotá', capacity_m3=Decimal('1000.00'),
        )
        self.route = Route.objects.create(
            name='Route Stops Edge', origin_warehouse=warehouse,
            estimated_duration_hours=Decimal('5.00'),
            estimated_distance_km=Decimal('150.00'),
        )
        self.stop_base = f'/api/v1/routes/{self.route.pk}/stops'

    def test_create_stop_without_coordinates(self):
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Calle 100',
            'city': 'Cali',
            'estimated_offset_hours': '0.50',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['latitude'])
        self.assertIsNone(response.data['longitude'])

    def test_address_max_length(self):
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'A' * 500,
            'city': 'Bogotá',
            'estimated_offset_hours': '1.00',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_negative_offset_hours(self):
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Calle 10',
            'city': 'Bogotá',
            'estimated_offset_hours': '-1.00',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_stop_order_returns_error(self):
        RouteStop.objects.create(
            route=self.route, stop_order=1,
            address='First Stop', city='Bogotá',
            estimated_offset_hours=Decimal('0.00'),
        )
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Duplicate Stop',
            'city': 'Bogotá',
            'estimated_offset_hours': '0.50',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_large_decimal_values(self):
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Calle 10',
            'city': 'Bogotá',
            'latitude': '4.711000',
            'longitude': '-74.072092',
            'estimated_offset_hours': '9999.99',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_long_city_name(self):
        data = {
            'route': self.route.pk,
            'stop_order': 1,
            'address': 'Addr',
            'city': 'C' * 100,
            'estimated_offset_hours': '1.00',
        }
        response = self.client.post(f'{self.stop_base}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_stop_invalid_data_returns_400(self):
        response = self.client.post(f'{self.stop_base}/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
