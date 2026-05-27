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
        name='Cliente Edge', customer_type=Customer.COMPANY,
        email='edge@test.com', phone='+57 1 111 2233',
        address='Calle 1', city='Bogotá',
    )
    warehouse = Warehouse.objects.create(
        name='Almacén Edge', address='Av. Edge',
        city='Bogotá', capacity_m3=Decimal('500.00'),
    )
    supplier = Supplier.objects.create(
        name='Proveedor Edge', contact_name='Contacto',
        email='edge_sup@test.com', phone='+57 1 999 8877',
        address='Calle 2', city='Bogotá',
    )
    product = Product.objects.create(
        supplier=supplier, warehouse=warehouse,
        name='Teclado', sku='TEC-001',
        category='accesorio', weight_kg=Decimal('0.500'),
        width_cm=Decimal('40.00'), height_cm=Decimal('3.00'),
        depth_cm=Decimal('15.00'), unit_price=Decimal('150.00'),
        stock_quantity=100,
    )
    User = get_user_model()
    user = User.objects.create_user(
        username='edge_driver', password='pass123',
    )
    transport = Transport.objects.create(
        plate_number='GHI-789', transport_type=Transport.MOTORCYCLE,
        brand='Yamaha', model='FZ', year=2024,
        capacity_kg=Decimal('200.00'), capacity_m3=Decimal('0.50'),
    )
    driver = Driver.objects.create(
        user=user, license_number='LIC-EDGE',
        license_expiry=date(2029, 1, 1), phone='+57 300 777 8888',
    )
    route = Route.objects.create(
        name='Ruta Edge', origin_warehouse=warehouse,
        estimated_duration_hours=Decimal('1.00'),
        estimated_distance_km=Decimal('20.00'),
    )
    return customer, warehouse, product, driver, transport, route


class ShipmentEdgeCaseTest(APITestCase):
    """Casos límite para Shipment."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='edgeship', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeship', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.customer, self.warehouse, self.product, \
            self.driver, self.transport, self.route = _create_prerequisites()

        self.list_url = reverse('shipment-list')

    def test_create_shipment_with_all_optionals(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 100',
            'destination_city': 'Cali',
            'driver': self.driver.pk,
            'transport': self.transport.pk,
            'route': self.route.pk,
            'estimated_delivery_date': '2026-07-15',
            'base_cost': '150.00',
            'calculated_cost': '200.00',
            'notes': 'Entregar en bodega',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['destination_city'], 'Cali')

    def test_long_destination_address(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'A' * 500,
            'destination_city': 'Bogotá',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_status_transition(self):
        response = self.client.post(self.list_url, {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'status': 'CONFIRMED',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'CONFIRMED')

    def test_invalid_status_returns_400(self):
        response = self.client.post(self.list_url, {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'status': 'INVALID',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delivery_dates(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'estimated_delivery_date': '2026-07-15',
            'actual_delivery_date': '2026-07-15T14:30:00Z',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_zero_cost_values(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'base_cost': '0.00',
            'calculated_cost': '0.00',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_large_weight(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'weight_total_kg': '9999999.999',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_large_cost_values(self):
        data = {
            'customer': self.customer.pk,
            'origin_warehouse': self.warehouse.pk,
            'destination_address': 'Calle 10',
            'destination_city': 'Bogotá',
            'base_cost': '9999999999.99',
            'calculated_cost': '9999999999.99',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ShipmentItemEdgeCaseTest(APITestCase):
    """Casos límite para ShipmentItem."""

    def setUp(self):
        User = get_user_model()
        self.api_user = User.objects.create_user(
            username='edgeitem', password='testpass123',
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'edgeitem', 'password': 'testpass123',
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
        self.item_base = f'/api/v1/shipments/{self.shipment.pk}/items'

    def test_create_item_fails_no_subtotal_default(self):
        data = {
            'shipment': self.shipment.pk,
            'product': self.product.pk,
            'quantity': 0,
            'unit_price_at_time': '150.00',
            'subtotal': '0.00',
        }
        with self.assertRaises(IntegrityError):
            self.client.post(f'{self.item_base}/', data, format='json')

    def test_create_item_invalid_data_returns_400(self):
        response = self.client.post(f'{self.item_base}/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_product_model_integrity(self):
        ShipmentItem.objects.create(
            shipment=self.shipment,
            product=self.product,
            quantity=1,
            unit_price_at_time=Decimal('150.00'),
            subtotal=Decimal('150.00'),
        )
        with self.assertRaises(IntegrityError):
            ShipmentItem.objects.create(
                shipment=self.shipment,
                product=self.product,
                quantity=1,
                unit_price_at_time=Decimal('150.00'),
                subtotal=Decimal('150.00'),
            )

    def test_item_without_subtotal_via_api_fails(self):
        data = {
            'shipment': self.shipment.pk,
            'product': self.product.pk,
            'quantity': 1,
            'unit_price_at_time': '150.00',
        }
        with self.assertRaises(IntegrityError):
            self.client.post(f'{self.item_base}/', data, format='json')
