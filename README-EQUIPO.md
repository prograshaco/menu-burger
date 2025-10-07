# 🍔 Menu Burger - Guía del Equipo

## 👥 Miembros del Equipo

- **Administrador**: Encargado de merges y revisiones
- **Javier**: Desarrollador - Rama `javier`
- **Valentina**: Desarrolladora - Rama `valentina`

## 🌿 Ramas de Trabajo

```
main (protegida)
├── javier (trabajo de Javier)
└── valentina (trabajo de Valentina)
```

## 🚀 Inicio Rápido

1. **Clonar y configurar**:
```bash
git clone [URL_REPO]
cd menu-burger
npm install
```

2. **Cambiar a tu rama**:
```bash
# Para Javier
git checkout javier

# Para Valentina
git checkout valentina
```

3. **Ejecutar el proyecto**:
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm run dev
```

## 📋 Flujo de Trabajo

1. **Actualizar tu rama** antes de trabajar:
```bash
git pull origin main
```

2. **Hacer cambios** en tu rama asignada

3. **Probar** que todo funcione correctamente

4. **Subir cambios**:
```bash
git add .
git commit -m "Descripción clara"
git push origin [tu-rama]
```

5. **Crear Pull Request** para revisión

## 🛡️ Reglas de Protección

- ❌ **NO** trabajar en `main`
- ❌ **NO** hacer merge directo
- ✅ **SÍ** usar tu rama asignada
- ✅ **SÍ** crear Pull Requests
- ✅ **SÍ** probar antes de subir

## 📖 Documentación Completa

Ver **PASO-A-PASO.md** para la guía completa.

---

**¿Dudas?** Consulta con el administrador del proyecto.