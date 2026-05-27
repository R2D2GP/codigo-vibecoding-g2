from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.drivers.models import Driver


class DriverEdgeCaseTest(APITestCase):
    """Casos límite para Driver."""

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

    def test_license_number_max_length(self):
        User = get_user_model()
        user = User.objects.create_user(username='licmax', password='pass123')
        license_num = 'A' * 50
        driver = Driver.objects.create(
            user=user, license_number=license_num,
            license_expiry=date(2030, 1, 1), phone='123',
        )
        self.assertEqual(len(driver.license_number), 50)

    def test_phone_max_length(self):
        User = get_user_model()
        user = User.objects.create_user(username='phonemax', password='pass123')
        phone = '5' * 20
        Driver.objects.create(
            user=user, license_number='PHN-001',
            license_expiry=date(2030, 1, 1), phone=phone,
        )
        self.assertEqual(len(Driver.objects.get(license_number='PHN-001').phone), 20)

    def test_soft_delete_excludes_inactive(self):
        User = get_user_model()
        user = User.objects.create_user(username='inactive_driver', password='pass123')
        Driver.objects.create(
            user=user, license_number='LIC-INACTIVE',
            license_expiry=date(2030, 1, 1), phone='123',
            is_active=False,
        )
        response = self.client.get(reverse('driver-list'))
        for d in response.data['results']:
            self.assertTrue(d['is_active'])

    def test_update_inactive_driver_not_found(self):
        User = get_user_model()
        user = User.objects.create_user(username='temp_driver', password='pass123')
        driver = Driver.objects.create(
            user=user, license_number='LIC-TEMP',
            license_expiry=date(2030, 1, 1), phone='123',
        )
        url = reverse('driver-detail', kwargs={'pk': driver.pk})
        self.client.patch(url, {'is_active': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_driver_without_transport(self):
        User = get_user_model()
        user = User.objects.create_user(username='no_transport', password='pass123')
        driver = Driver.objects.create(
            user=user, license_number='LIC-NOTRANS',
            license_expiry=date(2030, 1, 1), phone='123',
        )
        self.assertIsNone(driver.transport)
