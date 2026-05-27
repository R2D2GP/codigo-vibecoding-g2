from django.test import TestCase
from django.db import IntegrityError
from decimal import Decimal
from apps.transport.models import Transport


class TransportModelTest(TestCase):
    """Tests para el modelo Transport."""

    def setUp(self):
        self.data = {
            'plate_number': 'ABC-123',
            'transport_type': Transport.TRUCK,
            'brand': 'Toyota',
            'model': 'Hilux',
            'year': 2023,
            'capacity_kg': Decimal('1500.00'),
            'capacity_m3': Decimal('20.00'),
        }
        self.transport = Transport.objects.create(**self.data)

    def test_create_transport_success(self):
        self.assertEqual(self.transport.plate_number, 'ABC-123')
        self.assertEqual(self.transport.transport_type, Transport.TRUCK)
        self.assertEqual(self.transport.brand, 'Toyota')
        self.assertEqual(self.transport.model, 'Hilux')
        self.assertEqual(self.transport.year, 2023)
        self.assertTrue(self.transport.is_available)

    def test_default_is_available(self):
        self.assertTrue(self.transport.is_available)

    def test_string_representation(self):
        self.assertEqual(str(self.transport), 'ABC-123')

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.transport.created_at)
        self.assertIsNotNone(self.transport.updated_at)

    def test_unique_plate_number(self):
        with self.assertRaises(IntegrityError):
            Transport.objects.create(
                plate_number='ABC-123',
                transport_type=Transport.VAN,
                brand='Nissan', model='NP300',
                year=2022, capacity_kg=Decimal('1000.00'),
                capacity_m3=Decimal('15.00'),
            )

    def test_create_van_transport(self):
        transport = Transport.objects.create(
            plate_number='DEF-456',
            transport_type=Transport.VAN,
            brand='Chevrolet', model='N300',
            year=2021, capacity_kg=Decimal('800.00'),
            capacity_m3=Decimal('10.00'),
        )
        self.assertEqual(transport.transport_type, Transport.VAN)

    def test_create_motorcycle_transport(self):
        transport = Transport.objects.create(
            plate_number='GHI-789',
            transport_type=Transport.MOTORCYCLE,
            brand='Honda', model='CB190',
            year=2024, capacity_kg=Decimal('50.00'),
            capacity_m3=Decimal('1.00'),
        )
        self.assertEqual(transport.transport_type, Transport.MOTORCYCLE)

    def test_create_cargo_bike_transport(self):
        transport = Transport.objects.create(
            plate_number='JKL-012',
            transport_type=Transport.CARGO_BIKE,
            brand='Mekano', model='Cargo X',
            year=2023, capacity_kg=Decimal('30.00'),
            capacity_m3=Decimal('0.50'),
        )
        self.assertEqual(transport.transport_type, Transport.CARGO_BIKE)

    def test_year_integer_field(self):
        self.assertIsInstance(self.transport.year, int)
