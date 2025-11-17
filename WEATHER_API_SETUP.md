# 🌤️ Configuración de la API del Clima

## ✨ Sin configuración necesaria!

Este proyecto usa **Open-Meteo**, una API de clima 100% gratuita que **NO requiere API key ni registro**.

## Paso 1: Configurar la ciudad (Opcional)

Si quieres cambiar la ciudad por defecto, crea un archivo `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env`:
```env
VITE_WEATHER_CITY=Santiago
```

## Paso 2: ¡Listo!

Simplemente inicia el servidor:
```bash
npm run dev
```

El widget del clima funcionará automáticamente sin necesidad de API keys.

## Personalización

### Cambiar la ciudad
Edita el archivo `.env`:
```env
VITE_WEATHER_CITY=Valparaiso
```

### Ciudades disponibles en Chile
- Santiago
- Valparaiso
- Concepcion
- La Serena
- Antofagasta
- Temuco
- Rancagua
- Talca
- Arica
- Iquique
- Puerto Montt
- Chillan

Para agregar más ciudades, edita `src/services/weatherService.js` y agrega las coordenadas en `CITY_COORDINATES`.

## Características implementadas

✅ Widget del clima en la página principal
✅ Temperatura actual en grados Celsius
✅ Descripción del clima en español
✅ Icono animado según el clima
✅ Información de humedad y viento
✅ Mensaje personalizado para delivery según el clima
✅ Actualización automática cada 10 minutos
✅ Diseño responsive

## Ventajas de Open-Meteo

✅ **100% Gratis** - Sin límites razonables
✅ **Sin API Key** - No requiere registro
✅ **Sin tarjeta de crédito** - Completamente gratuito
✅ **Alta precisión** - Datos de múltiples fuentes meteorológicas
✅ **Rápido** - Respuestas en milisegundos
✅ **Sin CORS** - Funciona directamente desde el navegador

## Solución de problemas

### "No se pudo cargar el clima"
- Verifica tu conexión a internet
- Revisa la consola del navegador para más detalles
- La API de Open-Meteo puede estar temporalmente no disponible (muy raro)

### La ciudad no se encuentra
- Verifica que el nombre esté en la lista de ciudades disponibles
- Asegúrate de escribir el nombre exactamente como aparece en la lista
- Por defecto usará Santiago si la ciudad no existe

### Agregar una nueva ciudad
1. Busca las coordenadas (latitud y longitud) en Google Maps
2. Edita `src/services/weatherService.js`
3. Agrega la ciudad en el objeto `CITY_COORDINATES`:
```javascript
'Tu Ciudad': { lat: -XX.XX, lon: -XX.XX, name: 'Tu Ciudad' }
```

## Archivos creados

- `src/services/weatherService.js` - Servicio para obtener datos del clima
- `src/components/WeatherWidget.jsx` - Componente visual del clima
- `.env.example` - Plantilla de configuración
- `WEATHER_API_SETUP.md` - Este archivo de instrucciones

## Próximas mejoras sugeridas

- [ ] Pronóstico de 5 días
- [ ] Alertas de clima severo
- [ ] Cambio de ciudad desde la UI
- [ ] Gráficos de temperatura
- [ ] Integración con notificaciones de delivery
