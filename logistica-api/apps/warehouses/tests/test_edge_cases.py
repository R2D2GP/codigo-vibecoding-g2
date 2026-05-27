from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.warehouses.models import Warehouse


class WarehouseModelEdgeCaseTest(APITestCase):
    """Casos límite para el modelo Warehouse."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='edgeuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser',
            'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_name_max_length(self):
        """Verifica que name acepte 255 caracteres."""
        name = 'A' * 255
        warehouse = Warehouse.objects.create(
            name=name,
            address='Calle Test',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('100.00'),
        )
        self.assertEqual(len(warehouse.name), 255)

    def test_address_max_length(self):
        """Verifica que address acepte 500 caracteres."""
        address = 'A' * 500
        warehouse = Warehouse.objects.create(
            name='Test',
            address=address,
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('100.00'),
        )
        self.assertEqual(len(warehouse.address), 500)

    def test_capacity_zero(self):
        """Verifica que capacity_m3 pueda ser 0."""
        warehouse = Warehouse.objects.create(
            name='Vacío',
            address='Calle 0',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('0.00'),
        )
        self.assertEqual(warehouse.capacity_m3, Decimal('0.00'))

    def test_capacity_large_value(self):
        """Verifica que capacity_m3 acepte valores grandes."""
        warehouse = Warehouse.objects.create(
            name='Grande',
            address='Av Grande',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('99999999.99'),
        )
        self.assertEqual(warehouse.capacity_m3, Decimal('99999999.99'))

    def test_latitude_precision(self):
        """Verifica la precisión de 6 decimales en latitude."""
        warehouse = Warehouse.objects.create(
            name='Preciso',
            address='Calle Exacta',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('100.00'),
            latitude=Decimal('4.123456'),
            longitude=Decimal('-74.123456'),
        )
        self.assertEqual(warehouse.latitude, Decimal('4.123456'))

    def test_create_warehouse_name_empty(self):
        """Verifica que name vacío es permitido a nivel BD."""
        warehouse = Warehouse.objects.create(
            name='',
            address='Calle Test',
            city='Ciudad',
            capacity_m3=Decimal('100.00'),
        )
        self.assertEqual(warehouse.name, '')

    def test_soft_delete_excludes_inactive(self):
        """Verifica que el ViewSet excluya warehouses inactivos."""
        Warehouse.objects.create(
            name='Inactivo',
            address='Calle Fantasma',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('100.00'),
            is_active=False,
        )
        response = self.client.get(reverse('warehouse-list'))
        results = response.data['results']
        for w in results:
            self.assertTrue(w['is_active'])

    def test_create_warehouse_with_negative_capacity(self):
        """Verifica que capacity_m3 negativo sea aceptado (BD no tiene check)."""
        warehouse = Warehouse.objects.create(
            name='Negativo',
            address='Calle Negativa',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('-100.00'),
        )
        self.assertEqual(warehouse.capacity_m3, Decimal('-100.00'))

    def test_update_inactive_warehouse_not_found(self):
        """Verifica que un warehouse inactivo no sea accesible via API."""
        warehouse = Warehouse.objects.create(
            name='A Eliminar',
            address='Calle 1',
            city='Ciudad',
            country='Colombia',
            capacity_m3=Decimal('100.00'),
            is_active=True,
        )
        url = reverse('warehouse-detail', kwargs={'pk': warehouse.pk})
        self.client.patch(url, {'is_active': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
