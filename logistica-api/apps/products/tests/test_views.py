from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.suppliers.models import Supplier
from apps.warehouses.models import Warehouse
from apps.products.models import Product


class ProductAPITest(APITestCase):
    """Tests para los endpoints de Product."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.supplier = Supplier.objects.create(
            name='Proveedor Test', contact_name='C',
            email='prov@test.com', phone='123', address='Calle', city='City',
        )
        self.warehouse = Warehouse.objects.create(
            name='Almacén Test', address='Av 1', city='City',
            capacity_m3=Decimal('5000.00'),
        )
        self.product_data = {
            'supplier': self.supplier.pk,
            'warehouse': self.warehouse.pk,
            'name': 'Laptop Pro',
            'sku': 'LPT-001',
            'category': 'laptop',
            'weight_kg': '2.500',
            'width_cm': '35.00',
            'height_cm': '25.00',
            'depth_cm': '2.00',
            'unit_price': '4999.99',
            'stock_quantity': 10,
        }
        self.product = Product.objects.create(
            supplier=self.supplier, warehouse=self.warehouse,
            name='Mouse RGB', sku='MOU-001',
            category='accesorio',
            weight_kg=Decimal('0.200'), width_cm=Decimal('10.00'),
            height_cm=Decimal('5.00'), depth_cm=Decimal('3.00'),
            unit_price=Decimal('150.00'), stock_quantity=50,
        )
        self.list_url = reverse('product-list')

    def test_list_products_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_products_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)

    def test_create_product_returns_201(self):
        response = self.client.post(self.list_url, self.product_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Laptop Pro')
        self.assertEqual(response.data['sku'], 'LPT-001')

    def test_create_product_includes_supplier_name(self):
        response = self.client.post(self.list_url, self.product_data, format='json')
        self.assertIn('supplier_name', response.data)
        self.assertEqual(response.data['supplier_name'], 'Proveedor Test')

    def test_create_product_includes_warehouse_name(self):
        response = self.client.post(self.list_url, self.product_data, format='json')
        self.assertIn('warehouse_name', response.data)
        self.assertEqual(response.data['warehouse_name'], 'Almacén Test')

    def test_retrieve_product_returns_200(self):
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sku'], 'MOU-001')

    def test_update_product_returns_200(self):
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        data = {**self.product_data, 'name': 'Laptop Ultra'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Laptop Ultra')

    def test_partial_update_product_returns_200(self):
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.patch(url, {'name': 'Solo Nombre'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Solo Nombre')

    def test_delete_product_returns_204(self):
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_products_by_category(self):
        response = self.client.get(self.list_url, {'category': 'accesorio'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for p in response.data['results']:
            self.assertEqual(p['category'], 'accesorio')

    def test_search_products_by_sku(self):
        response = self.client.get(self.list_url, {'search': 'MOU'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        skus = [p['sku'] for p in response.data['results']]
        self.assertTrue(any('MOU' in s for s in skus))

    def test_create_product_duplicate_sku_returns_400(self):
        self.client.post(self.list_url, self.product_data, format='json')
        response = self.client.post(self.list_url, self.product_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_product_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
