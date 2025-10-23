# 🏗️ Estructura del Proyecto - Menu Burger

## 📁 Estructura General

```
menu-burger/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 components/               # Componentes React reutilizables
│   ├── 📁 pages/                    # Páginas principales de la aplicación
│   ├── 📁 services/                 # Lógica de negocio y servicios
│   └── 📁 data/                     # Datos estáticos y configuración
├── 📁 tests/                        # Tests con Jasmine y Karma
├── 📁 database/                     # Base de datos SQLite local (fallback)
├── 📁 uploads/                      # Archivos subidos (imágenes, etc.)
├── 📁 .github/                      # Configuración de GitHub
├── 📄 server.js                     # Servidor backend (Express + Node.js)
├── 📄 package.json                  # Dependencias y scripts
├── 📄 .env                          # Variables de entorno (Turso DB)
└── 📄 vite.config.js               # Configuración de Vite (frontend)
```

---

## 🎨 Frontend (React + Vite)

### 📄 Páginas Principales (`src/pages/`)

| Archivo | Ruta | Descripción | Funcionalidad |
|---------|------|-------------|---------------|
| `LandingPage.jsx` | `/` | Página de inicio | Presentación del restaurante, navegación principal |
| `MenuPage.jsx` | `/menu` | Menú de productos | Catálogo, carrito, filtros, búsqueda |
| `AdminPage.jsx` | `/admin` | Panel de administración | Gestión de pedidos, productos, usuarios |
| `LoginPage.jsx` | `/login` | Inicio de sesión | Autenticación de usuarios |
| `OrderTrackingPage.jsx` | `/order-tracking` | Seguimiento de pedidos | Estado en tiempo real de pedidos |
| `UserProfilePage.jsx` | `/profile` | Perfil de usuario | Datos personales, historial |
| `ReviewsPage.jsx` | `/reviews` | Reseñas | Comentarios y calificaciones |
| `ContactPage.jsx` | `/contact` | Contacto | Información de contacto |

### 🧩 Componentes (`src/components/`)

#### 🛒 **Componentes de Menú y Carrito**
| Componente | Propósito | Ubicación |
|------------|-----------|-----------|
| `MenuHeader.jsx` | Header del menú con navegación | Parte superior del menú |
| `CategoryTabs.jsx` | Pestañas de categorías (Burgers, Papas, etc.) | Filtros de productos |
| `SearchBar.jsx` | Barra de búsqueda de productos | Búsqueda en tiempo real |
| `MenuGrid.jsx` | Grid de productos | Contenedor de productos |
| `ProductCard.jsx` | Tarjeta individual de producto | Muestra producto con precio |
| `Cart.jsx` | Modal del carrito de compras | Gestión de items seleccionados |
| `ProductModal.jsx` | Modal de detalles del producto | Vista detallada del producto |
| `Checkout.jsx` | Formulario de finalización de compra | Datos del cliente y pedido |
| `OrderConfirmation.jsx` | Confirmación de pedido creado | Resumen post-compra |

#### 👤 **Componentes de Autenticación**
| Componente | Propósito | Funcionalidad |
|------------|-----------|---------------|
| `AuthModal.jsx` | Modal de autenticación | Contenedor login/registro |
| `LoginForm.jsx` | Formulario de inicio de sesión | Validación y autenticación |
| `RegisterForm.jsx` | Formulario de registro | Creación de nuevos usuarios |
| `TempUserNotification.jsx` | Notificación de usuario temporal | Gestión de sesiones temporales |

#### 🏪 **Componentes de Administración**
| Componente | Propósito | Funcionalidad |
|------------|-----------|---------------|
| `AdminDashboard.jsx` | Panel principal de administración | Gestión completa del sistema |
| `ProductManagement.jsx` | Gestión de productos | CRUD de productos |
| `OrderTracking.jsx` | Seguimiento individual de pedidos | Estado en tiempo real |

#### 🧭 **Componentes de Navegación**
| Componente | Propósito | Ubicación |
|------------|-----------|-----------|
| `Navbar.jsx` | Barra de navegación principal | Header global |
| `Footer.jsx` | Pie de página | Footer global |

---

## ⚙️ Backend (Node.js + Express)

### 📄 Servidor Principal (`server.js`)

**Funcionalidades:**
- 🌐 **API REST** - Endpoints para frontend
- 🔐 **Autenticación** - Login/registro de usuarios
- 📦 **Gestión de productos** - CRUD completo
- 🛒 **Gestión de pedidos** - Creación y seguimiento
- ⭐ **Sistema de reseñas** - Comentarios y calificaciones
- 📊 **Estadísticas** - Métricas del negocio
- 📝 **Logs de actividad** - Auditoría del sistema

