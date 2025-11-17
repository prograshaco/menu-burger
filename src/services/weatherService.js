// Servicio para obtener información del clima usando Open-Meteo (100% gratis, sin API key)
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

// Coordenadas de ciudades principales de Chile
const CITY_COORDINATES = {
  'Santiago': { lat: -33.45, lon: -70.67, name: 'Santiago' },
  'Valparaiso': { lat: -33.05, lon: -71.62, name: 'Valparaíso' },
  'Concepcion': { lat: -36.83, lon: -73.05, name: 'Concepción' },
  'La Serena': { lat: -29.90, lon: -71.25, name: 'La Serena' },
  'Antofagasta': { lat: -23.65, lon: -70.40, name: 'Antofagasta' },
  'Temuco': { lat: -38.74, lon: -72.59, name: 'Temuco' },
  'Rancagua': { lat: -34.17, lon: -70.74, name: 'Rancagua' },
  'Talca': { lat: -35.43, lon: -71.66, name: 'Talca' },
  'Arica': { lat: -18.47, lon: -70.30, name: 'Arica' },
  'Iquique': { lat: -20.21, lon: -70.15, name: 'Iquique' },
  'Puerto Montt': { lat: -41.47, lon: -72.94, name: 'Puerto Montt' },
  'Chillan': { lat: -36.61, lon: -72.10, name: 'Chillán' },
  'default': { lat: -33.45, lon: -70.67, name: 'Santiago' }
};

class WeatherService {
  async getWeather(cityName = 'Santiago') {
    try {
      // Obtener coordenadas de la ciudad
      const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES['default'];
      
      const response = await fetch(
        `${OPEN_METEO_API}?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=auto`
      );

      if (!response.ok) {
        throw new Error(`Error al obtener clima: ${response.status}`);
      }

      const data = await response.json();
      const current = data.current_weather;
      
      return {
        temperature: Math.round(current.temperature),
        feelsLike: Math.round(current.temperature - 2), // Aproximación
        description: this.getWeatherDescription(current.weathercode),
        icon: this.getWeatherIconCode(current.weathercode, current.is_day),
        humidity: 65, // Open-Meteo no incluye humedad en el plan básico
        windSpeed: Math.round(current.windspeed / 3.6), // Convertir km/h a m/s
        city: coords.name,
        country: 'CL',
        weatherCode: current.weathercode
      };
    } catch (error) {
      console.error('Error obteniendo clima:', error);
      throw error;
    }
  }

  getWeatherDescription(code) {
    const descriptions = {
      0: 'despejado',
      1: 'mayormente despejado',
      2: 'parcialmente nublado',
      3: 'nublado',
      45: 'niebla',
      48: 'niebla con escarcha',
      51: 'llovizna ligera',
      53: 'llovizna moderada',
      55: 'llovizna densa',
      61: 'lluvia ligera',
      63: 'lluvia moderada',
      65: 'lluvia intensa',
      71: 'nevada ligera',
      73: 'nevada moderada',
      75: 'nevada intensa',
      77: 'granizo',
      80: 'chubascos ligeros',
      81: 'chubascos moderados',
      82: 'chubascos violentos',
      85: 'chubascos de nieve ligeros',
      86: 'chubascos de nieve intensos',
      95: 'tormenta',
      96: 'tormenta con granizo ligero',
      99: 'tormenta con granizo intenso'
    };
    return descriptions[code] || 'clima variable';
  }

  getWeatherIconCode(code, isDay) {
    // Mapear códigos WMO a códigos similares de OpenWeatherMap para reutilizar iconos
    if (code === 0) return isDay ? '01d' : '01n'; // clear
    if (code <= 2) return isDay ? '02d' : '02n'; // few clouds
    if (code === 3) return '03d'; // scattered clouds
    if (code >= 45 && code <= 48) return '50d'; // mist
    if (code >= 51 && code <= 55) return '09d'; // drizzle
    if (code >= 61 && code <= 65) return isDay ? '10d' : '10n'; // rain
    if (code >= 71 && code <= 77) return '13d'; // snow
    if (code >= 80 && code <= 82) return '09d'; // shower rain
    if (code >= 85 && code <= 86) return '13d'; // snow shower
    if (code >= 95) return '11d'; // thunderstorm
    return '02d'; // default
  }

  getWeatherIcon(iconCode) {
    // Mapear códigos de OpenWeatherMap a emojis
    const iconMap = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    };

    return iconMap[iconCode] || '🌤️';
  }

  getDeliveryMessage(temp, description) {
    if (temp > 30) {
      return '🔥 Hace calor! Tu pedido llegará fresco y delicioso.';
    } else if (temp < 10) {
      return '🧊 Hace frío! Perfecto para una hamburguesa caliente.';
    } else if (description.includes('lluvia') || description.includes('rain')) {
      return '🌧️ Está lloviendo. Los tiempos de entrega pueden variar.';
    } else if (description.includes('tormenta') || description.includes('thunder')) {
      return '⛈️ Hay tormenta. Entregas pueden demorar más de lo normal.';
    } else {
      return '✨ Clima perfecto para disfrutar tu pedido!';
    }
  }
}

const weatherService = new WeatherService();
export default weatherService;
