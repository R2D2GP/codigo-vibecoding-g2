from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.transport.models import Transport
from apps.drivers.models import Driver


class DriverAPITest(APITestCase):
    """Tests para los endpoints de Driver."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='api_user', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'api_user', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.driver_user = User.objects.create_user(
            username='driver_user', password='pass123',
            first_name='Carlos', last_name='Pérez',
            email='carlos@test.com',
        )
        self.transport = Transport.objects.create(
            plate_number='ABC-123', transport_type=Transport.TRUCK,
            brand='Toyota', model='Hilux', year=2023,
            capacity_kg=Decimal('1500.00'), capacity_m3=Decimal('20.00'),
        )
        self.driver_data = {
            'user': self.driver_user.pk,
            'transport': self.transport.pk,
            'license_number': 'LIC-001',
            'license_expiry': '2027-12-31',
            'phone': '+57 300 111 2233',
        }
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number='LIC-EXISTING',
            license_expiry=date(2027, 12, 31),
            phone='+57 300 999 8877',
        )
        self.list_url = reverse('driver-list')

    def test_list_drivers_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_drivers_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)

    def test_create_driver_returns_201(self):
        User = get_user_model()
        new_user = User.objects.create_user(
            username='new_driver', password='pass123',
            first_name='Ana', last_name='López',
        )
        data = {**self.driver_data, 'user': new_user.pk, 'license_number': 'LIC-NEW'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['license_number'], 'LIC-NEW')

    def test_create_driver_includes_user_email(self):
        User = get_user_model()
        new_user = User.objects.create_user(
            username='email_driver', password='pass123',
            email='driver@test.com',
        )
        data = {**self.driver_data, 'user': new_user.pk, 'license_number': 'LIC-EMAIL'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertIn('user_email', response.data)

    def test_retrieve_driver_returns_200(self):
        url = reverse('driver-detail', kwargs={'pk': self.driver.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_driver_returns_200(self):
        url = reverse('driver-detail', kwargs={'pk': self.driver.pk})
        data = {**self.driver_data, 'phone': '+57 300 555 6666'}
        User = get_user_model()
        update_user = User.objects.create_user(
            username='update_driver', password='pass123',
        )
        data['user'] = update_user.pk
        data['license_number'] = 'LIC-UPDATE'
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_driver_returns_200(self):
        url = reverse('driver-detail', kwargs={'pk': self.driver.pk})
        response = self.client.patch(url, {'phone': '+57 300 000 1111'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '+57 300 000 1111')

    def test_delete_driver_returns_204(self):
        url = reverse('driver-detail', kwargs={'pk': self.driver.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_driver_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_driver_by_license(self):
        response = self.client.get(self.list_url, {'search': 'LIC-EXISTING'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
