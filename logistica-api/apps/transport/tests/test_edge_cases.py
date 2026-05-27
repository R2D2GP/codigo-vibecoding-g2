from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.transport.models import Transport


class TransportEdgeCaseTest(APITestCase):
    """Casos límite para Transport."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='edgeuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_plate_number_max_length(self):
        plate = 'A' * 20
        transport = Transport.objects.create(
            plate_number=plate, transport_type=Transport.TRUCK,
            brand='B', model='M', year=2020,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
        )
        self.assertEqual(len(transport.plate_number), 20)

    def test_brand_max_length(self):
        brand = 'A' * 100
        Transport.objects.create(
            plate_number='BRD-001', transport_type=Transport.TRUCK,
            brand=brand, model='M', year=2020,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
        )

    def test_model_max_length(self):
        model = 'A' * 100
        Transport.objects.create(
            plate_number='MDL-001', transport_type=Transport.TRUCK,
            brand='B', model=model, year=2020,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
        )

    def test_year_zero(self):
        transport = Transport.objects.create(
            plate_number='YER-000', transport_type=Transport.TRUCK,
            brand='B', model='M', year=0,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
        )
        self.assertEqual(transport.year, 0)

    def test_year_future(self):
        transport = Transport.objects.create(
            plate_number='FTR-001', transport_type=Transport.TRUCK,
            brand='B', model='M', year=2030,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
        )
        self.assertEqual(transport.year, 2030)

    def test_capacity_kg_zero(self):
        transport = Transport.objects.create(
            plate_number='CAP-000', transport_type=Transport.TRUCK,
            brand='B', model='M', year=2020,
            capacity_kg=Decimal('0.00'), capacity_m3=Decimal('10.00'),
        )
        self.assertEqual(transport.capacity_kg, Decimal('0.00'))

    def test_capacity_m3_zero(self):
        transport = Transport.objects.create(
            plate_number='M3-0000', transport_type=Transport.TRUCK,
            brand='B', model='M', year=2020,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('0.00'),
        )
        self.assertEqual(transport.capacity_m3, Decimal('0.00'))

    def test_update_unavailable_transport_not_found(self):
        transport = Transport.objects.create(
            plate_number='TMP-001', transport_type=Transport.TRUCK,
            brand='B', model='M', year=2020,
            capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
            is_available=True,
        )
        url = reverse('transport-detail', kwargs={'pk': transport.pk})
        self.client.patch(url, {'is_available': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_all_transport_types_valid(self):
        for transport_type, _ in Transport.TYPE_CHOICES:
            plate = f'TYP-{transport_type[:3]}'
            Transport.objects.create(
                plate_number=plate, transport_type=transport_type,
                brand='B', model='M', year=2020,
                capacity_kg=Decimal('100.00'), capacity_m3=Decimal('10.00'),
            )