### 🔌 Endpoints Principales

#### 🔐 **Autenticación (`/api/auth/`)**
```
POST /api/auth/login      # Iniciar sesión
POST /api/auth/register   # Registrar usuario
```

#### 👥 **Usuarios (`/api/users/`)**
```
GET    /api/users         # Obtener todos los usuarios
GET    /api/users/:id     # Obtener usuario por ID
PUT    /api/users/:id     # Actualizar usuario
POST   /api/users         # Crear usuario
DELETE /api/users/:id     # Eliminar usuario
PATCH  /api/users/:id/toggle # Activar/desactivar usuario
```

#### 📦 **Productos (`/api/products/`)**
```
GET    /api/products      # Productos disponibles
GET    /api/products/all  # Todos los productos
GET    /api/products/:id  # Producto por ID
POST   /api/products      # Crear producto
PUT    /api/products/:id  # Actualizar producto
DELETE /api/products/:id  # Eliminar producto (soft delete)
DELETE /api/products/:id/hard # Eliminar permanentemente
PATCH  /api/products/:id/toggle # Cambiar disponibilidad
```

#### 🛒 **Pedidos (`/api/orders/`)**
```
GET    /api/orders        # Todos los pedidos
GET    /api/orders/:id    # Pedido por ID
GET    /api/orders/user/:userId # Pedidos de usuario
POST   /api/orders        # Crear pedido
PUT    /api/orders/:id/status   # Actualizar estado
PUT    /api/orders/:id    # Actualizar pedido
DELETE /api/orders/:id    # Eliminar pedido
```

#### ⭐ **Reseñas (`/api/reviews/`)**
```
GET    /api/reviews       # Obtener reseñas
POST   /api/reviews       # Crear reseña
PUT    /api/reviews/:id/approval # Aprobar/rechazar
DELETE /api/reviews/:id   # Eliminar reseña
```

---

## 🔧 Servicios y Lógica (`src/services/`)

### 🌐 **Comunicación con API**
| Archivo | Propósito | Funcionalidad |
|---------|-----------|---------------|
| `apiService.js` | Cliente HTTP principal | Comunicación con backend, manejo de requests |

### 🔐 **Autenticación y Usuarios**
| Archivo | Propósito | Funcionalidad |
|---------|-----------|---------------|
| `authService.js` | Gestión de autenticación | Login, registro, tokens, sesiones |
| `tempUserService.js` | Usuarios temporales | Sesiones sin registro, perfiles temporales |

### 🛒 **Gestión de Pedidos**
| Archivo | Propósito | Funcionalidad |
|---------|-----------|---------------|
| `orderManager.js` | Gestión completa de pedidos | CRUD, estados, tiempo real, validaciones |
| `syncService.js` | Sincronización de datos | Sync entre pestañas, cache, eventos |

### 🔔 **Notificaciones**
| Archivo | Propósito | Funcionalidad |
|---------|-----------|---------------|
| `notificationService.js` | Sistema de notificaciones | Alertas, mensajes, estados |

---

## 🗄️ Base de Datos

### 🌐 **Turso (Principal) - `src/services/tursoDatabase.js`**

**Configuración:**
- 🔗 **URL**: `libsql://restaurant-prograshaco.aws-us-west-2.turso.io`
- 🔑 **Token**: Configurado en `.env`
- 📊 **Tipo**: SQLite en la nube

**Tablas:**
```sql
users           # Usuarios del sistema
products        # Catálogo de productos
orders          # Pedidos realizados
reviews         # Reseñas y calificaciones
activity_logs   # Logs de actividad del sistema
```

**Métodos Principales:**
```javascript
// Usuarios
createUser(), getUserById(), getAllUsers(), updateUser(), deleteUser()

// Productos
getProducts(), createProduct(), updateProduct(), deleteProduct()
toggleProductAvailability(), getProductsByCategory()

// Pedidos
createOrder(), getAllOrders(), getOrderById(), updateOrderStatus()
getOrdersByUser(), deleteOrder()

// Reseñas
createReview(), getAllReviews(), updateReviewApproval(), deleteReview()
```

### 💾 **SQLite Local (Fallback) - `src/services/sqliteDatabase.js`**

**Propósito:** Base de datos de respaldo local
**Ubicación:** `database/restaurant.db`
**Uso:** Cuando Turso no está disponible

---

## 📊 Datos y Configuración (`src/data/`)

### 📄 **Archivos de Datos**
| Archivo | Propósito | Contenido |
|---------|-----------|-----------|
| `menu.json` | Catálogo inicial de productos | Productos por categorías con precios |

