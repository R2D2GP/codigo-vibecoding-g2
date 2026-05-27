from decimal import Decimal
from datetime import date

from django.test import TestCase
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from apps.customers.models import Customer
from apps.warehouses.models import Warehouse
from apps.suppliers.models import Supplier
from apps.products.models import Product
from apps.transport.models import Transport
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.shipments.models import Shipment, ShipmentItem


def _create_prerequisites():
    """Crea objetos necesarios para los tests de Shipment."""
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


class ShipmentModelTest(TestCase):
    """Tests para el modelo Shipment."""

    def setUp(self):
        self.customer, self.warehouse, self.product, \
            self.driver, self.transport, self.route = _create_prerequisites()
        self.shipment = Shipment.objects.create(
            customer=self.customer,
            origin_warehouse=self.warehouse,
            destination_address='Calle 10 #20-30',
            destination_city='Medellín',
        )

    def test_create_shipment_success(self):
        self.assertIsNotNone(self.shipment.tracking_number)
        self.assertTrue(self.shipment.tracking_number.startswith('SHP-'))
        self.assertEqual(self.shipment.status, Shipment.PENDING)
        self.assertEqual(self.shipment.destination_city, 'Medellín')
        self.assertEqual(self.shipment.customer, self.customer)

    def test_default_weight_cost_are_zero(self):
        self.assertEqual(self.shipment.weight_total_kg, Decimal('0'))
        self.assertEqual(self.shipment.base_cost, Decimal('0'))
        self.assertEqual(self.shipment.calculated_cost, Decimal('0'))

    def test_string_representation(self):
        self.assertEqual(str(self.shipment), self.shipment.tracking_number)

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.shipment.created_at)
        self.assertIsNotNone(self.shipment.updated_at)

    def test_unique_tracking_number(self):
        with self.assertRaises(IntegrityError):
            Shipment.objects.create(
                tracking_number=self.shipment.tracking_number,
                customer=self.customer,
                origin_warehouse=self.warehouse,
                destination_address='Otra dirección',
                destination_city='Cali',
            )

    def test_nullable_relations_default_none(self):
        self.assertIsNone(self.shipment.driver)
        self.assertIsNone(self.shipment.transport)
        self.assertIsNone(self.shipment.route)

    def test_shipment_with_all_optional_fields(self):
        shipment = Shipment.objects.create(
            customer=self.customer,
            origin_warehouse=self.warehouse,
            destination_address='Calle 50',
            destination_city='Cali',
            driver=self.driver,
            transport=self.transport,
            route=self.route,
            estimated_delivery_date=date(2026, 6, 15),
            base_cost=Decimal('100.00'),
            calculated_cost=Decimal('120.50'),
            notes='Entregar antes de las 5pm',
        )
        self.assertEqual(shipment.driver, self.driver)
        self.assertEqual(shipment.transport, self.transport)
        self.assertEqual(shipment.route, self.route)
        self.assertEqual(shipment.notes, 'Entregar antes de las 5pm')

    def test_status_choices(self):
        for status_code, _ in Shipment.STATUS_CHOICES:
            shipment = Shipment.objects.create(
                customer=self.customer,
                origin_warehouse=self.warehouse,
                destination_address='Addr',
                destination_city='City',
                status=status_code,
            )
            self.assertEqual(shipment.status, status_code)

    def test_driver_set_null_on_delete(self):
        driver_pk = self.driver.pk
        self.shipment.driver = self.driver
        self.shipment.save()
        self.driver.delete()
        self.shipment.refresh_from_db()
        self.assertIsNone(self.shipment.driver)

    def test_transport_set_null_on_delete(self):
        self.shipment.transport = self.transport
        self.shipment.save()
        self.transport.delete()
        self.shipment.refresh_from_db()
        self.assertIsNone(self.shipment.transport)

    def test_route_set_null_on_delete(self):
        self.shipment.route = self.route
        self.shipment.save()
        self.route.delete()
        self.shipment.refresh_from_db()
        self.assertIsNone(self.shipment.route)

    def test_customer_cascade_on_delete(self):
        customer_pk = self.customer.pk
        shipment_pk = self.shipment.pk
        self.customer.delete()
        with self.assertRaises(Shipment.DoesNotExist):
            Shipment.objects.get(pk=shipment_pk)


class ShipmentItemModelTest(TestCase):
    """Tests para el modelo ShipmentItem."""

    def setUp(self):
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
            quantity=3,
            unit_price_at_time=Decimal('4500.00'),
            subtotal=Decimal('13500.00'),
        )

    def test_create_item_success(self):
        self.assertEqual(self.item.quantity, 3)
        self.assertEqual(self.item.product, self.product)
        self.assertEqual(self.item.subtotal, Decimal('13500.00'))

    def test_string_representation(self):
        expected = f'{self.shipment.tracking_number} - {self.product.name} x{self.item.quantity}'
        self.assertEqual(str(self.item), expected)

    def test_unique_product_per_shipment(self):
        with self.assertRaises(IntegrityError):
            ShipmentItem.objects.create(
                shipment=self.shipment,
                product=self.product,
                quantity=1,
                unit_price_at_time=Decimal('4500.00'),
                subtotal=Decimal('4500.00'),
            )

    def test_cascade_delete_with_shipment(self):
        item_pk = self.item.pk
        self.shipment.delete()
        with self.assertRaises(ShipmentItem.DoesNotExist):
            ShipmentItem.objects.get(pk=item_pk)
