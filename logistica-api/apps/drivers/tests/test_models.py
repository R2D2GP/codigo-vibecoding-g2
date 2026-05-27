from datetime import date

from django.test import TestCase
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from decimal import Decimal

from apps.transport.models import Transport
from apps.drivers.models import Driver


class DriverModelTest(TestCase):
    """Tests para el modelo Driver."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='driver1', password='pass123',
            first_name='Carlos', last_name='Pérez',
            email='carlos@test.com',
        )
        self.transport = Transport.objects.create(
            plate_number='ABC-123', transport_type=Transport.TRUCK,
            brand='Toyota', model='Hilux', year=2023,
            capacity_kg=Decimal('1500.00'), capacity_m3=Decimal('20.00'),
        )
        self.data = {
            'user': self.user,
            'license_number': 'LIC-001',
            'license_expiry': date(2027, 12, 31),
            'phone': '+57 300 111 2233',
        }
        self.driver = Driver.objects.create(**self.data)

    def test_create_driver_success(self):
        self.assertEqual(self.driver.license_number, 'LIC-001')
        self.assertEqual(self.driver.phone, '+57 300 111 2233')
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.license_expiry, date(2027, 12, 31))
        self.assertTrue(self.driver.is_active)

    def test_default_is_active(self):
        self.assertTrue(self.driver.is_active)

    def test_string_representation_with_full_name(self):
        self.assertEqual(str(self.driver), 'Carlos Pérez')

    def test_string_representation_with_username(self):
        User = get_user_model()
        user_no_name = User.objects.create_user(
            username='nobody', password='pass123',
        )
        driver = Driver.objects.create(
            user=user_no_name,
            license_number='LIC-NONAME',
            license_expiry=date(2027, 12, 31),
            phone='111',
        )
        self.assertEqual(str(driver), 'nobody')

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.driver.created_at)
        self.assertIsNotNone(self.driver.updated_at)

    def test_unique_license_number(self):
        with self.assertRaises(IntegrityError):
            Driver.objects.create(
                user=self.user,
                license_number='LIC-001',
                license_expiry=date(2027, 12, 31),
                phone='+57 300 999 8877',
            )

    def test_unique_user_one_to_one(self):
        User = get_user_model()
        other_user = User.objects.create_user(
            username='other', password='pass123',
        )
        Driver.objects.create(
            user=other_user,
            license_number='LIC-002',
            license_expiry=date(2027, 12, 31),
            phone='222',
        )
        with self.assertRaises(IntegrityError):
            Driver.objects.create(
                user=other_user,
                license_number='LIC-003',
                license_expiry=date(2027, 12, 31),
                phone='333',
            )

    def test_transport_nullable(self):
        self.assertIsNone(self.driver.transport)

    def test_driver_with_transport(self):
        User = get_user_model()
        other_user = User.objects.create_user(
            username='with_transport', password='pass123',
        )
        driver = Driver.objects.create(
            user=other_user,
            transport=self.transport,
            license_number='LIC-WITH-TRANSPORT',
            license_expiry=date(2027, 12, 31),
            phone='444',
        )
        self.assertEqual(driver.transport, self.transport)

    def test_transport_set_null_on_delete(self):
        self.transport.delete()
        self.driver.refresh_from_db()
        self.assertIsNone(self.driver.transport)
