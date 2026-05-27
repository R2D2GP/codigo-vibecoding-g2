from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AuthTokenObtainPairTest(APITestCase):
    """Tests para POST /api/v1/auth/token/."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com',
        )
        self.url = reverse('token_obtain_pair')
        self.valid_payload = {
            'username': 'testuser',
            'password': 'testpass123',
        }

    def test_obtain_token_with_valid_credentials(self):
        """POST /api/v1/auth/token/ con credenciales válidas → 200 + tokens."""
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_with_invalid_password(self):
        """POST /api/v1/auth/token/ con password incorrecto → 401."""
        payload = {'username': 'testuser', 'password': 'wrongpass'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_token_with_nonexistent_user(self):
        """POST /api/v1/auth/token/ con usuario inexistente → 401."""
        payload = {'username': 'nobody', 'password': 'testpass123'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_token_with_empty_username(self):
        """POST /api/v1/auth/token/ con username vacío → 400."""
        payload = {'username': '', 'password': 'testpass123'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_obtain_token_with_missing_fields(self):
        """POST /api/v1/auth/token/ sin campos requeridos → 400."""
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_obtain_token_with_get_method(self):
        """GET /api/v1/auth/token/ → 405 Method Not Allowed."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_obtain_token_returns_access_and_refresh(self):
        """Verifica que la respuesta contenga access y refresh tokens."""
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data['access'], str)
        self.assertIsInstance(response.data['refresh'], str)
        self.assertGreater(len(response.data['access']), 0)
        self.assertGreater(len(response.data['refresh']), 0)

    def test_obtain_token_with_inactive_user(self):
        """POST /api/v1/auth/token/ con usuario inactivo → 401."""
        self.user.is_active = False
        self.user.save()
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthTokenRefreshTest(APITestCase):
    """Tests para POST /api/v1/auth/token/refresh/."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
        )
        token_response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        self.refresh_token = token_response.data['refresh']
        self.access_token = token_response.data['access']
        self.url = reverse('token_refresh')

    def test_refresh_token_with_valid_token(self):
        """POST /api/v1/auth/token/refresh/ con refresh válido → 200 + nuevo access."""
        response = self.client.post(self.url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIsInstance(response.data['access'], str)

    def test_refresh_token_with_invalid_token(self):
        """POST /api/v1/auth/token/refresh/ con refresh inválido → 401."""
        payload = {'refresh': 'invalid_token_here'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_with_expired_token(self):
        """POST /api/v1/auth/token/refresh/ con refresh expirado → 401."""
        payload = {'refresh': self.refresh_token}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_token_with_missing_fields(self):
        """POST /api/v1/auth/token/refresh/ sin refresh → 400."""
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_token_with_get_method(self):
        """GET /api/v1/auth/token/refresh/ → 405."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_access_token_is_different_after_refresh(self):
        """Verifica que el nuevo access token sea distinto del anterior."""
        response = self.client.post(self.url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['access'], self.access_token)
