# Logística API — SDD Pipeline

Este proyecto usa **Spec-Driven Development (SDD)**. El equipo de agentes está compuesto por:

| Agente | Archivo | Rol |
|--------|---------|-----|
| 🎯 Orchestrator | `.opencode/agents/orchestrator.md` | Orquesta el pipeline SDD. **Siempre ejecutar primero.** |
| 📋 Spect | `.opencode/agents/spect.md` | Crea especificaciones técnicas por módulo |
| ⚙️ Implement | `.opencode/agents/implement.md` | Implementa el código según las specs |
| ✅ Validator | `.opencode/agents/validator.md` | Valida el código contra specs y arquitectura |
| 🧪 Testing | `.opencode/agents/testing.md` | Crea y ejecuta tests unitarios módulo por módulo |

**IMPORTANTE**: El primer agente en ejecutarse SIEMPRE debe ser el **Orchestrator** (`.opencode/agents/orchestrator.md`). Él decidirá cuándo y cómo invocar a Spect, Implement y Validator.

**Testing**: Se ejecuta después de Validator. Trabaja 1 módulo a la vez, con cobertura mínima del 80%.

---

# Reglas del Proyecto

## Contexto

API REST Full para gestión de logística y envíos. Construida con Django REST Framework siguiendo buenas prácticas de desarrollo.

## Alcance

Módulos del sistema:
- **cliente (customer)**: Empresa o persona que genera envíos
- **envio (shipment)**: Unidad central de negocio. Compuesto por origen, destino, estado, fecha de entrega, costo calculado
- **productos (products)**: Productos de tecnología a transportar
- **transporte (transport)**: Medio de entrega al cliente
- **conductor (driver)**: Persona asignada al transporte
- **ruta (route)**: Secuencia de paradas del transporte
- **almacén (warehouse)**: Punto de partida y almacenamiento de productos
- **proveedores (suppliers)**: Empresas que venden los productos

---

## Idioma

- **Documentación y comunicación**: Español
- **Código, nombres de archivos, carpetas, tablas, columnas, variables**: Inglés

### Ejemplos

| Elemento | Idioma | Ejemplo |
|----------|--------|---------|
| Comentarios en código | Español | `# Este modelo representa un producto` |
| Docstrings | Español | `"""Serializador para el modelo Producto."""` |
| Nombres de archivos | Inglés | `product_serializer.py` |
| Modelos/tablas | Inglés | `class Product(models.Model):` |
| URLs/paths | Inglés | `/api/products/` |
| Variables | Inglés | `product_list`, `total_price` |
| Mensajes de error | Español | `"El nombre del producto es requerido"` |

---

# Guía Técnica

## Proyecto

- **Tipo**: Django REST API
- **Stack**: Django 6.0.5, Django REST Framework 3.17.1, PostgreSQL (`psycopg2-binary`)
- **Entorno virtual**: `.venv/`

## Arquitectura

- Entry point: `manage.py`
- Settings: `config/settings.py` (DJANGO_SETTINGS_MODULE=config.settings)
- URL config: `config/urls.py`
- App principal: `products/` (esqueleto vacío)

## Comandos de desarrollo

```bash
python manage.py runserver      # Iniciar servidor de desarrollo
python manage.py makemigrations # Crear migraciones
python manage.py migrate       # Aplicar migraciones
python manage.py createsuperuser # Crear usuario administrador
python manage.py test          # Ejecutar pruebas
python manage.py check         # Verificar configuración
```

## Esquema de Base de Datos

- Documentado en `docs/database-schema.md`
- **Siempre consultar este archivo** antes de cualquier tarea de desarrollo
- Utiliza las tablas built-in de Django (`auth_user`, `auth_group`, etc.) en lugar de crear autenticación desde cero

## Configuración importante

- **App products**: NO registrada en `INSTALLED_APPS`. Agregar `'products'` en `config/settings.py`
- **Base de datos**: SQLite por defecto (`db.sqlite3`), con soporte para PostgreSQL
- **ALLOWED_HOSTS**: Vacío - configurar para acceso no-localhost
- **python-decouple**: Instalado pero no usado en settings -有待 implementar para variables de entorno

## Reglas de ejecución

- **Entorno virtual**: Siempre activar `.venv` antes de ejecutar cualquier comando
- **runserver**: NO ejecutar desde el agente. Este comando debe ejecutarse manualmente por el usuario
- **Type checking**: Siempre usar la skill `/fix-types` para resolver errores de mypy
- **Actualizar dependencias**: Siempre usar la skill `/upgrade-python-deps` para actualizar dependencias Python

## Skills disponibles

- `/fix-types` - Arreglar problemas de type checking con mypy
- `/upgrade-python-deps` - Actualizar dependencias Python

Para usar una skill, invocar el nombre directamente.