from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.suppliers.models import Supplier
from apps.warehouses.models import Warehouse
from apps.products.models import Product


class ProductEdgeCaseTest(APITestCase):
    """Casos límite para Product."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='edgeuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.supplier = Supplier.objects.create(
            name='Prov', contact_name='C', email='p@test.com',
            phone='123', address='Calle', city='City',
        )
        self.warehouse = Warehouse.objects.create(
            name='Alm', address='Av 1', city='City',
            capacity_m3=Decimal('5000.00'),
        )

    def _base_product(self, **kwargs):
        defaults = {
            'supplier': self.supplier, 'warehouse': self.warehouse,
            'name': 'Base', 'sku': 'BASE-001', 'category': 'test',
            'weight_kg': Decimal('1.000'), 'width_cm': Decimal('10.00'),
            'height_cm': Decimal('10.00'), 'depth_cm': Decimal('10.00'),
            'unit_price': Decimal('100.00'),
        }
        defaults.update(kwargs)
        return Product.objects.create(**defaults)

    def test_name_max_length(self):
        name = 'A' * 255
        self._base_product(name=name, sku='NMX-001')
        self.assertEqual(len(Product.objects.get(sku='NMX-001').name), 255)

    def test_sku_max_length(self):
        sku = 'B' * 100
        self._base_product(sku=sku)
        self.assertEqual(len(Product.objects.get(name='Base').sku), 100)

    def test_weight_precision(self):
        self._base_product(weight_kg=Decimal('999.999'), sku='WGT-001')
        self.assertEqual(Product.objects.get(sku='WGT-001').weight_kg, Decimal('999.999'))

    def test_dimensions_precision(self):
        self._base_product(
            width_cm=Decimal('99.99'), height_cm=Decimal('99.99'),
            depth_cm=Decimal('99.99'), sku='DIM-001',
        )
        p = Product.objects.get(sku='DIM-001')
        self.assertEqual(p.width_cm, Decimal('99.99'))
        self.assertEqual(p.height_cm, Decimal('99.99'))
        self.assertEqual(p.depth_cm, Decimal('99.99'))

    def test_unit_price_max_digits(self):
        self._base_product(unit_price=Decimal('99999999.99'), sku='PRC-001')
        self.assertEqual(Product.objects.get(sku='PRC-001').unit_price, Decimal('99999999.99'))

    def test_stock_quantity_zero(self):
        self._base_product(stock_quantity=0, sku='STK-000')
        self.assertEqual(Product.objects.get(sku='STK-000').stock_quantity, 0)

    def test_stock_quantity_large(self):
        self._base_product(stock_quantity=99999, sku='STK-BIG')
        self.assertEqual(Product.objects.get(sku='STK-BIG').stock_quantity, 99999)

    def test_nullable_description(self):
        response = self.client.post(reverse('product-list'), {
            'supplier': self.supplier.pk,
            'warehouse': self.warehouse.pk,
            'name': 'Sin Desc', 'sku': 'NOD-001',
            'category': 'test',
            'weight_kg': '1.000', 'width_cm': '10.00',
            'height_cm': '10.00', 'depth_cm': '10.00',
            'unit_price': '100.00',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['description'])

    def test_soft_delete_excludes_inactive(self):
        self._base_product(
            name='Inactivo', sku='INA-001', is_active=False,
        )
        response = self.client.get(reverse('product-list'))
        for p in response.data['results']:
            self.assertTrue(p['is_active'])

    def test_update_inactive_product_not_found(self):
        product = self._base_product(sku='TMP-001')
        url = reverse('product-detail', kwargs={'pk': product.pk})
        self.client.patch(url, {'is_active': False}, format='json')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
