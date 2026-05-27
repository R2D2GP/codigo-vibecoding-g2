from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer


class CustomerAPITest(APITestCase):
    """Tests para los endpoints de Customer."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser', 'password': 'testpass123',
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.customer_data = {
            'name': 'TechCorp S.A.S.',
            'customer_type': Customer.COMPANY,
            'email': 'contacto@techcorp.com',
            'phone': '+57 300 123 4567',
            'address': 'Cra 15 #88-66',
            'city': 'Bogotá',
            'country': 'Colombia',
        }
        self.customer = Customer.objects.create(
            name='Otra Empresa',
            email='otra@empresa.com',
            phone='+57 311 999 8888',
            address='Av Siempre Viva',
            city='Cali',
        )
        self.list_url = reverse('customer-list')

    def test_list_customers_returns_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_customers_returns_paginated(self):
        response = self.client.get(self.list_url)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)

    def test_create_customer_returns_201(self):
        response = self.client.post(self.list_url, self.customer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'TechCorp S.A.S.')

    def test_retrieve_customer_returns_200(self):
        url = reverse('customer-detail', kwargs={'pk': self.customer.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Otra Empresa')

    def test_update_customer_returns_200(self):
        url = reverse('customer-detail', kwargs={'pk': self.customer.pk})
        data = {**self.customer_data, 'name': 'TechCorp Actualizada'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'TechCorp Actualizada')

    def test_partial_update_customer_returns_200(self):
        url = reverse('customer-detail', kwargs={'pk': self.customer.pk})
        response = self.client.patch(url, {'name': 'Solo Nombre'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Solo Nombre')

    def test_delete_customer_returns_204(self):
        url = reverse('customer-detail', kwargs={'pk': self.customer.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_customers_by_city(self):
        Customer.objects.create(
            name='Filtrado', email='filtrado@email.com', phone='123',
            address='Calle 1', city='Bogotá',
        )
        response = self.client.get(self.list_url, {'city': 'Bogotá'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for c in response.data['results']:
            self.assertEqual(c['city'], 'Bogotá')

    def test_filter_customers_by_type(self):
        Customer.objects.create(
            name='Individual', email='indiv@email.com', phone='123',
            address='Calle 1', city='City',
            customer_type=Customer.INDIVIDUAL,
        )
        response = self.client.get(self.list_url, {'customer_type': Customer.INDIVIDUAL})
        for c in response.data['results']:
            self.assertEqual(c['customer_type'], Customer.INDIVIDUAL)

    def test_search_customers_by_name(self):
        response = self.client.get(self.list_url, {'search': 'Otra'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [c['name'] for c in response.data['results']]
        self.assertTrue(any('Otra' in n for n in names))

    def test_search_customers_by_email(self):
        response = self.client.get(self.list_url, {'search': 'otra@empresa.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_create_customer_with_duplicate_email_returns_400(self):
        self.client.post(self.list_url, self.customer_data, format='json')
        response = self.client.post(self.list_url, self.customer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_customer_with_invalid_data_returns_400(self):
        response = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
