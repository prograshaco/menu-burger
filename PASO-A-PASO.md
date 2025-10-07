# 📋 Guía Paso a Paso - Proyecto Menu Burger

## 🎯 Información General

Este proyecto es una aplicación de restaurante con:
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: Turso (SQLite en la nube)
- **Gestión de código**: Git con ramas protegidas

---

## 👥 Ramas de Trabajo

### 🚨 IMPORTANTE: Nunca trabajar directamente en `main`

- **`main`**: Rama principal (SOLO para el administrador del proyecto)
- **`javier`**: Rama de trabajo para Javier
- **`valentina`**: Rama de trabajo para Valentina

---

## 🛠️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd menu-burger
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
El archivo `.env` ya está configurado con:
```
TURSO_DATABASE_URL=libsql://restaurant-prograshaco.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=[TOKEN_CONFIGURADO]
PORT=3006
NODE_ENV=development
```

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Iniciar el Servidor Backend
```bash
node server.js
```
**Deberías ver:**
```
🔗 Conectando a Turso...
✅ Tablas creadas en Turso
✅ Base de datos Turso inicializada correctamente
Servidor backend ejecutándose en http://localhost:3006
```

### 2. Iniciar el Frontend (en otra terminal)
```bash
npm run dev
```
**Deberías ver:**
```
Local:   http://localhost:5173/
Network: use --host to expose
```

### 3. Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **Panel Admin**: http://localhost:5173/admin
- **API Backend**: http://localhost:3006

---

## 🌿 Flujo de Trabajo con Git

### Para Javier:

#### 1. Cambiar a tu rama
```bash
git checkout javier
```

#### 2. Antes de empezar a trabajar, actualizar tu rama
```bash
git pull origin main
```

#### 3. Hacer tus cambios
- Edita los archivos necesarios
- Prueba que todo funcione correctamente

#### 4. Guardar cambios
```bash
git add .
git commit -m "Descripción clara de los cambios realizados"
```

#### 5. Subir cambios a tu rama
```bash
git push origin javier
```

#### 6. Crear Pull Request
- Ve a GitHub/GitLab
- Crea un Pull Request de `javier` hacia `main`
- Espera la revisión y aprobación del administrador

### Para Valentina:

#### 1. Cambiar a tu rama
```bash
git checkout valentina
```

#### 2. Antes de empezar a trabajar, actualizar tu rama
```bash
git pull origin main
```

#### 3. Hacer tus cambios
- Edita los archivos necesarios
- Prueba que todo funcione correctamente

#### 4. Guardar cambios
```bash
git add .
git commit -m "Descripción clara de los cambios realizados"
```

#### 5. Subir cambios a tu rama
```bash
git push origin valentina
```

#### 6. Crear Pull Request
- Ve a GitHub/GitLab
- Crea un Pull Request de `valentina` hacia `main`
- Espera la revisión y aprobación del administrador

---

## 🧪 Cómo Probar tus Cambios

### 1. Verificar que el servidor funcione
```bash
node server.js
```

### 2. Verificar que el frontend funcione
```bash
npm run dev
```

### 3. Probar funcionalidades principales:
- ✅ Cargar productos en el menú
- ✅ Agregar productos al carrito
- ✅ Realizar un pedido completo
- ✅ Ver pedidos en el panel de administración
- ✅ Cambiar estados de pedidos
- ✅ Crear usuarios/login

### 4. Verificar en diferentes navegadores
- Chrome
- Firefox
- Edge

---

## 📁 Estructura del Proyecto

```
menu-burger/
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas principales
│   ├── services/           # Servicios (API, auth, etc.)
│   └── data/               # Datos estáticos
├── server.js               # Servidor backend
├── package.json            # Dependencias
├── .env                    # Variables de entorno
└── README.md              # Documentación
```

---

## 🔧 Comandos Útiles

### Git
```bash
# Ver en qué rama estás
git branch

# Ver el estado de tus archivos
git status

# Ver los cambios realizados
git diff

# Ver el historial de commits
git log --oneline

# Descartar cambios no guardados
git checkout -- [archivo]

# Volver a un commit anterior (CUIDADO)
git reset --hard [hash_del_commit]
```

### NPM
```bash
# Instalar una nueva dependencia
npm install [nombre_paquete]

# Instalar dependencia de desarrollo
npm install -D [nombre_paquete]

# Ver dependencias instaladas
npm list

# Limpiar cache de npm
npm cache clean --force
```

---

## 🚨 Reglas Importantes

### ❌ NO HACER:
- **NUNCA** trabajar directamente en la rama `main`
- **NUNCA** hacer `git push origin main` desde tu rama
- **NUNCA** hacer merge sin aprobación
- **NUNCA** subir archivos `.env` con credenciales reales
- **NUNCA** subir la carpeta `node_modules`

### ✅ SÍ HACER:
- Siempre trabajar en tu rama asignada
- Hacer commits frecuentes con mensajes descriptivos
- Probar tus cambios antes de subirlos
- Crear Pull Requests para revisión
- Comunicar problemas o dudas

---

## 🆘 Solución de Problemas Comunes

### Error: "Puerto 3006 ya está en uso"
```bash
# En Windows
netstat -ano | findstr :3006
taskkill /PID [PID_NUMBER] /F

# Luego reinicia el servidor
node server.js
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Base de datos no conecta"
- Verificar que el archivo `.env` esté presente
- Verificar que las credenciales de Turso sean correctas
- Reiniciar el servidor

### Error: "Git conflicts"
```bash
# Actualizar tu rama con los últimos cambios
git pull origin main

# Resolver conflictos manualmente en los archivos
# Luego hacer commit
git add .
git commit -m "Resolver conflictos"
```

---

## 📞 Contacto y Soporte

Si tienes problemas o dudas:
1. Revisa esta guía primero
2. Busca el error en Google
3. Pregunta al administrador del proyecto
4. Documenta el problema para futuras referencias

---

## 📝 Notas Adicionales

### Credenciales de Prueba:
- **Admin**: usuario: `admin`, contraseña: `admin123`
- **Cliente**: usuario: `cliente`, contraseña: `cliente123`

### URLs Importantes:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3006
- **Admin Panel**: http://localhost:5173/admin
- **Seguimiento**: http://localhost:5173/order-tracking

### Base de Datos:
- **Tipo**: Turso (SQLite en la nube)
- **URL**: Configurada en `.env`
- **Tablas**: users, products, orders, reviews, activity_logs

---

**¡Recuerda: La comunicación es clave para un trabajo en equipo exitoso!** 🚀