**Estructura de `menu.json`:**
```json
{
  "burgers": [
    {
      "id": 1,
      "name": "Burger Clásica",
      "desc": "Descripción del producto",
      "price": 1200,  // Precio en centavos
      "ingredients": ["Carne", "Lechuga", "Tomate"],
      "image": "/images/burger.jpg"
    }
  ],
  "papas": [...],
  "bebidas": [...],
  "salsas": [...],
  "agregados": [...]
}
```

---

## 🧪 Testing (`tests/`)

### 📁 **Estructura de Tests**
```
tests/
├── setup.js                    # Configuración global de tests
├── example.test.js             # Tests básicos (5 tests funcionando)
├── services/                   # Tests de servicios
│   ├── apiService.test.js      # Tests de API
│   └── orderManager.test.js    # Tests de gestión de pedidos
├── components/                 # Tests de componentes React
│   └── ProductCard.test.js     # Tests de componentes
├── utils/                      # Tests de utilidades
│   └── helpers.test.js         # Tests de funciones helper
└── integration/                # Tests de integración
    └── orderFlow.test.js       # Tests de flujo completo
```

### 🔧 **Configuración de Testing**
| Archivo | Propósito |
|---------|-----------|
| `karma.simple.conf.cjs` | Configuración básica de Karma |
| `karma.conf.cjs` | Configuración completa con Webpack |
| `.babelrc` | Transpilación de ES6/React |
| `jasmine.json` | Configuración de Jasmine |

---

## 🔧 Configuración del Proyecto

### 📄 **Archivos de Configuración**
| Archivo | Propósito | Contenido |
|---------|-----------|-----------|
| `package.json` | Dependencias y scripts | Scripts npm, dependencias |
| `.env` | Variables de entorno | Credenciales de Turso, configuración |
| `vite.config.js` | Configuración de Vite | Build del frontend |
| `tailwind.config.mjs` | Configuración de Tailwind | Estilos CSS |
| `postcss.config.js` | PostCSS | Procesamiento de CSS |

### 🌿 **Git y Colaboración**
| Archivo/Carpeta | Propósito |
|-----------------|-----------|
| `.github/PULL_REQUEST_TEMPLATE.md` | Plantilla para PRs |
| `PASO-A-PASO.md` | Guía para el equipo |
| `README-EQUIPO.md` | Guía rápida |
| `TESTING.md` | Documentación de testing |
| `ESTRUCTURA.md` | Este documento |

---

## 🔄 Flujo de Datos

### 📱 **Frontend → Backend**
```
Componente React → Service (apiService.js) → API Endpoint → Database Service → Turso DB
```

### 🔙 **Backend → Frontend**
```
Turso DB → Database Service → API Response → Service → React Component → UI Update
```

### 🔄 **Tiempo Real**
```
Admin Dashboard → orderManager → BroadcastChannel → OrderTracking Component
```

---

## 🚀 Scripts Disponibles

### 🖥️ **Desarrollo**
```bash
npm run dev          # Iniciar frontend (Vite)
node server.js       # Iniciar backend (Express)
```

### 🧪 **Testing**
```bash
npm run test:example    # Tests básicos
npm test               # Todos los tests
npm run test:headless  # Tests sin navegador
npm run test:watch     # Tests en modo watch
```

### 🏗️ **Build**
```bash
npm run build       # Build de producción
npm run preview     # Preview del build
npm run lint        # Linting del código
```

---

## 🔐 Seguridad y Validación

### 🛡️ **Validaciones Frontend**
- **Formularios**: Validación en tiempo real
- **Datos de entrada**: Sanitización y validación
- **Autenticación**: Verificación de tokens

### 🔒 **Validaciones Backend**
- **API Endpoints**: Validación de parámetros
- **Base de datos**: Constraints y validaciones
- **Autenticación**: Verificación de permisos

### 🔑 **Gestión de Sesiones**
- **Usuarios registrados**: JWT tokens
- **Usuarios temporales**: Sesiones con expiración
- **Administradores**: Permisos especiales

---

## 📈 Escalabilidad

### 🔄 **Sincronización**
- **Multi-pestaña**: BroadcastChannel API
- **Tiempo real**: Event-driven updates
- **Cache**: Optimización de requests

### 📊 **Monitoreo**
- **Logs de actividad**: Auditoría completa
- **Estadísticas**: Métricas del negocio
- **Errores**: Manejo centralizado

---

**📝 Nota:** Esta estructura está diseñada para ser escalable y mantenible, con separación clara de responsabilidades entre frontend, backend, y servicios auxiliares.