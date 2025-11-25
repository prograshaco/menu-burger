# 🍔 Sistema de Pedidos - Menú Burger

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Flujos de Trabajo (Diagramas)](#-flujos-de-trabajo)
- [Casos de Uso](#-casos-de-uso)
- [Funcionalidades Detalladas](#-funcionalidades-detalladas)
- [Aspectos Técnicos](#-aspectos-técnicos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [API y Servicios](#-api-y-servicios)
- [Interfaz de Usuario](#-interfaz-de-usuario)
- [Testing](#-testing)

## 🎯 Descripción General

**Menú Burger** es una aplicación web completa y robusta para la gestión de pedidos de un restaurante de hamburguesas. Evolucionando de un prototipo simple, ahora cuenta con una arquitectura **Full Stack** que combina la velocidad de React con la potencia de un backend Node.js y una base de datos híbrida distribuida.

El sistema permite a los clientes navegar por el menú, realizar pedidos, hacer seguimiento de sus órdenes y dejar reseñas. Los administradores pueden gestionar productos, pedidos, usuarios y obtener estadísticas en tiempo real.

## 🌟 Características Principales

### 🔐 **Sistema de Autenticación Avanzado**

- **Usuarios Registrados**: Login/registro completo con perfiles persistentes.
- **Usuarios Temporales**: Sistema innovador para realizar pedidos sin registro previo.
- **Roles de Usuario**: Cliente y Administrador con permisos diferenciados.
- **Seguridad**: Tokens JWT y hashing de contraseñas con Bcrypt.

### ☁️ **Infraestructura de Datos Híbrida (NUEVO)**

- **Turso (LibSQL)**: Base de datos principal distribuida para producción.
- **SQLite Fallback**: Sistema automático de respaldo local si falla la conexión a la nube.
- **Sincronización Inteligente**: Gestión transparente de datos entre entornos para garantizar que el restaurante nunca deje de operar.

### 🌤️ **Integración Meteorológica (NUEVO)**

- **Widget del Clima**: Información en tiempo real usando Open-Meteo API.
- **Contexto Local**: Muestra el clima de la ciudad configurada (por defecto Santiago) para incentivar pedidos contextuales.

### 🛒 **Sistema de Pedidos Inteligente**

- **Carrito Dinámico**: Gestión de productos, cálculo de totales e impuestos en tiempo real.
- **Proxy de API**: Integración con API externa de productos (`api-burger.onrender.com`) con caché y gestión local.
- **Seguimiento en Tiempo Real**: Estados de pedido actualizados automáticamente (Pendiente -> Preparando -> En Camino -> Entregado).

### 👨‍💼 **Panel Administrativo Completo**

- **Dashboard de Estadísticas**: Métricas en tiempo real de ventas y pedidos.
- **Gestión de Productos**: CRUD completo con subida de imágenes local.
- **Control de Disponibilidad**: Habilitar/deshabilitar productos al instante.

## 🏗️ Arquitectura del Sistema

### **Frontend (React + Vite)**

```
src/
├── components/          # Componentes reutilizables (WeatherWidget, Navbar, etc.)
├── pages/              # Páginas principales
├── services/           # Capa de servicios y lógica de negocio
│   ├── api.js          # Comunicación con Backend
│   ├── weatherService.js # Integración Open-Meteo
│   └── ...
├── context/            # Estado global (Auth, Cart)
├── config/             # Configuraciones
└── utils/              # Utilidades y helpers
```

### **Backend (Node.js + Express)**

```
root/
├── server.js           # Punto de entrada y configuración de Express
├── database/           # Archivos de DB local (SQLite) y migraciones
├── uploads/            # Almacenamiento local de imágenes
└── src/services/
    ├── tursoDatabase.js  # Cliente Turso (Producción)
    └── sqliteDatabase.js # Cliente SQLite (Fallback)
```

## � Flujos de Trabajo

### **Flujo de Pedido Completo**

```mermaid
graph TD
    A[Cliente accede al menú] --> B[Selecciona productos]
    B --> C[Agrega al carrito]
    C --> D{¿Usuario registrado?}
    D -->|Sí| E[Checkout con datos guardados]
    D -->|No| F[Checkout con formulario completo]
    E --> G[Confirma pedido]
    F --> G
    G --> H[Backend procesa pedido (Turso/SQLite)]
    H --> I[Genera ID y notifica]
    I --> J[Pedido aparece en panel admin]
    J --> K[Admin procesa pedido]
    K --> L[Actualiza estado]
    L --> M[Cliente ve actualización en vivo]
    M --> N[Pedido completado]
```

### **Flujo de Gestión de Productos (Híbrido)**

```mermaid
graph TD
    A[Admin accede a gestión] --> B[Lista productos (Proxy API + Local)]
    B --> C{¿Qué acción?}
    C -->|Crear| D[Formulario nuevo producto]
    C -->|Editar| E[Selecciona producto existente]
    C -->|Subir Imagen| F[Carga imagen a /uploads]
    C -->|Disponibilidad| G[Toggle ON/OFF]
    D --> H[Guarda en DB Local/Turso]
    E --> H
    F --> H
    G --> H
    H --> I[Actualización inmediata en Menú]
```

### **Flujo de Autenticación**

```mermaid
graph TD
    A[Usuario accede a la app] --> B{¿Tiene cuenta?}
    B -->|Sí| C[Inicia sesión (JWT)]
    B -->|No| D{¿Quiere registrarse?}
    D -->|Sí| E[Completa registro]
    D -->|No| F[Continúa como invitado]
    C --> G[Acceso completo + Historial]
    E --> G
    F --> H[Sesión temporal]
    H --> I[Funcionalidad de pedido básica]
```

## 📋 Casos de Uso

### 🎯 **Caso de Uso 1: Cliente Realiza Pedido (Usuario Anónimo)**

```
Actor: Cliente no registrado
Objetivo: Realizar un pedido sin crear cuenta

Flujo Principal:
1. Cliente accede al menú y ve el widget del clima.
2. Navega por categorías y agrega productos.
3. Procede al checkout.
4. Completa información de entrega (Nombre, Dirección, Teléfono).
5. Confirma el pedido.
6. Recibe confirmación en pantalla.
```

### 🎯 **Caso de Uso 2: Cliente Registrado Realiza Pedido**

```
Actor: Cliente registrado
Objetivo: Realizar pedido con datos guardados

Flujo Principal:
1. Cliente inicia sesión.
2. Navega el menú.
3. Agrega productos al carrito.
4. Checkout con datos pre-llenados (Dirección guardada).
5. Confirma pedido.
6. Pedido se guarda en su historial personal y suma puntos (futuro).
```

### 🎯 **Caso de Uso 3: Administrador Gestiona Pedidos**

```
Actor: Administrador
Objetivo: Procesar y gestionar pedidos

Flujo Principal:
1. Administrador accede al panel (Dashboard).
2. Revisa pedidos pendientes en tiempo real.
3. Cambia estado a "Preparando" -> "En Camino".
4. Revisa métricas de ventas del día.
```

## 🔧 Funcionalidades Detalladas

### 🏠 **Página Principal (Landing)**

- **Hero Section**: Presentación atractiva.
- **Widget Clima**: Información contextual para impulsar ventas.
- **Call-to-Action**: Acceso directo al menú.

### 🍽️ **Página del Menú**

- **Categorías**: Burgers, Papas, Bebidas, etc.
- **Búsqueda**: Filtrado instantáneo.
- **Tarjetas de Producto**: Imagen, precio, descripción y botón de agregar.

### 📊 **Panel Administrativo**

#### **Dashboard Principal**

- **Métricas**: Total pedidos, Ingresos, Productos top.
- **Gráficos**: Visualización de rendimiento.

#### **Gestión de Pedidos**

- **Lista**: Filtrable por estado.
- **Estados**: 🟡 Pendiente, 🔵 Preparando, 🟢 En Camino, ✅ Entregado, ❌ Cancelado.

#### **Gestión de Productos**

- **CRUD**: Crear, editar, eliminar.
- **Imágenes**: Subida de archivos locales.
- **Disponibilidad**: Control de stock rápido.

## 💻 Aspectos Técnicos

### **Base de Datos Híbrida**

El sistema utiliza un patrón de diseño robusto para la persistencia de datos:

1.  **Turso (Producción)**: Se intenta conectar a la base de datos en la nube usando `@libsql/client`.
2.  **SQLite (Fallback)**: Si la conexión falla o no está configurada, el sistema cambia automáticamente a una base de datos SQLite local (`restaurant.db`) usando `better-sqlite3`.
3.  **Transparencia**: El resto de la aplicación no sabe qué base de datos está usando, gracias a una capa de abstracción en los servicios.

### **Proxy de Productos**

Para manejar productos de una franquicia o API externa:

- El backend consulta `https://api-burger.onrender.com/api/products`.
- Permite extender estos productos con datos locales (imágenes personalizadas, disponibilidad).

### **Seguridad**

- **JWT**: Autenticación stateless.
- **Sanitización**: Prevención de inyecciones.
- **CORS**: Control de acceso a recursos.

## 🚀 Instalación y Configuración

### **Requisitos Previos**

- Node.js 18+
- npm o yarn
- Git

### **Instalación**

```bash
# 1. Clonar repositorio
git clone [repository-url]
cd menu-burger

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (Opcional) Configurar credenciales de Turso en .env

# 4. Configurar base de datos (Migraciones)
npm run migrate

# 5. Iniciar Servidor Backend
npm run server
# El backend correrá en http://localhost:3006

# 6. Iniciar Cliente Frontend (en otra terminal)
npm run dev
# La app abrirá en http://localhost:5173
```

### **Variables de Entorno (.env)**

```env
# Configuración del Servidor
PORT=3006

# Base de Datos (Turso)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Clima (Opcional, por defecto Santiago)
VITE_WEATHER_CITY=Santiago

# Seguridad
JWT_SECRET=tu_clave_secreta
```

## 🔌 API y Servicios

### **Endpoints Principales**

#### **Productos**

- `GET /api/products`: Obtiene todos los productos (Mezcla de API externa + DB Local).
- `POST /api/products`: Crea un nuevo producto.
- `PUT /api/products/:id`: Actualiza un producto.
- `POST /api/upload/image`: Sube una imagen al servidor.
- `PATCH /api/products/:id/toggle`: Cambia disponibilidad rápidamente.

#### **Pedidos**

- `GET /api/orders`: Lista todos los pedidos.
- `POST /api/orders`: Crea un pedido.
- `PUT /api/orders/:id/status`: Actualiza el estado de un pedido.
- `GET /api/orders/user/:userId`: Historial de pedidos de un usuario.

#### **Usuarios y Auth**

- `POST /api/auth/login`: Iniciar sesión.
- `POST /api/auth/register`: Registrar usuario.
- `GET /api/users`: Listar usuarios (Admin).

#### **Reseñas**

- `GET /api/reviews`: Obtener reseñas.
- `POST /api/reviews`: Crear reseña.

## 🎨 Interfaz de Usuario

### **Diseño Visual**

- **Paleta**: Naranjas y rojos (apetito), con modo oscuro/claro moderno.
- **Tipografía**: Fuentes legibles y modernas (Sans-serif).
- **Componentes**: Diseño modular con React y Tailwind CSS.

### **UX (Experiencia de Usuario)**

- **Feedback**: Notificaciones toast para acciones (éxito/error).
- **Loading States**: Skeletons y spinners para tiempos de carga.
- **Responsive**: Totalmente adaptado a móviles y escritorio.

## 🧪 Testing

El proyecto cuenta con una suite de pruebas automatizadas configurada con **Karma** y **Jasmine** para asegurar la calidad del código.

```bash
# Ejecutar tests una vez
npm run test:single

# Ejecutar en modo desarrollo (watch)
npm run test:watch

# Ejecutar en modo CI (headless)
npm run test:headless
```

---

## 📞 Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

**Credenciales de Administrador por Defecto (Local):**

- Usuario: `admin`
- Contraseña: `admin123`

---

_Documentación actualizada - Versión 3.0 (Full Stack Hybrid)_
