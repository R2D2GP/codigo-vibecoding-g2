from decimal import Decimal
from datetime import date

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer
from apps.warehouses.models import Warehouse
from apps.suppliers.models import Supplier
from apps.products.models import Product
from apps.transport.models import Transport
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.shipments.models import Shipment, ShipmentItem


def _create_prerequisites():
    customer = Customer.objects.create(
        name='Cliente Test', customer_type=Customer.COMPANY,
        email='cliente@test.com', phone='+57 1 111 2233',
        address='Calle 1', city='Bogotá',
    )
    warehouse = Warehouse.objects.create(
        name='Almacén Central', address='Av. Principal',
        city='Bogotá', capacity_m3=Decimal('1000.00'),
    )
    supplier = Supplier.objects.create(
        name='Proveedor Test', contact_name='Contacto',
        email='proveedor@test.com', phone='+57 1 999 8877',
        address='Calle 2', city='Bogotá',
    )
    product = Product.objects.create(
        supplier=supplier, warehouse=warehouse,
        name='Laptop Pro', sku='LPT-001',
        category='laptop', weight_kg=Decimal('2.500'),
        width_cm=Decimal('30.00'), height_cm=Decimal('2.00'),
        depth_cm=Decimal('20.00'), unit_price=Decimal('4500.00'),
        stock_quantity=50,
    )
    User = get_user_model()
    user = User.objects.create_user(
        username='driver_ship', password='pass123',
        first_name='Pedro', last_name='Gómez',
    )
    transport = Transport.objects.create(
        plate_number='DEF-456', transport_type=Transport.VAN,
        brand='Renault', model='Kangoo', year=2022,
        capacity_kg=Decimal('800.00'), capacity_m3=Decimal('4.00'),
    )
    driver = Driver.objects.create(
        user=user, license_number='LIC-DRIVER',
        license_expiry=date(2028, 6, 30), phone='+57 300 555 6666',
    )
    route = Route.objects.create(
        name='Ruta Principal', origin_warehouse=warehouse,
        estimated_duration_hours=Decimal('2.50'),
        estimated_distance_km=Decimal('60.00'),
    )
    return customer, warehouse, product, driver, transport, route


class ShipmentAPITest(APITestCase):
    """Tests para los endpoints de Shipment."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='shipuser', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'shipuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.customer, self.warehouse, self.product, \
            self.driver, self.transport, self.route = _create_prerequisites()

        self.shipment_data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10 #20-30',
            'destination_city': 'Medellín',
        }
        self.shipment = Shipment.objects.create(
            customer=self.customer,
            origin_warehouse=self.warehouse,
            destination_address='Calle 20',
            destination_city='Bogotá',
        )
        self.list_url = reverse('shipment-list')

    def test_list_shipments_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_shipments_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)

    def test_create_shipment_returns_201(self):
        response = self.client.post(self.list_url, self.shipment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tracking_number', response.data)
        self.assertIn('customer_name', response.data)
        self.assertIn('origin_warehouse_name', response.data)

    def test_retrieve_shipment_returns_200(self):
        url = reverse('shipment-detail', kwargs={'pk': self.shipment.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)

    def test_update_shipment_returns_200(self):
        url = reverse('shipment-detail', kwargs={'pk': self.shipment.pk})
        data = {**self.shipment_data, 'destination_city': 'Cali'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_shipment_returns_200(self):
        url = reverse('shipment-detail', kwargs={'pk': self.shipment.pk})
        response = self.client.patch(url, {'destination_city': 'Cali'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['destination_city'], 'Cali')

    def test_delete_shipment_returns_204(self):
        url = reverse('shipment-detail', kwargs={'pk': self.shipment.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_shipment_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_shipment_by_tracking(self):
        response = self.client.get(self.list_url, {'search': self.shipment.tracking_number})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_filter_by_status(self):
        response = self.client.get(self.list_url, {'status': 'PENDING'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_customer(self):
        response = self.client.get(self.list_url, {'customer': self.customer.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_shipment_read_only_fields(self):
        response = self.client.post(self.list_url, self.shipment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.data.get('tracking_number'), 'SHP-MANUAL')


class ShipmentItemAPITest(APITestCase):
    """Tests para los endpoints anidados de ShipmentItem."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='itemuser', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'itemuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.customer, self.warehouse, self.product, \
            self.driver, self.transport, self.route = _create_prerequisites()

        self.shipment = Shipment.objects.create(
            customer=self.customer,
            origin_warehouse=self.warehouse,
            destination_address='Calle 10',
            destination_city='Bogotá',
        )
        self.item = ShipmentItem.objects.create(
            shipment=self.shipment,
            product=self.product,
            quantity=2,
            unit_price_at_time=Decimal('4500.00'),
            subtotal=Decimal('9000.00'),
        )
        self.item_base = f'/api/v1/shipments/{self.shipment.pk}/items'

    def test_list_items_returns_200(self):
        response = self.client.get(f'{self.item_base}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_item_fails_no_subtotal_default(self):
        other_product = Product.objects.create(
            supplier=self.product.supplier, warehouse=self.warehouse,
            name='Monitor 27"', sku='MON-001',
            category='monitor', weight_kg=Decimal('4.000'),
            width_cm=Decimal('60.00'), height_cm=Decimal('40.00'),
            depth_cm=Decimal('15.00'), unit_price=Decimal('1200.00'),
            stock_quantity=20,
        )
        data = {
            'shipment': self.shipment.pk,
            'product': other_product.pk,
            'quantity': 1,
            'unit_price_at_time': '1200.00',
            'subtotal': '1200.00',
        }
        with self.assertRaises(IntegrityError):
            self.client.post(f'{self.item_base}/', data, format='json')

    def test_retrieve_item_returns_200(self):
        url = f'{self.item_base}/{self.item.pk}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_item_returns_200(self):
        url = f'{self.item_base}/{self.item.pk}/'
        data = {
            'shipment': self.shipment.pk,
            'product': self.product.pk,
            'quantity': 5,
            'unit_price_at_time': '4500.00',
            'subtotal': '22500.00',
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_item_returns_200(self):
        url = f'{self.item_base}/{self.item.pk}/'
        response = self.client.patch(url, {'quantity': 10}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quantity'], 10)

    def test_delete_item_returns_204(self):
        url = f'{self.item_base}/{self.item.pk}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_items_for_different_shipment_returns_empty(self):
        other_shipment = Shipment.objects.create(
            customer=self.customer,
            origin_warehouse=self.warehouse,
            destination_address='Calle 50',
            destination_city='Cali',
        )
        response = self.client.get(f'/api/v1/shipments/{other_shipment.pk}/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
