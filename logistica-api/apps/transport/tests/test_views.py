from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.transport.models import Transport


class TransportAPITest(APITestCase):
    """Tests para los endpoints de Transport."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.transport_data = {
            'plate_number': 'ABC-123',
            'transport_type': Transport.TRUCK,
            'brand': 'Toyota',
            'model': 'Hilux',
            'year': 2023,
            'capacity_kg': '1500.00',
            'capacity_m3': '20.00',
        }
        self.transport = Transport.objects.create(
            plate_number='XYZ-999', transport_type=Transport.VAN,
            brand='Nissan', model='NP300', year=2022,
            capacity_kg=Decimal('1000.00'), capacity_m3=Decimal('15.00'),
        )
        self.list_url = reverse('transport-list')

    def test_list_transport_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_transport_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)

    def test_create_transport_returns_201(self):
        response = self.client.post(self.list_url, self.transport_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['plate_number'], 'ABC-123')

    def test_retrieve_transport_returns_200(self):
        url = reverse('transport-detail', kwargs={'pk': self.transport.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_transport_returns_200(self):
        url = reverse('transport-detail', kwargs={'pk': self.transport.pk})
        data = {**self.transport_data, 'plate_number': 'ZZZ-999'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_transport_returns_200(self):
        url = reverse('transport-detail', kwargs={'pk': self.transport.pk})
        response = self.client.patch(url, {'brand': 'Mazda'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['brand'], 'Mazda')

    def test_delete_transport_returns_204(self):
        url = reverse('transport-detail', kwargs={'pk': self.transport.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_by_transport_type(self):
        response = self.client.get(self.list_url, {'transport_type': Transport.VAN})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for t in response.data['results']:
            self.assertEqual(t['transport_type'], Transport.VAN)

    def test_search_by_plate(self):
        response = self.client.get(self.list_url, {'search': 'XYZ'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        plates = [t['plate_number'] for t in response.data['results']]
        self.assertTrue(any('XYZ' in p for p in plates))

    def test_create_transport_duplicate_plate_returns_400(self):
        self.client.post(self.list_url, self.transport_data, format='json')
        response = self.client.post(self.list_url, self.transport_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_transport_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_transport_only_available(self):
        Transport.objects.create(
            plate_number='UNA-001', transport_type=Transport.TRUCK,
            brand='Ford', model='F-150', year=2020,
            capacity_kg=Decimal('2000.00'), capacity_m3=Decimal('25.00'),
            is_available=False,
        )
        response = self.client.get(self.list_url)
        for t in response.data['results']:
            self.assertTrue(t['is_available'])
