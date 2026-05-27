from decimal import Decimal

from django.test import TestCase
from django.db import IntegrityError

from apps.warehouses.models import Warehouse
from apps.routes.models import Route, RouteStop


class RouteModelTest(TestCase):
    """Tests para el modelo Route."""

    def setUp(self):
        self.warehouse = Warehouse.objects.create(
            name='Almacén Central', address='Calle 1 #2-3',
            city='Bogotá', capacity_m3=Decimal('1000.00'),
        )
        self.route = Route.objects.create(
            name='Ruta Norte',
            origin_warehouse=self.warehouse,
            estimated_duration_hours=Decimal('4.50'),
            estimated_distance_km=Decimal('120.00'),
        )

    def test_create_route_success(self):
        self.assertEqual(self.route.name, 'Ruta Norte')
        self.assertEqual(self.route.origin_warehouse, self.warehouse)
        self.assertEqual(self.route.estimated_duration_hours, Decimal('4.50'))
        self.assertEqual(self.route.estimated_distance_km, Decimal('120.00'))
        self.assertTrue(self.route.is_active)

    def test_default_is_active(self):
        self.assertTrue(self.route.is_active)

    def test_string_representation(self):
        self.assertEqual(str(self.route), 'Ruta Norte')

    def test_auto_timestamps(self):
        self.assertIsNotNone(self.route.created_at)
        self.assertIsNotNone(self.route.updated_at)

    def test_soft_delete_excludes_inactive(self):
        self.assertIn(self.route, Route.objects.filter(is_active=True))
        self.route.is_active = False
        self.route.save()
        self.assertNotIn(self.route, Route.objects.filter(is_active=True))


class RouteStopModelTest(TestCase):
    """Tests para el modelo RouteStop."""

    def setUp(self):
        warehouse = Warehouse.objects.create(
            name='Almacén Sur', address='Calle 5 #6-7',
            city='Cali', capacity_m3=Decimal('500.00'),
        )
        self.route = Route.objects.create(
            name='Ruta Norte',
            origin_warehouse=warehouse,
            estimated_duration_hours=Decimal('4.50'),
            estimated_distance_km=Decimal('120.00'),
        )
        self.stop = RouteStop.objects.create(
            route=self.route,
            stop_order=1,
            address='Calle 10 #20-30',
            city='Bogotá',
            latitude=Decimal('4.711000'),
            longitude=Decimal('-74.072000'),
            estimated_offset_hours=Decimal('1.00'),
        )

    def test_create_stop_success(self):
        self.assertEqual(self.stop.stop_order, 1)
        self.assertEqual(self.stop.address, 'Calle 10 #20-30')
        self.assertEqual(self.stop.city, 'Bogotá')
        self.assertEqual(self.stop.route, self.route)
        self.assertIsNotNone(self.stop.latitude)
        self.assertIsNotNone(self.stop.longitude)
        self.assertEqual(self.stop.estimated_offset_hours, Decimal('1.00'))

    def test_string_representation(self):
        self.assertEqual(str(self.stop), 'Ruta Norte - Stop 1')

    def test_stop_without_coordinates(self):
        stop2 = RouteStop.objects.create(
            route=self.route,
            stop_order=2,
            address='Calle 50 #60-70',
            city='Medellín',
            estimated_offset_hours=Decimal('3.50'),
        )
        self.assertIsNone(stop2.latitude)
        self.assertIsNone(stop2.longitude)

    def test_unique_stop_order_per_route(self):
        with self.assertRaises(IntegrityError):
            RouteStop.objects.create(
                route=self.route,
                stop_order=1,
                address='Otra dirección',
                city='Bogotá',
                estimated_offset_hours=Decimal('2.00'),
            )

    def test_duplicate_order_different_route_allowed(self):
        warehouse = Warehouse.objects.create(
            name='Almacén Sur', address='Calle 5 #6-7',
            city='Cali', capacity_m3=Decimal('500.00'),
        )
        other_route = Route.objects.create(
            name='Ruta Sur',
            origin_warehouse=warehouse,
            estimated_duration_hours=Decimal('3.00'),
            estimated_distance_km=Decimal('80.00'),
        )
        stop2 = RouteStop.objects.create(
            route=other_route,
            stop_order=1,
            address='Calle 100 #200-300',
            city='Cali',
            estimated_offset_hours=Decimal('0.50'),
        )
        self.assertEqual(stop2.stop_order, 1)
        self.assertEqual(stop2.route, other_route)

    def test_ordered_by_stop_order(self):
        RouteStop.objects.create(
            route=self.route,
            stop_order=3,
            address='Stop 3',
            city='Bogotá',
            estimated_offset_hours=Decimal('4.00'),
        )
        RouteStop.objects.create(
            route=self.route,
            stop_order=2,
            address='Stop 2',
            city='Bogotá',
            estimated_offset_hours=Decimal('2.50'),
        )
        stops = list(RouteStop.objects.filter(route=self.route).order_by('stop_order'))
        orders = [s.stop_order for s in stops]
        self.assertEqual(orders, [1, 2, 3])

    def test_cascade_delete_with_route(self):
        stop_pk = self.stop.pk
        self.route.delete()
        with self.assertRaises(RouteStop.DoesNotExist):
            RouteStop.objects.get(pk=stop_pk)
