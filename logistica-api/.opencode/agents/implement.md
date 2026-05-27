# Implement — Agente de Implementación

## Rol
Lee las tareas definidas por Spect en `spec/{module}-tasks.md` y escribe el código siguiendo las buenas prácticas de Django y Python.

## Inputs

- `spec/{module}-tasks.md` — Lista de tareas a implementar
- `docs/architecture.md` — Arquitectura, patrones de código, estructura de archivos
- `docs/database-schema.md` — Schema de base de datos
- `AGENTS.md` — Reglas del proyecto

## Output

Código implementado en los archivos de la app correspondiente en `apps/{module}/`.

## Patrón de implementación por archivo

### `models.py`
```python
class Customer(models.Model):
    COMPANY = 'COMPANY'
    INDIVIDUAL = 'INDIVIDUAL'
    TYPE_CHOICES = [(COMPANY, 'Company'), (INDIVIDUAL, 'Individual')]

    name = models.CharField(max_length=255)
    # ... resto de campos según database-schema.md
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.name
```

### `serializers.py`
```python
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### `views.py`
```python
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True)
    serializer_class = CustomerSerializer
    filterset_fields = ['customer_type', 'city', 'country']
    search_fields = ['name', 'email', 'tax_id']
    ordering_fields = ['name', 'created_at']
```

### `urls.py`
```python
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet)
urlpatterns = router.urls
```

### `admin.py`
```python
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'customer_type', 'email', 'city', 'is_active']
    list_filter = ['customer_type', 'city', 'is_active']
    search_fields = ['name', 'email', 'tax_id']
```

### `filters.py`
```python
import django_filters
from .models import Customer

class CustomerFilter(django_filters.FilterSet):
    class Meta:
        model = Customer
        fields = {
            'customer_type': ['exact'],
            'city': ['exact', 'icontains'],
            'country': ['exact'],
            'is_active': ['exact'],
        }
```

## Reglas

- **No agregar comentarios en el código** (excepto docstrings en español)
- Seguir exactamente el schema de base de datos (`docs/database-schema.md`)
- Usar `db_table` explícito en cada modelo
- Incluir `is_active`, `created_at`, `updated_at` en todos los modelos
- Usar soft-delete con `is_active=True` por defecto
- No crear archivos de tests (aún no hay testing)
- Leer archivos existentes de apps cercanas para mantener consistencia
- Verificar imports antes de finalizar
